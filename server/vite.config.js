import { defineConfig } from "vite"
import { VitePluginNode } from "vite-plugin-node"
import path from "path"


export default defineConfig({
	server: {
		port: 3001
	},
	plugins: [
		VitePluginNode({
			adapter: "express",
			appPath: "./src/index.js",
			initAppOnBoot: true,
		})
	]
})