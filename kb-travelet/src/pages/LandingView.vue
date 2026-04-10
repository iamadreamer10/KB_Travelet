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
        <p class="text-muted small">여행 계획을 시작해보세요.</p>
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
          <label class="form-label small fw-bold text-ka-deep ms-1">이름</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="이름을 입력해 주세요"
          />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-ka-deep ms-1"
            >이메일</label
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
            placeholder="비밀번호를 입력해 주세요"
            @keyup.enter="isLoginMode ? handleLogin() : handleRegister()"
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
            {{ isProcessing ? '로그인 중...' : '로그인' }}
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
            {{ isProcessing ? '가입 중...' : '가입하기' }}
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
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTravelStore } from '@/stores/travel';

const router = useRouter();
const authStore = useAuthStore();
const travelStore = useTravelStore();

const isProcessing = ref(false);
const statusMessage = ref('');
const statusType = ref('success');

// 🚩 로그인 모드를 기본으로 설정
const isLoginMode = ref(true);

const formData = reactive({
  name: '',
  email: '',
  password: '',
});

/**
 * 🚩 모드 전환 및 데이터 초기화
 */
function toggleMode() {
  isLoginMode.value = !isLoginMode.value;
  formData.name = '';
  formData.email = '';
  formData.password = '';
  statusMessage.value = '';
}

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

function showMsg(msg, type = 'success') {
  statusMessage.value = msg;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
}

async function handleLogin() {
  if (!canLogin.value || isProcessing.value) return;
  isProcessing.value = true;

  try {
    const res = await authStore.login({
      email: formData.email,
      password: formData.password,
    });

    if (!res.success) {
      showMsg(res.message, 'danger');
      return;
    }

    showMsg(`${res.user.name}님, 어서오세요`, 'success');

    // 🚩 토큰 저장 (라우터 가드용)
    localStorage.setItem('token', res.token || 'temp-token');

    const profile = await travelStore.loadProfile();
    if (profile?.checkedIn) {
      localStorage.setItem('onboarded', 'true');
      setTimeout(() => router.push('/main'), 500);
    } else {
      localStorage.setItem('onboarded', 'false');
      setTimeout(() => router.push({ name: 'step-region' }), 500);
    }
  } catch (error) {
    showMsg('서버 연결 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
}

async function handleRegister() {
  if (!canRegister.value || isProcessing.value) return;
  isProcessing.value = true;

  try {
    const res = await authStore.register(formData);
    if (!res.success) {
      showMsg(res.message, 'danger');
      return;
    }

    showMsg('가입이 완료되었습니다. 로그인을 진행해주세요.', 'success');
    // 가입 성공 시 자동으로 로그인 모드로 전환
    setTimeout(() => {
      toggleMode();
    }, 1500);
  } catch (error) {
    showMsg('가입 처리 중 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
}
</script>

<style scoped>
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
  cursor: pointer;
}
</style>
