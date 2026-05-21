import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    { enforce: "pre", ...mdx() },
    react(),
  ],
  root: "dashboard_frontend",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "dashboard_frontend", "src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
