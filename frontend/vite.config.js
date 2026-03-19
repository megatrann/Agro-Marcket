import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  envPrefix: ["VITE_", "REACT_APP_"],
  base: mode === "production" && isGitHubActions ? "/Agro-Marcket/" : "/",
}));
