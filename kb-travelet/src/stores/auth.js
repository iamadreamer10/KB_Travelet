// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);

  const API_URL = 'http://localhost:3000/members';

  async function login(loginData) {
    console.log('--- DB 저장 시도 ---');

    try {
      const response = await axios.post(API_URL, {
        name: loginData.name,
        email: loginData.email,
        // 🚩 수정: 사람이 읽기 편한 한국 시간 포맷으로 저장
        createdAt: new Date().toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      });

      const savedUser = response.data;
      console.log('DB 저장 완료:', savedUser);

      user.value = savedUser;
      token.value = `travelet-token-${savedUser.id}`;

      localStorage.setItem('token', token.value);
      localStorage.setItem('userName', savedUser.name);
      localStorage.setItem('userId', savedUser.id);

      return true;
    } catch (error) {
      console.error('DB 저장 중 오류 발생:', error);
      throw error;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.clear();
  }

  return { user, token, isAuthenticated, login, logout };
});
