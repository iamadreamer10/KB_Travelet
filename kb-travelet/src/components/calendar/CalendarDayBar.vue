<template>
  <div
<<<<<<< feature/dashboard
    v-if="calendarDate.date"
    class="date-card d-flex flex-column p-2 rounded-3 border h-100 bg-white"
    :class="{ 'border-primary border-2 shadow-sm': isToday() }"
    @click="viewDailyLedger"
  >
    <span
      class="text-center fw-bold small"
      :style="getDateColor()"
    >
      {{ calendarDate.date }}
    </span>
    <div class="mt-auto"></div>
  </div>

  <div v-else class="h-100" style="min-height: 75px; opacity: 0;"></div>
</template>

<script setup>
// Props 정의: calendarDate 객체 하나로 깔끔하게!
const props = defineProps({
  calendarDate: {
    type: Object,
    required: true,
    // 기대 구조: { year: Number, month: Number, date: Number | null }
  }
});

// 오늘 날짜 확인 (date가 null이면 false 반환)
const isToday = () => {
  const { year, month, date } = props.calendarDate;
  if (!date) return false;

  const today = new Date();
  return (
    date === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear()
  );
};

// 날짜 색상 결정
const getDateColor = () => {
  const { year, month, date } = props.calendarDate;
  if (!date) return {};

  if (isToday()) return { color: 'var(--color-primary)' };

  // 요일 계산
  const dayOfWeek = new Date(year, month - 1, date).getDay();
  if (dayOfWeek === 0) return { color: '#dc3545' }; // 일요일
  if (dayOfWeek === 6) return { color: '#0d6efd' }; // 토요일
  return { color: '#212529' }; // 평일
};

const viewDailyLedger = () => {
  const { year, month, date } = props.calendarDate;
  if (date) {
    console.log(`${year}-${month}-${date} 상세 보기`);
  }
=======
    class="date-card d-flex flex-column p-2 rounded-3 border h-100 bg-white"
    :class="{ 'border-primary border-2 shadow-sm': isToday(date) }"
    @click="viewDailyledger"
  >
    <span class="text-center fw-bold small" :style="getDateColor(date)">
      {{ date }}
    </span>
    <div class="mt-auto"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  date: Number,
  year: Number,
  month: Number,
});

// 오늘 날짜인지 확인하는 로직 (예시)
const isToday = (date) => {
  const today = new Date();
  return (
    today.getFullYear() === 2026 &&
    today.getMonth() + 1 === 4 &&
    date === today.getDate()
  );
};

// 요일별 색상 결정 함수
const getDateColor = (date) => {
  // 오늘 날짜 강조가 최우선이라면?
  if (isToday(date)) return { color: 'var(--color-primary)' };

  const dayOfWeek = new Date(props.year, props.month - 1, date).getDay();

  if (dayOfWeek === 0) return { color: '#dc3545' }; // 일요일: Red
  if (dayOfWeek === 6) return { color: '#0d6efd' }; // 토요일: Blue
  return { color: '#212529' }; // 평일: Dark
};

const viewDailyledger = () => {
  console.log('오늘의 가계부 등장! :', props.date, '일');
>>>>>>> develop
};
</script>

<style scoped>
.date-card {
  min-height: 75px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.date-card:hover {
  transform: translateY(-3px); /* 위로 살짝 들림 */
  border-color: var(--color-primary-soft); /* 테두리 색 변경 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important; /* 은은한 그림자 */
  z-index: 1;
}

.date-card:active {
  transform: translateY(-1px) scale(0.97); /* 꾹 눌리는 효과 */
  background-color: #f8f9fa;
  transition: all 0.05s; /* 클릭은 즉각적으로! */
}

.border-primary.border-2 {
  box-shadow: 0 4px 12px rgba(5, 23, 102, 0.15) !important;
}
</style>
