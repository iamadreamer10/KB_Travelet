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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';


const profileStore = useProfileStore();
const { myTravelGoal } = storeToRefs(profileStore); // 반응성 유지

const handleGoalUpdate = async (newData) => {
  const success = await profileStore.updateTravelGoal(newData);
  if (success) alert('수정 완료! 🛫');
};

const handleFinishGoal = async (id) => {
  const success = await profileStore.finishTravelGoal(id);
  if (success) alert('목표 달성! 🎉');
};

onMounted(() => {
  profileStore.fetchTravelGoal();
});


const router = useRouter();

const createNewGoal = () => {
  if (confirm('새 여행 목표를 등록하러 가볼까요?')) {
    router.push('/check-in');
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
