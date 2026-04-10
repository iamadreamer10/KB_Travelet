import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import api from '@/api';
import { useAuthStore } from '@/stores/auth';

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
  const checkedIn = ref(false);

  const hasSchedule = computed(() => Boolean(departureDate.value && returnDate.value));
  const availableBudget = computed(() => assetAmount.value + monthlyIncome.value);

  function getCurrentMemberId() {
    const authStore = useAuthStore();
    return authStore.user?.id || localStorage.getItem('userId') || '';
  }

  function createDefaultProfile(memberId) {
    return {
      memberId,
      destination: '',
      startDate: '',
      endDate: '',
      currentAsset: 0,
      monthlyIncome: 0,
      budgetOption: '',
      checkedIn: false,
      isCompleted: false,
    };
  }

  function findCountryByCode(code) {
    if (!code) {
      return { continent: '', country: null };
    }

    const continentNameMap = {
      Asia: '아시아',
      Europe: '유럽',
      Americas: '아메리카',
      Africa: '아프리카',
      Oceania: '오세아니아',
    };

    for (const [sourceName, countries] of Object.entries(continents.value ?? {})) {
      const matchedCountry = (countries ?? []).find((country) => country.code === code);

      if (matchedCountry) {
        return {
          continent: continentNameMap[sourceName] ?? sourceName,
          country: matchedCountry,
        };
      }
    }

    return { continent: '', country: null };
  }

  function applyProfile(profile) {
    const memberId = getCurrentMemberId();
    const nextProfile = {
      ...createDefaultProfile(memberId),
      ...(profile ?? {}),
    };
    const { continent, country } = findCountryByCode(nextProfile.destination);

    selectedContinent.value = continent;
    selectedCountry.value = country;
    departureDate.value = nextProfile.startDate || '';
    returnDate.value = nextProfile.endDate || '';
    assetAmount.value = Number(nextProfile.currentAsset) || 0;
    monthlyIncome.value = Number(nextProfile.monthlyIncome) || 0;
    selectedBudgetOption.value = nextProfile.budgetOption || '';
    checkedIn.value = Boolean(nextProfile.checkedIn);
  }

  async function getCurrentProfile() {
    const memberId = getCurrentMemberId();

    if (!memberId) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    const profiles = await api.get('/profiles', {
      params: { memberId },
    });

    return Array.isArray(profiles) ? (profiles[0] ?? null) : null;
  }

  async function loadProfile() {
    const memberId = getCurrentMemberId();

    if (!memberId) {
      resetTravelPlan();
      return null;
    }

    await fetchContinents();

    const profile = await getCurrentProfile();
    applyProfile(profile ?? createDefaultProfile(memberId));
    return profile;
  }

  async function saveProfile(patch = {}) {
    const memberId = getCurrentMemberId();

    if (!memberId) {
      throw new Error('저장할 사용자 정보를 찾을 수 없습니다.');
    }

    const currentProfile = await getCurrentProfile();
    const baseProfile = currentProfile ?? createDefaultProfile(memberId);

    const nextProfile = {
      ...createDefaultProfile(memberId),
      ...baseProfile,
      ...patch,
      memberId,
    };

    const savedProfile = currentProfile?.id
      ? await api.patch(`/profiles/${currentProfile.id}`, nextProfile)
      : await api.post('/profiles', nextProfile);

    applyProfile(savedProfile);
    return savedProfile;
  }

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

  async function saveDestination({ continent, country }) {
    setDestination({ continent, country });

    return saveProfile({
      destination: country?.code || '',
      checkedIn: false,
      isCompleted: false,
    });
  }

  function setSchedule({ startDate, endDate }) {
    departureDate.value = startDate;
    returnDate.value = endDate;
  }

  async function saveSchedule({ startDate, endDate }) {
    setSchedule({ startDate, endDate });

    return saveProfile({
      startDate,
      endDate,
      checkedIn: false,
      isCompleted: false,
    });
  }

  function setBudgetOption(option) {
    selectedBudgetOption.value = option;
  }

  function setIncomeInfo({ assets = 0, income = 0 }) {
    assetAmount.value = Number(assets) || 0;
    monthlyIncome.value = Number(income) || 0;
  }

  async function saveIncomeInfo({ assets = 0, income = 0 }) {
    const normalizedAssets = Number(assets) || 0;
    const normalizedIncome = Number(income) || 0;

    setIncomeInfo({
      assets: normalizedAssets,
      income: normalizedIncome,
    });

    return saveProfile({
      currentAsset: normalizedAssets,
      monthlyIncome: normalizedIncome,
      checkedIn: false,
      isCompleted: false,
    });
  }

  async function resetSavedProfile() {
    const memberId = getCurrentMemberId();

    if (!memberId) {
      throw new Error('새 여행 정보를 초기화할 사용자를 찾을 수 없습니다.');
    }

    const nextProfile = createDefaultProfile(memberId);
    return saveProfile(nextProfile);
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
    checkedIn.value = false;
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
    checkedIn,
    hasSchedule,
    availableBudget,
    fetchContinents,
    loadProfile,
    getCurrentProfile,
    saveProfile,
    setDestination,
    saveDestination,
    setSchedule,
    saveSchedule,
    setBudgetOption,
    setIncomeInfo,
    saveIncomeInfo,
    setMonthlyIncome,
    resetSavedProfile,
    resetTravelPlan,
  };
});
