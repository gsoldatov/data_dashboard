import { PageLayout } from "@/components/stateful/page-layout";
import { LoginForm } from "@/components/page-parts/login/login-form";

// TODO add redirect to previous page after login
export const Login = () => (
    <PageLayout>
        <LoginForm />
    </PageLayout>
);
