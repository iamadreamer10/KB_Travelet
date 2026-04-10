<template>
  <div class="onboarding-page-bg">
    <div class="onboarding-card shadow-lg mx-auto">
      <div class="progress-container p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="step-text">STEP 4/5</span>
          <span class="step-label">고정 지출 입력</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-bar-inner progress-animate"
            style="--progress-start: 60%; --progress-end: 80%; width: 80%"
          ></div>
          <span
            class="progress-plane progress-plane-animate"
            style="--progress-start: 60%; --progress-end: 80%"
          >
            <i class="fas fa-plane" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <div class="content-section p-4 p-md-5">
        <div class="expense-copy mb-4">
          <span class="copy-kicker">fixed monthly expense</span>
          <h2 class="section-title mb-2">고정으로 나가는 비용이 있나요?</h2>
          <p class="section-description mb-0">
            여행 계획에 반영해서 계산해드릴게요.
          </p>
        </div>

        <div class="expense-grid">
          <label
            v-for="field in expenseFields"
            :key="field.key"
            class="field-card"
            :for="`${field.key}-input`"
          >
            <span class="field-label">{{ field.label }}</span>
            <div class="input-shell">
              <input
                :id="`${field.key}-input`"
                :value="formatInputNumber(expenses[field.key])"
                @input="handleAmountInput(field.key, $event.target.value)"
                @keydown="blockInvalidNumberKey"
                class="form-control form-control-lg input-field"
                type="text"
                inputmode="numeric"
                placeholder="0"
              />
              <div class="stepper-controls" aria-hidden="true">
                <button
                  type="button"
                  class="stepper-btn"
                  @click.prevent="adjustAmount(field.key, 10000)"
                >
                  ▲
                </button>
                <button
                  type="button"
                  class="stepper-btn"
                  @click.prevent="adjustAmount(field.key, -10000)"
                >
                  ▼
                </button>
              </div>
              <span class="currency-label">원</span>
            </div>
            <span class="field-preview">{{
              formatToKoreanAmount(expenses[field.key])
            }}</span>
          </label>
        </div>

        <div class="summary-card mt-4">
          <span class="summary-caption">Monthly Fixed Total</span>
          <strong class="summary-value">{{
            formatWon(totalFixedExpense)
          }}</strong>
          <p class="summary-description mb-0">
            이 금액을 기준으로 다음 단계에서 선택 가능한 여행 유형을 더 정확하게
            계산합니다.
          </p>
        </div>

        <div class="action-row mt-4">
          <button class="btn secondary-btn prev-icon-btn" @click="emit('prev')">
            <i class="fas fa-angle-left" aria-hidden="true"></i>
          </button>
          <button class="btn primary-btn" @click="saveAndContinue">다음</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['next', 'prev']);
const travelStore = useTravelStore();

const expenses = reactive({
  rent: Number(travelStore.monthlyRent) || 0,
  insurance: Number(travelStore.monthlyInsurance) || 0,
  phone: Number(travelStore.monthlyPhone) || 0,
  transport: Number(travelStore.monthlyTransport) || 0,
  subscription: Number(travelStore.monthlySubscription) || 0,
  otherFixed: Number(travelStore.monthlyOtherFixed) || 0,
});

const expenseFields = [
  { key: 'rent', label: '주거비' },
  { key: 'insurance', label: '보험료' },
  { key: 'phone', label: '통신비' },
  { key: 'transport', label: '교통비' },
  { key: 'subscription', label: '구독료' },
  { key: 'otherFixed', label: '기타 고정 지출' },
];

const totalFixedExpense = computed(() =>
  Object.values(expenses).reduce((sum, value) => sum + (Number(value) || 0), 0),
);

async function saveAndContinue() {
  try {
    await travelStore.saveFixedExpenses({ ...expenses });
    emit('next');
  } catch (error) {
    console.error('고정 지출 저장 실패:', error);
    alert('고정 지출을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

function formatInputNumber(value) {
  const amount = Number(value) || 0;
  return amount > 0 ? amount.toLocaleString('ko-KR') : '';
}

function parseInputNumber(value) {
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
}

function handleAmountInput(target, value) {
  expenses[target] = parseInputNumber(value);
}

function blockInvalidNumberKey(event) {
  if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
    event.preventDefault();
  }
}

function adjustAmount(target, delta) {
  expenses[target] = Math.max(0, (Number(expenses[target]) || 0) + delta);
}

function formatToKoreanAmount(value) {
  const amount = Number(value) || 0;

  if (amount <= 0) {
    return '0원';
  }

  const eok = Math.floor(amount / 100000000);
  const man = Math.floor((amount % 100000000) / 10000);
  const won = amount % 10000;
  const parts = [];

  if (eok > 0) {
    parts.push(`${eok.toLocaleString('ko-KR')}억`);
  }

  if (man > 0) {
    parts.push(`${man.toLocaleString('ko-KR')}만`);
  }

  if (won > 0) {
    parts.push(`${won.toLocaleString('ko-KR')}원`);
  }

  if (parts.length === 0) {
    return `${amount.toLocaleString('ko-KR')}원`;
  }

  if (won === 0) {
    return `${parts.join(' ')} 원`;
  }

  return parts.join(' ');
}

function formatWon(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}
</script>

<style scoped>
.onboarding-page-bg {
  min-height: 100dvh;
  background-color: #0766ff;
  padding: 16px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-card {
  --color-text-muted: #64748b;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 860px;
  max-height: min(92dvh, 980px);
  background: #fff;
  border-radius: 2rem;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
  margin: auto 0;
}

.progress-container {
  flex-shrink: 0;
  background-color: var(--color-primary-soft);
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
}

.content-section {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: calc(min(92dvh, 980px) - 110px);
  padding-right: 26px !important;
  overscroll-behavior: contain;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.content-section::-webkit-scrollbar {
  display: none;
}

.step-text {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 0.1rem;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary-deep);
}

.progress-track {
  position: relative;
  height: 4px;
  background: rgba(2, 8, 23, 0.08);
  border-radius: 999px;
  overflow: visible;
  margin-top: 6px;
}

.progress-bar-inner {
  position: relative;
  height: 100%;
  background: var(--color-primary);
  border-radius: inherit;
}

.progress-animate {
  animation: progressFill 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-plane {
  position: absolute;
  top: 0;
  left: var(--progress-end);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  color: #0766ff;
  font-size: 1.4rem;
  line-height: 1;
  background: linear-gradient(180deg, #ffffff 0%, #eaf2ff 100%);
  border: 2px solid rgba(7, 102, 255, 0.18);
  border-radius: 999px;
  box-shadow:
    0 10px 20px rgba(7, 102, 255, 0.2),
    0 2px 6px rgba(5, 23, 102, 0.14);
  transform: translate(-50%, -50%);
  transform-origin: center;
  pointer-events: none;
  z-index: 2;
}

.progress-plane i {
  filter: drop-shadow(0 1px 2px rgba(5, 23, 102, 0.16));
}

.progress-plane-animate {
  animation: planeFly 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.expense-copy {
  max-width: 560px;
}

.copy-kicker {
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

.section-title {
  color: var(--color-primary-deep);
  font-size: 1.75rem;
  font-weight: 800;
}

.section-description {
  color: var(--color-text-muted);
  max-width: 520px;
  font-size: 0.98rem;
  line-height: 1.62;
}

.expense-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-label {
  display: block;
  color: var(--color-primary-deep);
  font-size: 0.9rem;
  font-weight: 700;
}

.field-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(7, 102, 255, 0.1);
  border-radius: 1.35rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 10px 28px rgba(7, 102, 255, 0.06);
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px 10px 16px;
  border: 1px solid rgba(7, 102, 255, 0.16);
  border-radius: 1rem;
  background: #fff;
}

.currency-label {
  color: var(--color-primary-deep);
  font-size: 0.95rem;
  font-weight: 700;
  flex-shrink: 0;
}

.input-field {
  border: 0;
  box-shadow: none;
  padding: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-primary-deep);
  text-align: right;
}

.input-field:focus {
  box-shadow: none;
}

.input-field::placeholder {
  color: #b1bfd4;
  font-weight: 600;
}

.field-preview {
  color: var(--color-primary);
  font-size: 0.96rem;
  font-weight: 800;
  text-align: right;
}

.stepper-controls {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.stepper-btn {
  width: 24px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7b8ba7;
  font-size: 0.7rem;
  line-height: 1;
}

.stepper-btn:hover {
  color: var(--color-primary);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 1.35rem;
  background: linear-gradient(135deg, #f7fbff 0%, #eef5ff 100%);
  border: 1px solid rgba(7, 102, 255, 0.12);
}

.summary-caption {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-value {
  color: var(--color-primary-deep);
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.5;
}

.summary-description {
  color: var(--color-text-muted);
  font-size: 0.86rem;
  line-height: 1.55;
}

.action-row {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.action-row > .btn {
  min-height: 52px;
  border-radius: 999px;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.prev-icon-btn {
  width: 52px;
  min-width: 52px;
  padding: 0;
  font-size: 1.2rem;
}

.primary-btn {
  flex: 1;
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 24px rgba(7, 102, 255, 0.16);
}

.primary-btn:hover {
  transform: translateY(-2px);
  background: #055ae3;
  box-shadow: 0 16px 30px rgba(7, 102, 255, 0.24);
}

.secondary-btn {
  border: 1px solid var(--color-primary-soft);
  background: #f8fafc;
  color: var(--color-primary-deep);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  background: #eef2f7;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

@media (max-width: 991px) {
  .onboarding-card {
    max-width: 100%;
  }

  .expense-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .onboarding-page-bg {
    padding: 12px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .content-section {
    padding: 1.1rem !important;
  }

  .field-card {
    padding: 12px;
  }
}

@keyframes progressFill {
  from {
    width: var(--progress-start);
  }
  to {
    width: var(--progress-end);
  }
}

@keyframes planeFly {
  from {
    left: var(--progress-start);
    transform: translate(-50%, -60%);
  }
  to {
    left: var(--progress-end);
    transform: translate(-50%, -60%);
  }
}
</style>
