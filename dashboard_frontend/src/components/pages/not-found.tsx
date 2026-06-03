import { PageLayout } from "@/components/stateful/page-layout";
import { Error } from "@/components/common/messages";

export const NotFound = () => (
    <PageLayout>
        <Error message="Page not found." />
    </PageLayout>
);
