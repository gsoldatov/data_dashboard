import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/page-parts/Navbar";

/**
 * App shell: renders the top navbar and a centered content area.
 * Child routes are rendered via React Router's <Outlet /> below the nav.
 */
export const Layout = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
