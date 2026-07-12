import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { backendAPI } from "@/store/backend-api";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/store/backend-api-slices/auth";
import { LogIn, LogOut, LayoutDashboard, User, Menu, X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/styles/utils";


const NavbarLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className={cn(
            // Layout
            "flex items-center gap-1",
            // Typography
            "text-sm text-muted-foreground",
            // Interaction
            "hover:text-foreground transition-colors",
        )}
    >
        {children}
    </Link>
);


const NavbarBrand = () => (
    <Link
        to="/"
        className={cn(
            // Layout
            "flex items-center gap-2",
            // Typography
            "font-semibold text-lg",
        )}
    >
        <LayoutDashboard className="h-5 w-5" />
        Data Dashboard
    </Link>
);


const NavbarMenuLinks = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const isAdmin = currentUser?.role === "admin";

    return (
        <div
            className={cn(
                // Mobile layout
                "flex flex-col items-center gap-2",
                // Desktop layout
                "md:flex-row md:gap-4",
            )}
        >
            <NavbarLink to="/">Visualizations</NavbarLink>
            {isAdmin && <NavbarLink to="/admin/etl">Admin</NavbarLink>}
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
    const [logout, { isLoading, isError }] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            // Only clear session state after the server confirmed cookie deletion.
            dispatch(backendAPI.util.resetApiState());
            navigate("/");
        } catch {
            // Stay authenticated — the server did not clear the cookie.
        }
    };

    return (
        <>
            <NavbarLink to="/user-profile">
                <User className="h-4 w-4" />
                {currentUser?.username}
            </NavbarLink>
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className={cn(
                    // Layout
                    "flex items-center gap-1",
                    // Typography
                    "text-sm text-muted-foreground",
                    // Interaction
                    "hover:text-destructive transition-colors",
                )}
                title={
                    isLoading
                        ? "Logging out..."
                        : isError
                            ? "Failed to log out."
                            : undefined
                }
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isError ? (
                    <AlertTriangle className="h-4 w-4" />
                ) : (
                    <LogOut className="h-4 w-4" />
                )}
                Logout
            </button>
        </>
    );
};


const NavbarSecondaryMenu = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const isAuthenticated = currentUser != null;

    return (
        <div
            className={cn(
                // Mobile layout
                "flex flex-col items-center gap-2",
                // Desktop layout
                "md:flex-row md:gap-3",
            )}
        >
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
        <nav
            className={cn(
                // Border
                "border-b",
                // Background
                "bg-background",
            )}
        >
            <div
                className={cn(
                    // Centering
                    "mx-auto",
                    // Width constraints
                    "w-full lg:w-4/5 lg:max-w-[1536px]",
                    // Flex layout
                    "flex flex-col items-center gap-3 md:flex-row md:justify-between",
                    // Inner spacing
                    "px-4 py-3",
                )}
            >
                <div
                    className={cn(
                        // Layout
                        "flex items-center justify-between",
                        // Responsive width
                        "w-full md:w-auto",
                    )}
                >
                    <NavbarBrand />
                    <button
                        className={cn(
                            // Visibility
                            "md:hidden",
                        )}
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
                    className={cn(
                        // Layout
                        "flex flex-col items-center gap-3 md:flex-row md:flex-1 md:justify-between",
                        // Visibility toggle
                        expanded ? "flex" : "hidden",
                        "md:flex",
                    )}
                    onClick={() => setExpanded(false)}
                >
                    <NavbarMenuLinks />
                    <NavbarSecondaryMenu />
                </div>
            </div>
        </nav>
    );
};
