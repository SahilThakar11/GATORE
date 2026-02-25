import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000", // Proxy to the backend server
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
        proxy.on("error", (err, _req, _res) => {
          console.log("proxy error", err);
        });
        proxy.on("proxyReq", (proxyReq, req, _res) => {
          console.log("proxying", req.method, req.url, "->", proxyReq.getHeader("host"));
        });
      },
      },
    },
  },
});
