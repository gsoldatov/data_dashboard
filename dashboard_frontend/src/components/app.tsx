import { Routes, Route } from "react-router-dom";
import { Index } from "@/components/pages/index";
import { Login } from "@/components/pages/login";
import { Visualization } from "@/components/pages/visualizations/visualization";
import { UserProfile } from "@/components/pages/user-profile";
import { AdminEtl } from "@/components/pages/admin/etl";
import { AdminVisualizations } from "@/components/pages/admin/visualizations";
import { NotFound } from "@/components/pages/not-found";
import { LocationManageWrapper } from "@/components/stateful/location-manager-wrapper";
import { AdminRoute, AnonymousRoute, AuthRoute } from "@/components/stateful/protected";


/** Export Top-level route elements to allow introspection in tests. */
export const appRouteElements = (
    <>
        <Route index element={<Index />} />
        <Route path="login" element={<AnonymousRoute />}>
            <Route index element={<Login />} />
        </Route>
        <Route path="visualizations/:slug" element={<Visualization />} />
        <Route path="user-profile" element={<AuthRoute />}>
            <Route index element={<UserProfile />} />
        </Route>
        <Route path="admin" element={<AdminRoute />}>
            <Route path="etl" element={<AdminEtl />} />
            <Route path="visualizations" element={<AdminVisualizations />} />
        </Route>
        <Route path="not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
    </>
);

export const App = () => {
    return (
        <LocationManageWrapper>
            <Routes>{appRouteElements}</Routes>
        </LocationManageWrapper>
    );
};
