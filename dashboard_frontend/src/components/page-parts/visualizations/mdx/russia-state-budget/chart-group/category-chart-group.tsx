import { useState, useMemo, useCallback } from "react";

import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    getHierarchy,
    getDepth,
    getDescendantNumbers,
    groupByDepth,
    compareNumbers,
} from "@/components/common/visualizations/selectors/hierarchy/util";
import { AttributeDropdown } from "@/components/common/visualizations/selectors/attribute/dropdown";
import { AttributeSelections } from "@/components/common/visualizations/selectors/attribute/selection";
import { HierarchyBreadcrumb } from "@/components/common/visualizations/selectors/hierarchy/breadcrumb";
import { HierarchySelections } from "@/components/common/visualizations/selectors/hierarchy/selections";
import { CategoryLineChart } from "./charts/category-line-chart";
import { CategoryShareStackedBarChart } from "./charts/category-share-stacked-bar-chart";
import { CategoryTreemap } from "./charts/category-treemap";
import { CategoryDiffTable } from "./charts/category-diff-table";
import { ChartsContainer } from "@/components/common/visualizations/charts/charts";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { HierarchyItem } from "@/components/common/visualizations/selectors/hierarchy/util";
import type { BreadcrumbLevel } from "@/components/common/visualizations/selectors/hierarchy/breadcrumb";

export interface CategoryChartGroupProps {
    rootPrefix: string;
    dataTestID: string;
}

/** Generic chart group managing shared year/category selections for a data section. */
export const CategoryChartGroup = ({ rootPrefix, dataTestID }: CategoryChartGroupProps) => {
    const { data } = useGetVisualizationDatasetQuery("russia_state_budget");
    const items = (data ?? []) as RussiaStateBudgetItem[];

    const excludedNumbers = new Set(["2.1*"]); // child of 2.1, which overlaps with it

    /** Raw user selection: years explicitly picked (empty = all years). */
    const [selectedYears, setSelectedYears] = useState<number[]>([]);
    /** Raw user selection: category codes explicitly picked (empty = top-level). */
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const allYears = useMemo(
        () => [...new Set(items.map((d) => d.year))].sort((a, b) => a - b),
        [items],
    );
    const allCategories = useMemo(
        () => getHierarchy(items, rootPrefix, excludedNumbers),
        [items, rootPrefix],
    );

    // ── Derived data ─────────────────────────────────────────────────────

    /** Years actually shown in charts: all years when nothing selected, selected years otherwise. */
    const displayedYears = useMemo(
        () =>
            selectedYears.length === 0
                ? allYears
                : [...selectedYears].sort((a, b) => a - b),
        [allYears, selectedYears],
    );

    /** Categories actually shown in charts, derived from selection state.
     *  - Empty selection → all top-level (depth-2) categories.
     *  - Single bottom-most selected → its children, or itself if leaf.
     *  - Multiple bottom-most selected → use them directly. */
    const displayedCategories: HierarchyItem[] = useMemo(() => {
        if (allCategories.size === 0) return [];

        if (selectedCategories.length === 0) {
            const top: HierarchyItem[] = [];
            for (const [number, name] of allCategories) {
                if (getDepth(number) === 2) top.push({ number, name });
            }
            top.sort((a, b) => compareNumbers(a.number, b.number));
            return top;
        }

        const maxDepth = Math.max(
            ...selectedCategories.map((c) => getDepth(c)),
        );
        const bottomMost = selectedCategories.filter(
            (c) => getDepth(c) === maxDepth,
        );

        if (bottomMost.length > 1) {
            return bottomMost.map((number) => ({
                number,
                name: allCategories.get(number) ?? number,
            }));
        }

        const code = bottomMost[0];
        const targetDepth = getDepth(code) + 1;
        const children: HierarchyItem[] = [];
        for (const [c, n] of allCategories) {
            if (c.startsWith(code + ".") && getDepth(c) === targetDepth) children.push({ number: c, name: n });
        }
        if (children.length > 0) {
            children.sort((a, b) => compareNumbers(a.number, b.number));
            return children;
        }
        return [{ number: code, name: allCategories.get(code) ?? code }];
    }, [allCategories, selectedCategories]);

    const breadcrumbLevels: BreadcrumbLevel[] = useMemo(() => {
        if (allCategories.size === 0) return [];

        const maxDepth = Math.max(
            ...[...allCategories.keys()].map(getDepth),
        );
        const levels: BreadcrumbLevel[] = [];

        for (let depth = 2; depth <= maxDepth; depth++) {
            // All categories at this depth
            const allAtDepth: HierarchyItem[] = [];
            for (const [number, name] of allCategories) {
                if (getDepth(number) === depth) {
                    allAtDepth.push({ number, name });
                }
            }
            allAtDepth.sort((a, b) => compareNumbers(a.number, b.number));

            // Filter by selected parents at the previous depth
            let filtered: HierarchyItem[];
            if (depth === 2) {
                filtered = allAtDepth;
            } else if (selectedCategories.length === 0) {
                break;
            } else {
                const selectedParents = selectedCategories.filter(
                    (c) => getDepth(c) === depth - 1,
                );
                if (selectedParents.length === 0) {
                    break;
                } else {
                    filtered = allAtDepth.filter((cat) => {
                        const parts = cat.number.split(".");
                        parts.pop();
                        return selectedParents.includes(parts.join("."));
                    });
                }
            }

            if (filtered.length > 0) {
                const label = rootPrefix + ".x".repeat(depth - 1);
                levels.push({ label, depth, items: filtered });
            }
        }

        return levels;
    }, [allCategories, selectedCategories, rootPrefix]);

    const badgeGroups = useMemo(() => {
        if (selectedCategories.length === 0) return [];
        const groups = groupByDepth(selectedCategories);
        const result: { depth: number; items: HierarchyItem[] }[] = [];
        for (const [depth, infos] of groups) {
            const named = infos.map((info) => ({
                number: info.number,
                name: allCategories.get(info.number) ?? info.number,
            }));
            named.sort((a, b) => compareNumbers(a.number, b.number));
            result.push({ depth, items: named });
        }
        result.sort((a, b) => a.depth - b.depth);
        return result;
    }, [selectedCategories, allCategories]);

    // ── Helpers ──────────────────────────────────────────────────────────

    /** Remove `code` and all its descendants from a selection array. */
    const withoutDescendants = useCallback(
        (code: string, selection: string[]): string[] => {
            const descendants = getDescendantNumbers(code, allCategories);
            return selection.filter((c) => !descendants.includes(c));
        },
        [allCategories],
    );

    // ── Callbacks ─────────────────────────────────────────────────────────

    /** Add/remove a year from the selection. First selection from "all" state picks
     *  that single year; subsequent toggles behave additively. */
    const toggleYear = useCallback((year: number) => {
        setSelectedYears((prev) => {
            if (prev.length === 0) {
                return prev.includes(year) ? prev : [year];
            }
            return prev.includes(year)
                ? prev.filter((y) => y !== year)
                : [...prev, year];
        });
    }, []);

    /** Reset year selection to "all". */
    const clearYears = useCallback(() => {
        setSelectedYears([]);
    }, []);

    /** Add/remove a category code. First selection from "all" state switches
     *  to single-selection mode; toggling a parent also removes its descendants. */
    const toggleCategory = useCallback(
        (code: string) => {
            setSelectedCategories((prev) => {
                if (prev.length === 0) {
                    return [code];
                }
                return prev.includes(code)
                    ? withoutDescendants(code, prev)
                    : [...prev, code];
            });
        },
        [withoutDescendants],
    );

    /** Remove all selected categories at a given depth (and their descendants). */
    const clearLevel = useCallback(
        (depth: number) => {
            setSelectedCategories((prev) => {
                const toClear = prev.filter((c) => getDepth(c) === depth);
                let result = prev;
                for (const code of toClear) {
                    result = withoutDescendants(code, result);
                }
                return result;
            });
        },
        [withoutDescendants],
    );

    /** Remove a single category code and all its descendants from the selection. */
    const deselectCategory = useCallback(
        (code: string) => {
            setSelectedCategories((prev) => withoutDescendants(code, prev));
        },
        [withoutDescendants],
    );

    // ── Render ───────────────────────────────────────────────────────────

    const section = rootPrefix === "1" ? "Income" : "Expenses";

    return (
        <div className="space-y-4" data-testid={dataTestID}>
            <div className="flex items-center gap-2">
                <AttributeDropdown
                    allValues={allYears}
                    selectedValues={selectedYears}
                    onToggle={toggleYear}
                    prompt="Select years"
                />
                <AttributeSelections
                    selectedValues={selectedYears}
                    displayedValues={displayedYears}
                    onToggle={toggleYear}
                    onClear={clearYears}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Select categories</span>
                <HierarchyBreadcrumb
                    levels={breadcrumbLevels}
                    selectedItems={selectedCategories}
                    onToggle={toggleCategory}
                />
            </div>

            <HierarchySelections
                badgeGroups={badgeGroups}
                onClearLevel={clearLevel}
                onDeselect={deselectCategory}
            />

            <ChartsContainer>
                <CategoryLineChart
                    items={items}
                    displayedYears={displayedYears}
                    displayedCategories={displayedCategories}
                    title={`${section} Categories`}
                />
                <CategoryShareStackedBarChart
                    items={items}
                    displayedYears={displayedYears}
                    displayedCategories={displayedCategories}
                    rootPrefix={rootPrefix}
                    title={`${section} Category Shares`}
                />
            </ChartsContainer>
            
            <ChartsContainer>
                <CategoryTreemap
                    items={items}
                    displayedYears={displayedYears}
                    displayedCategories={displayedCategories}
                    rootPrefix={rootPrefix}
                    title={`${section} Category Treemap`}
                    onToggleCategory={toggleCategory}
                />
                <CategoryDiffTable
                    items={items}
                    displayedYears={displayedYears}
                    displayedCategories={displayedCategories}
                    rootPrefix={rootPrefix}
                    allYears={allYears}
                    title={`${section} Category Changes`}
                />
            </ChartsContainer>
        </div>
    );
};
