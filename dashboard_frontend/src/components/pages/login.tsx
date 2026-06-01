import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/stateful/page-layout";
import { LoginForm } from "@/components/page-parts/login/login-form";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";

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

export const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { data: currentUser, isLoading: isUserLoading } =
        useGetCurrentUserQuery();

    // Redirect to a specified page or index, when authenticated
    const redirectTo = validRedirect(searchParams.get("redirect")) ?? "/";

    useEffect(() => {
        if (currentUser) {
            navigate(redirectTo, { replace: true });
        }
    }, [currentUser, navigate, redirectTo]);

    // Display a placeholder, while a user loads
    if (isUserLoading) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    // Render login form
    return (
        <PageLayout>
            <LoginForm />
        </PageLayout>
    );
};
