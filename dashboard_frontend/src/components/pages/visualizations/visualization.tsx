/**
 * Renders a visualization page identified by the URL slug.
 *
 * Checks whether the visualization can be displayed (via is-published
 * endpoint), loads the corresponding MDX module, extracts its DATASETS
 * export, and fetches required data before rendering.
 */
import { useEffect, useState, type ComponentType } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { setRedirectOnRender } from "@/store/slices/ui";
import { PageLayout } from "@/components/stateful/page-layout";
import { useGetIsPublishedQuery } from "@/store/backend-api-slices/visualization-settings";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { MDXErrorBoundary } from "@/components/page-parts/visualizations/wrappers/mdx-error-boundary";
import { VisualizationDataLoader } from "@/components/page-parts/visualizations/wrappers/visualization-data-loader";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";
import { mdxComponents as mdxComponentMap } from "@/components/common/mdx";


const mdxGlob = import.meta.glob("./mdx/*.mdx");


/** Loaded MDX module: the default-export component and its DATASETS list. */
interface MdxModule {
    Component: ComponentType<Record<string, unknown>>;
    datasets: string[];
}

/**
 * Dynamically imports the MDX module for *slug* and extracts the
 * default-export component and the named `DATASETS` export.
 */
const useMdxModule = (slug: string | undefined) => {
    const [loadedModule, setLoadedModule] = useState<MdxModule | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!slug) return;

        const importFn = mdxGlob[`./mdx/${slug}.mdx`];
        if (!importFn) return;

        setLoadedModule(null);
        setError(null);

        importFn().then(
            (mod) => {
                if (cancelled) return;
                const md = mod as {
                    default: ComponentType<Record<string, unknown>>;
                    DATASETS?: string[];
                };
                setLoadedModule({
                    Component: md.default,
                    datasets: md.DATASETS ?? [],
                });
            },
            (err) => {
                if (!cancelled) setError(err as Error);
            },
        );

        return () => {
            cancelled = true;
        };
    }, [slug]);

    return { loadedModule, error };
};


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

    const isInvalidSlug = !slug || !mdxGlob[`./mdx/${slug}.mdx`];

    const redirectToNotFound =
        isInvalidSlug ||
        // visualization is not published (admins can view unpublished)
        (!isAdmin && publishedStatus != null && publishedStatus[slug] != null && !publishedStatus[slug].is_published);

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

    // Phase 2 — load MDX module and render page content.
    return <MdxPage slug={slug!} />;
};


/** Inner component that loads the MDX module for the given slug,
 *  fetches the required datasets, and renders the page. */
const MdxPage = ({ slug }: { slug: string }) => {
    const { loadedModule, error: mdxError } = useMdxModule(slug);

    if (!loadedModule && mdxError == null) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (mdxError != null) {
        return (
            <PageLayout>
                <Error message="Failed to load the page." />
            </PageLayout>
        );
    }

    if (!loadedModule) {
        return null;
    }

    return (
        <PageLayout>
            <MDXErrorBoundary>
                <VisualizationDataLoader
                    datasetNames={loadedModule.datasets}
                >
                    <loadedModule.Component
                        components={mdxComponentMap}
                    />
                </VisualizationDataLoader>
            </MDXErrorBoundary>
        </PageLayout>
    );
};
