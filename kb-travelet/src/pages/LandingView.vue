<template>
  <div
    class="bg-ka-gradient d-flex align-items-center justify-content-center vh-100 px-3"
  >
    <main
      class="card border-0 shadow-lg p-4 p-md-5 animate-up"
      style="max-width: 420px; width: 100%"
    >
      <header class="text-center mb-5">
        <div class="mb-3">
          <img
            src="@/assets/images/travelet_logo.svg"
            alt="Travelet Logo"
            class="logo-img"
          />
        </div>
        <h1 class="h2 fw-bold text-dark-navy mb-2">Travelet</h1>
        <p class="text-muted small">꿈의 여행을 위한 첫 걸음</p>
      </header>

      <div class="mb-4">
        <div class="mb-4">
          <label class="form-label small fw-bold text-ka-deep ms-1">이름</label>
          <input
            type="text"
            v-model="loginData.name"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div class="mb-2">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >이메일</label
          >
          <input
            type="email"
            v-model="loginData.email"
            class="form-control form-control-lg py-3 rounded-3"
            :class="{ 'is-invalid': emailError }"
            placeholder="email@example.com"
          />
          <div v-if="emailError" class="text-danger small mt-2 ms-1">
            올바른 이메일 형식을 입력해주세요.
          </div>
        </div>
      </div>

      <button
        @click="handleStart"
        class="btn btn-primary btn-lg w-100 py-3 rounded-4 shadow-sm mb-3"
        :disabled="isProcessing || !isFormValid"
      >
        <span
          v-if="isProcessing"
          class="spinner-border spinner-border-sm me-2"
        ></span>
        시작하기
      </button>

      <footer class="text-center mt-3">
        <p class="text-secondary opacity-50 mb-0" style="font-size: 0.75rem">
          © 2026 Travelet.
        </p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { reactive, toRefs, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // 1. Store 임포트 확인

const router = useRouter();
const authStore = useAuthStore(); // 2. Store 인스턴스화

const state = reactive({
  loginData: {
    name: '',
    email: '',
  },
  isProcessing: false,
});

const { loginData, isProcessing } = toRefs(state);

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

const emailError = computed(() => {
  return state.loginData.email && !validateEmail(state.loginData.email);
});

const isFormValid = computed(() => {
  return (
    state.loginData.name.trim() !== '' && validateEmail(state.loginData.email)
  );
});

const handleStart = async () => {
  if (!isFormValid.value) return;

  state.isProcessing = true;

  try {
    // 3. 실제로 authStore의 login 액션을 호출해야 토큰이 생성됩니다.
    // reactive 객체인 state.loginData를 그대로 넘깁니다.
    await authStore.login(state.loginData);

    // 4. 저장이 완료된 후 페이지 이동
    router.push({ name: 'step-region' });
  } catch (error) {
    console.error('로그인 프로세스 오류:', error);
    alert('로그인 처리 중 문제가 발생했습니다.');
  } finally {
    state.isProcessing = false;
  }
};
</script>

<style scoped>
.logo-img {
  width: 80px;
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
}

.rounded-4 {
  border-radius: 1.25rem !important;
}

.text-dark-navy {
  color: #020817;
}

/* 부트스트랩 에러 테두리 스타일 커스텀 */
.form-control.is-invalid {
  border-color: #dc3545;
}

.text-danger {
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
