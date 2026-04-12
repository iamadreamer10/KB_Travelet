<template>
  <div class="bg-white rounded-4 shadow-sm p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">
        <i class="fas fa-plane-departure me-2 text-primary"></i>여행 목표
      </h5>
      <button
        v-if="!isEditing"
        @click="startEdit"
        class="btn btn-sm btn-outline-primary px-3 border-2 fw-bold"
      >
        수정하기
      </button>
    </div>

    <div v-if="isEditing">
      <TravelGoalForm v-model="tempData" />
      <div class="d-flex gap-2 mt-4 pt-3 border-top">
        <button
          @click="cancelEdit"
          class="btn btn-light flex-grow-1 py-2 fw-bold"
        >
          취소
        </button>
        <button
          @click="saveEdit"
          class="btn btn-primary flex-grow-1 py-2 fw-bold"
        >
          설정 저장하기
        </button>
      </div>
    </div>

    <div v-else>
      <TravelGoalDisplay :goal="goal" />

      <div
        class="d-flex justify-content-between align-items-center mt-3 border-top pt-3"
      >
        <span class="text-muted">총 여행 경비</span>
        <span class="fw-bold fs-5" style="color: var(--color-primary)">
          {{ totalExpense.toLocaleString() }}원
        </span>
      </div>

      <GoalBudgetCalculationDisplay :budget="budgetCalculation" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TravelGoalDisplay from './TravelGoalDisplay.vue';
import TravelGoalForm from '../form/TravelGoalForm.vue';
import GoalBudgetCalculationDisplay from './GoalBudgetCalculationDisplay.vue';
import { useGoalBudgetCalculation } from '@/composables/useGoalBudgetCalculation';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';

const profileStore = useProfileStore();
const { fetchContinents } = profileStore;
const { continentList } = storeToRefs(profileStore);

const props = defineProps({
  goal: { type: Object, required: true },
});
const emit = defineEmits(['update-goal']);

const isEditing = ref(false);
const tempData = ref({});

const calculatePeriod = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffInMs = endDate - startDate;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.floor(diffInDays);
};

const totalExpense = computed(() => {
  const period = calculatePeriod(props.goal.startDate, props.goal.endDate);
  const target = isEditing.value ? tempData.value : props.goal;
  return (
    (target.dailyExpense || 0) * (period + 1) +
    (target.flightExpense || 0) +
    (target.hotelExpense || 0) * period
  );
});

// 여행일수 계산 헬퍼
function computeTravelDays(goal) {
  if (!goal.startDate || !goal.endDate) return 1;
  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);
  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 1;
}

// 예산 계산 composable - computed로 감싸서 실시간 업데이트
const budgetCalculation = computed(() => {
  const travelDays = computeTravelDays(props.goal);
  return useGoalBudgetCalculation({
    currentAsset: props.goal.currentAsset || 0,
    monthlyIncome: props.goal.monthlyIncome || 0,
    monthlyRent: props.goal.monthlyRent || 0,
    monthlyInsurance: props.goal.monthlyInsurance || 0,
    monthlyPhone: props.goal.monthlyPhone || 0,
    monthlyTransport: props.goal.monthlyTransport || 0,
    monthlySubscription: props.goal.monthlySubscription || 0,
    monthlyOtherFixed: props.goal.monthlyOtherFixed || 0,
    departureDate: props.goal.startDate || '',
    returnDate: props.goal.endDate || '',
    dayExpense: (props.goal.etcExpense || 0) / Math.max(1, travelDays),
    nightly: (props.goal.hotelExpense || 0) / Math.max(1, travelDays - 1) || 0,
    flightExpense: props.goal.flightExpense || 0,
  });
});

const startEdit = async () => {
  const reverseMap = {
    아시아: 'Asia',
    유럽: 'Europe',
    아메리카: 'Americas',
    아프리카: 'Africa',
    오세아니아: 'Oceania',
  };

  // 1. 데이터가 없으면 가져올 때까지 대기
  if (!continentList.value || Object.keys(continentList.value).length === 0) {
    await fetchContinents();
  }

  const initialData = { ...props.goal };

  // 2. destination -> country 매핑
  if (initialData.destination && !initialData.country) {
    initialData.country = initialData.destination;
  }

  // 3. continent 변환 및 역추적
  if (initialData.continent && reverseMap[initialData.continent]) {
    initialData.continent = reverseMap[initialData.continent];
  } else if (!initialData.continent && initialData.country) {
    const foundKey = Object.keys(continentList.value).find((key) =>
      continentList.value[key].some((c) => c.name === initialData.country),
    );
    if (foundKey) initialData.continent = foundKey;
  }

  tempData.value = initialData;
  isEditing.value = true;
};

const saveEdit = () => {
  // 1. 변환용 맵 (Section에서 정의)
  const continentNameMap = {
    Asia: '아시아',
    Europe: '유럽',
    Americas: '아메리카',
    Africa: '아프리카',
  };

  // 2. 서버로 보낼 데이터 복사본 생성
  const finalData = { ...tempData.value };

  // 3. 영문 Key가 있으면 한글 Label로 교체
  if (finalData.continent && continentNameMap[finalData.continent]) {
    finalData.continent = continentNameMap[finalData.continent];
  }

  if (finalData.country) {
    finalData.destination = finalData.country;
  }

  // 4. 변환된 데이터를 부모(ProfileView 등)로 전달
  emit('update-goal', finalData);
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};

onMounted(() => {
  // console.log('초기 여행 목표 데이터:', props.goal);
});
</script>

<style scoped></style>
