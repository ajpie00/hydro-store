import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(), // ❌ içinde fsRoutes kullanma
    oxygen(),
    reactRouter(), // route'lar zaten burada otomatik çözülüyor
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['react-router-dom/server'],
    },
  },
  ssr: {
    optimizeDeps: {
      include: [],
    },
  },
});

