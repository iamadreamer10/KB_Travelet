<template>
  <div
    v-if="calendarDate.date"
    class="date-card d-flex flex-column p-2 rounded-3 border h-100 bg-white"
    :class="{ 'border-primary border-2 shadow-sm': isToday() }"
    @click="viewDailyLedger"
  >
    <span class="text-center fw-bold small" :style="getDateColor()">
      {{ calendarDate.date }}
    </span>
    <!-- 날짜별 총수입, 총지출위한 코드 -->
    <div class="mt-auto text-center small">
      <div v-if="summary?.income > 0" style="color: green">
        +{{ summary.income.toLocaleString() }}
      </div>

      <div v-if="summary?.expense > 0" style="color: red">
        -{{ summary.expense.toLocaleString() }}
      </div>
    </div>
  </div>

  <div v-else class="h-100" style="min-height: 75px; opacity: 0"></div>
</template>

<script setup>
import { computed } from 'vue';

// Props 정의: calendarDate 객체 하나로 깔끔하게!
const props = defineProps({
  calendarDate: {
    type: Object,
    required: true,
    // 기대 구조: { year: Number, month: Number, date: Number | null }
  },
  dailySummary: Object,
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

/*-----------------------------------------
날짜 클릭시 모달 띄우기 위한 코드
(클릭 발생 알림)
*/

const emit = defineEmits(['selectDate']);

const viewDailyLedger = () => {
  const { year, month, date } = props.calendarDate;
  if (date) {
    const formatted = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

    emit('selectDate', formatted);
  }
};

/* 날짜 key 만들기 */
const fullDate = computed(() => {
  const { year, month, date } = props.calendarDate;
  if (!date) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
});

const summary = computed(() => {
  if (!fullDate.value) return null;

  return (
    props.dailySummary?.[fullDate.value] || {
      income: 0,
      expense: 0,
    }
  );
});
</script>

<style scoped>
.date-card {
  min-height: 75px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.date-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary-soft);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  z-index: 1;
}

.date-card:active {
  transform: translateY(-1px) scale(0.97);
  background-color: #f8f9fa;
  transition: all 0.05s;
}

.border-primary.border-2 {
  box-shadow: 0 4px 12px rgba(5, 23, 102, 0.15) !important;
}
</style>
