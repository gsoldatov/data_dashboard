import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { backendAPI } from "@/store/backend-api";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/store/backend-api-slices/auth";
import { LogIn, LogOut, LayoutDashboard, User, Settings } from "lucide-react";


const NavbarLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
        {children}
    </Link>
);


const NavbarMenu = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const isAdmin = currentUser?.role === "admin";

    return (
        <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                <LayoutDashboard className="h-5 w-5" />
                Data Dashboard
            </Link>
            <div className="flex items-center gap-4">
                <NavbarLink to="/">Visualizations</NavbarLink>
                {isAdmin && <NavbarLink to="/admin/visualizations">Admin</NavbarLink>}
            </div>
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
    const isAdmin = currentUser?.role === "admin";
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
            {isAdmin && (
                <NavbarLink to="/admin/visualizations">
                    <Settings className="h-4 w-4" />
                </NavbarLink>
            )}
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
        <div className="flex items-center gap-3">
            {isAuthenticated ? <NavbarSecondaryMenuLoggedIn /> : <NavbarSecondaryMenuLoggedOut />}
        </div>
    );
};


/**
 * Top-level navigation bar with branding, page links, and auth controls.
 *
 * Adapts to the current authentication state: shows user info and logout
 * when authenticated, a login link otherwise.  Admin users see additional
 * admin links in both the main menu and the secondary menu.
 */
export const Navbar = () => (
    <nav className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <NavbarMenu />
            <NavbarSecondaryMenu />
        </div>
    </nav>
);
