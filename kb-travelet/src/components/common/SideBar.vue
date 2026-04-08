<template>
  <div
    class="d-flex flex-column p-3 text-white h-100"
    style="background-color: var(--color-primary)"
  >
    <div class="bg-white text-dark rounded-4 p-3 mb-4 mt-2">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="fw-bold small text-primary" style="letter-spacing: 1px">
          <i class="fa-solid fa-ticket" style="color: var(--color-primary)"></i>
          TRAVEL PASS</span
        >
      </div>
      <h4 class="fw-bold mb-0">권원영</h4>
      <p class="text-muted small mb-3">onyo9@naver.com</p>
      <div class="d-flex border-top pt-2 justify-content-between">
        <div>
          <span class="text-muted extra-small d-block">목적지</span>
          <span class="fw-bold">스페인</span>
        </div>
        <div>
          <span class="text-muted extra-small d-block">일정</span>
          <span class="fw-bold">2026-04-18</span>
        </div>
      </div>
    </div>

    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <a
          href="#"
          class="nav-link active bg-white text-primary rounded-3 py-3 mb-2 shadow-sm"
        >
          <i class="fas fa-home me-2"></i> 홈
        </a>
      </li>
      <li>
        <a href="#" class="nav-link text-white-50 py-3 mb-2"
          ><i class="fas fa-cog me-2"></i> 설정</a
        >
      </li>
    </ul>
    <p class="mb-0 fw-bold text-white mt-2">
      예시> 스페인 여행을 위해 하루에 0원씩 사용할 수 있어요
    </p>

    <div class="mt-auto border-top border-white-50 pt-3">
      <button class="btn btn-link text-white-50 p-0 text-decoration-none small">
        <i class="fas fa-sign-out-alt me-1"></i> 로그아웃
      </button>
    </div>
  </div>
</template>

<style scoped>
.extra-small {
  font-size: 0.7rem;
}
.nav-link:hover {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
