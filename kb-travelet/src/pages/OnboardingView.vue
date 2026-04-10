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
      transitionName.value = newIndex > oldIndex ? 'step-forward' : 'step-backward';
    }
  },
);

const nextStep = () => {
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
    await travelStore.loadProfile();
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
}

.step-forward-enter-active,
.step-forward-leave-active,
.step-backward-enter-active,
.step-backward-leave-active {
  width: 100%;
  transition: transform 0.8s cubic-bezier(0.22, 0.8, 0.2, 1);
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
