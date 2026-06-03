/**
 * Renders a visualization page identified by the URL slug.
 *
 * Checks whether the visualization can be displayed (via is-published
 * endpoint), lazily loads the corresponding MDX file, and wraps it in
 * a data loader.
 */
import { Suspense, lazy, type ComponentType } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/stateful/page-layout";
import { useGetIsPublishedQuery } from "@/store/backend-api-slices/visualization-settings";
import { VisualizationDataLoader } from "@/components/page-parts/visualizations/visualization-data-loader";
import { MDXErrorBoundary } from "@/components/page-parts/visualizations/mdx-error-boundary";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";
import { parseRTKQError } from "@/store/util";


const mdxGlob = import.meta.glob("./mdx/*.mdx");


/** Map of slug → lazily-loaded MDX components, built at module scope. */
const mdxComponents: Record<
    string,
    ComponentType<Record<string, unknown>>
> = Object.fromEntries(
    Object.entries(mdxGlob).map(([path, importFn]) => {
        const slug = path.replace("./mdx/", "").replace(".mdx", "");
        return [
            slug,
            lazy(
                importFn as () => Promise<{
                    default: ComponentType<Record<string, unknown>>;
                }>
            ),
        ];
    })
);


export const Visualization = () => {
    const { slug } = useParams<{ slug: string }>();

    // Skip the query when slug is missing, so hooks are called unconditionally.
    const {
        isLoading: isCheckingPublishedStatus,
        error: publishedStatusCheckError,
    } = useGetIsPublishedQuery(slug!, { skip: !slug });

    if (!slug || !mdxComponents[slug]) {
        return (
            <PageLayout>
                <Error message="Page not found." />
            </PageLayout>
        );
    }

    // Phase 1 — query backend to check if visualization can be displayed.
    if (isCheckingPublishedStatus) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (publishedStatusCheckError) {
        const message = parseRTKQError(publishedStatusCheckError).status === 403 ? "Page not found." : "Failed to load the page.";
        return (
            <PageLayout>
                <Error message={message} />
            </PageLayout>
        );
    }

    // Phase 2 — lazily load MDX, fetch required data and display main page content.
    const MdxComponent = mdxComponents[slug];

    return (
        <PageLayout>
            <MDXErrorBoundary>
                <Suspense fallback={<LoadingPlaceholder />}>
                    <VisualizationDataLoader slug={slug}>
                        <MdxComponent />
                    </VisualizationDataLoader>
                </Suspense>
            </MDXErrorBoundary>
        </PageLayout>
    );
};
