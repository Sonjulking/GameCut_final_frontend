// 2025-07-11 생성됨
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true
            },

            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
            },

      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "테스트용 리액트앱",
        short_name: "MyApp",
        description: "설명",
        theme_color: "#000000",
        display: "standalone",
        icons: [
          {
            src: "logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    // 프록시 설정 - 백엔드 혼재 상황 대응
    allowedHosts: ["www.gamecut.net"],
    proxy: {
      // /api로 시작하는 요청 - 백엔드에 /api가 있는 경우
      "/api": {
        target: "http://server:8081",
        // target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        // rewrite 없음 - /api를 그대로 백엔드로 전달
      },
      // WebSocket 지원 (필요시)
      "/ws": {
        target: "http://server:8081",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

