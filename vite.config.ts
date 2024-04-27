import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePluginRadar } from "vite-plugin-radar";

export default defineConfig({
  plugins: [
    react(),
    VitePluginRadar({
      enableDev: false,
      analytics: {
        id: "G-DM5EHE62E0",
      },
    }),
  ],
});
