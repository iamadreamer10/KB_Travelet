<template>
  <div class="onboarding-page-bg">
    <div class="onboarding-card shadow-lg mx-auto">
      <div class="progress-container p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="step-text">STEP 4/4</span>
          <span class="step-label">예산 정보 입력</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-bar-inner progress-animate"
            style="--progress-start: 75%; --progress-end: 100%; width: 100%"
          ></div>
          <span
            class="progress-plane progress-plane-animate"
            style="--progress-start: 75%; --progress-end: 100%"
          >
            <i class="fas fa-plane" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <div class="content-section p-4 p-md-5">
        <div class="text-center mb-4">
          <h2 class="section-title mb-2">월 수입을 입력해 주세요</h2>
          <p class="section-description mb-0">
            예산 가이드를 계산하기 위한 기준값으로 사용됩니다.
          </p>
        </div>

        <label class="field-label mb-2" for="income-input">월 수입</label>
        <div class="input-shell">
          <span class="currency-label">원</span>
          <input
            id="income-input"
            v-model="income"
            class="form-control form-control-lg input-field"
            type="number"
            min="0"
            placeholder="3000000"
          />
        </div>

        <div class="action-row mt-4">
          <button class="btn secondary-btn" @click="emit('prev')">이전</button>
          <button class="btn primary-btn" @click="checkInComplete">완료</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['next', 'prev']);
const travelStore = useTravelStore();
const income = ref(0);

const checkInComplete = () => {
  if (income.value <= 0) {
    alert('월 수입을 입력해 주세요.');
    return;
  }

  travelStore.setMonthlyIncome(income.value);
  emit('next');
};
</script>

<style scoped>
.onboarding-page-bg {
  min-height: 100vh;
  background-color: #0766ff;
  padding: 24px 20px 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.onboarding-card {
  --color-primary: #0766ff;
  --color-primary-deep: #051766;
  --color-primary-soft: #e6f0ff;
  --color-text-muted: #64748b;

  width: 100%;
  max-width: 760px;
  background: #fff;
  border-radius: 2rem;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
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
  color: #051766;
  font-size: 1.15rem;
  line-height: 1;
  transform: translate(-50%, -60%);
  transform-origin: center;
  pointer-events: none;
}

.progress-plane-animate {
  animation: planeFly 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.section-title {
  color: var(--color-primary-deep);
  font-size: 1.75rem;
  font-weight: 800;
}

.section-description {
  color: var(--color-text-muted);
}

.field-label {
  display: block;
  color: var(--color-primary-deep);
  font-size: 0.9rem;
  font-weight: 700;
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1rem;
}

.currency-label {
  color: var(--color-primary-deep);
  font-weight: 700;
}

.input-field {
  border: 0;
  box-shadow: none;
  padding-left: 0;
}

.input-field:focus {
  box-shadow: none;
}

.action-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.action-row > .btn {
  flex: 1;
  min-height: 52px;
  border-radius: 999px;
  font-weight: 700;
}

.secondary-btn {
  border: 1px solid var(--color-primary-soft);
  background: #fff;
  color: var(--color-primary-deep);
}

.primary-btn {
  background: var(--color-primary);
  color: #fff;
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
