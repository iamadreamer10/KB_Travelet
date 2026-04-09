<template>
  <div class="onboarding-transition-shell">
    <Transition :name="transitionName">
      <component
        :is="steps[currentStep]"
        :key="currentStep"
        @next="nextStep"
        @prev="prevStep"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import StepRegion from '@/components/onboarding/StepRegion.vue';
import StepSchedule from '@/components/onboarding/StepSchedule.vue';
import StepOption from '@/components/onboarding/StepOption.vue';
import StepIncome from '@/components/onboarding/StepIncome.vue';

const router = useRouter();
const currentStep = ref(0);
const transitionName = ref('step-forward');

const steps = [StepRegion, StepSchedule, StepOption, StepIncome];

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    transitionName.value = 'step-forward';
    currentStep.value++;
  } else {
    alert('모든 설정 완료! 메인으로 이동합니다.');
    router.push('/main');
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    transitionName.value = 'step-backward';
    currentStep.value--;
  }
};
</script>

<style scoped>
.onboarding-transition-shell {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
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
