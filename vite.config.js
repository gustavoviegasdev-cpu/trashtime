import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// O app é uma página só, servida na raiz. O que está em public/ (ícones,
// manifest e o service worker) é copiado para dist/ sem passar pelo empacotador.
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'dist',
        assetsDir: 'recursos'
    }
});
