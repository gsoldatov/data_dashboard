/**
 * Renders a visualization page identified by the URL slug.
 *
 * Checks whether the visualization can be displayed (via is-published
 * endpoint), lazily loads the corresponding MDX file, and wraps it in
 * a data loader.
 */
import { Suspense, lazy, type ComponentType } from "react";
import { useParams } from "react-router-dom";
import { useGetIsPublishedQuery } from "@/store/api/visualizationSettings";
import { VisualizationDataLoader } from "@/components/page-parts/visualizations/VisualizationDataLoader";
import { MDXErrorBoundary } from "@/components/page-parts/visualizations/MDXErrorBoundary";
import { LoadingPlaceholder } from "@/components/page-parts/visualizations/LoadingPlaceholder";
import { ErrorPlaceholder } from "@/components/page-parts/visualizations/ErrorPlaceholder";


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
        return <ErrorPlaceholder message="Page not found." />;
    }

    // Phase 1 — query backend to check if visualization can be displayed.
    if (isCheckingPublishedStatus) {
        return <LoadingPlaceholder />;
    }

    if (publishedStatusCheckError) {
        if ("status" in publishedStatusCheckError && publishedStatusCheckError.status === 403) {
            return <ErrorPlaceholder message="Page not found." />;
        }
        return <ErrorPlaceholder message="Failed to load the page." />;
    }

    // Phase 2 — lazily load MDX, fetch required data and display main page content.
    const MdxComponent = mdxComponents[slug];

    return (
        <MDXErrorBoundary>
            <Suspense fallback={<LoadingPlaceholder />}>
                <VisualizationDataLoader slug={slug}>
                    <MdxComponent />
                </VisualizationDataLoader>
            </Suspense>
        </MDXErrorBoundary>
    );
};
