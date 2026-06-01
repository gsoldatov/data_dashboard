import { Navigate } from "react-router-dom";
import { PageLayout } from "@/components/stateful/page-layout";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { LoginForm } from "@/components/page-parts/login/login-form";

// TODO add redirect to previous page after login
export const Login = () => {
    const { data: currentUser, isLoading: isQueryLoading } =
        useGetCurrentUserQuery();

    if (isQueryLoading) {
        return (
            <PageLayout>
                <LoadingPlaceholder />
            </PageLayout>
        );
    }

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return (
        <PageLayout>
            <LoginForm />
        </PageLayout>
    );
};
