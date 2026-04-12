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
      <h4 class="fw-bold mb-0">{{ userName }}</h4>
      <p class="text-muted small mb-3">{{ userEmail }}</p>
      <div
        v-if="myTravelGoal && myTravelGoal.id"
        class="d-flex border-top pt-2 justify-content-between"
      >
        <div class="d-flex flex-column gap-1">
          <span
            class="text-muted extra-small fw-bold text-uppercase tracking-wider"
            >Destination</span
          >
          <div class="d-flex align-items-center gap-2">
            <div
              class="bg-light rounded-3 p-1 text-center border"
              style="min-width: 20px"
            >
              <span
                class="d-block fw-black text-primary lh-1"
                style="font-size: 0.6rem"
                >{{ myTravelGoal?.destinationCode }}</span
              >
            </div>

            <div class="flex-grow-1" style="max-width: 150px">
              <span class="fw-bold fs-6 lh-sm d-block">{{
                myTravelGoal?.destination
              }}</span>
            </div>
          </div>
        </div>
        <div>
          <span class="text-muted extra-small d-block">일정</span>
          <span class="fs-7 fw-bold"
            >{{ myTravelGoal?.startDate }} <br />-{{
              myTravelGoal?.endDate
            }}</span
          >
        </div>
      </div>
      <div v-else class="text-center py-3">
        <hr />
        <span class="fw-bold text-muted ms-2"
          >다음 여행지는 이미 당신을 기다리고 있어요.</span
        >
      </div>
    </div>

    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <RouterLink to="/main" class="nav-link text-white rounded-3 py-3 mb-2">
          <i class="fas fa-home me-2"></i> 홈
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/profile"
          class="nav-link text-white rounded-3 py-3 mb-2"
        >
          <i class="fas fa-cog me-2"></i> 설정
        </RouterLink>
      </li>
    </ul>
    <div
      v-if="myTravelGoal && myTravelGoal.id"
      class="flex-grow-1 rounded-3 p-3 my-3 bg-white d-flex flex-column align-items-center justify-content-center"
    >
      <p>
        <i
          class="fa-solid fa-money-bill-1-wave fa-2xl"
          style="color: var(--color-primary)"
        ></i>
      </p>
      <p
        class="mb-0 fw-bold small text-center"
        style="color: var(--color-primary-deep); line-height: 1.5"
      >
        <i class="fa-solid fa-circle-info me-1"></i>
        {{ myTravelGoal?.destination }} 여행을 위해 <br />하루에
        <span class="text-primary">{{ myTravelGoal?.dailyAvailableBudget?.toLocaleString() }}원</span>씩 사용할 수 있어요
      </p>
    </div>
    <div
      v-else
      class="flex-grow-1 rounded-3 p-3 my-3 bg-white d-flex flex-column align-items-center justify-content-center"
    >
      <p>
        <i
          class="fa-solid fa-sack-xmark fa-2xl m-2"
          style="color: var(--color-primary)"
        ></i>
      </p>
      <p class="fw-bold text-black-50 m-3 fs-7 text-center">
        텅 빈 여행 가방을 꿈으로 채워보세요.
      </p>
      <button
        @click="createNewGoal()"
        class="btn px-4"
        style="background-color: var(--color-primary); color: white"
      >
        목표 만들기
      </button>
    </div>

    <div class="mt-auto border-top border-white-50 pt-3">
      <button
        @click="handleLogout"
        class="btn btn-link text-white-50 p-0 text-decoration-none small"
      >
        <i class="fas fa-sign-out-alt me-1"></i> 로그아웃
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
<<<<<<< HEAD

const router = useRouter();
const authStore = useAuthStore();
=======
import { useProfileStore } from '@/stores/profile.js';
import { storeToRefs } from 'pinia';

const profileStore = useProfileStore();
const { createNewGoal } = profileStore;
const { myTravelGoal } = storeToRefs(profileStore);
>>>>>>> ed8eb3bd9fdabe4c164daf11a2e992c35075316a

/**
 * 🚩 로그아웃 처리
 */
const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    // 1. auth 스토어의 logout 실행 (내부에서 localStorage.clear()와 상태 초기화 수행)
    authStore.logout();

    // 2. 랜딩 페이지로 이동 (LandingView.vue 경로)
    router.push('/');
  }
};
</script>

<style scoped>
.extra-small {
  font-size: 0.7rem;
}
.nav-link:hover {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
