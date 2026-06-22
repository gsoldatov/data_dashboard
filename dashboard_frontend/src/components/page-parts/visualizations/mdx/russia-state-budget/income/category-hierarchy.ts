import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

/** Unique category from the flat data. */
export interface CategoryInfo {
    code: string;
    name: string;
}

const INCOME_ROOT = "1";

/** Number of hierarchy levels in a category code. */
export function getDepth(code: string): number {
    return code.split(".").length;
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
