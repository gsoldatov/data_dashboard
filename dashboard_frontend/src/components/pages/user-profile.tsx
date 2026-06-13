import { PageLayout } from "@/components/stateful/page-layout";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";
import { Error } from "@/components/common/messages";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { UserDataContainer } from "@/components/page-parts/user-profile/user-data-container";
import { UserInfo } from "@/components/page-parts/user-profile/user-info";
import { UserForm } from "@/components/page-parts/user-profile/user-form";

export const UserProfile = () => {
    const { isLoading, error } = useGetCurrentUserQuery();

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

    return (
        <PageLayout>
            <UserDataContainer>
                <h1 className="mb-6 text-2xl font-semibold">User Profile</h1>
                <UserInfo />
                <UserForm />
            </UserDataContainer>
        </PageLayout>
    );
};
