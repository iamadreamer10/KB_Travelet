<template>
  <div class="onboarding-container">
    <ProgressBar :current-step="currentStep" :total-steps="4" />

    <transition name="fade" mode="out-in">
      <component
        :is="stepComponents[currentStep]"
        @next="nextStep"
        @prev="prevStep"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTravelStore } from '@/stores/travel';

import StepRegion from '@/components/onboarding/StepRegion.vue';
import StepSchedule from '@/components/onboarding/StepSchedule.vue';
import StepOption from '@/components/onboarding/StepOption.vue';
import StepIncome from '@/components/onboarding/StepIncome.vue';

const currentStep = ref(0);
const stepComponents = [StepRegion, StepSchedule, StepOption, StepIncome];
const travelStore = useTravelStore();
const router = useRouter();

const nextStep = () => {
  if (currentStep.value < stepComponents.length - 1) {
    currentStep.value++;
  } else {
    completeOnboarding();
  }
};

const completeOnboarding = async () => {
  router.push('/main');
};
</script>
