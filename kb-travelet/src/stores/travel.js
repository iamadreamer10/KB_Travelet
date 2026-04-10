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
  const dailyExpense = ref(0);
  const hotelExpense = ref(0);
  const flightExpense = ref(0);
  const checkedIn = ref(false);

  const hasSchedule = computed(() => Boolean(departureDate.value && returnDate.value));
  const availableBudget = computed(() => assetAmount.value + monthlyIncome.value);

  function getCurrentMemberId() {
    const authStore = useAuthStore();
    return authStore.user?.id || localStorage.getItem('userId') || '';
  }

  function createDefaultProfile(memberId) {
    // json-server에 저장할 기본 여행 프로필 형태를 정의한다.
    return {
      memberId,
      destination: '',
      destinationCode: '',
      startDate: '',
      endDate: '',
      currentAsset: 0,
      monthlyIncome: 0,
      budgetOption: '',
      dailyExpense: 0,
      hotelExpense: 0,
      flightExpense: 0,
      checkedIn: false,
      isCompleted: false,
    };
  }

  function getBudgetLevelKey(option) {
    const optionMap = {
      budget: 'eco',
      standard: 'std',
      luxury: 'lux',
    };

    return optionMap[option] || '';
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
    // 서버에서 가져온 프로필을 화면 상태로 되돌린다.
    const memberId = getCurrentMemberId();
    const nextProfile = {
      ...createDefaultProfile(memberId),
      ...(profile ?? {}),
    };
    const resolvedCode = nextProfile.destinationCode || nextProfile.destination;
    const { continent, country } = findCountryByCode(resolvedCode);

    selectedContinent.value = continent;
    selectedCountry.value = country;
    departureDate.value = nextProfile.startDate || '';
    returnDate.value = nextProfile.endDate || '';
    assetAmount.value = Number(nextProfile.currentAsset) || 0;
    monthlyIncome.value = Number(nextProfile.monthlyIncome) || 0;
    selectedBudgetOption.value = nextProfile.budgetOption || '';
    dailyExpense.value = Number(nextProfile.dailyExpense) || 0;
    hotelExpense.value = Number(nextProfile.hotelExpense) || 0;
    flightExpense.value = Number(nextProfile.flightExpense) || 0;
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
      // 로그인 정보가 없으면 온보딩 상태도 초기화한다.
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
      // 기본값 -> 기존 값 -> 이번에 바뀐 값 순으로 덮어쓴다.
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
      // json-server 응답을 그대로 캐시에 저장한다.
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

    // 목적지는 선택 즉시 서버에도 저장한다.
    return saveProfile({
      destination: country?.name || '',
      destinationCode: country?.code || '',
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

    // 일정 선택 후 바로 프로필에 반영한다.
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

  function getRecommendedExpensePreset(option = selectedBudgetOption.value) {
    const levelKey = getBudgetLevelKey(option);
    const levels = selectedCountry.value?.levels ?? {};
    const [daily = 0, hotel = 0, flight = 0] = levels[levelKey] ?? [];

    return {
      dailyExpense: daily * 10000,
      hotelExpense: hotel * 10000,
      flightExpense: flight * 10000,
    };
  }

  function setExpenseOverrides({ daily = 0, hotel = 0, flight = 0 }) {
    dailyExpense.value = Number(daily) || 0;
    hotelExpense.value = Number(hotel) || 0;
    flightExpense.value = Number(flight) || 0;
  }

  async function saveExpenseOverrides({ daily = 0, hotel = 0, flight = 0 }) {
    const normalizedDaily = Number(daily) || 0;
    const normalizedHotel = Number(hotel) || 0;
    const normalizedFlight = Number(flight) || 0;

    setExpenseOverrides({
      daily: normalizedDaily,
      hotel: normalizedHotel,
      flight: normalizedFlight,
    });

    return saveProfile({
      dailyExpense: normalizedDaily,
      hotelExpense: normalizedHotel,
      flightExpense: normalizedFlight,
    });
  }

  function setIncomeInfo({ assets = 0, income = 0 }) {
    // 입력창의 현재 값을 즉시 계산 상태에 반영한다.
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

    // 시드 머니 입력 단계는 다음 예산 계산의 기준이 된다.
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

    // 새로 만들기를 선택하면 서버 프로필을 초기 상태로 다시 저장한다.
    const nextProfile = createDefaultProfile(memberId);
    return saveProfile(nextProfile);
  }

  function setMonthlyIncome(income) {
    monthlyIncome.value = Number(income) || 0;
  }

  function resetTravelPlan() {
    // 화면 상태만 초기화하고 서버와의 연결은 유지한다.
    selectedContinent.value = '';
    selectedCountry.value = null;
    departureDate.value = '';
    returnDate.value = '';
    selectedBudgetOption.value = '';
    assetAmount.value = 0;
    monthlyIncome.value = 0;
    dailyExpense.value = 0;
    hotelExpense.value = 0;
    flightExpense.value = 0;
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
    dailyExpense,
    hotelExpense,
    flightExpense,
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
    getRecommendedExpensePreset,
    setExpenseOverrides,
    saveExpenseOverrides,
    setIncomeInfo,
    saveIncomeInfo,
    setMonthlyIncome,
    resetSavedProfile,
    resetTravelPlan,
  };
});
