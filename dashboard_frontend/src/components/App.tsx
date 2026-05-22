import { Routes, Route } from "react-router-dom";
import { PageLayout } from "@/components/stateful/PageLayout";
import { Feed } from "@/components/pages/Feed";
import { Login } from "@/components/pages/Login";
import { Page } from "@/components/pages/Page";
import { UserProfile } from "@/components/pages/UserProfile";
import { AdminUsers } from "@/components/pages/admin/Users";
import { AdminPageSettings } from "@/components/pages/admin/PageSettings";
import { AdminEtl } from "@/components/pages/admin/EtlJobs";

export const App = () => {
    return (
        <Routes>
            <Route element={<PageLayout />}>
                <Route index element={<Feed />} />
                <Route path="login" element={<Login />} />
                <Route path="page/:slug" element={<Page />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="admin">
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="pages" element={<AdminPageSettings />} />
                    <Route path="etl" element={<AdminEtl />} />
                </Route>
            </Route>
        </Routes>
    );
};
