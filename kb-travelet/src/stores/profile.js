import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/api';

export const useProfileStore = defineStore('profile', () => {
  // 1. 상태(State)
  const myTravelGoal = ref(null);
  const userId = localStorage.getItem('userId');

  // 2. 게터(Getters) - 목표 존재 여부 확인용
  const hasGoal = computed(
    () => !!(myTravelGoal.value && myTravelGoal.value.destination),
  );

  // 3. 액션(Actions)

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
      myTravelGoal.value = null; // 스토어를 비우면 사이드바도 즉시 바뀜
      return true;
    } catch (error) {
      console.error('목표 완료 실패:', error);
      return false;
    }
  };

  return {
    myTravelGoal,
    hasGoal,
    fetchTravelGoal,
    updateTravelGoal,
    finishTravelGoal,
  };
});
