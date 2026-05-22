import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Feed from "@/components/routes/Feed";
import Login from "@/components/routes/Login";
import Page from "@/components/routes/Page";
import UserProfile from "@/components/routes/UserProfile";
import AdminUsers from "@/components/routes/admin/Users";
import AdminPageSettings from "@/components/routes/admin/PageSettings";
import AdminEtl from "@/components/routes/admin/EtlJobs";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
}
