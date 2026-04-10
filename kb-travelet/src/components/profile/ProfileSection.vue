<template>
  <div class="bg-white rounded-4 shadow-sm p-4">
    <div class="d-flex align-items-center">
      <div
        class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4 me-3"
        style="
          width: 80px;
          height: 80px;
          background-color: var(--color-primary);
        "
      >
        {{ userName.charAt(0).toUpperCase() }}
      </div>
      <div>
        <h5 class="fw-bold mb-1">{{ userName }}</h5>
        <p class="text-muted mb-0 small">{{ userEmail }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const userName = localStorage.getItem('userName') || '사용자';
const userEmail = localStorage.getItem('userEmail') || 'abc@naver.com';
</script>

<style scoped></style>
