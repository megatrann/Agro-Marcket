import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  envPrefix: ["VITE_", "REACT_APP_"],
  base: mode === "production" ? "/Agro-Marcket/" : "/",
}));
