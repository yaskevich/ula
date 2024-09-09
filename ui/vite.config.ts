import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Checker from 'vite-plugin-checker';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? loadEnv('', process.cwd(), 'VITE_BASE')?.['VITE_BASE'] : '',
  plugins: [
    vue(),
    Checker({ typescript: true }),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
        },
      ],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
  server: {
    port: Number(loadEnv('', process.cwd(), 'VITE_PORT')?.['VITE_PORT']) || 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:' + loadEnv('', process.cwd(), 'VITE_API')?.['VITE_API'],
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
