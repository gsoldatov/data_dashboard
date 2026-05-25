import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearUser } from "@/store/slices/auth";
import { useUpdateUserMutation } from "@/store/backend-api-slices/users";
import { backendAPI } from "@/store/backend-api";

export const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const [updateUser, { isLoading, error, isSuccess }] =
        useUpdateUserMutation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username);
        }
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="mx-auto mt-16 max-w-sm text-center">
                <p className="mb-4 text-muted-foreground">
                    You must be logged in to view this page.
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const body: {
            username?: string;
            password?: string;
        } = {};

        if (username !== currentUser.username) {
            body.username = username;
        }
        if (password) {
            body.password = password;
        }

        if (Object.keys(body).length === 0) {
            setMessage("No changes to save.");
            return;
        }

        try {
            await updateUser({ userId: currentUser.id, body }).unwrap();
            setPassword("");
            setMessage("Profile updated.");
        } catch {
            // Error handled via RTK Query error state
        }
    };

    const handleLogout = async () => {
        // TODO remove logout
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Proceed regardless
        }
        dispatch(clearUser());
        dispatch(backendAPI.util.resetApiState());
        navigate("/");
    };

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
            <div className="mb-6 rounded-lg border p-4 text-sm">
                <p>
                    <span className="text-muted-foreground">Role: </span>
                    <span className="font-medium capitalize">{currentUser.role}</span>
                </p>
                <p>
                    <span className="text-muted-foreground">Joined: </span>
                    <span className="font-medium">
                        {new Date(currentUser.created_at).toLocaleDateString()}
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="profile-username" className="text-sm font-medium">
                        Username
                    </label>
                    <input
                        id="profile-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="profile-password" className="text-sm font-medium">
                        New Password (leave blank to keep current)
                    </label>
                    <input
                        id="profile-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                {error && (
                    <p className="text-sm text-destructive">
                        {"data" in error
                            ? (error.data as { detail?: string })?.detail ?? "Update failed"
                            : "Update failed"}
                    </p>
                )}
                {isSuccess && message && (
                    <p className="text-sm text-green-600">{message}</p>
                )}
                {message && !isSuccess && (
                    <p className="text-sm text-muted-foreground">{message}</p>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </form>

            <hr className="my-6 border-t" />

            <button
                onClick={handleLogout}
                className="w-full rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
            >
                Logout
            </button>
        </div>
    );
};
