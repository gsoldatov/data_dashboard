import { PageLayout } from "@/components/stateful/page-layout";
import { VisualizationLink } from "@/components/page-parts/index/visualization-link";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error, Info } from "@/components/common/messages";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { useGetIsPublishedQuery } from "@/store/backend-api-slices/visualization-settings";
import { VISUALIZATIONS } from "@/util/constants";

export const Index = () => {
    const slugs = VISUALIZATIONS.map((v) => v.slug);

    const {
        data: currentUser,
        isFetching: isAuthFetching,
        error: authError,
    } = useGetCurrentUserQuery();
    const isAdmin = currentUser?.role === "admin";

    const {
        isFetching: isSettingsFetching,
        error: settingsError,
        data,
    } = useGetIsPublishedQuery(
        { slugs, settings: ["is-published"] },
        { skip: slugs.length === 0 },
    );

    const published = isAdmin
        ? VISUALIZATIONS
        : data
            ? VISUALIZATIONS.filter((v) => data[v.slug]?.is_published)
            : [];

    if (isAuthFetching || isSettingsFetching) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (authError != null || settingsError != null) {
        return (
            <PageLayout>
                <Error message="Failed to load the page." />
            </PageLayout>
        );
    }

    if (!data) {
        return null;
    }

    if (published.length === 0) {
        return (
            <PageLayout>
                <Info message="No visualizations are available." />
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <h1 className="mb-6 text-2xl font-semibold">
                Dashboard Visualizations
            </h1>
            <ul className="flex flex-col gap-3">
                {published.map((viz) => (
                    <li key={viz.slug}>
                        <VisualizationLink
                            slug={viz.slug}
                            title={viz.title}
                            icon={viz.icon}
                        />
                    </li>
                ))}
            </ul>
        </PageLayout>
    );
};
