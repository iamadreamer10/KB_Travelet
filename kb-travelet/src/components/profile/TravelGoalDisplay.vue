<template>
  <div>
    <!-- 기본 여행 정보 -->
    <div class="row g-4 mb-4">
      <div class="col-6">
        <div class="text-muted small">목적지</div>
        <div class="fw-bold fs-5">{{ goal.destination }}</div>
      </div>
      <div class="col-6">
        <div class="text-muted small">대륙</div>
        <div class="fw-bold fs-5">{{ goal.continent }}</div>
      </div>
      <div class="col-6">
        <div class="text-muted small">출발일</div>
        <div class="fw-bold fs-5">{{ goal.startDate }}</div>
      </div>
      <div class="col-6">
        <div class="text-muted small">귀국일</div>
        <div class="fw-bold fs-5">{{ goal.endDate }}</div>
      </div>
    </div>

    <hr class="text-muted opacity-25" />

    <!-- 여행 경비 내역 -->
    <div class="vstack gap-2">
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted">기타 경비</span>
        <span class="fw-bold">{{ formatNumber(goal.etcExpense) }}원</span>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted">비행기값</span>
        <span class="fw-bold">{{ formatNumber(goal.flightExpense) }}원</span>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted">총 숙소비</span>
        <span class="fw-bold">{{ formatNumber(goal.hotelExpense) }}원</span>
      </div>
    </div>

    <hr class="text-muted opacity-25" />

    <!-- 재정 정보 요약 -->
    <div v-if="hasFinanceInfo" class="vstack gap-2 mt-2">
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted small">현재 자산</span>
        <span class="fw-bold small">{{ formatNumber(goal.currentAsset) }}원</span>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted small">월 수입</span>
        <span class="fw-bold small">{{ formatNumber(goal.monthlyIncome) }}원</span>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted small">월 고정지출</span>
        <span class="fw-bold small">{{ formatNumber(totalMonthlyFixed) }}원</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  goal: { type: Object, required: true },
});

const formatNumber = (value) => {
  return (value || 0).toLocaleString();
};

const hasFinanceInfo = computed(() => {
  return (
    props.goal.currentAsset !== undefined &&
    props.goal.monthlyIncome !== undefined
  );
});

const totalMonthlyFixed = computed(() => {
  return (
    (props.goal.monthlyRent || 0) +
    (props.goal.monthlyInsurance || 0) +
    (props.goal.monthlyPhone || 0) +
    (props.goal.monthlyTransport || 0) +
    (props.goal.monthlySubscription || 0) +
    (props.goal.monthlyOtherFixed || 0)
  );
});
</script>

<style scoped></style>
