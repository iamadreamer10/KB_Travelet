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
        <div class="mb-3">
          <label class="form-label small fw-bold text-ka-deep ms-1">이름</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="이름을 입력해 주세요"
          />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-ka-deep ms-1">이메일</label>
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
          <label class="form-label small fw-bold text-ka-deep ms-1">비밀번호</label>
          <input
            v-model="formData.password"
            type="password"
            class="form-control form-control-lg py-3 rounded-3"
            placeholder="비밀번호를 입력해 주세요"
          />
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

const formData = reactive({
  name: '',
  email: '',
  password: '',
});

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

    // 로그인한 사용자의 저장된 여행 프로필이 있으면 바로 대시보드로 이동한다.
    const profile = await travelStore.loadProfile();
    if (profile?.checkedIn) {
      setTimeout(() => router.push('/main'), 500);
      return;
    }

    setTimeout(() => router.push({ name: 'step-region' }), 800);
  } catch (error) {
    showMsg('서버 연결 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
}

async function handleRegister() {
  isProcessing.value = true;

  try {
    const res = await authStore.register(formData);
    if (!res.success) {
      showMsg(res.message, 'danger');
      return;
    }

    showMsg('가입이 완료되었습니다.', 'success');
    setTimeout(() => router.push({ name: 'step-region' }), 800);
  } catch (error) {
    showMsg('가입 처리 중 오류가 발생했습니다.', 'danger');
  } finally {
    isProcessing.value = false;
  }
}
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

.form-control.is-invalid {
  border-color: #dc3545;
}

.text-danger {
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
