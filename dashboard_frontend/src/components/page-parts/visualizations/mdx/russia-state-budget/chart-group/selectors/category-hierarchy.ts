import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

/** Unique category from the flat data. */
export interface CategoryInfo {
    code: string;
    name: string;
}

/** Number of hierarchy levels in a category code. */
export function getDepth(code: string): number {
    return code.split(".").length;
}

/** Categories, which are excluded from display */
const EXCLUDED_CODES = new Set([
    "2.1*"  // child of 2.1, which overlaps with it
]);

/** Extract unique (code, name) pairs from flat items, filtered to the given root prefix. */
export function getCategories(
    items: RussiaStateBudgetItem[],
    rootPrefix: string,
): Map<string, string> {
    const map = new Map<string, string>();
    for (const item of items) {
        if (item.number.startsWith(rootPrefix) && !map.has(item.number)) {
            // Skip the root itself — only subcategories
            if (item.number !== rootPrefix && !EXCLUDED_CODES.has(item.number)) {
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

/** Compare category codes numerically by segment (e.g. 2.1 < 2.2 < 2.11 < 2.100),
 *  with codes ending in * sorting after their plain counterpart (2.14 < 2.14* < 2.15). */
export function compareCodes(a: string, b: string): number {
    const aParts = a.split(".");
    const bParts = b.split(".");
    const len = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
        const aRaw = aParts[i] ?? "";
        const bRaw = bParts[i] ?? "";
        const aStar = aRaw.endsWith("*");
        const bStar = bRaw.endsWith("*");
        const aNum = parseInt(aRaw, 10);
        const bNum = parseInt(bRaw, 10);
        if (aNum !== bNum) return aNum - bNum;
        // Plain sorts before starred when numeric parts are equal
        if (aStar !== bStar) return aStar ? 1 : -1;
    }
    return 0;
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
        infos.sort((a, b) => compareCodes(a.code, b.code));
    }
    return groups;
}
