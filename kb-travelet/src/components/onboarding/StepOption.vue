<template>
  <div class="onboarding-page-bg">
    <div class="onboarding-card shadow-lg mx-auto">
      <div class="progress-container p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="step-text">STEP 4/4</span>
          <span class="step-label">여행 예산 선택</span>
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
        <div class="option-copy mb-4">
          <span class="copy-kicker">Budget</span>
          <h2 class="section-title mb-2">여행 예산을 정해주세요</h2>
          <p class="section-description mb-0">
            선택한 여행지, 일정, 그리고 현재 재정 상황에 맞춰 예산 유형을 선택해 주세요.
          </p>
        </div>

        <div class="selection-summary-grid mb-4">
          <div class="summary-chip-card">
            <span class="summary-chip-label">여행지</span>
            <strong class="summary-chip-value">{{
              selectedDestinationText
            }}</strong>
          </div>
          <div class="summary-chip-card">
            <span class="summary-chip-label">출발일</span>
            <strong class="summary-chip-value">{{ formattedDeparture }}</strong>
          </div>
          <div class="summary-chip-card">
            <span class="summary-chip-label">도착일</span>
            <strong class="summary-chip-value">{{ formattedReturn }}</strong>
          </div>
          <div class="summary-chip-card">
            <span class="summary-chip-label">가용 예산</span>
            <strong class="summary-chip-value">{{ formattedAvailableBudget }}</strong>
          </div>
        </div>

        <div class="option-grid">
          <button
            v-for="option in budgetOptions"
            :key="option.key"
            type="button"
            class="option-card"
            :disabled="!canSelectBudget"
            @click="selectOption(option)"
          >
            <span class="option-badge">{{ option.label }}</span>
            <strong class="option-total">{{ option.totalText }}</strong>
            <span class="option-meta"
              >예상 {{ stayNights }}박 / {{ tripDays }}일 기준</span
            >
            <span class="option-breakdown">
              일비 {{ option.dailyText }} · 숙박 {{ option.hotelText }} · 항공
              {{ option.flightText }}
            </span>
            <span class="option-budget-state">
              {{ option.budgetState }}
            </span>
          </button>
        </div>

        <p v-if="!canSelectBudget" class="missing-note mt-4 mb-0">
          여행지와 일정을 먼저 선택하면 예산 옵션을 고를 수 있습니다.
        </p>

        <div class="action-row mt-4">
          <button class="btn secondary-btn" @click="emit('prev')">이전</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['prev', 'next']);
const travelStore = useTravelStore();

const dayMs = 1000 * 60 * 60 * 24;

const departure = computed(() => parseIsoDate(travelStore.departureDate));
const arrival = computed(() => parseIsoDate(travelStore.returnDate));
const availableBudget = computed(() => Number(travelStore.availableBudget || 0));

const tripDays = computed(() => {
  if (!departure.value || !arrival.value) {
    return 0;
  }

  const diff = Math.round((arrival.value - departure.value) / dayMs);
  return Math.max(diff + 1, 1);
});

const stayNights = computed(() => {
  if (!departure.value || !arrival.value) {
    return 0;
  }

  const diff = Math.round((arrival.value - departure.value) / dayMs);
  return Math.max(diff, 0);
});

const selectedDestinationText = computed(() => {
  if (!travelStore.selectedCountry) {
    return '여행지를 선택해 주세요';
  }

  return `${travelStore.selectedCountry.name} (${travelStore.selectedContinent})`;
});

const formattedDeparture = computed(() =>
  departure.value
    ? formatDisplayDate(departure.value)
    : '출발일을 선택해 주세요',
);

const formattedReturn = computed(() =>
  arrival.value ? formatDisplayDate(arrival.value) : '도착일을 선택해 주세요',
);

const canSelectBudget = computed(() =>
  Boolean(travelStore.selectedCountry && tripDays.value > 0),
);

const formattedAvailableBudget = computed(() => formatWon(availableBudget.value));

const budgetOptions = computed(() => {
  const levels = travelStore.selectedCountry?.levels ?? {};
  const optionMap = [
    { key: 'budget', levelKey: 'eco', label: '절약형' },
    { key: 'standard', levelKey: 'std', label: '표준형' },
    { key: 'luxury', levelKey: 'lux', label: '럭셔리' },
  ];

  return optionMap.map((option) => {
    const [daily = 0, hotel = 0, flight = 0] = levels[option.levelKey] ?? [];
    const total =
      (daily * tripDays.value + hotel * stayNights.value + flight) * 10000;
    const isOverBudget = total > availableBudget.value;

    return {
      ...option,
      totalText: canSelectBudget.value ? formatWon(total) : '예상 금액 계산 전',
      dailyText: formatWon(daily * 10000),
      hotelText: formatWon(hotel * 10000),
      flightText: formatWon(flight * 10000),
      budgetState: canSelectBudget.value
        ? isOverBudget
          ? '가용 예산보다 높아요'
          : '가용 예산 안에서 가능해요'
        : '여행 정보 입력 후 확인 가능',
    };
  });
});

function selectOption(option) {
  if (!canSelectBudget.value) {
    return;
  }

  const confirmed = window.confirm(
    `${option.label}을 선택하셨습니다. 이대로 진행할까요?`,
  );

  if (!confirmed) {
    return;
  }

  travelStore.setBudgetOption(option.key);
  emit('next');
}

function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(date) {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatWon(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}
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
  max-width: 820px;
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

.option-copy {
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
  font-size: clamp(1.85rem, 2vw, 2.25rem);
  font-weight: 800;
  line-height: 1.12;
}

.section-description {
  color: var(--color-text-muted);
  font-size: 0.98rem;
  line-height: 1.62;
}

.selection-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-chip-card {
  padding: 16px 18px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.4rem;
  background: #f8fbff;
}

.summary-chip-label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.summary-chip-value {
  color: var(--color-primary-deep);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.45;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.option-card {
  min-height: 188px;
  padding: 20px 18px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.5rem;
  background: #fff;
  color: var(--color-primary-deep);
  text-align: left;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.option-card:hover:not(:disabled) {
  transform: translateY(-3px);
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  box-shadow: 0 12px 28px rgba(7, 102, 255, 0.12);
}

.option-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-badge {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(7, 102, 255, 0.1);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 800;
}

.option-total {
  display: block;
  margin-bottom: 8px;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.35;
}

.option-meta {
  display: block;
  margin-bottom: 10px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.option-breakdown {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.55;
}

.option-budget-state {
  display: inline-flex;
  margin-top: 12px;
  padding: 0.28rem 0.72rem;
  border-radius: 999px;
  background: rgba(7, 102, 255, 0.08);
  color: var(--color-primary-deep);
  font-size: 0.78rem;
  font-weight: 800;
}

.missing-note {
  color: var(--color-text-muted);
  text-align: center;
  font-size: 0.92rem;
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

  .selection-summary-grid,
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
