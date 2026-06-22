import { useState, useMemo, useCallback } from "react";

import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import {
    getCategories,
    getDepth,
    getDescendantCodes,
    groupByDepth,
} from "./category-hierarchy";
import { YearDropdown } from "./year-dropdown";
import { YearSelections } from "./year-selections";
import { CategoryBreadcrumb } from "./category-breadcrumb";
import { CategorySelections } from "./category-selections";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { CategoryInfo } from "./category-hierarchy";
import type { BreadcrumbLevel } from "./category-breadcrumb";

export interface CategoryChartGroupProps {
    rootPrefix: string;
    dataTestID: string;
}

/** Generic chart group managing shared year/category selections for a data section. */
export const CategoryChartGroup = ({ rootPrefix, dataTestID }: CategoryChartGroupProps) => {
    const { data } = useGetVisualizationDataQuery("russia_state_budget");
    const items: RussiaStateBudgetItem[] = data?.[0] ?? [];

    const [selectedYears, setSelectedYears] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const allYears = useMemo(
        () => [...new Set(items.map((d) => d.year))].sort((a, b) => a - b),
        [items],
    );
    const allCategories = useMemo(
        () => getCategories(items, rootPrefix),
        [items, rootPrefix],
    );

    // ── Derived data ─────────────────────────────────────────────────────

    const effectiveYears = useMemo(
        () =>
            selectedYears.length === 0
                ? allYears
                : [...selectedYears].sort((a, b) => a - b),
        [allYears, selectedYears],
    );

    const breadcrumbLevels: BreadcrumbLevel[] = useMemo(() => {
        if (allCategories.size === 0) return [];

        const maxDepth = Math.max(
            ...[...allCategories.keys()].map(getDepth),
        );
        const levels: BreadcrumbLevel[] = [];

        for (let depth = 2; depth <= maxDepth; depth++) {
            // All categories at this depth
            const allAtDepth: CategoryInfo[] = [];
            for (const [code, name] of allCategories) {
                if (getDepth(code) === depth) {
                    allAtDepth.push({ code, name });
                }
            }
            allAtDepth.sort((a, b) => a.code.localeCompare(b.code));

            // Filter by selected parents at the previous depth
            let filtered: CategoryInfo[];
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
                        const parts = cat.code.split(".");
                        parts.pop();
                        return selectedParents.includes(parts.join("."));
                    });
                }
            }

            if (filtered.length > 0) {
                const label = rootPrefix + ".x".repeat(depth - 1);
                levels.push({ label, depth, categories: filtered });
            }
        }

        return levels;
    }, [allCategories, selectedCategories, rootPrefix]);

    const badgeGroups = useMemo(() => {
        if (selectedCategories.length === 0) return [];
        const groups = groupByDepth(selectedCategories);
        const result: { depth: number; categories: CategoryInfo[] }[] = [];
        for (const [depth, infos] of groups) {
            const named = infos.map((info) => ({
                code: info.code,
                name: allCategories.get(info.code) ?? info.code,
            }));
            named.sort((a, b) => a.code.localeCompare(b.code));
            result.push({ depth, categories: named });
        }
        result.sort((a, b) => a.depth - b.depth);
        return result;
    }, [selectedCategories, allCategories]);

    // ── Helpers ──────────────────────────────────────────────────────────

    /** Remove `code` and all its descendants from a selection array. */
    const withoutDescendants = useCallback(
        (code: string, selection: string[]): string[] => {
            const descendants = getDescendantCodes(code, allCategories);
            return selection.filter((c) => !descendants.includes(c));
        },
        [allCategories],
    );

    // ── Callbacks ─────────────────────────────────────────────────────────

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

    const clearYears = useCallback(() => {
        setSelectedYears([]);
    }, []);

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

    const deselectCategory = useCallback(
        (code: string) => {
            setSelectedCategories((prev) => withoutDescendants(code, prev));
        },
        [withoutDescendants],
    );

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-4" data-testid={dataTestID}>
            <div className="flex items-center gap-2">
                <YearDropdown
                    allYears={allYears}
                    selectedYears={selectedYears}
                    onToggle={toggleYear}
                />
                <YearSelections
                    selectedYears={selectedYears}
                    effectiveYears={effectiveYears}
                    onToggle={toggleYear}
                    onClear={clearYears}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Select categories</span>
                <CategoryBreadcrumb
                    levels={breadcrumbLevels}
                    selectedCategories={selectedCategories}
                    onToggle={toggleCategory}
                />
            </div>

            <CategorySelections
                badgeGroups={badgeGroups}
                onClearLevel={clearLevel}
                onDeselect={deselectCategory}
            />

            <div className="border rounded-md p-6 text-center text-muted-foreground text-sm mt-6">
                Charts will be added here
            </div>
        </div>
    );
};
