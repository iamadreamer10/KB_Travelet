<template>
  <div style="border: 1px solid #ccc; padding: 20px">
    <h3>4. 수입 정보 입력</h3>
    <p>월 수입을 입력해주세요 (가계부 계산의 기준이 됩니다).</p>

    <input type="number" v-model="income" placeholder="예: 3000000" /> 원

    <br /><br />
    <button @click="$emit('prev')">이전</button>
    <button @click="checkInComplete">설정 완료 및 탑승하기</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['next', 'prev']);
const travelStore = useTravelStore();
const income = ref(0);

const checkInComplete = () => {
  if (income.value <= 0) {
    alert('수입을 입력해주세요!');
    return;
  }

  // 1. 스토어에 데이터 저장
  travelStore.setMonthlyIncome(income.value);

  // 2. 부모에게 마지막 완료 신호 전송
  emit('next');
};
</script>
