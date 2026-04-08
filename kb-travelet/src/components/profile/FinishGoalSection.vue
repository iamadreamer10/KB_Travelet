<template>
  <div
    class="rounded-4 p-4 border border-primary border-opacity-25"
    style="background-color: #f0f4ff"
  >
    <h5 class="text-primary fw-bold mb-3">여행 목표 조기 종료</h5>
    <p class="text-muted small mb-4">
      여행이 계획보다 일찍 끝났나요? 현재까지의 기록을 바탕으로 가계부를
      정산하고 목표를 마무리합니다.
      <br /><span class="text-secondary fw-bold"
        >* 종료된 데이터는 '월별 리포트'에서 확인할 수 있습니다.</span
      >
    </p>

    <div class="d-flex gap-2">
      <button
        class="btn btn-outline-primary flex-grow-1 py-2 fw-bold"
        @click="handleEarlyFinish"
      >
        <i class="fas fa-flag-checkered me-2"></i>조기 종료하기
      </button>
    </div>
  </div>
</template>

<script setup>
const handleEarlyFinish = () => {
  // 브라우저 기본 confirm보다는 나중에 예쁜 커스텀 모달로 바꾸면 더 좋습니다!
  const message =
    '현재까지의 내역으로 가계부를 마감할까요?\n종료 후에는 이번 목표의 지출을 추가할 수 없습니다.';

  if (confirm(message)) {
    console.log('가계부 마감 및 리포트 생성 로직 실행');
    // 여기에 성공/실패 여부 판단 및 DB 상태 업데이트 로직 추가
  }
};
</script>
