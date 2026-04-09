import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import api from '@/api';

export const useTravelStore = defineStore('travel', () => {
  const continents = ref({});
  const isLoadingContinents = ref(false);
  const continentsError = ref('');

  const selectedContinent = ref('');
  const selectedCountry = ref(null);
  const departureDate = ref('');
  const returnDate = ref('');
  const selectedBudgetOption = ref('');
  const assetAmount = ref(0);
  const monthlyIncome = ref(0);

  const hasSchedule = computed(() => Boolean(departureDate.value && returnDate.value));
  const availableBudget = computed(() => assetAmount.value + monthlyIncome.value);

  async function fetchContinents() {
    if (Object.keys(continents.value).length > 0) {
      return continents.value;
    }

    isLoadingContinents.value = true;
    continentsError.value = '';

    try {
      const data = await api.get('/continents');
      continents.value = data ?? {};
      return continents.value;
    } catch (error) {
      console.error('대륙 데이터 조회 실패:', error);
      continentsError.value = '대륙 정보를 불러오지 못했습니다.';
      continents.value = {};
      return {};
    } finally {
      isLoadingContinents.value = false;
    }
  }

  function setDestination({ continent, country }) {
    selectedContinent.value = continent;
    selectedCountry.value = country;
  }

  function setSchedule({ startDate, endDate }) {
    departureDate.value = startDate;
    returnDate.value = endDate;
  }

  function setBudgetOption(option) {
    selectedBudgetOption.value = option;
  }

  function setIncomeInfo({ assets = 0, income = 0 }) {
    assetAmount.value = Number(assets) || 0;
    monthlyIncome.value = Number(income) || 0;
  }

  function setMonthlyIncome(income) {
    monthlyIncome.value = Number(income) || 0;
  }

  function resetTravelPlan() {
    selectedContinent.value = '';
    selectedCountry.value = null;
    departureDate.value = '';
    returnDate.value = '';
    selectedBudgetOption.value = '';
    assetAmount.value = 0;
    monthlyIncome.value = 0;
  }

  return {
    continents,
    isLoadingContinents,
    continentsError,
    selectedContinent,
    selectedCountry,
    departureDate,
    returnDate,
    selectedBudgetOption,
    assetAmount,
    monthlyIncome,
    hasSchedule,
    availableBudget,
    fetchContinents,
    setDestination,
    setSchedule,
    setBudgetOption,
    setIncomeInfo,
    setMonthlyIncome,
    resetTravelPlan,
  };
});
