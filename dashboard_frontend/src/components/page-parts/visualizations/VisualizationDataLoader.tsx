import { useGetVisualizationDataQuery } from "@/store/api/visualizationData";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { ErrorPlaceholder } from "./ErrorPlaceholder";

interface VisualizationDataLoaderProps {
    slug: string;
    children: React.ReactNode;
}

/**
 * Fetches visualization data and renders children when data is available.
 *
 * Displays loading and error placeholders while the RTK Query request
 * is in progress or has failed. On success the children (normally the
 * MDX content component) are rendered.
 */
export const VisualizationDataLoader = ({
    slug,
    children,
}: VisualizationDataLoaderProps) => {
    const { isLoading, error } = useGetVisualizationDataQuery(slug);

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        const detail =
            "data" in error
                ? (error.data as { detail?: string })?.detail ??
                  "Failed to load data"
                : "Failed to load data";
        return <ErrorPlaceholder message={detail} />;
    }

    return <>{children}</>;
};
