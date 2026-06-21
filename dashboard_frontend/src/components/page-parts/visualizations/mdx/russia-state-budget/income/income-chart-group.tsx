import { useState, useMemo, useCallback, Fragment } from "react";
import { Eraser } from "lucide-react";

import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import { Badge } from "@/components/common/shadcn-ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/common/shadcn-ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/common/shadcn-ui/dropdown-menu";
import {
    getIncomeCategories,
    getDepth,
    getDescendantCodes,
    groupByDepth,
} from "./category-hierarchy";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { CategoryInfo } from "./category-hierarchy";

/** Parent component for income chart group — manages shared year/category selections. */
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

    const effectiveYears =
        selectedYears.length === 0
            ? allYears
            : allYears.filter((y) => !selectedYears.includes(y)).sort((a, b) => a - b);

    // ── Breadcrumb computation ───────────────────────────────────────────

    const breadcrumbLevels = useMemo(() => {
        const levels: { label: string; depth: number; categories: CategoryInfo[] }[] = [];

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
                // Walk down from depth 3, adding levels while children exist
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

    // ── Year helpers ─────────────────────────────────────────────────────

    const toggleYear = useCallback((year: number) => {
        setSelectedYears((prev) =>
            prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
        );
    }, []);

    const clearYears = useCallback(() => setSelectedYears([]), []);

    // ── Category helpers ─────────────────────────────────────────────────

    const toggleCategory = useCallback(
        (code: string) => {
            setSelectedCategories((prev) =>
                prev.includes(code)
                    ? prev.filter((c) => c !== code)
                    : [...prev, code],
            );
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

    // ── Badge groups ─────────────────────────────────────────────────────

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

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* ── Year selector ─────────────────── */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                        Years
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-56">
                        {allYears.map((year) => (
                            <DropdownMenuCheckboxItem
                                key={year}
                                checked={!selectedYears.includes(year)}
                                onCheckedChange={() => toggleYear(year)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {year}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {selectedYears.length > 0 && (
                    <>
                        <button
                            type="button"
                            onClick={clearYears}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Clear all years"
                        >
                            <Eraser className="h-4 w-4" />
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                            {effectiveYears.map((year) => (
                                <Badge
                                    key={year}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => toggleYear(year)}
                                >
                                    {year}
                                </Badge>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Category breadcrumb ───────────── */}
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbLevels.map((level, i) => (
                        <Fragment key={level.depth}>
                            {i > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="text-sm hover:text-foreground transition-colors">
                                        {level.label}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="max-h-56">
                                        {level.categories.map((cat) => {
                                            const checked =
                                                selectedCategories.includes(cat.code) ||
                                                selectedCategories.length === 0;
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={cat.code}
                                                    checked={checked}
                                                    onCheckedChange={() => toggleCategory(cat.code)}
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    {cat.code} {cat.name}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </BreadcrumbItem>
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            {/* ── Category badge rows ───────────── */}
            {badgeGroups.map(({ depth, categories }) => (
                <div key={depth} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => clearLevel(depth)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Clear level ${depth} categories`}
                    >
                        <Eraser className="h-4 w-4" />
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                            <Badge
                                key={cat.code}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => deselectCategory(cat.code)}
                            >
                                {cat.code} {cat.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            ))}

            {/* ── Charts placeholder ────────────── */}
            <div className="border rounded-md p-6 text-center text-muted-foreground text-sm mt-6">
                Charts will be added here
            </div>
        </div>
    );
};
