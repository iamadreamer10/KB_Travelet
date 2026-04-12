<template>
  <div class="w-100 p-4">
    <div class="d-flex justify-content-between align-items-end m-1">
      <div>
        <h6 class="fw-bold mb-0">오늘도 예산 방어 성공!</h6>
        <p class="text-muted small mb-0" style="font-size: 0.75rem">
          {{ savedDaysCount }}일 / {{ totalDays }}일 성공 중
        </p>
      </div>
      <span class="small fw-bold text-primary">{{ progress }}%</span>
    </div>

    <div class="position-relative py-3">
      <div
        class="progress w-100"
        style="
          height: 12px;
          background-color: white;
          border-radius: 10px;
          overflow: visible;
        "
      >
        <div
          class="progress-bar shadow-sm"
          :style="{
            width: progress + '%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '10px',
            transition: 'width 0.5s ease',
          }"
        ></div>
      </div>

      <div
        class="position-absolute"
        :style="{
          left: progress + '%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.5s ease',
        }"
      >
        <i
          class="fas fa-plane text-primary bg-white rounded-circle p-2 shadow-sm"
          style="font-size: 1.2rem"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProfileStore } from '@/stores/profile';
import { useAccountStore } from '@/stores/account';

const profileStore = useProfileStore();
const accountStore = useAccountStore();
const { myTravelGoal } = storeToRefs(profileStore);
const { transactions } = storeToRefs(accountStore);

// 전체 준비 기간(분모) 계산
const totalDays = computed(() => {
  const goal = myTravelGoal.value;
  if (!goal || !goal.createdAt || !goal.startDate) return 0;

  const start = new Date(goal.createdAt).setHours(0, 0, 0, 0);
  const target = new Date(goal.startDate).setHours(0, 0, 0, 0);

  const diff = target - start;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
});

// 실제로 지킨 날(분자) 계산
const savedDaysCount = computed(() => {
  const goal = myTravelGoal.value;
  if (!goal || !transactions.value.length) return 0;

  const dailyLimit = goal.dailyAvailableBudget || 0;
  const start = new Date(goal.createdAt).setHours(0, 0, 0, 0);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const dailyBalances = transactions.value.reduce((acc, tran) => {
    const dateStr = tran.date;
    if (!acc[dateStr]) acc[dateStr] = 0;
    acc[dateStr] += tran.type === 'income' ? tran.amount : -tran.amount;
    return acc;
  }, {});

  let count = 0;
  let curr = new Date(start);

  while (curr <= yesterday) {
    const dateKey = curr.toISOString().split('T')[0];
    const balance = dailyBalances[dateKey] || 0;
    if (balance >= -dailyLimit) count++;
    curr.setDate(curr.getDate() + 1);
  }
  return count;
});

// 최종 퍼센트
const progress = computed(() => {
  if (totalDays.value <= 0) return 0;
  return Math.min(
    Math.round((savedDaysCount.value / totalDays.value) * 100),
    100,
  );
});
</script>

<style scoped></style>
