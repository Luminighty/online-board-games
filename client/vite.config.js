import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

function aliasEntry(find, path) {
	return {
		find,
		replacement: fileURLToPath(new URL(path, import.meta.url))
	}
}

export default defineConfig({
	resolve: {
		alias: [
			aliasEntry("@res", "../resources")
		]
	}
})