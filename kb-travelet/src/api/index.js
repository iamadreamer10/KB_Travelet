import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router'; // 라우터 추가

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      const authStore = useAuthStore();

      switch (status) {
        case 401:
          console.warn('[401] 세션 만료. 로그인이 필요합니다.');
          authStore.logout();
          router.push({ name: 'landing' }); // router 사용으로 변경
          break;

        case 403:
          console.error('[403] 접근 권한이 없습니다.');
          break;

        case 404:
          /**
           * 🚩 팁: 특정 API(예: 프로필 조회)의 404는
           * 시스템 에러가 아니므로 콘솔 출력을 생략하거나 약하게 처리합니다.
           */
          if (!config.url.includes('members')) {
            console.error('[404] 리소스를 찾을 수 없습니다.');
          }
          break;

        case 500:
          console.error('[500] 서버 오류 발생');
          break;
      }
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 에러 등)
      console.error(
        '[Network Error] 서버와 연결할 수 없습니다. API 주소 설정을 확인하세요.',
      );
    } else {
      console.error('[API Error]', error.message);
    }

    // 에러를 컴포넌트의 .catch()나 try-catch로 넘겨줌
    return Promise.reject(error);
  },
);

export default api;
export { apiBaseUrl };
