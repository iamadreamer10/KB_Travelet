import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

/**
 * Axios 인스턴스 생성
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 8000, // 통신 타임아웃 (8초)
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // 인스턴스 내부에서 store를 불러와야 에러가 발생하지 않습니다.
    const authStore = useAuthStore();

    // Pinia에 저장된 토큰이 있다면 Authorization 헤더에 추가
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * [응답 인터셉터]
 */
api.interceptors.response.use(
  (response) => {
    // 응답 데이터만 반환 (컴포넌트에서 데이터 접근 용이)
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const authStore = useAuthStore();

      switch (status) {
        case 401:
          console.warn('[401] 인증 세션 만료. 로그인이 필요합니다.');
          authStore.logout();
          window.location.href = '/';
          break;
        case 403:
          console.error('[403] 접근 권한이 없습니다.');
          break;
        case 404:
          console.error('[404] 요청하신 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          console.error('[500] 서버 오류 발생');
          break;
        default:
          console.error(`[${status}] 에러 발생`);
      }
    } else if (error.request) {
      console.error(
        '[Network Error] 서버 응답 없음. Railway 배포 상태를 확인하세요.',
      );
    } else {
      console.error('[API Error]', error.message);
    }

    // 에러를 컴포넌트의 .catch()나 try-catch로 넘겨줌
    return Promise.reject(error);
  },
);

// 기본 내보내기
export default api;
