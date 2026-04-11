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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';


const profileStore = useProfileStore();
const { myTravelGoal, hasGoal } = storeToRefs(profileStore); // 반응성 유지

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
const userId = localStorage.getItem('userId');

const getTravelGoal = async () => {
  // 실제로는 여기서 axios 같은 거로 서버에 GET 요청을 보냅니다.
  // 예시 응답 데이터:
  try {
    const response = await axios.get(
      `/api/profiles?memberId=${userId}&isCompleted=false`,
    );
    myTravelGoal.value = response.data[0] || {}; // 데이터가 없으면 빈 객체로 초기화
    console.log('로드된 여행 목표:', myTravelGoal.value);
  } catch (error) {
    console.error('여행 목표 로드 에러:', error);
  }
};

// const handleGoalUpdate = async (newData) => {
//   try {
//     // 1. 서버에 수정 요청 보내기 (id 기반)
//     // newData 안에 이미 id(난수 혹은 숫자)가 포함되어 있어야 합니다.
//     const response = await axios.put(`/api/profiles/${newData.id}`, newData);

//     if (response.status === 200) {
//       myTravelGoal.value = { ...response.data };

//       alert('여행 목표가 성공적으로 수정되었습니다! 🛫');
//     }
//   } catch (error) {
//     console.error('목표 수정 중 에러 발생:', error);

//     // 에러 상황에 대한 피드백
//     if (error.response && error.response.status === 404) {
//       alert('데이터를 찾을 수 없습니다. 다시 시도해주세요.');
//     } else {
//       alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
//     }
//   }
// };

// const handleFinishGoal = async (id) => {
//   try {
//     // 1. 서버에 '이 목표 완료됐음'이라고 알리기 (PATCH 사용)
//     const response = await axios.patch(`/api/profiles/${id}`, {
//       isCompleted: true,
//     });

//     if (response.status === 200) {
//       // 2. 서버 업데이트 성공 시 로컬 상태 초기화
//       console.log(`${id}번 목표 완료 처리 성공!`);

//       // 현재 활성화된 목표를 화면에서 제거
//       myTravelGoal.value = null;

//       // 3. ProgressBar 및 관련 데이터 초기화
//       // 만약 ProgressBar가 myTravelGoal을 참조하고 있다면 자동으로 0이 되겠지만,
//       // 별도의 reactive 변수를 쓰고 있다면 여기서 초기화해줍니다.
//       // if (typeof resetProgressBar === 'function') {
//       //   resetProgressBar();
//       // }

//       alert('축하합니다! 여행 목표를 달성하셨습니다. 🎉');
//     }
//   } catch (error) {
//     console.error('목표 완료 처리 중 에러:', error);
//     alert('상태 업데이트에 실패했습니다. 다시 시도해주세요.');
//   }
// };

const createNewGoal = () => {
  if (confirm('새 여행 목표를 등록하러 가볼까요?')) {
    router.push('/check-in');
  }
};

onMounted(() => {
  getTravelGoal();
});
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
