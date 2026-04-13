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
          수정 완료하기
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
import { ref, computed } from 'vue';
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

const calculateNights = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffInMs = endDate - startDate;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.max(Math.floor(diffInDays), 0);
};

const totalExpense = computed(() => {
  const target = isEditing.value ? tempData.value : props.goal;
  const nights = calculateNights(target.startDate, target.endDate);
  const days = nights + 1;

  return (
    (target.dailyTravelExpense || 0) * days +
    (target.flightExpense || 0) +
    (target.hotelExpense || 0) * nights
  );
});

function computeTravelDays(goal) {
  if (!goal.startDate || !goal.endDate) return 1;
  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);
  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 1;
}

const budgetCalculation = computed(() => {
  const travelDays = computeTravelDays(props.goal);
  const nightlyDays = Math.max(travelDays - 1, 0);

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
    dayExpense: props.goal.dailyTravelExpense || 0,
    nightly: nightlyDays > 0 ? props.goal.hotelExpense || 0 : 0,
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

  if (!continentList.value || Object.keys(continentList.value).length === 0) {
    await fetchContinents();
  }

  const initialData = { ...props.goal };

  if (initialData.destination && !initialData.country) {
    initialData.country = initialData.destination;
  }

  if (initialData.continent && reverseMap[initialData.continent]) {
    initialData.continent = reverseMap[initialData.continent];
  } else if (!initialData.continent && initialData.country) {
    const foundKey = Object.keys(continentList.value).find((key) =>
      continentList.value[key].some((country) => country.name === initialData.country),
    );
    if (foundKey) initialData.continent = foundKey;
  }

  tempData.value = initialData;
  isEditing.value = true;
};

const saveEdit = () => {
  const continentNameMap = {
    Asia: '아시아',
    Europe: '유럽',
    Americas: '아메리카',
    Africa: '아프리카',
    Oceania: '오세아니아',
  };

  const finalData = { ...tempData.value };

  if (finalData.continent && continentNameMap[finalData.continent]) {
    finalData.continent = continentNameMap[finalData.continent];
  }

  if (finalData.country) {
    finalData.destination = finalData.country;
  }

  emit('update-goal', finalData);
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};
</script>

<style scoped></style>
