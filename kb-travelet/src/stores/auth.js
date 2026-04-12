import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  // 🚩 새로고침 시 email 정보도 포함하여 복구
  const user = ref(
    localStorage.getItem('userId')
      ? {
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('userName'),
          email: localStorage.getItem('userEmail'), // 추가
        }
      : null,
  );

  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);
  const API_URL = '/api/members';
  const router = useRouter();

  const setSession = (userData) => {
    user.value = userData;
    token.value = `travelet-token-${userData.id}`;

    localStorage.setItem('token', token.value);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userEmail', userData.email);
  };

  /**
   * 🚩 피드백 반영: 상세한 에러 메시지 처리를 위해 로직 분리
   */
  async function login(loginData) {
    try {
      // 1. 먼저 해당 이메일을 가진 사용자가 있는지 확인
      const { data: members } = await axios.get(
        `${API_URL}?email=${loginData.email}`,
      );

      if (members.length === 0) {
        return {
          success: false,
          message: '존재하지 않는 이메일입니다.', // 상세 메시지
        };
      }

      const foundUser = members[0];

      // 2. 이메일은 있지만 비밀번호가 틀린 경우
      if (foundUser.password !== loginData.password) {
        return {
          success: false,
          message: '비밀번호가 일치하지 않습니다.', // 상세 메시지
        };
      }

      // 3. 로그인 성공
      setSession(foundUser);
      return { success: true, user: foundUser };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, message: '서버 통신 실패' };
    }
  }

  async function register(userData) {
    try {
      const check = await axios.get(`${API_URL}?email=${userData.email}`);
      if (check.data.length > 0) {
        return { success: false, message: '이미 가입된 이메일입니다.' };
      }

      const { data } = await axios.post(API_URL, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        createdAt: new Date().toLocaleString('ko-KR'),
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
    router.push({ name: 'landing' });
  }

  return { user, token, isAuthenticated, login, register, logout };
});
