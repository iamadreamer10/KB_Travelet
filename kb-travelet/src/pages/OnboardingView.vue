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
const steps = [StepRegion, StepSchedule, StepOption, StepIncome];

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    router.push({ name: steps[currentStep.value + 1].routeName });
  } else {
    // 🚩 핵심: 온보딩 완료 기록 저장
    localStorage.setItem('onboarded', 'true');
    alert('모든 설정 완료! 메인으로 이동합니다.');
    router.push({ name: 'step-region' });
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
