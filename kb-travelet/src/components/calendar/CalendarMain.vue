<template>
  <div class="calendar-container">
    <div
      class="align-items-center mb-4"
      style="display: grid; grid-template-columns: 1fr auto 1fr; width: 100%"
    >
      <div class="d-flex justify-content-start">
        <div class="btn-group shadow-sm">
          <button class="btn btn-sm btn-outline-primary px-2 border-2 me-1">
            <i class="fas fa-chevron-left fa-xs"></i>
          </button>
          <button class="btn btn-sm btn-outline-primary px-2 border-2">
            <i class="fas fa-chevron-right fa-xs"></i>
          </button>
        </div>
      </div>

      <div class="text-center px-4">
        <h5 class="fw-bold mb-0">2026년 4월</h5>
      </div>
      <div class="d-flex gap-2 justify-content-end">
        <div
          class="p-2 px-3 bg-white rounded-3 text-end border-top border-primary border-4 shadow-sm"
          style="min-width: 120px"
        >
          <div class="text-muted extra-small fw-bold">수익</div>
          <div class="fw-bold text-primary" style="font-size: 0.9rem">
            + 2,678,123원
          </div>
        </div>

        <div
          class="p-2 px-3 bg-white rounded-3 text-end border-top border-danger border-4 shadow-sm"
          style="min-width: 120px"
        >
          <div class="text-muted extra-small fw-bold">지출</div>
          <div class="fw-bold text-danger" style="font-size: 0.9rem">
            - 1,678,000원
          </div>
        </div>

        <div
          class="p-2 px-3 rounded-3 text-end shadow-sm d-flex flex-column justify-content-center"
          style="background-color: var(--color-primary); min-width: 140px"
        >
          <div class="text-white extra-small fw-bold">총 잔액</div>
          <div
            class="fw-bold"
            style="color: var(--color-surface); font-size: 1rem"
          >
            + 1,000,123원
          </div>
        </div>
      </div>
    </div>

    <div class="row g-0 text-center mb-2">
      <div
        v-for="day in days"
        :key="day"
        class="col fw-bold py-2 text-muted small"
        :class="{ 'text-danger': day === '일', 'text-primary': day === '토' }"
      >
        {{ day }}
      </div>
    </div>

    <div class="row g-2">
      <div
        v-for="(dayObj, index) in calendarDates"
        :key="index"
        class="col-1-7"
      >
        <CalendarDayBar v-if="dayObj.date" :date="dayObj.date" />
        <div v-else class="h-100 p-2 opacity-25"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CalendarDayBar from './CalendarDayBar.vue';

const days = ['일', '월', '화', '수', '목', '금', '토'];
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth() + 1);

const calendarDates = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  // 1. 해당 월의 1일이 무슨 요일인지 (0: 일요일, ..., 6: 토요일)
  const firstDay = new Date(year, month - 1, 1).getDay();

  // 2. 해당 월의 마지막 날짜 (0을 넣으면 지난달의 마지막 날을 가져옴)
  const lastDate = new Date(year, month, 0).getDate();

  const result = [];

  // 3. 1일 앞의 빈 칸 채우기 (지난달 날짜들)
  for (let i = 0; i < firstDay; i++) {
    result.push({ date: null, currentMonth: false });
  }

  // 4. 실제 날짜 채우기
  for (let d = 1; d <= lastDate; d++) {
    result.push({ date: d, currentMonth: true });
  }

  return result;
});
</script>

<style scoped>
/* 7열 그리드를 위한 커스텀 스타일 */
.col-1-7 {
  flex: 0 0 14.285%;
  max-width: 14.285%;
}
</style>
