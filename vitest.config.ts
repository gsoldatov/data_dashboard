import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    // ── Module resolution ──────────────────────────────────────────
    resolve: {
        alias: {
            // `@/` maps to `dashboard_frontend/src/`. Must mirror `paths`
            // in tsconfig.json and `resolve.alias` in vite.config.ts.
            "@": path.resolve(__dirname, "dashboard_frontend", "src"),
        },
    },

    test: {
        // ── Test environment ───────────────────────────────────────
        // Simulate browser DOM in Node. Required for React component
        // tests (render, user events, DOM queries).
        environment: "jsdom",
        // Make `describe`, `it`, `expect`, `vi` available without imports.
        globals: true,
        // Process CSS imports (Tailwind utility classes) in tests so
        // components that import styles don't cause errors.
        css: true,

        // ── Test discovery ─────────────────────────────────────────
        // Files matching this pattern under dashboard_frontend/tests/
        // are treated as test suites.
        include: ["dashboard_frontend/tests/**/test_*.{ts,tsx}"],
        // Runs before each test file — adds jest-dom matchers
        // (`.toBeInTheDocument()`, `.toHaveTextContent()`, etc.).
        setupFiles: ["./dashboard_frontend/tests/setup.ts"],
    },
});
