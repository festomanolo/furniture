import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // Registered manually in main.tsx: web only. Native (Capacitor) ships assets in the APK/IPA.
      injectRegister: null,
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "SAMANI",
        short_name: "SAMANI",
        description: "Furniture, Made Accessible.",
        lang: "sw",
        theme_color: "#153D2C",
        background_color: "#F5F5F0",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        runtimeCaching: [
          {
            // Recently viewed product imagery stays available on flaky networks.
            urlPattern: ({ url }) => url.pathname.startsWith("/images/"),
            handler: "CacheFirst",
            options: { cacheName: "samani-images", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/catalog"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "samani-catalog", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 } },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/test/setup.ts"] },
});
