import { defineConfig } from "vitest/config";
import path from "path";
import fs from "fs";
import mdx from "@mdx-js/rollup";

/**
 * Load environment variables from config.env.example,
 * so global object with app's config can be created.
 */
function loadViteEnvs(): Record<string, string> {
    const configPath = path.resolve(__dirname, "config.env.example");
    const viteEnvs: Record<string, string> = {};
    const lines = fs.readFileSync(configPath, "utf-8").split("\n");
    const exportRe = /^export\s+(VITE_\w+)\s*=\s*"([^"]*)"/;

    for (const line of lines) {
        const match = line.match(exportRe);
        if (match) {
            viteEnvs[match[1]] = match[2];
        }
    }

    return viteEnvs;
}

export default defineConfig({
    // ── Module resolution ──────────────────────────────────────────
    resolve: {
        alias: {
            // `@/` maps to `dashboard_frontend/src/`. Must mirror `paths`
            // in tsconfig.json and `resolve.alias` in vite.config.ts.
            "@": path.resolve(__dirname, "dashboard_frontend", "src"),
        },
    },

    plugins: [
        // Transform MDX files before React sees them.  Must mirror the
        // Vite build config.  `enforce: "pre"` ensures it runs first.
        { enforce: "pre", ...mdx() },
    ],

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
        // Populate environment variables from config example, so
        // app config can be properly build
        env: loadViteEnvs(),

        // ── Test discovery ─────────────────────────────────────────
        // Files matching this pattern under dashboard_frontend/tests/
        // are treated as test suites.
        include: ["dashboard_frontend/tests/tests/**/*.test.{ts,tsx}"],
        // Per-file setup
        setupFiles: ["./dashboard_frontend/tests/setup.ts"],
    },
});
