import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: true,
      registerType: "autoUpdate",
      manifest: {
        name: "SOPLA Runframe",
        short_name: "Runframe",
        description: "Estacion fotografica SOPLA Run 10K",
        theme_color: "#53cbe1",
        background_color: "#061d38",
        display: "standalone",
        orientation: "any"
      }
    })
  ]
});
