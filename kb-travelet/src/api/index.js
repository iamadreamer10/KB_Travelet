// index.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL?.trim() || '/api'
).replace(/\/+$/, '');

/**
 * Axios 인스턴스 생성
 * 개발 환경에서는 '/api' 프록시를, 배포 환경에서는 환경변수 기반 API 주소를 사용합니다.
 */
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 8000, // 통신 타임아웃 (8초)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * [요청 인터셉터]
 * 서버로 요청을 보내기 직전에 실행됩니다.
 */
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    // Pinia에 저장된 토큰이 있다면 Authorization 헤더에 Bearer 토큰 추가
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    // 로딩 시작 등의 처리를 여기서 할 수 있습니다.
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

/**
 * [응답 인터셉터]
 * 서버로부터 응답을 받은 직후, 컴포넌트의 .then()이나 .catch()로 전달되기 전에 실행됩니다.
 */
api.interceptors.response.use(
  (response) => {
    /**
     * 프록시를 통해 들어온 응답 데이터(response.data)만 반환하여
     * 컴포넌트에서 데이터 접근을 편리하게 만듭니다.
     */
    return response.data;
  },
  (error) => {
    // 공통 에러 핸들링 로직
    if (error.response) {
      const { status } = error.response;
      const authStore = useAuthStore();

      switch (status) {
        case 401:
          // 인증되지 않음: 로그인 페이지로 리다이렉트 하거나 토큰 갱신
          console.warn(
            '[401] 인증 세션이 만료되었습니다. 로그인이 필요합니다.',
          );
          authStore.logout(); // Pinia 내 로그아웃 액션 실행
          window.location.href = '/'; // 랜딩 페이지로 강제 이동
          break;

        case 403:
          console.error('[403] 접근 권한이 없습니다.');
          break;

        case 404:
          console.error('[404] 요청하신 페이지를 찾을 수 없습니다.');
          break;

        case 500:
          console.error('[500] 서버 내부 오류가 발생했습니다.');
          break;

        default:
          console.error(`[${status}] 알 수 없는 에러가 발생했습니다.`);
      }
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 에러 등)
      console.error(
        '[Network Error] 서버와 연결할 수 없습니다. API 주소 설정을 확인하세요.',
      );
    } else {
      console.error('[API Error]', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
export { apiBaseUrl };
