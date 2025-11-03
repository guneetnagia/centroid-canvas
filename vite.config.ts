import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // dynamically load dev-only plugin to avoid Rollup trying to resolve / externalize it at build time
  const devPlugins = [] as any[];
  if (mode === "development") {
    try {
      const mod = await import("lovable-tagger");
      if (mod && typeof mod.componentTagger === "function") {
        devPlugins.push(mod.componentTagger());
      }
    } catch (e) {
      // ignore if the dev-only plugin isn't available in some environments
    }
  }

  return {
    base: "/centroid-canvas/",
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), ...devPlugins],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: true
    }
  };
});