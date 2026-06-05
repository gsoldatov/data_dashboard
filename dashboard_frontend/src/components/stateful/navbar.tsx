import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { backendAPI } from "@/store/backend-api";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/store/backend-api-slices/auth";
import { LogIn, LogOut, LayoutDashboard, User, Menu, X } from "lucide-react";


const NavbarLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
        {children}
    </Link>
);


const NavbarBrand = () => (
    <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
        <LayoutDashboard className="h-5 w-5" />
        Data Dashboard
    </Link>
);


const NavbarMenuLinks = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const isAdmin = currentUser?.role === "admin";

    return (
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <NavbarLink to="/">Visualizations</NavbarLink>
            {isAdmin && <NavbarLink to="/admin/visualizations">Admin</NavbarLink>}
        </div>
    );
};


const NavbarSecondaryMenuLoggedOut = () => (
    <NavbarLink to="/login">
        <LogIn className="h-4 w-4" />
        Login
    </NavbarLink>
);


const NavbarSecondaryMenuLoggedIn = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch {
            // Logout should succeed regardless of server response
        }
        dispatch(backendAPI.util.resetApiState());
        navigate("/");
    };

    return (
        <>
            <NavbarLink to="/profile">
                <User className="h-4 w-4" />
                {currentUser?.username}
            </NavbarLink>
            <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </>
    );
};


const NavbarSecondaryMenu = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const isAuthenticated = currentUser != null;

    return (
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
            {isAuthenticated ? <NavbarSecondaryMenuLoggedIn /> : <NavbarSecondaryMenuLoggedOut />}
        </div>
    );
};


/**
 * Top-level navigation bar with branding, page links, and auth controls.
 *
 * On mobile the nav links and secondary menu are hidden behind a toggle.
 * Adapts to the current authentication state: shows user info and logout
 * when authenticated, a login link otherwise.  Admin users see an additional
 * admin link in the main menu.
 */
export const Navbar = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <nav className="border-b bg-background">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-3 md:flex-row md:justify-between">
                <div className="flex w-full items-center justify-between md:w-auto">
                    <NavbarBrand />
                    <button
                        className="md:hidden cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                        aria-label="Toggle navigation"
                    >
                        {expanded ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <div
                    className={
                        `flex flex-col items-center gap-3 md:flex-row md:flex-1 md:justify-between ${
                            expanded ? "flex" : "hidden"
                        } md:flex`
                    }
                    onClick={() => setExpanded(false)}
                >
                    <NavbarMenuLinks />
                    <NavbarSecondaryMenu />
                </div>
            </div>
        </nav>
    );
};
