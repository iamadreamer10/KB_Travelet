<template>
  <div class="onboarding-page-bg">
    <div class="step-schedule-stage">
      <div class="onboarding-card shadow-lg">
        <div class="progress-container p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="step-text">STEP 2/4</span>
            <span class="step-label">여행 일정 선택</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-bar-inner progress-animate"
              style="--progress-start: 25%; --progress-end: 50%; width: 50%"
            ></div>
            <span
              class="progress-plane progress-plane-animate"
              style="--progress-start: 25%; --progress-end: 50%"
            >
              <i class="fas fa-plane" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        <div class="content-section p-4 p-md-4">
          <div class="schedule-copy mb-4">
            <span class="copy-kicker">Schedule</span>
            <h2 class="section-title mb-2">여행 일정을 정해주세요</h2>
            <p class="section-description mb-0">
              달력에서 출발일과 도착일을 순서대로 선택해주세요.
            </p>
          </div>

          <div class="calendar-card">
            <div class="calendar-header">
              <button
                type="button"
                class="month-nav-btn"
                @click="moveMonth(-1)"
              >
                이전
              </button>
              <div class="month-title-wrap">
                <strong class="month-title">{{ currentMonthLabel }}</strong>
                <span class="month-subtitle"
                  >원하는 출발일과 도착일을 한 번에 선택해 주세요</span
                >
              </div>
              <button type="button" class="month-nav-btn" @click="moveMonth(1)">
                다음
              </button>
            </div>

            <div class="weekday-row">
              <span v-for="day in weekDays" :key="day" class="weekday-label">{{
                day
              }}</span>
            </div>

            <div class="calendar-grid">
              <button
                v-for="day in calendarDays"
                :key="day.key"
                type="button"
                class="calendar-day"
                :class="{
                  'is-muted': !day.isCurrentMonth,
                  'is-disabled': day.isPast,
                  'is-start': day.isStart,
                  'is-end': day.isEnd,
                  'is-in-range': day.isInRange,
                  'is-single': day.isSingle,
                }"
                :disabled="day.isPast"
                @click="selectDate(day.date)"
              >
                <span class="day-number">{{ day.dayNumber }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside class="schedule-summary-card shadow-lg">
        <div class="summary-header">
          <span class="summary-kicker">선택 일정</span>
          <h3 class="summary-title mb-0">여행 날짜 확인</h3>
        </div>

        <div class="summary-list">
          <div class="summary-block">
            <span class="summary-label">출발일</span>
            <strong class="summary-value">{{ formattedDeparture }}</strong>
          </div>
          <div class="summary-block">
            <span class="summary-label">도착일</span>
            <strong class="summary-value">{{ formattedReturn }}</strong>
          </div>
        </div>

        <div class="summary-action-row">
          <button
            type="button"
            class="btn secondary-btn action-btn"
            @click="emit('prev')"
          >
            이전
          </button>
          <button
            type="button"
            class="btn confirm-btn action-btn"
            :disabled="!isRangeComplete"
            @click="confirmSchedule"
          >
            확인
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['next', 'prev']);
const travelStore = useTravelStore();

const today = startOfDay(new Date());
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const departureDate = ref(parseStoredDate(travelStore.departureDate));
const returnDate = ref(parseStoredDate(travelStore.returnDate));
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const currentMonthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  }),
);

const formattedDeparture = computed(() =>
  departureDate.value
    ? formatSummaryDate(departureDate.value)
    : '날짜를 선택해 주세요',
);

const formattedReturn = computed(() =>
  returnDate.value
    ? formatSummaryDate(returnDate.value)
    : '날짜를 선택해 주세요',
);

const isRangeComplete = computed(() =>
  Boolean(departureDate.value && returnDate.value),
);

const calendarDays = computed(() => {
  const monthStart = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth(),
    1,
  );
  const monthEnd = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    0,
  );
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const days = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const date = new Date(cursor);
    const isCurrentMonth = date.getMonth() === currentMonth.value.getMonth();
    const isPast = date < today;
    const isStart = isSameDate(date, departureDate.value);
    const isEnd = isSameDate(date, returnDate.value);
    const isSingle = isStart && isEnd;
    const isInRange =
      departureDate.value &&
      returnDate.value &&
      date > departureDate.value &&
      date < returnDate.value;

    days.push({
      key: formatIsoDate(date),
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isPast,
      isStart,
      isEnd,
      isSingle,
      isInRange,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
});

function moveMonth(offset) {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + offset,
    1,
  );
}

function selectDate(date) {
  if (!departureDate.value || (departureDate.value && returnDate.value)) {
    departureDate.value = date;
    returnDate.value = null;
    return;
  }

  if (date < departureDate.value) {
    departureDate.value = null;
    returnDate.value = null;
    return;
  }

  returnDate.value = date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(a, b) {
  if (!a || !b) {
    return false;
  }

  return formatIsoDate(a) === formatIsoDate(b);
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSummaryDate(date) {
  const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
  return `${formatIsoDate(date)}(${weekday})`;
}

function parseStoredDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function confirmSchedule() {
  if (!isRangeComplete.value) {
    return;
  }

  travelStore.setSchedule({
    startDate: formatIsoDate(departureDate.value),
    endDate: formatIsoDate(returnDate.value),
  });

  emit('next');
}
</script>

<style scoped>
.onboarding-page-bg {
  min-height: 100vh;
  background-color: #0766ff;
  padding: 20px 18px 32px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.step-schedule-stage {
  width: 100%;
  max-width: 980px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
}

.onboarding-card {
  --color-primary: #0766ff;
  --color-primary-deep: #051766;
  --color-primary-soft: #e6f0ff;
  --color-text-muted: #64748b;

  width: min(100%, 680px);
  flex: 1 1 680px;
  background: #fff;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
}

.schedule-summary-card {
  width: 300px;
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 18px;
  padding: 20px;
  border-radius: 2rem;
  background: #fcfdff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.16) !important;
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

.schedule-copy {
  max-width: 540px;
}

.copy-kicker,
.summary-kicker {
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
  font-size: clamp(1.65rem, 1.8vw, 2.05rem);
  font-weight: 800;
  line-height: 1.12;
}

.section-description {
  color: var(--color-text-muted);
  max-width: 500px;
  font-size: 0.93rem;
  line-height: 1.58;
}

.calendar-card {
  padding: 14px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.75rem;
  background: #fff;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.month-nav-btn {
  min-width: 56px;
  min-height: 34px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 999px;
  background: #fff;
  color: var(--color-primary-deep);
  font-size: 0.82rem;
  font-weight: 700;
}

.month-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.month-title {
  color: var(--color-primary-deep);
  font-size: 0.96rem;
  font-weight: 800;
}

.month-subtitle {
  color: var(--color-text-muted);
  font-size: 0.74rem;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 6px;
}

.weekday-label {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.calendar-day {
  position: relative;
  min-height: 46px;
  border: 1px solid transparent;
  border-radius: 0.95rem;
  background: #fff;
  color: var(--color-primary-deep);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.calendar-day:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #cfe1ff;
  box-shadow: 0 10px 22px rgba(7, 102, 255, 0.08);
}

.calendar-day.is-muted {
  color: #b0bfd6;
}

.calendar-day.is-disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.calendar-day.is-in-range {
  background: #eef4ff;
  color: var(--color-primary-deep);
}

.calendar-day.is-start,
.calendar-day.is-end,
.calendar-day.is-single {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 24px rgba(7, 102, 255, 0.2);
}

.day-number {
  font-size: 0.84rem;
  font-weight: 700;
}

.summary-header {
  padding-bottom: 2px;
}

.summary-title {
  color: var(--color-primary-deep);
  font-size: 1.22rem;
  font-weight: 800;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 15px 16px;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.4rem;
  background: #f8fbff;
}

.summary-label {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.summary-value {
  color: var(--color-primary-deep);
  font-size: 0.96rem;
  font-weight: 800;
  line-height: 1.5;
}

.confirm-btn {
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
}

.confirm-btn:disabled {
  background: #bcd7ff;
  color: rgba(255, 255, 255, 0.92);
}

.summary-action-row {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  min-height: 48px;
  border-radius: 999px;
  font-weight: 700;
}

.secondary-btn {
  border: 1px solid var(--color-primary-soft);
  background: #fff;
  color: var(--color-primary-deep);
}

@media (max-width: 991px) {
  .step-schedule-stage {
    flex-direction: column;
  }

  .onboarding-card,
  .schedule-summary-card {
    width: 100%;
    flex: 1 1 auto;
  }
}

@media (max-width: 767px) {
  .copy-header {
    gap: 12px;
  }

  .calendar-header {
    gap: 10px;
  }

  .month-subtitle {
    text-align: center;
  }

  .calendar-day {
    min-height: 48px;
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
