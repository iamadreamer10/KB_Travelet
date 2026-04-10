<template>
  <div class="bg-white rounded-4 shadow-sm p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">
        <i class="fas fa-plane-departure me-2 text-primary"></i>여행 목표
      </h5>
      <div class="d-flex gap-2">
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="btn btn-sm btn-light px-3"
        >
          취소
        </button>
        <button
          @click="isEditing ? saveEdit() : startEdit()"
          class="btn btn-sm px-3"
          :class="isEditing ? 'btn-success' : 'btn-primary'"
        >
          {{ isEditing ? '저장' : '수정' }}
        </button>
      </div>
    </div>

    <TravelGoalForm v-if="isEditing" v-model="tempData" />
    <TravelGoalDisplay v-else :goal="goal" />

    <div
      class="d-flex justify-content-between align-items-center mt-3 border-top pt-3"
    >
      <span class="text-muted">총 여행 경비</span>
      <span class="fw-bold" style="color: var(--color-primary)">
        {{ totalExpense.toLocaleString() }}원
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import TravelGoalDisplay from './TravelGoalDisplay.vue';
import TravelGoalForm from '../form/TravelGoalForm.vue';

const props = defineProps({
  goal: { type: Object, required: true },
});
const emit = defineEmits(['update-goal']);

const isEditing = ref(false);
const tempData = ref({});

const totalExpense = computed(() => {
  const target = isEditing.value ? tempData.value : props.goal;
  return (
    (target.etcExpense || 0) +
    (target.flightExpense || 0) +
    (target.hotelExpense || 0)
  );
});

const startEdit = () => {
  // 한글을 영문으로 역매핑 (Map을 뒤집음)
  const reverseMap = {
    아시아: 'Asia',
    유럽: 'Europe',
    아메리카: 'Americas',
    아프리카: 'Africa',
  };

  const initialData = { ...props.goal };

  // 만약 데이터가 한글이면 영문으로 치환해서 Form에 전달
  if (initialData.continent && reverseMap[initialData.continent]) {
    initialData.continent = reverseMap[initialData.continent];
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

  // 4. 변환된 데이터를 부모(ProfileView 등)로 전달
  emit('update-goal', finalData);
  isEditing.value = false;
  console.log('저장된 여행 목표:', finalData);
};

const cancelEdit = () => {
  isEditing.value = false;
};
</script>
