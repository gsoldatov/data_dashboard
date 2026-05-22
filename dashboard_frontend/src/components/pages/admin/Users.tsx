import { useState } from "react";
import {
    useCreateUserMutation,
    useDeleteUserMutation,
} from "@/store/api/users";

export const AdminUsers = () => {
    const [createUser, { isLoading: isCreating, error: createError }] =
        useCreateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"admin" | "viewer">("viewer");
    const [deleteId, setDeleteId] = useState("");
    const [message, setMessage] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        try {
            const user = await createUser({ username, password, role }).unwrap();
            setMessage(`User "${user.username}" created.`);
            setUsername("");
            setPassword("");
        } catch {
            // Error handled via RTK Query
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        const id = parseInt(deleteId, 10);
        if (isNaN(id)) return;
        try {
            await deleteUser(id).unwrap();
            setMessage(`User ${id} deleted.`);
            setDeleteId("");
        } catch {
            // Error handled via RTK Query
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold">Admin: Users</h1>

            {/* Create User */}
            <section className="mb-8 rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-medium">Create User</h2>
                <form onSubmit={handleCreate} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "admin" | "viewer")}
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                        {isCreating ? "Creating..." : "Create User"}
                    </button>
                </form>
                {createError && (
                    <p className="mt-2 text-sm text-destructive">
                        {"data" in createError
                            ? (createError.data as { detail?: string })?.detail ??
                                "Create failed"
                            : "Create failed"}
                    </p>
                )}
            </section>

            {/* Delete User */}
            <section className="mb-8 rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-medium">Delete User</h2>
                <form onSubmit={handleDelete} className="flex items-end gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                        <label htmlFor="delete-id" className="text-sm font-medium">
                            User ID
                        </label>
                        <input
                            id="delete-id"
                            type="number"
                            value={deleteId}
                            onChange={(e) => setDeleteId(e.target.value)}
                            className="rounded-md border px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isDeleting}
                        className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 cursor-pointer"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </form>
            </section>

            {message && (
                <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
            )}
        </div>
    );
};
