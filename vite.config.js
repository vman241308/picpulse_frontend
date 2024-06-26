import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // '@/components/Auth/SignIn' will resolve to './src/components/Auth/SignIn'
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
