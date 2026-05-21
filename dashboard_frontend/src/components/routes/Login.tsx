import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useLoginMutation } from "@/store/api/auth";
import { useAppSelector, useAppDispatch, selectIsAuthenticated } from "@/store";
import { setUser } from "@/store/slices/auth";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login, { isLoading, error }] = useLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await login({ username, password }).unwrap();
      // TODO: replace with GET /api/auth/me
      const response = await fetch(`/api/users/${session.user_id}`, {
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        dispatch(setUser(user));
      }
      navigate("/");
    } catch {
      // Error handled via RTK Query error state
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
            required
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {"data" in error
              ? (error.data as { detail?: string })?.detail ?? "Login failed"
              : "Login failed"}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
