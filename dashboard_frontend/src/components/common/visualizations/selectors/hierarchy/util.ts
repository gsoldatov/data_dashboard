/** Item with a hierarchical number and display name. */
export interface HierarchyItem {
    number: string;
    name: string;
}

/** Number of hierarchy levels in a hierarchy item number. */
export function getDepth(number: string): number {
    return number.split(".").length;
}

/** Extract unique (number, name) pairs from flat items, filtered to the given root prefix. */
export function getHierarchy(
    items: HierarchyItem[],
    rootPrefix: string,
    excludedNumbers?: Set<string>,
): Map<string, string> {
    const map = new Map<string, string>();
    for (const item of items) {
        if (item.number.startsWith(rootPrefix) && !map.has(item.number)) {
            // Skip the root itself — only child hierarchy items
            if (item.number !== rootPrefix && !excludedNumbers?.has(item.number)) {
                map.set(item.number, item.name);
            }
        }
    }
    return map;
}

/** Return all descendant numbers of `parentNumber` (including the parent itself). */
export function getDescendantNumbers(
    parentNumber: string,
    allNumbers: Map<string, string>,
): string[] {
    const prefix = parentNumber + ".";
    const descendants = [parentNumber];
    for (const number of allNumbers.keys()) {
        if (number.startsWith(prefix)) {
            descendants.push(number);
        }
    }
    return descendants;
}

/** Compare hierarchy item numbers numerically by segment (e.g. 2.1 < 2.2 < 2.11 < 2.100),
 *  with numbers ending in * sorting after their plain counterpart (2.14 < 2.14* < 2.15). */
export function compareNumbers(a: string, b: string): number {
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

/** Group selected numbers by their hierarchy depth. */
export function groupByDepth(
    numbers: string[],
): Map<number, HierarchyItem[]> {
    const groups = new Map<number, HierarchyItem[]>();
    for (const number of numbers) {
        const depth = getDepth(number);
        if (!groups.has(depth)) groups.set(depth, []);
        groups.get(depth)!.push({ number, name: number });
    }
    for (const infos of groups.values()) {
        infos.sort((a, b) => compareNumbers(a.number, b.number));
    }
    return groups;
}
