import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      // hackarena-2027.html is the same SPA with HackArena-specific <head> tags, so
      // link previews (WhatsApp, LinkedIn) show HackArena instead of the generic site
      // card. vercel.json routes /hackarena-2027/* to it.
      input: {
        main: path.resolve(__dirname, "index.html"),
        hackarena2027: path.resolve(__dirname, "hackarena-2027.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
