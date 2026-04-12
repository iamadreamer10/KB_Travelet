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

      <transition name="slide-fade">
        <div
          v-if="statusMessage"
          class="alert mb-4 text-center py-2 shadow-sm"
          :class="statusType === 'success' ? 'alert-success' : 'alert-danger'"
          role="alert"
        >
          <i
            class="bi"
            :class="
              statusType === 'success'
                ? 'bi-check-circle-fill'
                : 'bi-exclamation-triangle-fill'
            "
          ></i>
          {{ statusMessage }}
        </div>
      </transition>

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
            class="btn btn-primary btn-lg py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center"
            :disabled="isProcessing || !canLogin"
          >
            <span
              v-if="isProcessing"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            <span>{{ isProcessing ? '로그인 중' : '로그인' }}</span>
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
            class="btn btn-primary btn-lg py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center"
            :disabled="isProcessing || !canRegister"
          >
            <span
              v-if="isProcessing"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            <span>{{ isProcessing ? '가입 중' : '가입하기' }}</span>
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
const isLoginMode = ref(true);

const formData = reactive({
  name: '',
  email: '',
  password: '',
});

function toggleMode() {
  isLoginMode.value = !isLoginMode.value;
  Object.assign(formData, { name: '', email: '', password: '' });
  statusMessage.value = '';
}

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

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
  // 🚩 3초 후 페이드 아웃 효과를 위해 메시지 초기화
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

    // 🚩 피드백 반영: res.message에 "존재하지 않는 이메일" 등이 담겨옵니다.
    if (!res.success) {
      showMsg(res.message, 'danger');
      return;
    }

    showMsg(`${res.user.name}님, 반갑습니다!`, 'success');

    // 데이터 로드 및 온보딩 체크
    let profile = null;
    try {
      profile = await travelStore.loadProfile();
    } catch (err) {
      if (err.response?.status !== 404) throw err;
    }

    const targetRoute = profile?.checkedIn ? 'main-dashboard' : 'step-region';
    localStorage.setItem('onboarded', profile?.checkedIn ? 'true' : 'false');

    setTimeout(() => router.push({ name: targetRoute }), 800);
  } catch (error) {
    showMsg('서버와의 연결이 원활하지 않습니다.', 'danger');
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
    showMsg('회원가입 성공! 여행 설정을 시작합니다.', 'success');
    localStorage.setItem('onboarded', 'false');
    setTimeout(() => router.push({ name: 'step-region' }), 1500);
  } catch (error) {
    showMsg('가입 중 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
}
</script>

<style scoped>
/* 🚩 알림창 슬라이드 & 페이드 애니메이션 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

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
  width: 70px;
  height: auto;
}

.rounded-4 {
  border-radius: 1rem !important;
}

.text-dark-navy {
  color: #1a1f36;
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  transform: translateY(-1px);
}
</style>
