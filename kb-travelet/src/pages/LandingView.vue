<template>
  <div
    class="bg-ka-gradient d-flex align-items-center justify-content-center vh-100 px-3"
  >
    <main
      class="card border-0 shadow-lg p-4 p-md-5"
      style="max-width: 420px; width: 100%"
    >
      <header class="text-center mb-4">
        <img
          src="@/assets/images/travelet_logo.svg"
          alt="Logo"
          class="logo-img mb-3"
        />
        <h1 class="h2 fw-bold text-dark-navy mb-2">Travelet</h1>
        <p class="text-muted small">당신만의 특별한 여행을 계획해보세요</p>
      </header>

      <div
        v-if="statusMessage"
        class="alert mb-4 animate-fade-in text-center"
        :class="statusType === 'success' ? 'alert-success' : 'alert-danger'"
      >
        {{ statusMessage }}
      </div>

      <div class="mb-4">
        <div v-if="!isLoginMode" class="mb-3 animate-fade-in">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >닉네임</label
          >
          <input
            v-model="formData.name"
            type="text"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >이메일 (아이디)</label
          >
          <input
            v-model="formData.email"
            type="email"
            class="form-control form-control-lg py-3 rounded-3"
            :class="{ 'is-invalid': emailError }"
            placeholder="email@example.com"
          />
          <div v-if="emailError" class="text-danger small mt-1 ms-1">
            올바른 이메일 형식이 아닙니다.
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >비밀번호</label
          >
          <input
            v-model="formData.password"
            type="password"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
      </div>

      <div class="d-grid gap-3">
        <template v-if="isLoginMode">
          <button
            @click="handleLogin"
            class="btn btn-primary btn-lg py-3 rounded-4 fw-bold shadow-sm"
            :disabled="isProcessing || !canLogin"
          >
            로그인
          </button>
          <div class="text-center mt-2">
            <span class="text-muted small">아직 계정이 없으신가요? </span>
            <button
              @click="toggleMode"
              class="btn btn-link btn-sm p-0 fw-bold text-decoration-none"
            >
              회원가입
            </button>
          </div>
        </template>

        <template v-else>
          <button
            @click="handleRegister"
            class="btn btn-primary btn-lg py-3 rounded-4 fw-bold shadow-sm"
            :disabled="isProcessing || !canRegister"
          >
            가입하기
          </button>
          <div class="text-center mt-2">
            <span class="text-muted small">이미 회원이신가요? </span>
            <button
              @click="toggleMode"
              class="btn btn-link btn-sm p-0 fw-bold text-decoration-none"
            >
              로그인
            </button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isProcessing = ref(false);
const statusMessage = ref('');
const statusType = ref('success');

// 화면 전환 상태 관리 (true: 로그인, false: 회원가입)
const isLoginMode = ref(true);

const formData = reactive({
  name: '',
  email: '',
  password: '',
});

// 화면 전환 시 데이터 초기화 기능 (선택 사항)
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  statusMessage.value = ''; // 모드 변경 시 에러 메시지 삭제
};

// 유효성 검사 (기존 유지)
const validateEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase(),
  );

const emailError = computed(
  () => formData.email && !validateEmail(formData.email),
);

const canLogin = computed(
  () => validateEmail(formData.email) && formData.password.length > 0,
);
const canRegister = computed(
  () => formData.name.trim().length > 0 && canLogin.value,
);

const showMsg = (msg, type = 'success') => {
  statusMessage.value = msg;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
};

const handleLogin = async () => {
  isProcessing.value = true;
  try {
    const res = await authStore.login({
      email: formData.email,
      password: formData.password,
    });
    if (res.success) {
      showMsg(`${res.user.name}님, 어서오세요!`, 'success');
      setTimeout(() => router.push({ name: 'step-region' }), 800);
    } else {
      showMsg(res.message, 'danger');
    }
  } catch (err) {
    showMsg('서버 연결 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
};

const handleRegister = async () => {
  isProcessing.value = true;
  try {
    const res = await authStore.register(formData);
    if (res.success) {
      showMsg('가입이 완료되었습니다.', 'success');
      setTimeout(() => router.push({ name: 'step-region' }), 800);
    } else {
      showMsg(res.message, 'danger');
    }
  } catch (err) {
    showMsg('가입 처리 중 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
/* 애니메이션 효과 추가 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-img {
  width: 80px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.rounded-4 {
  border-radius: 1.25rem !important;
}

.text-dark-navy {
  color: #020817;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.btn-link {
  font-size: 0.875rem;
  color: #0d6efd;
}
</style>
