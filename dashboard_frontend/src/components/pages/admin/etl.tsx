import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/stateful/page-layout";
import { AdminNavbar } from "@/components/page-parts/admin/admin-navbar";
import { AdminEtlContent, Toolbar } from "@/components/page-parts/admin/etl";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";
import { useGetDagsQuery } from "@/store/backend-api-slices/airflow";
import { ADMIN_ETL_DAG_PAGE_SIZE } from "@/util/constants";
import { useDebouncedValue } from "@/util/hooks";


export const AdminEtl = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageParam = searchParams.get("page");
    const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const offset = (page - 1) * ADMIN_ETL_DAG_PAGE_SIZE;

    const urlPattern = searchParams.get("dag_id_pattern") ?? "";
    const [inputValue, setInputValue] = useState(urlPattern);

    const debouncedPattern = useDebouncedValue(inputValue, 300);

    // Commit debounced pattern to URL (reset page to 1 on change)
    useEffect(() => {
        if (debouncedPattern === urlPattern) return;
        const next = new URLSearchParams(searchParams);
        if (debouncedPattern) {
            next.set("dag_id_pattern", debouncedPattern);
        } else {
            next.delete("dag_id_pattern");
        }
        next.set("page", "1");
        setSearchParams(next);
    }, [debouncedPattern]);

    const { error, data, isFetching, refetch } = useGetDagsQuery(
        {
            limit: ADMIN_ETL_DAG_PAGE_SIZE,
            offset,
            dag_id_pattern: urlPattern || undefined,
        },
        { refetchOnMountOrArgChange: true },
    );

    // Poll every 30 seconds — restart timer when pattern changes
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30_000);
        return () => clearInterval(interval);
    }, [refetch, urlPattern]);

    // ── refocus filter input after fetch triggered by typing ──────────

    const inputRef = useRef<HTMLInputElement>(null);
    const prevIsFetching = useRef(isFetching);
    const shouldRefocus = useRef(false);

    if (isFetching && !prevIsFetching.current) {
        shouldRefocus.current = document.activeElement === inputRef.current;
    }
    prevIsFetching.current = isFetching;

    useEffect(() => {
        if (!isFetching && shouldRefocus.current) {
            inputRef.current?.focus();
            shouldRefocus.current = false;
        }
    }, [isFetching]);

    const handlePageChange = (newPage: number) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(newPage));
        setSearchParams(next);
    };

    const handleRefresh = () => {
        refetch();
    };

    if (error != null) {
        return (
            <PageLayout>
                <AdminNavbar />
                <Toolbar
                    isRefetching={isFetching}
                    onRefresh={handleRefresh}
                    filterText={inputValue}
                    onFilterChange={setInputValue}
                    inputRef={inputRef}
                />
                <Error message="Failed to fetch DAGs information." />
            </PageLayout>
        );
    }

    if (!data) {
        return (
            <PageLayout>
                <AdminNavbar />
                <Toolbar
                    isRefetching={isFetching}
                    onRefresh={handleRefresh}
                    filterText={inputValue}
                    onFilterChange={setInputValue}
                    inputRef={inputRef}
                />
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <AdminNavbar />
            <Toolbar
                isRefetching={isFetching}
                onRefresh={handleRefresh}
                filterText={inputValue}
                onFilterChange={setInputValue}
                inputRef={inputRef}
            />
            <AdminEtlContent
                dags={data.dags}
                total={data.total}
                page={page}
                onPageChange={handlePageChange}
            />
        </PageLayout>
    );
};
