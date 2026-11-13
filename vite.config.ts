import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

/** node_modules may be a symlink to a folder outside the project; the dev server must be allowed to serve
 *  package files (fonts, workers) from its real location, or they 403 and pages fall back to system fonts. */
function packageRoots(): string[] {
  try {
    return [fs.realpathSync(path.resolve(__dirname, "node_modules"))];
  } catch {
    return [];
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), ...packageRoots()],
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  // Pre-bundle heavy libraries so the preview doesn't re-optimize mid-session; split them into their own cached files.
  optimizeDeps: { include: ["astronomy-engine", "pdf-lib", "qrcode", "xlsx"] },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("pdf-lib") || id.includes("pdfjs-dist")) return "vendor-pdf";
          if (id.includes("/xlsx/")) return "vendor-sheet";
          if (id.includes("astronomy-engine")) return "vendor-astro";
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
