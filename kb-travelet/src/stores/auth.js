import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

export const useAuthStore = defineStore('auth', () => {
  // 새로고침 시에도 사용자 정보를 로컬스토리지에서 가져옴
  const user = ref(
    localStorage.getItem('userId')
      ? {
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('userName'),
        }
      : null,
  );

  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);
  const API_URL = '/members';

  const setSession = (userData) => {
    user.value = userData;
    token.value = `travelet-token-${userData.id}`;

    localStorage.setItem('token', token.value);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userEmail', userData.email);
  };

  async function login(loginData) {
    try {
      const data = await api.get(API_URL, {
        params: {
          email: loginData.email,
          password: loginData.password,
        },
      });

      if (data.length > 0) {
        setSession(data[0]);
        return { success: true, user: data[0] };
      }
      return {
        success: false,
        message: '이메일 또는 비밀번호가 잘못되었습니다.',
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, message: '서버 통신 실패' };
    }
  }

  async function register(userData) {
    try {
      const check = await api.get(API_URL, {
        params: { email: userData.email },
      });
      if (check.length > 0) {
        return { success: false, message: '이미 가입된 이메일입니다.' };
      }

      const data = await api.post(API_URL, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        createdAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });

      setSession(data);
      return { success: true, user: data };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { success: false, message: '회원가입 실패' };
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.clear();
    router.push({ name: 'landing' }); // 추가요.
  }

  return { user, token, isAuthenticated, login, register, logout };
});
