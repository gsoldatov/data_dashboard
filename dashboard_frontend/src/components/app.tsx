import { Routes, Route } from "react-router-dom";
import { Feed } from "@/components/pages/feed";
import { Login } from "@/components/pages/login";
import { Visualization } from "@/components/pages/visualizations/visualization";
import { UserProfile } from "@/components/pages/user-profile";
import { AdminUsers } from "@/components/pages/admin/users";
import { AdminVisualizationSettings } from "@/components/pages/admin/visualization-settings";
import { AdminEtl } from "@/components/pages/admin/etl-jobs";
import { LocationManageWrapper } from "@/components/stateful/location-manager-wrapper";
import { AnonymousRoute } from "@/components/stateful/protected-routes/anonymous-route";

export const App = () => {
    return (
        <LocationManageWrapper>
            <Routes>
                <Route index element={<Feed />} />
                <Route path="login" element={<AnonymousRoute><Login /></AnonymousRoute>} />
                <Route path="visualizations/:slug" element={<Visualization />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="admin">
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="visualizations" element={<AdminVisualizationSettings />} />
                    <Route path="etl" element={<AdminEtl />} />
                </Route>
            </Routes>
        </LocationManageWrapper>
    );
};
