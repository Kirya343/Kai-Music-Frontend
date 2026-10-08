import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";

// Получаем путь к текущей папке
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    base: './',
    plugins: [
        react({
            jsxRuntime: 'automatic'
        }),
        svgr(),
        visualizer({
            open: false,
            filename: "stats.html",
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        tsconfigPaths: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    server: {
        host: '0.0.0.0',
        allowedHosts: ['music.workswap.org'],
        port: 30000,
    },
    preview: {
        port: 30004
    },
    css: {
        transformer: 'postcss'
    },
})
