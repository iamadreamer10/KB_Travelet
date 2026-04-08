<template>
  <div
    class="min-h-screen app-container font-sans relative overflow-hidden flex items-center justify-center p-6"
  >
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#1a73e8] via-[#0766ff] to-[#40a9ff] z-0"
    ></div>

    <main
      class="w-full max-w-sm bg-white rounded-3xl p-10 shadow-2xl z-10 animate-slide-up"
    >
      <header class="text-center mb-10">
        <div class="flex justify-center mb-3 text-[#0766ff]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          여행 저축 가계부
        </h1>
        <p class="text-slate-500 text-sm">꿈의 여행을 위한 첫 걸음</p>
      </header>

      <div class="space-y-6 mb-10">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2"
            >이름</label
          >
          <input
            type="text"
            v-model="loginData.name"
            placeholder="이름을 입력하세요"
            class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-[#0766ff] outline-none text-slate-800"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2"
            >이메일</label
          >
          <input
            type="email"
            v-model="loginData.email"
            placeholder="email@example.com"
            class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-[#0766ff] outline-none text-slate-800"
          />
        </div>
      </div>

      <button
        @click="handleStart"
        class="w-full py-4 px-6 bg-[#0766ff] hover:bg-[#0053d9] text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200"
      >
        시작하기
      </button>

      <footer class="mt-8 text-center text-xs text-slate-300">
        © 2026 Travelet.
      </footer>
    </main>
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
// 만약 Pinia 스토어를 사용하신다면 auth 스토어에서 로그인 액션을 가져옵니다.
// import { useAuthStore } from '@/stores/auth';

const router = useRouter();
// const authStore = useAuthStore();

// 상태 관리 (이름, 이메일 입력값)
const state = reactive({
  loginData: {
    name: '',
    email: '',
  },
  isProcessing: false,
});

// 구조 분해 할당 (toRefs 사용 필수 지침 반영)
const { loginData, isProcessing } = toRefs(state);

/**
 * '시작하기' 버튼 클릭 시 처리
 */
const handleStart = async () => {
  if (!state.loginData.name || !state.loginData.email) {
    alert('이름과 이메일을 모두 입력해 주세요.');
    return;
  }

  state.isProcessing = true;

  try {
    // 1. 실제 로그인/회원가입 API 호출 (Auth 스토어 활용 추천)
    // await authStore.login(state.loginData);

    // 테스트용: 로그인 성공 시 토큰을 임시 저장 (개발 단계)
    // localStorage.setItem('token', 'test_token');

    // 2. 로그인 성공 후 온보딩(여행 설정) 첫 단계로 이동
    // (api/index.js 인터셉터에서 토큰을 활용할 수 있게 됩니다.)
    router.push({ name: 'step-region' });
  } catch (error) {
    console.error('로그인 실패:', error);
    alert('로그인 중 에러가 발생했습니다.');
  } finally {
    state.isProcessing = false;
  }
};
</script>

<style scoped>
/* 앱처럼 보이기 위한 스타일 */
.app-container {
  /* PC 브라우저에서 볼 때도 모바일 화면 크기로 고정 */
  height: 100vh;
}

/* 아래에서 위로 스윽 올라오는 애니메이션 */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 스크롤바 숨기기 (모바일 앱 느낌) */
::webkit-scrollbar {
  display: none;
}
</style>
