import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import fsRoutes from '@react-router/fs-routes'; // 🔥 bu satırı ekle
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen({
      routes: fsRoutes('app/routes'), // 🔥 burada route dizinini tanımlıyoruz
    }),
    oxygen(),
    reactRouter(),
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
