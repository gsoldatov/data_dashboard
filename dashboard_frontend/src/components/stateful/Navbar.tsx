import { Link } from "react-router-dom";
import {
    useAppSelector,
    useAppDispatch,
} from "@/store";
import { clearUser } from "@/store/slices/auth";
import { backendAPI } from "@/store/backend-api";
import { LogIn, LogOut, LayoutDashboard, User, Settings } from "lucide-react";

export const Navbar = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.user !== null);
    const isAdmin = useAppSelector(
        (state) => state.auth.user?.role === "admin",
    );
    const currentUser = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Logout should succeed regardless of server response
        }
        dispatch(clearUser());
        dispatch(backendAPI.util.resetApiState());
    };

    return (
        <nav className="border-b bg-background">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                        <LayoutDashboard className="h-5 w-5" />
                        Data Dashboard
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-foreground transition-colors">
                            Visualizations
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/admin/visualizations"
                                className="hover:text-foreground transition-colors"
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <User className="h-4 w-4" />
                                {currentUser?.username}
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin/visualizations"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogIn className="h-4 w-4" />
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
