import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { setRedirectOnRender } from "@/store/slices/ui";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { PageLayout } from "@/components/stateful/page-layout";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";

/**
 * Return the redirect target if valid, or null.
 *
 * Only relative paths starting with ``/`` are accepted.
 */
function validRedirect(raw: string | null): string | null {
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
        return raw;
    }
    return null;
}

/** Route guard: only renders children when the current user is anonymous. */
export const AnonymousRoute = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const { data: currentUser, isLoading, error } = useGetCurrentUserQuery();

    const redirectTo = validRedirect(searchParams.get("redirect")) ?? "/";

    const redirectTarget =
        !isLoading && !error && currentUser ? redirectTo : null;

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
