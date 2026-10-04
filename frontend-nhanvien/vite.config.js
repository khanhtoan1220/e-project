import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: { "/api": "http://localhost:3000" },
    port: 5175, // Replace with your desired port
  },
});
