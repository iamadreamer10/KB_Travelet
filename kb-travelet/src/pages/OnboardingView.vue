<template>
  <div class="onboarding-transition-shell">
    <Transition :name="transitionName">
      <component
        v-if="isReady"
        :is="currentStepComponent"
        :key="currentStepKey"
        @next="nextStep"
        @prev="prevStep"
      />
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StepRegion from '@/components/onboarding/StepRegion.vue';
import StepSchedule from '@/components/onboarding/StepSchedule.vue';
import StepOption from '@/components/onboarding/StepOption.vue';
import StepIncome from '@/components/onboarding/StepIncome.vue';
import { useTravelStore } from '@/stores/travel';

const router = useRouter();
const route = useRoute();
const travelStore = useTravelStore();
const transitionName = ref('step-forward');
const isReady = ref(false);

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

const nextStep = () => {
  // 마지막 스텝이 아니면 다음 라우트로, 끝이면 대시보드로 이동한다.
  if (currentStep.value < steps.length - 1) {
    router.push({ name: steps[currentStep.value + 1].routeName });
  } else {
    alert('모든 설정 완료! 메인으로 이동합니다.');
    router.push('/main');
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    router.push({ name: steps[currentStep.value - 1].routeName });
  }
};

onMounted(async () => {
  try {
    const profile = await travelStore.loadProfile();

    // 이미 여행 프로필이 있으면 온보딩을 건너뛴다.
    if (profile?.checkedIn) {
      router.replace('/main');
      return;
    }
  } catch (error) {
    console.error('프로필 불러오기 실패:', error);
  } finally {
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
  background: #0766ff;
}

.step-forward-enter-active,
.step-forward-leave-active,
.step-backward-enter-active,
.step-backward-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  min-height: 100dvh;
  transition:
    transform 0.55s cubic-bezier(0.22, 0.8, 0.2, 1),
    opacity 0.2s ease;
  will-change: transform, opacity;
}

.step-forward-enter-from,
.step-backward-leave-to {
  transform: translateX(100%);
  opacity: 1;
}

.step-forward-leave-to,
.step-backward-enter-from {
  transform: translateX(-100%);
  opacity: 1;
}

.step-forward-enter-active,
.step-backward-enter-active {
  z-index: 2;
}

.step-forward-leave-active,
.step-backward-leave-active {
  z-index: 1;
}
</style>
