import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import { LoadingPlaceholder } from "./loading-placeholder";
import { ErrorPlaceholder } from "./error-placeholder";

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
        return <ErrorPlaceholder message="Failed to load the page." />;
    }

    return <>{children}</>;
};
