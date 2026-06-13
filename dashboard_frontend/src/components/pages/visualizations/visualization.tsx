/**
 * Renders a visualization page identified by the URL slug.
 *
 * Checks whether the visualization can be displayed (via is-published
 * endpoint), lazily loads the corresponding MDX file, and wraps it in
 * a data loader.
 */
import { Suspense, lazy, useEffect, type ComponentType } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { setRedirectOnRender } from "@/store/slices/ui";
import { PageLayout } from "@/components/stateful/page-layout";
import { useGetIsPublishedQuery } from "@/store/backend-api-slices/visualization-settings";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { VisualizationDataLoader } from "@/components/page-parts/visualizations/visualization-data-loader";
import { MDXErrorBoundary } from "@/components/page-parts/visualizations/mdx-error-boundary";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";


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
    const dispatch = useAppDispatch();

    const {
        data: currentUser,
        isFetching: isFetchingAuth,
        error: authError,
    } = useGetCurrentUserQuery();
    const isAdmin = currentUser?.role === "admin";

    // Skip the query when slug is missing, so hooks are called unconditionally.
    const {
        isFetching: isFetchingPublishedStatus,
        error: publishedStatusCheckError,
        data: publishedStatus,
    } = useGetIsPublishedQuery(
        { slugs: slug ? [slug] : [], settings: ["is-published"] },
        { skip: !slug },
    );

    const isInvalidSlug = !slug || !mdxComponents[slug];

    const redirectToNotFound =
        isInvalidSlug ||
        // visualization is not published (admins can view unpublished)
        (!isAdmin && publishedStatus != null && !publishedStatus[slug]?.is_published);

    // Redirect effect — dispatched after render to avoid React warning.
    useEffect(() => {
        if (redirectToNotFound) {
            dispatch(setRedirectOnRender("/not-found"));
        }
    }, [redirectToNotFound, dispatch]);

    if (redirectToNotFound) {
        return null;
    }

    // Phase 1 — wait for both queries to settle.
    if (isFetchingAuth || (slug && isFetchingPublishedStatus)) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (authError != null || publishedStatusCheckError != null) {
        return (
            <PageLayout>
                <Error message="Failed to load the page." />
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
