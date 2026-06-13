import { PageLayout } from "@/components/stateful/page-layout";
import { AdminNavbar } from "@/components/page-parts/admin/admin-navbar";
import { AdminVisualizationsContent } from "@/components/page-parts/admin/visualizations";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";
import { useGetIsPublishedQuery } from "@/store/backend-api-slices/visualization-settings";
import { VISUALIZATIONS } from "@/util/constants";

export const AdminVisualizations = () => {
    const slugs = VISUALIZATIONS.map((v) => v.slug);

    const { isLoading, error, data } = useGetIsPublishedQuery(
        { slugs, settings: ["is-published"] },
    );

    if (isLoading) {
        return (
            <PageLayout>
                <AdminNavbar />
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (error != null) {
        return (
            <PageLayout>
                <AdminNavbar />
                <Error message="Failed to load the page." />
            </PageLayout>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <PageLayout>
            <AdminNavbar />
            <AdminVisualizationsContent settings={data} />
        </PageLayout>
    );
};
