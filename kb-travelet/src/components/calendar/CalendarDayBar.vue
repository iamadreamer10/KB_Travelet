<template>
  <div
    class="date-card d-flex flex-column p-2 rounded-3 border h-100 bg-white"
    :class="{ 'border-primary border-2 shadow-sm': isToday(date) }"
    @click="viewDailyledger"
  >
    <span
      class="text-center fw-bold small"
      :class="{ 'text-primary': isToday(date) }"
    >
      {{ date }}
    </span>
    <div class="mt-auto"></div>
  </div>
</template>

<script setup>
const props = defineProps(['date']);

// 오늘 날짜인지 확인하는 로직 (예시)
const isToday = (date) => {
  const today = new Date();
  return (
    today.getFullYear() === 2026 &&
    today.getMonth() + 1 === 4 &&
    date === today.getDate()
  );
};

const viewDailyledger = () => {
  console.log('오늘의 가계부 등장! :', props.date, '일');
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
