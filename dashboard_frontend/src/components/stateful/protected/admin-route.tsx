import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { setRedirectOnRender } from "@/store/slices/ui";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { PageLayout } from "@/components/stateful/page-layout";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";

/** Route guard: only renders children when the current user is an admin. */
export const AdminRoute = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { data: currentUser, isLoading, error } = useGetCurrentUserQuery();

    const redirectTarget = !isLoading && !error
        ? !currentUser
            ? `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
            : currentUser.role !== "admin"
                ? "/"
                : null
        : null;

    useEffect(() => {
        if (redirectTarget) {
            dispatch(setRedirectOnRender(redirectTarget));
        }
    }, [redirectTarget, dispatch]);

    if (isLoading) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <Error message="Failed to load the page." />
            </PageLayout>
        );
    }

    if (redirectTarget) {
        return null;
    }

    return <Outlet />;
};
