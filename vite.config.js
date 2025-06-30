import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter(), tsconfigPaths()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['react-router-dom/server'], // 🚫 hatayı engelleyen satır
    },
  },
  ssr: {
    optimizeDeps: {
      include: [],
    },
  },
});
