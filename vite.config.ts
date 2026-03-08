import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'

// Получаем путь к текущей папке
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic'
        }), 
        tsconfigPaths()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0',
        allowedHosts: [
            'latair-rp.com'
        ],
        port: 30000,
    },
    define: {
        global: 'window'
    },
    preview: {
        port: 30000
    },
})
