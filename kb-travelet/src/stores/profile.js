import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useRouter } from 'vue-router';

export const useProfileStore = defineStore('profile', () => {
  // 1. 상태(State)
  const myTravelGoal = ref(null);
  const userId = localStorage.getItem('userId');

  // 2. 게터(Getters) - 목표 존재 여부 확인용
  const hasGoal = computed(
    () => !!(myTravelGoal.value && myTravelGoal.value.destination),
  );

  // 🚩 고정 지출 합계 Getter
  const fixedExpensesTotal = computed(() => {
    const goal = myTravelGoal.value;
    if (!goal) return 0; // 데이터 없으면 0 반환

    return (
      (goal.monthlyRent || 0) +
      (goal.monthlyInsurance || 0) +
      (goal.monthlyPhone || 0) +
      (goal.monthlyTransport || 0) +
      (goal.monthlySubscription || 0) +
      (goal.monthlyOtherFixed || 0)
    );
  });

  // 🚩 고정 수입 Getter
  const monthlyIncomeTotal = computed(() => {
    return myTravelGoal.value?.monthlyIncome || 0;
  });

  // 3. 액션(Actions)
  const router = useRouter();

  const createNewGoal = () => {
    if (confirm('새 여행 목표를 등록하러 가볼까요?')) {
      localStorage.setItem('onboarded', 'false'); // 온보딩 상태 초기화
      router.push('/check-in');
    }
  };

  // 목표 불러오기 (진행 중인 것만)
  const fetchTravelGoal = async () => {
    try {
      const response = await api.get('/profiles', {
        params: { memberId: userId, isCompleted: false },
      });
      myTravelGoal.value = response.length > 0 ? response[0] : null;
      console.log('목표 로드 성공:', myTravelGoal.value);
    } catch (error) {
      console.error('여행 목표 로드 실패:', error);
    }
  };

  // 목표 수정
  const updateTravelGoal = async (newData) => {
    try {
      const response = await api.put(`/profiles/${newData.id}`, newData);
      myTravelGoal.value = { ...response };
      return true;
    } catch (error) {
      console.error('목표 수정 실패:', error);
      return false;
    }
  };

  // 목표 완료/종료 처리
  const finishTravelGoal = async (id) => {
    try {
      await api.patch(`/profiles/${id}`, {
        isCompleted: true,
      });
      if (response.status === 200) {
        myTravelGoal.value = null; // 스토어를 비우면 사이드바도 즉시 바뀜
        localStorage.setItem('onboarded', false);
        return true;
      }
    } catch (error) {
      console.error('목표 완료 실패:', error);
      return false;
    }
  };

  return {
    myTravelGoal,
    fixedExpensesTotal,
    monthlyIncomeTotal,
    hasGoal,
    createNewGoal,
    fetchTravelGoal,
    updateTravelGoal,
    finishTravelGoal,
  };
});
