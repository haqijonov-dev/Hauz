import { defineConfig } from "vite";

import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), nitroV2Plugin({ preset: "vercel" }), viteReact()],
});

export default config;
