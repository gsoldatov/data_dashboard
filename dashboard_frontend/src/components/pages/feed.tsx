import { PageLayout } from "@/components/stateful/page-layout";
import { VisualizationLink } from "@/components/page-parts/feed/visualization-link";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error, Info } from "@/components/common/messages";
import { useGetIsPublishedQuery } from "@/store/backend-api-slices/visualization-settings";
import type { VisualizationInfo } from "@/types";

/** Hardcoded list of visualizations known to the feed page. */
const VISUALIZATIONS: VisualizationInfo[] = [
    { slug: "russia_state_budget", title: "Russia State Budget" },
];

export const Feed = () => {
    const slugs = VISUALIZATIONS.map((v) => v.slug);

    const { isLoading, error, data } = useGetIsPublishedQuery(
        { slugs, settings: ["is-published"] },
        { skip: slugs.length === 0 },
    );

    const published =
        data
            ? VISUALIZATIONS.filter((v) => data[v.slug]?.is_published)
            : [];

    if (isLoading) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (error != null) {
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
                        />
                    </li>
                ))}
            </ul>
        </PageLayout>
    );
};
