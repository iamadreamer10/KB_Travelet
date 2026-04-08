<template>
  <div>
    <h1>여행 설정 (Step: {{ currentStep + 1 }})</h1>
    <hr />

    <component :is="steps[currentStep]" @next="nextStep" @prev="prevStep" />
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

// 순서대로 배열에 담습니다.
const steps = [StepRegion, StepSchedule, StepOption, StepIncome];

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    alert('모든 설정 완료! 메인으로 이동합니다.');
    router.push('/main');
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};
</script>
