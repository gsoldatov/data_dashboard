import { Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";

interface AnonymousRouteProps {
    children: React.ReactNode;
}

/** Renders children only when the user is not authenticated. */
export const AnonymousRoute = ({ children }: AnonymousRouteProps) => {
    const { data: currentUser, isLoading: isQueryLoading } =
        useGetCurrentUserQuery();

    if (isQueryLoading) {
        return <LoadingPlaceholder />;
    }

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
