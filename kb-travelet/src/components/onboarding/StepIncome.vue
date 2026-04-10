<template>
  <div class="onboarding-page-bg">
    <div class="onboarding-card shadow-lg mx-auto">
      <div class="progress-container p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="step-text">STEP 3/4</span>
          <span class="step-label"> 시드 머니 입력</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-bar-inner progress-animate"
            style="--progress-start: 50%; --progress-end: 75%; width: 75%"
          ></div>
          <span
            class="progress-plane progress-plane-animate"
            style="--progress-start: 50%; --progress-end: 75%"
          >
            <i class="fas fa-plane" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <div class="content-section p-4 p-md-5">
        <div class="income-copy mb-4">
          <span class="copy-kicker">SEEDMONEY</span>
          <h2 class="section-title mb-2">
            현재 자산과 월 수입을 입력해 주세요
          </h2>
          <p class="section-description mb-0">
            다음 단계에서 여행 옵션을 추천하고 계산하는 기준이
            됩니다.
          </p>
        </div>

        <div class="row g-3 income-field-grid">
          <div class="col-12 col-md-6">
            <label class="field-card" for="asset-input">
              <span class="field-label">현재 자산 금액</span>
              <div class="input-shell">
                <input
                  id="asset-input"
                  :value="formatInputNumber(assetAmount)"
                  @input="handleAmountInput('asset', $event.target.value)"
                  class="form-control form-control-lg input-field"
                  type="text"
                  inputmode="numeric"
                  placeholder="5000000"
                />
                <div class="stepper-controls" aria-hidden="true">
                  <button
                    type="button"
                    class="stepper-btn"
                    @click.prevent="adjustAmount('asset', 10000)"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    class="stepper-btn"
                    @click.prevent="adjustAmount('asset', -10000)"
                  >
                    ▼
                  </button>
                </div>
                <span class="currency-label">원</span>
              </div>
              <span class="field-preview">{{ assetAmountPreview }}</span>
            </label>
          </div>
          <div class="col-12 col-md-6">
            <label class="field-card" for="income-input">
              <span class="field-label">월 수입</span>
              <div class="input-shell">
                <input
                  id="income-input"
                  :value="formatInputNumber(monthlyIncome)"
                  @input="handleAmountInput('income', $event.target.value)"
                  class="form-control form-control-lg input-field"
                  type="text"
                  inputmode="numeric"
                  placeholder="3000000"
                />
                <div class="stepper-controls" aria-hidden="true">
                  <button
                    type="button"
                    class="stepper-btn"
                    @click.prevent="adjustAmount('income', 10000)"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    class="stepper-btn"
                    @click.prevent="adjustAmount('income', -10000)"
                  >
                    ▼
                  </button>
                </div>
                <span class="currency-label">원</span>
              </div>
              <span class="field-preview">{{ monthlyIncomePreview }}</span>
            </label>
          </div>
        </div>

        <div class="income-summary-card mt-4">
          <span class="summary-caption">Current Snapshot</span>
          <strong class="summary-value">
            가지고 있는 금액 {{ assetAmountPreview }} · 월 수입
            {{ monthlyIncomePreview }}
          </strong>
          <p class="summary-description mb-0">
            입력한 값은 저장 후 다음 단계에서 여행 옵션과 예상 금액 비교에
            사용됩니다.
          </p>
        </div>

        <div class="action-row mt-4">
          <button class="btn secondary-btn prev-icon-btn" @click="emit('prev')">
            <i class="fas fa-angle-left" aria-hidden="true"></i>
          </button>
          <button class="btn primary-btn" @click="checkInComplete">다음</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['next', 'prev']);
const travelStore = useTravelStore();
const assetAmount = ref(travelStore.assetAmount || 0);
const monthlyIncome = ref(travelStore.monthlyIncome || 0);
const assetAmountPreview = computed(() =>
  formatToKoreanAmount(assetAmount.value),
);
const monthlyIncomePreview = computed(() =>
  formatToKoreanAmount(monthlyIncome.value),
);

const checkInComplete = async () => {
  if (assetAmount.value < 0 || monthlyIncome.value < 0) {
    alert('자산 금액과 월 수입은 0원 이상으로 입력해 주세요.');
    return;
  }

  try {
    await travelStore.saveIncomeInfo({
      assets: assetAmount.value,
      income: monthlyIncome.value,
    });
    emit('next');
  } catch (error) {
    console.error('재정 정보 저장 실패:', error);
    alert('재정 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
};

function formatToKoreanAmount(value) {
  const amount = Number(value) || 0;

  if (amount <= 0) {
    return '0원';
  }

  const eok = Math.floor(amount / 100000000);
  const man = Math.floor((amount % 100000000) / 10000);
  const parts = [];

  if (eok > 0) {
    parts.push(`${eok}억원`);
  }

  if (man > 0) {
    parts.push(`${man.toLocaleString('ko-KR')}만원`);
  }

  if (parts.length === 0) {
    return `${amount.toLocaleString('ko-KR')}원`;
  }

  return parts.join(' ');
}

function formatInputNumber(value) {
  const amount = Number(value) || 0;
  return amount > 0 ? amount.toLocaleString('ko-KR') : '';
}

function parseInputNumber(value) {
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
}

function handleAmountInput(target, value) {
  const parsedValue = parseInputNumber(value);

  if (target === 'asset') {
    assetAmount.value = parsedValue;
    return;
  }

  monthlyIncome.value = parsedValue;
}

function adjustAmount(target, delta) {
  if (target === 'asset') {
    assetAmount.value = Math.max(0, (Number(assetAmount.value) || 0) + delta);
    return;
  }

  monthlyIncome.value = Math.max(0, (Number(monthlyIncome.value) || 0) + delta);
}
</script>

<style scoped>
.onboarding-page-bg {
  min-height: 100dvh;
  background-color: #0766ff;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-card {
  --color-text-muted: #64748b;

  width: 100%;
  max-width: 760px;
  background: #fff;
  border-radius: 2rem;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
  margin: auto 0;
}

.progress-container {
  background-color: var(--color-primary-soft);
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
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

.income-copy {
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

.field-label {
  display: block;
  color: var(--color-primary-deep);
  font-size: 0.9rem;
  font-weight: 700;
}

.field-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid rgba(7, 102, 255, 0.1);
  border-radius: 1.35rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 10px 28px rgba(7, 102, 255, 0.06);
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 12px 18px;
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
  font-size: 1.15rem;
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

.field-helper {
  margin-top: 0.75rem;
  padding-left: 0.2rem;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.income-summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
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
  font-size: 1.02rem;
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

.primary-btn {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 24px rgba(7, 102, 255, 0.16);
}

.primary-btn:hover {
  transform: translateY(-2px);
  background: #055ae3;
  box-shadow: 0 16px 30px rgba(7, 102, 255, 0.24);
}

@media (max-width: 991px) {
  .onboarding-card {
    max-width: 100%;
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
