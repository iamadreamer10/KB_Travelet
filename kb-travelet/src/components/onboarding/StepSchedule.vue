<template>
  <div style="border: 1px solid #ccc; padding: 20px">
    <h3>2. 여행 일정 선택</h3>
    <input type="date" /> ~ <input type="date" /> <br /><br />
    <button @click="$emit('prev')">이전</button>
    <button @click="$emit('next')">다음</button>
  </div>
</template>

<script setup>
defineEmits(['next', 'prev']);
</script>
