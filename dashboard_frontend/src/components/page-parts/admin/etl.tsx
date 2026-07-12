import { useState } from "react";
import { RefreshCw, ExternalLink, ChevronFirst, ChevronLast } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/common/shadcn-ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/common/shadcn-ui/pagination";
import { Badge } from "@/components/common/shadcn-ui/badge";
import { Button } from "@/components/common/shadcn-ui/button";
import { Input } from "@/components/common/shadcn-ui/input";
import { Switch } from "@/components/common/shadcn-ui/switch";
import { useUpdateDagMutation } from "@/store/backend-api-slices/airflow";
import { getDocumentApp } from "@/util/document-app";
import { ADMIN_ETL_DAG_PAGE_SIZE } from "@/util/constants";
import type { DagStatus } from "@/types/backend/responses/airflow";
import { cn } from "@/styles/utils";


// ── Helpers ────────────────────────────────────────────────────────────

const formatTimestamp = (iso: string | null): string => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const STALE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;

const isStale = (iso: string | null): boolean => {
    if (!iso) return false;
    return Date.now() - new Date(iso).getTime() > STALE_THRESHOLD_MS;
};


// ── Subcomponents ──────────────────────────────────────────────────────

interface ActiveToggleProps {
    dagId: string;
    isPaused: boolean;
}

const ActiveToggle = ({ dagId, isPaused }: ActiveToggleProps) => {
    const [updateDag, { isLoading }] = useUpdateDagMutation();
    const [checked, setChecked] = useState(!isPaused);

    const handleToggle = async () => {
        if (isLoading) return;
        const next = !checked;
        setChecked(next);
        try {
            await updateDag({
                dag_id: dagId,
                body: { is_paused: !next },
            }).unwrap();
        } catch {
            setChecked(!next);
        }
    };

    return (
        <Switch
            checked={checked}
            onCheckedChange={handleToggle}
            disabled={isLoading}
        />
    );
};


export const RefreshButton = ({
    isRefetching,
    onRefresh,
}: {
    isRefetching: boolean;
    onRefresh: () => void;
}) => (
    <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isRefetching}
    >
        <RefreshCw
            className={cn("h-4 w-4 mr-1", isRefetching && "animate-spin")}
        />
        Refresh
    </Button>
);


export const Toolbar = ({
    isRefetching,
    onRefresh,
    filterText,
    onFilterChange,
    inputRef,
}: {
    isRefetching: boolean;
    onRefresh: () => void;
    filterText: string;
    onFilterChange: (value: string) => void;
    inputRef: React.RefObject<HTMLInputElement>;
}) => (
    <div className="flex items-center gap-3 mb-4">
        <RefreshButton isRefetching={isRefetching} onRefresh={onRefresh} />
        <Input
            ref={inputRef}
            type="search"
            placeholder="Filter DAGs by id..."
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
            disabled={isRefetching}
            className="max-w-64"
        />
    </div>
);


const statusBadge = (state: string | null) => {
    if (!state) {
        return (
            <Badge
                variant="secondary"
                className="bg-warning/15 text-warning border-warning/30"
            >
                N/A
            </Badge>
        );
    }
    switch (state) {
        case "success":
        case "running":
        case "queued":
            return (
                <Badge
                    variant="secondary"
                    className="bg-success/15 text-success border-success/30"
                >
                    {state}
                </Badge>
            );
        case "failed":
            return <Badge variant="destructive">{state}</Badge>;
        default:
            return <Badge variant="secondary">{state}</Badge>;
    }
};


const DagsTable = ({ dags }: { dags: DagStatus[] }) => {
    const { airflowUrl } = getDocumentApp().config;

    // ── Responsive cell classnames ────────────────────────────────────
    // Base: flex row on mobile (label left, value right), normal cell on desktop
    const CELL = "flex justify-between md:table-cell";
    // DAG ID gets extra width cap + forced breaks for long identifiers
    const CELL_DAG_ID = cn(CELL, "font-medium break-all md:max-w-48");
    // Description also capped and breakable
    const CELL_DESC = cn(CELL, "max-w-xs break-all");
    // Narrow badge columns — never wrap
    const CELL_NOWRAP = cn(CELL, "whitespace-nowrap");
    // Mobile label — hidden on desktop, shown inline on mobile
    const MOBILE_LABEL = "font-normal md:hidden";
    // Table row: card stack on mobile, normal row on desktop
    const ROW = "flex flex-col md:table-row border-b";

    return (
        <Table className="table-fixed">
            <TableHeader className="hidden md:table-header-group">
                <TableRow>
                    <TableHead title="DAG identifier">DAG ID</TableHead>
                    <TableHead title="DAG description">Description</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-32">Last Run State</TableHead>
                    <TableHead className="min-w-24">Schedule</TableHead>
                    <TableHead className="min-w-24">Next Run</TableHead>
                    <TableHead className="min-w-24">Last Run Start</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {dags.map((dag) => (
                    <TableRow key={dag.dag_id} className={ROW}>
                        <TableCell className={CELL_DAG_ID}>
                            <span className={MOBILE_LABEL}>DAG ID</span>
                            <span title={dag.dag_id} className="flex-1 text-right">
                                {dag.dag_id}
                                <a
                                    href={`${airflowUrl}/dags/${dag.dag_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open ${dag.dag_id} in Airflow`}
                                    title="View DAG in Airflow Dashboard"
                                    className="ml-1.5 inline-flex align-middle shrink-0"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </span>
                        </TableCell>
                        <TableCell className={CELL_DESC}>
                            <span className={MOBILE_LABEL}>Description</span>
                            <span title={dag.description ?? undefined}>{dag.description}</span>
                        </TableCell>
                        <TableCell className={CELL_NOWRAP}>
                            <span className={MOBILE_LABEL}>Active</span>
                            <ActiveToggle dagId={dag.dag_id} isPaused={dag.is_paused} />
                        </TableCell>
                        <TableCell className={CELL_NOWRAP}>
                            <span className={MOBILE_LABEL}>Last Run State</span>
                            {statusBadge(dag.last_run_state)}
                        </TableCell>
                        <TableCell className={CELL}>
                            <span className={MOBILE_LABEL}>Schedule</span>
                            <span>{dag.timetable_summary}</span>
                        </TableCell>
                        <TableCell className={CELL}>
                            <span className={MOBILE_LABEL}>Next Run</span>
                            <span>{formatTimestamp(dag.next_dagrun)}</span>
                        </TableCell>
                        <TableCell className={CELL}>
                            <span className={MOBILE_LABEL}>Last Run Start</span>
                            <span className={cn(isStale(dag.last_run_start_date) && "text-warning")}>
                                {formatTimestamp(dag.last_run_start_date)}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


// ── Pagination ─────────────────────────────────────────────────────────

interface DagsPaginationProps {
    total: number;
    page: number;
    onPageChange: (page: number) => void;
}

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

const DagsPagination = ({ total, page, onPageChange }: DagsPaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_ETL_DAG_PAGE_SIZE));

    if (totalPages <= 1) return null;

    const desktopPages = computeWindow(page, totalPages, 5);
    const mobilePages = new Set(computeWindow(page, totalPages, 3));

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationFirst
                        disabled={page <= 1}
                        onClick={() => onPageChange(1)}
                    />
                </PaginationItem>
                <PaginationItem>
                    <PaginationPrevious
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={() => onPageChange(page - 1)}
                    />
                </PaginationItem>
                {desktopPages.map((p) => (
                    <PaginationItem
                        key={p}
                        className={mobilePages.has(p) ? "" : "hidden md:block"}
                    >
                        <PaginationLink
                            isActive={p === page}
                            onClick={() => onPageChange(p)}
                            className="cursor-pointer"
                        >
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={() => onPageChange(page + 1)}
                    />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLast
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(totalPages)}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};


// ── First / Last pagination helpers ────────────────────────────────────

const PaginationFirst = ({
    disabled,
    onClick,
}: {
    disabled: boolean;
    onClick: () => void;
}) => (
    <PaginationLink
        aria-label="Go to first page"
        size="default"
        className={cn(
            "gap-1 pl-2.5 cursor-pointer",
            disabled && "pointer-events-none opacity-50",
        )}
        onClick={disabled ? undefined : onClick}
    >
        <ChevronFirst className="h-4 w-4" />
        <span>First</span>
    </PaginationLink>
);

const PaginationLast = ({
    disabled,
    onClick,
}: {
    disabled: boolean;
    onClick: () => void;
}) => (
    <PaginationLink
        aria-label="Go to last page"
        size="default"
        className={cn(
            "gap-1 pr-2.5 cursor-pointer",
            disabled && "pointer-events-none opacity-50",
        )}
        onClick={disabled ? undefined : onClick}
    >
        <span>Last</span>
        <ChevronLast className="h-4 w-4" />
    </PaginationLink>
);


// ── Exported content component ─────────────────────────────────────────

interface AdminEtlContentProps {
    dags: DagStatus[];
    total: number;
    page: number;
    onPageChange: (page: number) => void;
}

export const AdminEtlContent = ({
    dags,
    total,
    page,
    onPageChange,
}: AdminEtlContentProps) => (
    <>
        <DagsTable dags={dags} />
        <DagsPagination total={total} page={page} onPageChange={onPageChange} />
    </>
);
