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
        </div>
      </div>

      <div class="content-section p-4 p-md-5">
        <div class="option-copy mb-4">
          <span class="copy-kicker">Trip Option</span>
          <h2 class="section-title mb-2">여행 예산을 정해주세요</h2>
          <p class="section-description mb-0">
            선택한 여행지, 일정, 그리고 현재 재정 상황에 맞춰 예산 유형을 선택해
            주세요.
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
          <button class="btn secondary-btn prev-icon-btn" @click="emit('prev')">
            <i class="fas fa-angle-left" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>

    <Transition name="budget-modal">
      <div
        v-if="pendingOption"
        class="budget-modal-backdrop"
        @click="closeOptionModal"
      >
        <div
          class="budget-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-modal-title"
          @click.stop
        >
          <div class="budget-modal-header">
            <span class="budget-modal-kicker">Selected Plan</span>
            <h3 id="budget-modal-title" class="budget-modal-title mb-0">
              이 여행으로 진행할까요?
            </h3>
          </div>

          <div class="budget-modal-summary">
            <div class="budget-modal-item">
              <span class="budget-modal-label">여행지</span>
              <strong class="budget-modal-value">{{ selectedDestinationText }}</strong>
            </div>
            <div class="budget-modal-item">
              <span class="budget-modal-label">여행 기간</span>
              <strong class="budget-modal-value">{{ tripDays }}일간</strong>
            </div>
            <div class="budget-modal-item">
              <span class="budget-modal-label">여행 유형</span>
              <strong class="budget-modal-value">{{ pendingOption.label }}</strong>
            </div>
          </div>

          <div class="budget-daily-banner">
            <span class="budget-daily-caption">Before Departure</span>
            <strong class="budget-daily-value">{{ dailyBudgetGuide }}</strong>
            <p class="budget-daily-description mb-0">
              여행 전까지 준비 기간을 기준으로 계산한 하루 예산 안내예요.
            </p>
          </div>

          <div class="budget-modal-actions">
            <button
              type="button"
              class="btn secondary-btn modal-cancel-btn"
              @click="closeOptionModal"
            >
              취소
            </button>
            <button
              type="button"
              class="btn confirm-btn modal-confirm-btn"
              @click="confirmOptionSelection"
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
import { computed, onMounted, ref } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['prev', 'next']);
const travelStore = useTravelStore();
const pendingOption = ref(null);

const dayMs = 1000 * 60 * 60 * 24;
const today = startOfDay(new Date());

const departure = computed(() => parseIsoDate(travelStore.departureDate));
const arrival = computed(() => parseIsoDate(travelStore.returnDate));
const availableBudget = computed(() =>
  Number(travelStore.availableBudget || 0),
);

const tripDays = computed(() => {
  if (!departure.value || !arrival.value) {
    return 0;
  }

  const diff = Math.round((arrival.value - departure.value) / dayMs);
  return Math.max(diff, 1);
});

const stayNights = computed(() => {
  if (!departure.value || !arrival.value) {
    return 0;
  }

  const diff = Math.round((arrival.value - departure.value) / dayMs);
  return Math.max(diff - 1, 0);
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
const daysUntilDeparture = computed(() => {
  if (!departure.value) {
    return 0;
  }

  return Math.max(Math.ceil((departure.value - today) / dayMs), 0);
});
const dailyBudgetGuide = computed(() => {
  if (!pendingOption.value) {
    return '';
  }

  if (daysUntilDeparture.value <= 0) {
    return `총 ${pendingOption.value.totalText} 예산을 바로 확인해 주세요.`;
  }

  const dailyAmount = Math.ceil(
    pendingOption.value.total / daysUntilDeparture.value,
  );
  return `여행 전까지 하루 약 ${formatWon(dailyAmount)} 준비하면 돼요.`;
});

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
      total,
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

async function selectOption(option) {
  if (!canSelectBudget.value) {
    return;
  }

  pendingOption.value = option;
}

function closeOptionModal() {
  pendingOption.value = null;
}

async function confirmOptionSelection() {
  if (!pendingOption.value) {
    return;
  }

  try {
    travelStore.setBudgetOption(pendingOption.value.key);
    await travelStore.saveProfile({
      budgetOption: pendingOption.value.key,
      checkedIn: true,
      isCompleted: true,
    });
    closeOptionModal();
    emit('next');
  } catch (error) {
    console.error('프로필 완료 처리 실패:', error);
    alert('프로필을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

onMounted(async () => {
  try {
    await travelStore.loadProfile();
  } catch (error) {
    console.error('옵션 페이지 프로필 불러오기 실패:', error);
  }
});
</script>

<style scoped>
.onboarding-page-bg {
  min-height: 100dvh;
  background-color: #0766ff;
  padding: 24px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
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

.confirm-btn {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 24px rgba(7, 102, 255, 0.16);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  background: #055ae3;
  box-shadow: 0 16px 30px rgba(7, 102, 255, 0.24);
}

.budget-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(5, 23, 102, 0.34);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 30;
  will-change: opacity;
  contain: paint;
}

.budget-modal-enter-active,
.budget-modal-leave-active {
  transition: opacity 0.22s linear;
}

.budget-modal-enter-active .budget-modal-card,
.budget-modal-leave-active .budget-modal-card {
  transition:
    transform 0.34s cubic-bezier(0.22, 0.8, 0.2, 1),
    opacity 0.22s linear;
  will-change: transform, opacity;
}

.budget-modal-enter-from,
.budget-modal-leave-to {
  opacity: 0;
}

.budget-modal-enter-from .budget-modal-card,
.budget-modal-leave-to .budget-modal-card {
  opacity: 0;
  transform: translate3d(0, 18px, 0);
}

.budget-modal-card {
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout paint style;
}

.budget-modal-card {
  width: min(100%, 480px);
  padding: 24px;
  border-radius: 2rem;
  background: #fff;
  box-shadow: 0 24px 60px rgba(5, 23, 102, 0.18);
}

.budget-modal-header {
  margin-bottom: 18px;
}

.budget-modal-kicker {
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

.budget-modal-title {
  color: var(--color-primary-deep);
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.3;
}

.budget-modal-summary {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.budget-modal-item {
  padding: 14px 16px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.2rem;
  background: #f8fbff;
}

.budget-modal-label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
}

.budget-modal-value {
  color: var(--color-primary-deep);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.45;
}

.budget-daily-banner {
  margin-bottom: 20px;
  padding: 16px 18px;
  border-radius: 1.25rem;
  background: rgba(5, 23, 102, 0.06);
}

.budget-daily-caption {
  display: block;
  margin-bottom: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}

.budget-daily-value {
  display: block;
  color: var(--color-primary-deep);
  font-size: 1.22rem;
  font-weight: 800;
  line-height: 1.4;
}

.budget-daily-description {
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.55;
}

.budget-modal-actions {
  display: flex;
  gap: 10px;
}

.modal-cancel-btn,
.modal-confirm-btn {
  flex: 1;
  min-height: 50px;
  border-radius: 999px;
  font-weight: 700;
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
