import { useState, useMemo, useCallback } from "react";

import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import {
    getIncomeCategories,
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

/** Parent component for income chart group — manages shared year/category selections.
 *  Empty selection arrays mean "all items shown" for both years and categories. */
export const IncomeChartGroup = () => {
    const { data } = useGetVisualizationDataQuery("russia_state_budget");
    const items: RussiaStateBudgetItem[] = data?.[0] ?? [];

    const [selectedYears, setSelectedYears] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const allYears = useMemo(
        () => [...new Set(items.map((d) => d.year))].sort((a, b) => a - b),
        [items],
    );
    const allCategories = useMemo(() => getIncomeCategories(items), [items]);

    // ── Derived data ─────────────────────────────────────────────────────

    const effectiveYears = useMemo(
        () =>
            selectedYears.length === 0
                ? allYears
                : [...selectedYears].sort((a, b) => a - b),
        [allYears, selectedYears],
    );

    const breadcrumbLevels: BreadcrumbLevel[] = useMemo(() => {
        const levels: BreadcrumbLevel[] = [];

        // Level 0: top-level income ("1.x")
        const topLevel: CategoryInfo[] = [];
        for (const [code, name] of allCategories) {
            if (getDepth(code) === 2) {
                topLevel.push({ code, name });
            }
        }
        topLevel.sort((a, b) => a.code.localeCompare(b.code));
        levels.push({ label: "Income", depth: 2, categories: topLevel });

        // Additional levels: follow drilldown path
        if (selectedCategories.length > 0) {
            const maxDepth = Math.max(...selectedCategories.map(getDepth));
            const deepest = selectedCategories.filter((c) => getDepth(c) === maxDepth);

            if (deepest.length === 1) {
                const parts = deepest[0].split(".");
                for (let childDepth = 3; childDepth <= parts.length + 1; childDepth++) {
                    const parentCode = parts.slice(0, childDepth - 1).join(".");
                    if (!allCategories.has(parentCode)) break;

                    const parentName = allCategories.get(parentCode) ?? parentCode;
                    const prefix = parentCode + ".";
                    const children: CategoryInfo[] = [];
                    for (const [code, name] of allCategories) {
                        if (
                            code.startsWith(prefix) &&
                            !code.slice(prefix.length).includes(".")
                        ) {
                            children.push({ code, name });
                        }
                    }
                    children.sort((a, b) => a.code.localeCompare(b.code));
                    levels.push({ label: parentName, depth: childDepth + 1, categories: children });
                }
            }
        }

        return levels;
    }, [allCategories, selectedCategories]);

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

    // ── Callbacks ─────────────────────────────────────────────────────────

    const toggleYear = useCallback((year: number) => {
        setSelectedYears((prev) => {
            if (prev.length === 0) {
                // Transition from "all" to explicit selection:
                // select everything except the clicked year
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
                    ? prev.filter((c) => c !== code)
                    : [...prev, code];
            });
        },
        [],
    );

    const clearLevel = useCallback(
        (depth: number) => {
            setSelectedCategories((prev) =>
                prev.filter((c) => getDepth(c) !== depth),
            );
        },
        [],
    );

    const deselectCategory = useCallback(
        (code: string) => {
            const descendants = getDescendantCodes(code, allCategories);
            setSelectedCategories((prev) =>
                prev.filter((c) => !descendants.includes(c)),
            );
        },
        [allCategories],
    );

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-4" data-testid="income-chart-group">
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

            <CategoryBreadcrumb
                levels={breadcrumbLevels}
                selectedCategories={selectedCategories}
                onToggle={toggleCategory}
            />

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
