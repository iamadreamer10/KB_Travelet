<template>
  <div class="calendar-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="btn-group shadow-sm">
        <button class="btn btn-outline-primary px-3 border-2">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="btn btn-outline-primary px-3 border-2">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <h5 class="fw-bold mb-0">2026년 4월</h5>
      <div>
        <div>수익: + 2,678,123원</div>
        <div>지출: - 1,678,000원</div>
        <div>총: + 1,000,123원</div>
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
      <div v-for="i in dates" :key="i" class="col-1-7">
        <div
          class="date-card d-flex flex-column p-2 rounded-3 border h-100 bg-white"
          :class="{ 'border-primary border-2 shadow-sm': i === 8 }"
        >
          <span
            class="text-center fw-bold small"
            :class="{ 'text-primary': i === 8 }"
            >{{ i }}</span
          >
          <div class="mt-auto"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const days = ['일', '월', '화', '수', '목', '금', '토'];
const dates = ref(31);
</script>

<style scoped>
/* 7열 그리드를 위한 커스텀 스타일 */
.col-1-7 {
  flex: 0 0 14.285%;
  max-width: 14.285%;
}
.date-card {
  min-height: 75px;
  transition: all 0.2s;
  cursor: pointer;
}
.date-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary);
}
</style>
