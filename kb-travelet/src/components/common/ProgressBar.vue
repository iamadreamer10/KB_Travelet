<template>
  <div class="w-100">
    <div class="d-flex justify-content-between align-items-end mb-2">
      <h6 class="fw-bold mb-0">여행까지</h6>
      <span class="text-primary small fw-bold">스페인 0.0% 달성</span>
    </div>

    <div class="position-relative py-3">
      <div
        class="progress w-100"
        style="height: 12px; background-color: white; border-radius: 10px"
      >
        <div
          class="progress-bar shadow-sm"
          style="width: 0%; background-color: var(--color-primary)"
        ></div>
      </div>
      <div
        class="position-absolute"
        style="left: 0%; top: 50%; transform: translate(-50%, -50%)"
      >
        <i
          class="fas fa-plane text-primary bg-white rounded-circle p-2 shadow-sm"
          style="font-size: 1.2rem"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped></style>
