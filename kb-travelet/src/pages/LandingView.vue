<template>
  <div class="bg-ka-gradient d-flex align-items-center justify-content-center vh-100 px-3">
    <main class="card border-0 shadow-lg p-4 p-md-5" style="max-width: 420px; width: 100%">
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
          <div v-if="emailError" class="text-danger small mt-2 ms-1">
            올바른 이메일을 입력해 주세요.
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

    <Transition name="resume-modal">
      <div v-if="showResumeModal" class="resume-modal-backdrop">
        <div
          class="resume-modal-card shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
        >
          <span class="resume-modal-kicker">Travel Profile</span>
          <h2 id="resume-modal-title" class="resume-modal-title mb-2">
            저장된 여행정보를 불러올까요?
          </h2>
          <p class="resume-modal-description mb-4">
            이전에 저장한 여행 목표가 있습니다. 이어서 진행하거나 새로 만들 수 있어요.
          </p>

          <div class="resume-summary-list mb-4">
            <div class="resume-summary-item">
              <span class="resume-summary-label">여행지</span>
              <strong class="resume-summary-value">{{ resumeSummary.destination }}</strong>
            </div>
            <div class="resume-summary-item">
              <span class="resume-summary-label">일정</span>
              <strong class="resume-summary-value">{{ resumeSummary.schedule }}</strong>
            </div>
            <div class="resume-summary-item">
              <span class="resume-summary-label">재정</span>
              <strong class="resume-summary-value">{{ resumeSummary.income }}</strong>
            </div>
            <div class="resume-summary-item">
              <span class="resume-summary-label">예산 옵션</span>
              <strong class="resume-summary-value">{{ resumeSummary.budget }}</strong>
            </div>
          </div>

          <div class="resume-modal-actions">
            <button
              type="button"
              class="btn btn-outline-secondary px-4 py-3 rounded-4 fw-bold"
              @click="handleCreateNewTrip"
            >
              새로 만들기
            </button>
            <button
              type="button"
              class="btn btn-primary px-4 py-3 rounded-4 fw-bold shadow-sm"
              @click="handleRestoreTrip"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTravelStore } from '@/stores/travel';

const router = useRouter();
const authStore = useAuthStore();
const travelStore = useTravelStore();

const isProcessing = ref(false);
const statusMessage = ref('');
const statusType = ref('success');
const showResumeModal = ref(false);

const formData = reactive({
  name: '',
  email: '',
  password: '',
});

const validateEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase(),
  );

const emailError = computed(() => formData.email && !validateEmail(formData.email));
const canLogin = computed(
  () => validateEmail(formData.email) && formData.password.length > 0,
);
const canRegister = computed(
  () => formData.name.trim().length > 0 && canLogin.value,
);

const resumeSummary = computed(() => ({
  destination: travelStore.selectedCountry
    ? `${travelStore.selectedCountry.name} (${travelStore.selectedContinent})`
    : '미설정',
  schedule:
    travelStore.departureDate && travelStore.returnDate
      ? `${formatResumeDate(travelStore.departureDate)} ~ ${formatResumeDate(travelStore.returnDate)}`
      : '미설정',
  income:
    travelStore.assetAmount || travelStore.monthlyIncome
      ? `자산 ${formatWon(travelStore.assetAmount)} / 월 수입 ${formatWon(travelStore.monthlyIncome)}`
      : '미설정',
  budget: resolveBudgetLabel(travelStore.selectedBudgetOption) || '미선택',
}));

function showMsg(msg, type = 'success') {
  statusMessage.value = msg;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
}

function formatWon(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatResumeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '미설정';
  }

  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(
    date,
  );

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}(${weekday})`;
}

function resolveBudgetLabel(option) {
  const map = {
    budget: '절약형',
    standard: '표준형',
    luxury: '럭셔리',
  };

  return map[option] || '';
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

    const profile = await travelStore.loadProfile();
    if (profile?.checkedIn) {
      showResumeModal.value = true;
    } else {
      setTimeout(() => router.push({ name: 'step-region' }), 800);
    }
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

async function handleRestoreTrip() {
  showResumeModal.value = false;
  await router.push('/main');
}

async function handleCreateNewTrip() {
  showResumeModal.value = false;

  try {
    await travelStore.resetSavedProfile();
  } catch (error) {
    console.error('새 여행 정보 초기화 실패:', error);
  }

  await router.push({ name: 'step-region' });
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

.resume-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 8, 23, 0.5);
  backdrop-filter: blur(8px);
  z-index: 40;
}

.resume-modal-card {
  width: min(100%, 520px);
  padding: 28px;
  border-radius: 1.75rem;
  background: #fff;
}

.resume-modal-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.resume-modal-title {
  color: var(--color-primary-deep);
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.3;
}

.resume-modal-description {
  color: #64748b;
  line-height: 1.6;
}

.resume-summary-list {
  display: grid;
  gap: 10px;
}

.resume-summary-item {
  padding: 14px 16px;
  border-radius: 1rem;
  background: #f8fbff;
  border: 1px solid var(--color-primary-soft);
}

.resume-summary-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
}

.resume-summary-value {
  color: var(--color-primary-deep);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.45;
}

.resume-modal-actions {
  display: flex;
  gap: 10px;
}

.resume-modal-actions > .btn {
  flex: 1;
}

.resume-modal-enter-active,
.resume-modal-leave-active {
  transition: opacity 0.2s ease;
}

.resume-modal-enter-from,
.resume-modal-leave-to {
  opacity: 0;
}

.resume-modal-enter-active .resume-modal-card,
.resume-modal-leave-active .resume-modal-card {
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.resume-modal-enter-from .resume-modal-card,
.resume-modal-leave-to .resume-modal-card {
  transform: translateY(14px);
  opacity: 0;
}
</style>
