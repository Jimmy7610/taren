import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
var __dirname = dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        outDir: 'dist',
    },
});
