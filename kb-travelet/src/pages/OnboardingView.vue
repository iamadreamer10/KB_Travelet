<template>
  <div class="onboarding-transition-shell">
    <Transition :name="transitionName">
      <component
        v-if="isReady"
        :is="currentStepComponent"
        :key="currentStep"
        @next="nextStep"
        @prev="prevStep"
      />
      <div v-else class="loading-screen">
        <p>데이터를 불러오는 중입니다...</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StepRegion from '@/components/onboarding/StepRegion.vue';
import StepSchedule from '@/components/onboarding/StepSchedule.vue';
import StepOption from '@/components/onboarding/StepOption.vue';
import StepIncome from '@/components/onboarding/StepIncome.vue';
import { useTravelStore } from '@/stores/travel';

const router = useRouter();
const travelStore = useTravelStore();

// --- 상태 관리 ---
const isReady = ref(false); // 에러 원인이었던 변수 선언
const currentStep = ref(0);
const transitionName = ref('step-forward');
const steps = [StepRegion, StepSchedule, StepOption, StepIncome];

const steps = [
  // URL 순서와 실제 온보딩 순서를 1:1로 맞춘다.
  { key: 'region', routeName: 'step-region', component: StepRegion },
  { key: 'schedule', routeName: 'step-schedule', component: StepSchedule },
  { key: 'income', routeName: 'step-income', component: StepIncome },
  { key: 'option', routeName: 'step-option', component: StepOption },
];

const currentStep = computed(() => {
  const index = steps.findIndex((step) => step.routeName === route.name);
  return index >= 0 ? index : 0;
});

const currentStepComponent = computed(() => steps[currentStep.value].component);
const currentStepKey = computed(() => steps[currentStep.value].key);

watch(
  () => route.name,
  (newName, oldName) => {
    if (!oldName) {
      return;
    }

    const newIndex = steps.findIndex((step) => step.routeName === newName);
    const oldIndex = steps.findIndex((step) => step.routeName === oldName);

    if (newIndex !== -1 && oldIndex !== -1) {
      transitionName.value =
        newIndex > oldIndex ? 'step-forward' : 'step-backward';
    }
  },
);

/**
 * 다음 단계로 이동
 */
const nextStep = () => {
  // 마지막 스텝이 아니면 다음 라우트로, 끝이면 대시보드로 이동한다.
  if (currentStep.value < steps.length - 1) {
    transitionName.value = 'step-forward';
    currentStep.value++;
  } else {
    // 🚩 온보딩 완료 마킹 및 이동
    localStorage.setItem('onboarded', 'true');
    alert('모든 설정 완료! 메인으로 이동합니다.');
    router.push({ name: 'step-region' });
  }
};

/**
 * 이전 단계로 이동
 */
const prevStep = () => {
  if (currentStep.value > 0) {
    transitionName.value = 'step-backward';
    currentStep.value--;
  }
};

/**
 * 초기 데이터 로드
 */
onMounted(async () => {
  try {
    const profile = await travelStore.loadProfile();

    // 이미 여행 프로필이 있으면 온보딩을 건너뛴다.
    if (profile?.checkedIn) {
      router.replace('/main');
      return;
    }
  } catch (error) {
    console.error('초기 데이터 로드 실패:', error);
  } finally {
    // 데이터 로드가 끝나면 화면 표시
    isReady.value = true;
  }
});
</script>

<style scoped>
.onboarding-transition-shell {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background-color: #fff;
}

.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 트랜지션 스타일 (0.8초 동안 부드럽게 슬라이드) */
.step-forward-enter-active,
.step-forward-leave-active,
.step-backward-enter-active,
.step-backward-leave-active {
  width: 100%;
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.step-forward-enter-active,
.step-backward-enter-active {
  position: relative;
  z-index: 2;
}

.step-forward-leave-active,
.step-backward-leave-active {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.step-forward-enter-from,
.step-backward-leave-to {
  transform: translateX(100%);
}

.step-forward-leave-to,
.step-backward-enter-from {
  transform: translateX(-100%);
}
</style>
