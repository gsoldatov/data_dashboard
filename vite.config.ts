import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import path from "path";

export default defineConfig({
    // ── Plugins ────────────────────────────────────────────────────
    plugins: [
        // Process Tailwind CSS v4 utility classes and theme configuration.
        tailwindcss(),
        // Transform MDX files before React sees them so JSX in .mdx is
        // already resolved. `enforce: "pre"` ensures it runs first.
        { enforce: "pre", ...mdx() },
        // React JSX transform, Fast Refresh in dev, and production
        // optimizations.
        react(),
    ],

    // ── Project structure ──────────────────────────────────────────
    // Set project root to the frontend subdirectory, where index.html
    // and public assets live.
    root: "dashboard_frontend",
    resolve: {
        alias: {
            // `@/` maps to `dashboard_frontend/src/`. Must mirror `paths`
            // in tsconfig.json and `resolve.alias` in vitest.config.ts.
            "@": path.resolve(__dirname, "dashboard_frontend", "src"),
        },
    },

    // ── Build ──────────────────────────────────────────────────────
    build: {
        // Output directory, relative to `root`.
        outDir: "dist",
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Recharts and chart/selector components — used only by
                    // lazy-loaded MDX visualization pages.
                    if (
                        id.includes("/node_modules/recharts/") ||
                        id.includes("/components/common/visualizations/") ||
                        id.includes("/src/styles/charts")
                    )
                        return "charts";

                    // shadcn/ui wrappers together with their dependencies
                    // (Radix primitives, Lucide icons, styling utilities)
                    // so the chunk is self-contained and cacheable.
                    if (
                        id.includes("/components/common/shadcn-ui/") ||
                        id.includes("/node_modules/@radix-ui/") ||
                        id.includes("/node_modules/lucide-react/") ||
                        id.includes("/node_modules/class-variance-authority/") ||
                        id.includes("/node_modules/clsx/") ||
                        id.includes("/node_modules/tailwind-merge/")
                    )
                        return "shadcn-ui";
                },
            },
        },
    },
});
