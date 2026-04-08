<template>
  <div style="border: 1px solid #ccc; padding: 20px">
    <div v-if="!selectedContinent">
      <h3>1-1. 대륙 선택</h3>
      <button @click="selectedContinent = 'Europe'">유럽</button>
      <button @click="selectedContinent = 'Asia'">아시아</button>
    </div>

    <div v-else>
      <h3>1-2. {{ selectedContinent }}의 목적지 선택</h3>
      <button @click="confirm">파리/도쿄 (선택 완료)</button>
      <br /><br />
      <button @click="selectedContinent = null">이전(대륙 다시 고르기)</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const emit = defineEmits(['next']);
const selectedContinent = ref(null);

const confirm = () => {
  // 여기서 Pinia 스토어에 데이터를 저장하는 로직이 들어갑니다.
  emit('next');
};
</script>
