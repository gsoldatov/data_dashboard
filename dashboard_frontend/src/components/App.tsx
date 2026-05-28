import { Routes, Route } from "react-router-dom";
import { Feed } from "@/components/pages/Feed";
import { Login } from "@/components/pages/Login";
import { Visualization } from "@/components/pages/visualizations/Visualization";
import { UserProfile } from "@/components/pages/UserProfile";
import { AdminUsers } from "@/components/pages/admin/Users";
import { AdminVisualizationSettings } from "@/components/pages/admin/VisualizationSettings";
import { AdminEtl } from "@/components/pages/admin/EtlJobs";

export const App = () => {
    return (
        <Routes>
            <Route index element={<Feed />} />
            <Route path="login" element={<Login />} />
            <Route path="visualizations/:slug" element={<Visualization />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="admin">
                <Route path="users" element={<AdminUsers />} />
                <Route path="visualizations" element={<AdminVisualizationSettings />} />
                <Route path="etl" element={<AdminEtl />} />
            </Route>
        </Routes>
    );
};
