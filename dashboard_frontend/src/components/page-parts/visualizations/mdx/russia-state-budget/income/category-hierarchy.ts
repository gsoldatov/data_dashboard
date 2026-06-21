import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

/** Unique category from the flat data. */
export interface CategoryInfo {
    code: string;
    name: string;
}

const INCOME_ROOT = "1";

/** Parse dot-separated category number into integer parts. */
export function parseNumber(code: string): number[] {
    return code.split(".").map(Number);
}

/** Number of hierarchy levels in a category code. */
export function getDepth(code: string): number {
    return parseNumber(code).length;
}

/** Extract unique (code, name) pairs from flat items, filtered to income categories. */
export function getIncomeCategories(
    items: RussiaStateBudgetItem[],
): Map<string, string> {
    const map = new Map<string, string>();
    for (const item of items) {
        if (item.number.startsWith(INCOME_ROOT) && !map.has(item.number)) {
            // Skip the root "1" itself — only subcategories
            if (item.number !== INCOME_ROOT) {
                map.set(item.number, item.name);
            }
        }
    }
    return map;
}

/** Whether any category code in the map is a direct child of `parentCode`. */
function hasChildren(parentCode: string, allCodes: Map<string, string>): boolean {
    const prefix = parentCode + ".";
    for (const code of allCodes.keys()) {
        if (code.startsWith(prefix)) return true;
    }
    return false;
}

/**
 * Compute which categories should be visible at the current drilldown layer.
 *
 * - No selections → all depth-2 income categories (`"1.x"`).
 * - Single category selected at the deepest level, and it has children → show its children.
 * - Otherwise → show the deepest-level selected categories.
 */
export function getCurrentLayerCategories(
    items: RussiaStateBudgetItem[],
    selectedCodes: string[],
): CategoryInfo[] {
    const allCategories = getIncomeCategories(items);

    if (selectedCodes.length === 0) {
        // Default: all "1.x" categories
        const result: CategoryInfo[] = [];
        for (const [code, name] of allCategories) {
            if (getDepth(code) === 2) {
                result.push({ code, name });
            }
        }
        return result.sort((a, b) => a.code.localeCompare(b.code));
    }

    const maxDepth = Math.max(...selectedCodes.map(getDepth));
    const deepest = selectedCodes.filter((c) => getDepth(c) === maxDepth);

    if (deepest.length === 1 && hasChildren(deepest[0], allCategories)) {
        // Single with children → display its direct children
        const prefix = deepest[0] + ".";
        const result: CategoryInfo[] = [];
        for (const [code, name] of allCategories) {
            if (
                code.startsWith(prefix) &&
                !code.slice(prefix.length).includes(".")
            ) {
                result.push({ code, name });
            }
        }
        return result.sort((a, b) => a.code.localeCompare(b.code));
    }

    return deepest
        .map((code) => ({ code, name: allCategories.get(code) ?? code }))
        .sort((a, b) => a.code.localeCompare(b.code));
}

/** Return all descendant codes of `parentCode` (including the parent itself). */
export function getDescendantCodes(
    parentCode: string,
    allCodes: Map<string, string>,
): string[] {
    const prefix = parentCode + ".";
    const descendants = [parentCode];
    for (const code of allCodes.keys()) {
        if (code.startsWith(prefix)) {
            descendants.push(code);
        }
    }
    return descendants;
}

/** Group selected codes by their hierarchy depth. */
export function groupByDepth(
    codes: string[],
): Map<number, CategoryInfo[]> {
    const groups = new Map<number, CategoryInfo[]>();
    for (const code of codes) {
        const depth = getDepth(code);
        if (!groups.has(depth)) groups.set(depth, []);
        groups.get(depth)!.push({ code, name: code });
    }
    for (const infos of groups.values()) {
        infos.sort((a, b) => a.code.localeCompare(b.code));
    }
    return groups;
}
