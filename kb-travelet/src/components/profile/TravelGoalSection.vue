<template>
  <div class="bg-white rounded-4 shadow-sm p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">
        <i class="fas fa-plane-departure me-2 text-primary"></i>여행 목표
      </h5>
      <button class="btn btn-primary btn-sm px-3">수정</button>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-6">
        <div class="text-muted small">목적지</div>
        <div class="fw-bold fs-5">일본</div>
      </div>
      <div class="col-6">
        <div class="text-muted small">대륙</div>
        <div class="fw-bold fs-5">아시아</div>
      </div>
    </div>

    <hr class="text-muted opacity-25" />

    <div class="vstack gap-2">
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted">여행 경비</span>
        <span class="fw-bold">5,400,000원</span>
      </div>
    </div>
  </div>
</template>
<script setup></script>

<style scoped></style>
