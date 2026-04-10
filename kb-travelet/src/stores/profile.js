import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

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
      const response = await axios.get(
        `/api/profiles?memberId=${userId}&isCompleted=false`,
      );
      myTravelGoal.value = response.data.length > 0 ? response.data[0] : null;
      console.log('목표 로드 성공:', myTravelGoal.value);
    } catch (error) {
      console.error('여행 목표 로드 실패:', error);
    }
  };

  // 목표 수정
  const updateTravelGoal = async (newData) => {
    try {
      const response = await axios.put(`/api/profiles/${newData.id}`, newData);
      if (response.status === 200) {
        myTravelGoal.value = { ...response.data };
        return true;
      }
    } catch (error) {
      console.error('목표 수정 실패:', error);
      return false;
    }
  };

  // 목표 완료/종료 처리
  const finishTravelGoal = async (id) => {
    try {
      const response = await axios.patch(`/api/profiles/${id}`, {
        isCompleted: true,
      });
      if (response.status === 200) {
        myTravelGoal.value = null; // 스토어를 비우면 사이드바도 즉시 바뀜
        return true;
      }
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
