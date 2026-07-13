import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/common/shadcn-ui/pagination";
import { cn } from "@/styles/utils";


interface PaginatorProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const BTN = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
);

const PAGE_BTN = cn(BTN, "h-9 w-9 p-0 text-foreground hover:bg-accent hover:text-accent-foreground");
const NAV_BTN = cn(BTN, "h-9 px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground");

const computeWindow = (page: number, totalPages: number, maxButtons: number): number[] => {
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
};

export const Paginator = ({ page, totalPages, onPageChange }: PaginatorProps) => {
    if (totalPages <= 1) return null;

    const desktopPages = computeWindow(page, totalPages, 5);
    const mobilePages = new Set(computeWindow(page, totalPages, 3));

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <button
                        type="button"
                        aria-label="Go to first page"
                        disabled={page <= 1}
                        onClick={() => onPageChange(1)}
                        className={cn(NAV_BTN, "gap-1 pl-2.5")}
                    >
                        <ChevronFirst className="h-4 w-4" />
                        <span>First</span>
                    </button>
                </PaginationItem>
                <PaginationItem>
                    <button
                        type="button"
                        aria-label="Go to previous page"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        className={cn(NAV_BTN, "gap-1 pl-2.5")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                    </button>
                </PaginationItem>
                {desktopPages.map((p) => (
                    <PaginationItem
                        key={p}
                        className={mobilePages.has(p) ? "" : "hidden md:block"}
                    >
                        <button
                            type="button"
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? "page" : undefined}
                            onClick={() => onPageChange(p)}
                            className={cn(
                                PAGE_BTN,
                                p === page && "bg-active text-active-foreground hover:bg-active hover:text-active-foreground",
                            )}
                        >
                            {p}
                        </button>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <button
                        type="button"
                        aria-label="Go to next page"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className={cn(NAV_BTN, "gap-1 pr-2.5")}
                    >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </PaginationItem>
                <PaginationItem>
                    <button
                        type="button"
                        aria-label="Go to last page"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(totalPages)}
                        className={cn(NAV_BTN, "gap-1 pr-2.5")}
                    >
                        <span>Last</span>
                        <ChevronLast className="h-4 w-4" />
                    </button>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
