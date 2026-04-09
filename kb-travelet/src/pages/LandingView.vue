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
        <div class="mb-3">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >닉네임 (회원가입 시)</label
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

        <div class="mb-2">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >비밀번호</label
          >
          <input
            v-model="formData.password"
            type="password"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="비밀번호를 입력하세요"
          />
          <div v-if="emailError" class="text-danger small mt-2 ms-1">
            올바른 이메일 형식을 입력해주세요.
          </div>
        </div>
      </div>

      <div class="d-grid gap-3">
        <button
          @click="handleLogin"
          class="btn btn-outline-primary btn-lg py-3 rounded-4 fw-bold"
          :disabled="isProcessing || !canLogin"
        >
          로그인
        </button>

        <button
          @click="handleRegister"
          class="btn btn-primary btn-lg py-3 rounded-4 fw-bold shadow-sm"
          :disabled="isProcessing || !canRegister"
        >
          회원가입
        </button>
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

const formData = reactive({
  name: '',
  email: '',
  password: '',
});

// 유효성 검사
const validateEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase(),
  );
const emailError = computed(
  () => formData.email && !validateEmail(formData.email),
);

// 버튼 활성화 조건 분리
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
    // 로그인 시 닉네임은 보내지 않음 (이메일/비밀번호만 사용)
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
