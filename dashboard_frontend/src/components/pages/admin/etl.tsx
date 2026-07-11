import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/stateful/page-layout";
import { AdminNavbar } from "@/components/page-parts/admin/admin-navbar";
import { AdminEtlContent } from "@/components/page-parts/admin/etl";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";
import { RefreshButton } from "@/components/page-parts/admin/etl";
import { useGetDagsQuery } from "@/store/backend-api-slices/airflow";
import { ADMIN_ETL_DAG_PAGE_SIZE } from "@/util/constants";


export const AdminEtl = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageParam = searchParams.get("page");
    const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const offset = (page - 1) * ADMIN_ETL_DAG_PAGE_SIZE;

    const { error, data, isFetching, refetch } = useGetDagsQuery(
        { limit: ADMIN_ETL_DAG_PAGE_SIZE, offset },
        { refetchOnMountOrArgChange: true },
    );

    // Poll every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30_000);
        return () => clearInterval(interval);
    }, [refetch]);

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
                <RefreshButton isRefetching={isFetching} onRefresh={handleRefresh} />
                <Error message="Failed to fetch DAGs information." />
            </PageLayout>
        );
    }

    if (!data) {
        return (
            <PageLayout>
                <AdminNavbar />
                <RefreshButton isRefetching={isFetching} onRefresh={handleRefresh} />
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <AdminNavbar />
            <AdminEtlContent
                dags={data.dags}
                total={data.total}
                page={page}
                onPageChange={handlePageChange}
                isRefetching={isFetching}
                onRefresh={handleRefresh}
            />
        </PageLayout>
    );
};
