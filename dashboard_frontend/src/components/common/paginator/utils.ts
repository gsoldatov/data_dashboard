/** Compute a sliding window of page numbers centered on the current page. */
export const computeWindow = (page: number, totalPages: number, maxButtons: number): number[] => {
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
};
