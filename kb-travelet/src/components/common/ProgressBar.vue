<template>
  <div class="w-100 p-4">
    <div class="d-flex justify-content-between align-items-end m-1">
      <h6 class="fw-bold mb-0">여행까지</h6>
      <span class="small fw-bold">스페인 35.0% 달성</span>
    </div>

    <div class="position-relative py-3">
      <div
        class="progress w-100"
        style="
          height: 12px;
          background-color: var(--color-primary);
          border-radius: 10px;
        "
      >
        <div
          class="progress-bar shadow-sm"
          style="width: 35%; background-color: white"
        ></div>
      </div>

      <div
        class="position-absolute"
        style="
          left: 35%;
          top: 50%;
          transform: translate(-50%, -50%);
          transition: left 0.5s ease;
        "
      >
        <i
          class="fas fa-plane text-primary bg-white rounded-circle p-2 shadow-sm"
          style="font-size: 1.2rem; transform: rotate(0deg)"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped></style>
