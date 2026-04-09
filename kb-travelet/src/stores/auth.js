// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);
  const API_URL = 'http://localhost:3000/members';

  // 🚩 핵심: 로그인/회원가입 성공 시 사용자 정보를 저장하는 공통 함수
  const setSession = (userData) => {
    user.value = userData;
    token.value = `travelet-token-${userData.id}`;

    // 브라우저를 껐다 켜도 유지되도록 로컬 스토리지에 저장
    localStorage.setItem('token', token.value);
    localStorage.setItem('userName', userData.name); // 👈 여기서 닉네임 저장!
    localStorage.setItem('userId', userData.id);
  };

  // 1. 로그인
  async function login(loginData) {
    try {
      // 이메일과 비밀번호가 모두 일치하는 유저 조회
      const { data } = await axios.get(
        `${API_URL}?email=${loginData.email}&password=${loginData.password}`,
      );

      if (data.length > 0) {
        setSession(data[0]); // 저장 로직 실행
        return { success: true, user: data[0] };
      }
      return {
        success: false,
        message: '이메일 또는 비밀번호가 잘못되었습니다.',
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }

  // 2. 회원가입
  async function register(userData) {
    try {
      // 이메일 중복 체크
      const check = await axios.get(`${API_URL}?email=${userData.email}`);
      if (check.data.length > 0) {
        return { success: false, message: '이미 가입된 이메일입니다.' };
      }

      // 신규 유저 등록
      const { data } = await axios.post(API_URL, {
        name: userData.name, // 닉네임
        email: userData.email, // 아이디
        password: userData.password, // 비밀번호
        createdAt: new Date().toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
        }),
      });

      setSession(data); // 저장 로직 실행
      return { success: true, user: data };
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  }

  // 3. 로그아웃
  function logout() {
    user.value = null;
    token.value = null;
    localStorage.clear(); // 로컬 스토리지의 닉네임 등 모든 정보 삭제
  }

  return { user, token, isAuthenticated, login, register, logout };
});
