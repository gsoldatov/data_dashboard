import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/common/shadcn-ui/pagination";
import { cn } from "@/styles/utils";
import { computeWindow } from "./utils";


interface PaginatorProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    variant?: "button" | "link";
}

type Kind = "first" | "prev" | "page" | "next" | "last";

interface ItemProps {
    kind: Kind;
    page: number;
    totalPages: number;
    pageNumber?: number;
    onPageChange: (page: number) => void;
}


// ── Button styling ─────────────────────────────────────────────────────

const BTN_BASE = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
);

const NAV_BTN = cn(BTN_BASE, "h-9 px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground");
const PAGE_BTN = cn(BTN_BASE, "h-9 w-9 p-0 text-foreground hover:bg-accent hover:text-accent-foreground");

const PaginatorButton = ({ kind, page, totalPages, pageNumber, onPageChange }: ItemProps) => {
    const p = kind === "page" ? pageNumber! : undefined;

    const common = {
        type: "button" as const,
        onClick: (() => {
            switch (kind) {
                case "first": return () => onPageChange(1);
                case "prev": return () => onPageChange(page - 1);
                case "page": return () => onPageChange(p!);
                case "next": return () => onPageChange(page + 1);
                case "last": return () => onPageChange(totalPages);
            }
        })(),
    };

    if (kind === "page") {
        return (
            <button
                {...common}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(PAGE_BTN, p === page && "bg-active text-active-foreground hover:bg-active hover:text-active-foreground")}
            >
                {p}
            </button>
        );
    }

    const disabled =
        (kind === "first" || kind === "prev") ? page <= 1 :
        (kind === "next" || kind === "last") ? page >= totalPages :
        false;

    const isLeft = kind === "first" || kind === "prev";
    const icon = (() => {
        switch (kind) {
            case "first": return <ChevronFirst className="h-4 w-4" />;
            case "prev": return <ChevronLeft className="h-4 w-4" />;
            case "next": return <ChevronRight className="h-4 w-4" />;
            case "last": return <ChevronLast className="h-4 w-4" />;
            default: return null;
        }
    })();

    const label = kind === "first" ? "First" : kind === "prev" ? "Previous" : kind === "next" ? "Next" : "Last";

    return (
        <button
            {...common}
            aria-label={`Go to ${label.toLowerCase()} page`}
            disabled={disabled}
            className={cn(NAV_BTN, isLeft ? "gap-1 pl-2.5" : "gap-1 pr-2.5")}
        >
            {isLeft && icon}
            <span>{label}</span>
            {!isLeft && icon}
        </button>
    );
};


// ── Link styling ───────────────────────────────────────────────────────

const linkDisabled = (d: boolean) => d ? "pointer-events-none opacity-50" : undefined;

const PaginatorLinkItem = ({ kind, page, totalPages, pageNumber, onPageChange }: ItemProps) => {
    const p = kind === "page" ? pageNumber! : undefined;

    if (kind === "prev") {
        return (
            <PaginationPrevious
                className={linkDisabled(page <= 1)}
                onClick={() => onPageChange(page - 1)}
            />
        );
    }

    if (kind === "next") {
        return (
            <PaginationNext
                className={linkDisabled(page >= totalPages)}
                onClick={() => onPageChange(page + 1)}
            />
        );
    }

    if (kind === "page") {
        return (
            <PaginationLink isActive={p === page} onClick={() => onPageChange(p!)}>
                {p}
            </PaginationLink>
        );
    }

    const isFirst = kind === "first";
    const disabled = isFirst ? page <= 1 : page >= totalPages;
    const label = isFirst ? "First" : "Last";
    const icon = isFirst
        ? <ChevronFirst className="h-4 w-4" />
        : <ChevronLast className="h-4 w-4" />;

    return (
        <PaginationLink
            aria-label={`Go to ${label.toLowerCase()} page`}
            size="default"
            className={cn(
                isFirst ? "gap-1 pl-2.5" : "gap-1 pr-2.5",
                linkDisabled(disabled),
            )}
            onClick={
                disabled ? undefined : () => onPageChange(isFirst ? 1 : totalPages)
            }
        >
            {isFirst && icon}
            <span>{label}</span>
            {!isFirst && icon}
        </PaginationLink>
    );
};


// ── Paginator ──────────────────────────────────────────────────────────

export const Paginator = ({ page, totalPages, onPageChange, variant = "button" }: PaginatorProps) => {
    if (totalPages <= 1) return null;

    const desktopPages = computeWindow(page, totalPages, 5);
    const mobilePages = new Set(computeWindow(page, totalPages, 3));

    const Item = variant === "button" ? PaginatorButton : PaginatorLinkItem;
    const navProps = (kind: Kind): ItemProps => ({ kind, page, totalPages, onPageChange });

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <Item {...navProps("first")} />
                </PaginationItem>
                <PaginationItem>
                    <Item {...navProps("prev")} />
                </PaginationItem>
                {desktopPages.map((p) => (
                    <PaginationItem
                        key={p}
                        className={mobilePages.has(p) ? "" : "hidden md:block"}
                    >
                        <Item {...navProps("page")} pageNumber={p} />
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <Item {...navProps("next")} />
                </PaginationItem>
                <PaginationItem>
                    <Item {...navProps("last")} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
