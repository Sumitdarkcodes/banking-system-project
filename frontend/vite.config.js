import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    // dev server settings
    server: {
        port: 5173,                                      // frontend port
        proxy: {
            "/api": {                                    // forward /api to backend
                target: "http://localhost:5000",
                changeOrigin: true
            }
        }
    }
});