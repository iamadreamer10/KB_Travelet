<template>
  <div
    class="d-flex vh-100 overflow-hidden"
    style="background-color: var(--color-surface)"
  >
    <div style="width: 280px; flex-shrink: 0"><SideBar /></div>

    <main class="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
      <div
        class="w-100 sticky-top flex-shrink-0"
        style="z-index: 1020; background-color: var(--color-primary-soft)"
      >
        <ProgressBar />
      </div>
      <div class="flex-grow-1 overflow-auto p-4">
        <h4 class="mb-4 fw-bold">설정</h4>

        <div class="settings-content">
          <ProfileSection class="mb-4" />
          <div class="travel-section mb-4">
            <TravelGoalSection
              v-if="myTravelGoal?.destination"
              :goal="myTravelGoal"
              @update-goal="handleGoalUpdate"
            />

            <div v-else class="bg-white rounded-4 shadow-sm p-5 text-center">
              <div class="mb-3 text-primary" style="font-size: 3rem">🛫</div>
              <h5 class="fw-bold">등록된 여행 목표가 없어요</h5>
              <p class="text-muted small">
                새로운 여행 계획을 세우고 자산을 관리해보세요!
              </p>
              <button
                @click="createNewGoal"
                class="btn px-4"
                style="background-color: var(--color-primary); color: white"
              >
                목표 만들기
              </button>
            </div>
          </div>
          <FinishGoalSection
            :has-goal="!!myTravelGoal?.destination"
            @finish-goal="handleFinishGoal(myTravelGoal.id)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SideBar from '@/components/common/SideBar.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import ProfileSection from '@/components/profile/ProfileSection.vue';
import TravelGoalSection from '@/components/profile/TravelGoalSection.vue';
import FinishGoalSection from '@/components/profile/FinishGoalSection.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 1. 초기 데이터 설정
const myTravelGoal = ref({
  id: 1,
  destination: '도쿄 & 오사카',
  continent: '아시아',
  startDate: '2026-06-15',
  endDate: '2026-06-25',
  etcExpense: 1200000,
  flightExpense: 450000,
  hotelExpense: 1850000,
  // 재정 정보
  currentAsset: 5000000,
  monthlyIncome: 4000000,
  monthlyRent: 800000,
  monthlyInsurance: 200000,
  monthlyPhone: 50000,
  monthlyTransport: 300000,
  monthlySubscription: 100000,
  monthlyOtherFixed: 200000,
});

const router = useRouter();

// 2. 자식(TravelGoalSection)이 보낸 수정된 데이터를 처리
const handleGoalUpdate = (newData) => {
  // 실제로는 여기서 axios 같은 거로 서버에 PUT/PATCH 요청을 보냅니다.
  console.log('서버로 전송할 데이터:', newData);

  // 서버 응답이 성공했다고 가정하고 로컬 상태 업데이트
  // 스프레드 연산자를 써서 새 객체로 교체해주는 게 Vue의 반응성에 좋습니다.
  myTravelGoal.value = { ...newData };

  alert('여행 목표가 성공적으로 수정되었습니다!');
};

const handleFinishGoal = (id) => {
  // 해당 id에 대한 목표 완료 여부를 수정해주세요. OR 삭제해주세요.
  console.log(`${id}번 목표 완료! 이제 다시 시작`);
  myTravelGoal.value = null;
};

const createNewGoal = () => {
  if (confirm('새 여행 목표를 등록하러 가볼까요?')) {
    router.push('/onboarding');
  }
};
</script>

<style scoped>
.bg-surface {
  background-color: var(--color-surface);
}
/* 스크롤바 디자인을 깔끔하게 하고 싶다면 */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
