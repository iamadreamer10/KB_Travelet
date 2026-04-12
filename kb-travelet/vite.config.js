import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';
  const isProduction = mode === 'production';

  return {
    // 1. 배포 환경에서 자산을 찾을 때 루트(/)를 기준으로 찾도록 명시
    base: '/',

    plugins: [vue(), !isProduction && vueDevTools()].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    // 2. 빌드 설정 보강
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // 소스맵은 배포 시 false로 설정하여 빌드 속도 향상 및 보안 강화
      sourcemap: !isProduction,
    },

    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
