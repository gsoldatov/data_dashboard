/**
 * Renders a visualization page identified by the URL slug.
 *
 * Checks if the visualization can be displayed (stub — all are published),
 * lazily loads the corresponding MDX file, and wraps it in a data loader.
 */
import { Suspense, lazy, type ComponentType } from "react";
import { useParams } from "react-router-dom";
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

    if (!slug || !mdxComponents[slug]) {
        return <ErrorPlaceholder message="Visualization not found." />;
    }

    const MdxComponent = mdxComponents[slug];

    // Stub: all visualizations are published until backend route is added.
    // Phase 1 — settings check (always passes for now).

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
