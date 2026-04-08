<template>
  <h3>step3 여행 옵션 설정</h3>

  <button @click="$emit('prev')">이전</button>
  <button @click="$emit('next')">다음</button>
</template>

<script setup>
defineEmits('prev', 'next');
</script>

<style scoped></style>
