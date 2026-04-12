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
  const dailyTravelExpense = ref(0);
  const dailyAvailableBudget = ref(0);
  const hotelExpense = ref(0);
  const flightExpense = ref(0);
  const checkedIn = ref(false);
  const profileCreatedAt = ref('');

  const currentAsset = ref(0);
  const monthlyRent = ref(0);
  const monthlyInsurance = ref(0);
  const monthlyPhone = ref(0);
  const monthlyTransport = ref(0);
  const monthlySubscription = ref(0);
  const monthlyOtherFixed = ref(0);

  const hasSchedule = computed(() =>
    Boolean(departureDate.value && returnDate.value),
  );
  const availableBudget = computed(
    () => assetAmount.value + monthlyIncome.value,
  );

  function getCurrentMemberId() {
    const authStore = useAuthStore();
    return authStore.user?.id || localStorage.getItem('userId') || '';
  }

  function formatProfileDate(date = new Date()) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function createDefaultProfile(memberId) {
    return {
      memberId,
      createdAt: '',
      destination: '',
      destinationCode: '',
      startDate: '',
      endDate: '',
      currentAsset: 0,
      monthlyIncome: 0,
      budgetOption: '',
      dailyTravelExpense: 0,
      dailyAvailableBudget: 0,
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
    if (!code) return { continent: '', country: null };
    const continentNameMap = {
      Asia: '아시아',
      Europe: '유럽',
      Americas: '아메리카',
      Africa: '아프리카',
      Oceania: '오세아니아',
    };
    for (const [sourceName, countries] of Object.entries(
      continents.value ?? {},
    )) {
      const matchedCountry = (countries ?? []).find(
        (country) => country.code === code,
      );
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
    const resolvedCode = nextProfile.destinationCode || nextProfile.destination;
    const { continent, country } = findCountryByCode(resolvedCode);

    selectedContinent.value = continent;
    selectedCountry.value = country;
    departureDate.value = nextProfile.startDate || '';
    returnDate.value = nextProfile.endDate || '';
    assetAmount.value = Number(nextProfile.currentAsset) || 0;
    monthlyIncome.value = Number(nextProfile.monthlyIncome) || 0;
    monthlyRent.value = Number(nextProfile.monthlyRent) || 0;
    monthlyInsurance.value = Number(nextProfile.monthlyInsurance) || 0;
    monthlyPhone.value = Number(nextProfile.monthlyPhone) || 0;
    monthlyTransport.value = Number(nextProfile.monthlyTransport) || 0;
    monthlySubscription.value = Number(nextProfile.monthlySubscription) || 0;
    monthlyOtherFixed.value = Number(nextProfile.monthlyOtherFixed) || 0;
    selectedBudgetOption.value = nextProfile.budgetOption || '';
    profileCreatedAt.value = nextProfile.createdAt || '';
    dailyTravelExpense.value =
      Number(nextProfile.dailyTravelExpense ?? nextProfile.dailyExpense) || 0;
    dailyAvailableBudget.value = Number(nextProfile.dailyAvailableBudget) || 0;
    hotelExpense.value = Number(nextProfile.hotelExpense) || 0;
    flightExpense.value = Number(nextProfile.flightExpense) || 0;
    checkedIn.value = Boolean(nextProfile.checkedIn);
  }

  // 🚩 수정됨: 404 에러 시 로직이 중단되지 않도록 catch 처리
  async function getCurrentProfile() {
    const memberId = getCurrentMemberId();
    if (!memberId) throw new Error('사용자 정보를 찾을 수 없습니다.');

    try {
      const profiles = await api.get('/profiles', { params: { memberId } });
      return Array.isArray(profiles) && profiles.length > 0
        ? profiles[0]
        : null;
    } catch (error) {
      if (error.response && error.response.status === 404) return null;
      throw error;
    }

    const profiles = await api.get('/profiles', {
      params: { memberId, isCompleted: false },
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

  // 🚩 수정됨: 데이터 유무에 따라 POST/PATCH 확실히 분기
  async function saveProfile(patch = {}) {
    const memberId = getCurrentMemberId();
    if (!memberId) throw new Error('저장할 사용자 정보를 찾을 수 없습니다.');

    const currentProfile = await getCurrentProfile();
    const baseProfile = currentProfile ?? createDefaultProfile(memberId);

    const nextProfile = {
      ...baseProfile,
      ...patch,
      memberId,
    };

    if (!currentProfile?.id && !nextProfile.createdAt) {
      nextProfile.createdAt = formatProfileDate();
    }

    const savedProfile = currentProfile?.id
      ? await api.patch(`/profiles/${currentProfile.id}`, nextProfile)
      : await api.post('/profiles', nextProfile);

    applyProfile(savedProfile);
    return savedProfile;
  }

  async function fetchContinents() {
    if (Object.keys(continents.value).length > 0) return continents.value;
    isLoadingContinents.value = true;
    continentsError.value = '';
    try {
      const data = await api.get('/continents');
      continents.value = data ?? {};
      return continents.value;
    } catch (error) {
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
      dailyTravelExpense: daily * 10000,
      hotelExpense: hotel * 10000,
      flightExpense: flight * 10000,
    };
  }

  function setExpenseOverrides({ daily = 0, hotel = 0, flight = 0 }) {
    dailyTravelExpense.value = Number(daily) || 0;
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
      dailyTravelExpense: normalizedDaily,
      hotelExpense: normalizedHotel,
      flightExpense: normalizedFlight,
    });
  }

  function setIncomeInfo({ assets = 0, income = 0 }) {
    assetAmount.value = Number(assets) || 0;
    monthlyIncome.value = Number(income) || 0;
  }

  async function saveIncomeInfo({ assets = 0, income = 0 }) {
    const nAssets = Number(assets) || 0;
    const nIncome = Number(income) || 0;
    setIncomeInfo({ assets: nAssets, income: nIncome });
    return saveProfile({
      currentAsset: nAssets,
      monthlyIncome: nIncome,
      checkedIn: false,
      isCompleted: false,
    });
  }

  function setFixedExpenses(ex = {}) {
    monthlyRent.value = Number(ex.rent) || 0;
    monthlyInsurance.value = Number(ex.insurance) || 0;
    monthlyPhone.value = Number(ex.phone) || 0;
    monthlyTransport.value = Number(ex.transport) || 0;
    monthlySubscription.value = Number(ex.subscription) || 0;
    monthlyOtherFixed.value = Number(ex.otherFixed) || 0;
  }

  async function saveFixedExpenses(ex = {}) {
    const nEx = {
      rent: Number(ex.rent) || 0,
      insurance: Number(ex.insurance) || 0,
      phone: Number(ex.phone) || 0,
      transport: Number(ex.transport) || 0,
      subscription: Number(ex.subscription) || 0,
      otherFixed: Number(ex.otherFixed) || 0,
    };

    setFixedExpenses(normalizedExpenses);
    return saveProfile({
      monthlyRent: normalizedExpenses.rent,
      monthlyInsurance: normalizedExpenses.insurance,
      monthlyPhone: normalizedExpenses.phone,
      monthlyTransport: normalizedExpenses.transport,
      monthlySubscription: normalizedExpenses.subscription,
      monthlyOtherFixed: normalizedExpenses.otherFixed,
      checkedIn: false,
      isCompleted: false,
    });
  }

  async function resetSavedProfile() {
    const memberId = getCurrentMemberId();
    if (!memberId) throw new Error('사용자 정보를 초기화할 수 없습니다.');
    return saveProfile(createDefaultProfile(memberId));
  }

  function setMonthlyIncome(income) {
    monthlyIncome.value = Number(income) || 0;
  }

  function setFinanceInfo(fi = {}) {
    currentAsset.value = Number(fi.currentAssetVal) || 0;
    monthlyIncome.value = Number(fi.monthlyIncomeVal) || 0;
    monthlyRent.value = Number(fi.rentVal) || 0;
    monthlyInsurance.value = Number(fi.insuranceVal) || 0;
    monthlyPhone.value = Number(fi.phoneVal) || 0;
    monthlyTransport.value = Number(fi.transportVal) || 0;
    monthlySubscription.value = Number(fi.subscriptionVal) || 0;
    monthlyOtherFixed.value = Number(fi.otherFixedVal) || 0;
  }

  async function saveFinanceInfo(fi = {}) {
    setFinanceInfo(fi);
    return saveProfile({
      currentAsset: Number(currentAssetVal) || 0,
      monthlyIncome: Number(monthlyIncomeVal) || 0,
    });
  }

  function resetTravelPlan() {
    selectedContinent.value = '';
    selectedCountry.value = null;
    departureDate.value = '';
    returnDate.value = '';
    selectedBudgetOption.value = '';
    assetAmount.value = 0;
    monthlyIncome.value = 0;
    currentAsset.value = 0;
    monthlyRent.value = 0;
    monthlyInsurance.value = 0;
    monthlyPhone.value = 0;
    monthlyTransport.value = 0;
    monthlySubscription.value = 0;
    monthlyOtherFixed.value = 0;
    dailyTravelExpense.value = 0;
    dailyAvailableBudget.value = 0;
    checkedIn.value = false;
    profileCreatedAt.value = '';
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
    dailyTravelExpense,
    dailyAvailableBudget,
    checkedIn,
    profileCreatedAt,
    currentAsset,
    monthlyRent,
    monthlyInsurance,
    monthlyPhone,
    monthlyTransport,
    monthlySubscription,
    monthlyOtherFixed,
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
    setFixedExpenses,
    saveFixedExpenses,
    setMonthlyIncome,
    setFinanceInfo,
    saveFinanceInfo,
    resetTravelPlan,
  };
});
