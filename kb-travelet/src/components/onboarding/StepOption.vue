<template>
  <div class="onboarding-page-bg">
    <div class="onboarding-card shadow-lg mx-auto">
      <div class="progress-container p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="step-text">STEP 3/4</span>
          <span class="step-label">여행 예산 선택</span>
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
        <div class="text-center mb-4">
          <h2 class="section-title mb-2">여행 예산을 골라주세요</h2>
          <p class="section-description mb-0">
            원하는 예산 유형을 누르면 다음 단계로 이동합니다.
          </p>
        </div>

        <div class="option-grid">
          <button type="button" class="option-card" @click="selectOption('budget')">절약형</button>
          <button type="button" class="option-card" @click="selectOption('standard')">표준형</button>
          <button type="button" class="option-card" @click="selectOption('luxury')">럭셔리</button>
        </div>

        <div class="action-row mt-4">
          <button class="btn secondary-btn" @click="emit('prev')">이전</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['prev', 'next']);

const selectOption = () => {
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

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.option-card {
  min-height: 120px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.25rem;
  background: #fff;
  color: var(--color-primary-deep);
  font-weight: 700;
  transition: 0.2s ease;
}

.option-card:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.action-row {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.action-row > .btn {
  min-width: 140px;
  min-height: 52px;
  border-radius: 999px;
  font-weight: 700;
}

.secondary-btn {
  border: 1px solid var(--color-primary-soft);
  background: #fff;
  color: var(--color-primary-deep);
}

@media (max-width: 991px) {
  .onboarding-card {
    max-width: 100%;
  }
}

@media (max-width: 767px) {
  .option-grid {
    grid-template-columns: 1fr;
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
