import { computed } from 'vue';

/**
 * 예산 계산 composable
 * 여행 경비, 월 수입/지출, 자산을 기반으로 여행 자금 계획을 계산
 */
export const useBudgetCalculation = ({
  currentAsset = 0,
  monthlyIncome = 0,
  monthlyRent = 0,
  monthlyInsurance = 0,
  monthlyPhone = 0,
  monthlyTransport = 0,
  monthlySubscription = 0,
  monthlyOtherFixed = 0,
  departureDate = '',
  returnDate = '',
  dayExpense = 0, // 하루경비 (만원 단위일 경우)
  nightly = 0, // 숙박비 (만원 단위일 경우)
  flightExpense = 0, // 비행기값
} = {}) => {
  // 안전한 숫자 변환
  const safeNum = (val) => Number(val) || 0;

  // 여행일수 계산
  const travelDays = computed(() => {
    if (!departureDate || !returnDate) return 0;
    const start = new Date(departureDate);
    const end = new Date(returnDate);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  });

  // 숙박일수 계산
  const nightlyDays = computed(() => {
    return travelDays.value > 0 ? travelDays.value - 1 : 0;
  });

  // 월 고정지출 합계
  const totalMonthlyFixed = computed(() => {
    return (
      safeNum(monthlyRent) +
      safeNum(monthlyInsurance) +
      safeNum(monthlyPhone) +
      safeNum(monthlyTransport) +
      safeNum(monthlySubscription) +
      safeNum(monthlyOtherFixed)
    );
  });

  // 월 가용 금액
  const monthlyAvailable = computed(() => {
    const income = safeNum(monthlyIncome);
    const fixed = totalMonthlyFixed.value;
    const available = income - fixed;
    return available > 0 ? available : 0;
  });

  // 월 여행 저축 금액 (월 가용 금액의 60%)
  const monthlySavingsForTravel = computed(() => {
    return Math.floor(monthlyAvailable.value * 0.6);
  });

  // 출발일까지 남은 일수
  const daysUntilDeparture = computed(() => {
    if (!departureDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departure = new Date(departureDate);
    departure.setHours(0, 0, 0, 0);
    const diffMs = departure.getTime() - today.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : -1;
  });

  // 출발일까지 남은 개월 수
  const monthsUntilDeparture = computed(() => {
    const dayCount = daysUntilDeparture.value;
    if (dayCount < 0) return 0;
    return Math.floor(dayCount / 30);
  });

  // 여행 총 필요 예산
  const totalTravelBudget = computed(() => {
    return (
      safeNum(dayExpense) * travelDays.value +
      safeNum(nightly) * nightlyDays.value +
      safeNum(flightExpense)
    );
  });

  // 출발 전 예상 확보 자금
  const projectedFunds = computed(() => {
    const asset = safeNum(currentAsset);
    const savings = monthlySavingsForTravel.value * monthsUntilDeparture.value;
    return asset + savings;
  });

  // 부족/여유 금액
  const budgetGap = computed(() => {
    return projectedFunds.value - totalTravelBudget.value;
  });

  // 하루 사용 가능/절약 필요 금액
  const dailyBudget = computed(() => {
    const departureDays = daysUntilDeparture.value;
    if (departureDays <= 0) return 0;
    return Math.floor(Math.abs(budgetGap.value) / departureDays);
  });

  // 상태 판정
  const budgetStatus = computed(() => {
    // 필수 정보 확인
    if (!departureDate || !returnDate) {
      return {
        status: 'incomplete',
        message: '여행 날짜를 선택해주세요.',
        isReady: false,
      };
    }

    if (daysUntilDeparture.value < 0) {
      return {
        status: 'past',
        message: '출발일이 과거 날짜입니다. 미래 날짜를 선택해주세요.',
        isReady: false,
      };
    }

    if (daysUntilDeparture.value === 0) {
      return {
        status: 'today',
        message: '오늘 출발입니다! 좋은 여행 되세요.',
        isReady: false,
      };
    }

    if (totalMonthlyFixed.value > safeNum(monthlyIncome)) {
      return {
        status: 'warning',
        message:
          '현재 고정지출이 수입보다 많아 여행 자금을 모으기 어려워요. 고정지출을 줄여보세요.',
        isReady: false,
      };
    }

    if (budgetGap.value >= 0) {
      return {
        status: 'sufficient',
        message: '예산이 충분합니다!',
        isReady: true,
        label: '하루 사용 가능 금액',
      };
    } else {
      return {
        status: 'insufficient',
        message: '더 저축이 필요합니다.',
        isReady: true,
        label: '하루 절약 필요 금액',
      };
    }
  });

  // 숫자를 한국 원화 형식으로 변환
  const formatKRW = (value) => {
    const num = safeNum(value);
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return {
    // 기본 계산 값들
    travelDays,
    nightlyDays,
    totalMonthlyFixed,
    monthlyAvailable,
    monthlySavingsForTravel,
    daysUntilDeparture,
    monthsUntilDeparture,
    totalTravelBudget,
    projectedFunds,
    budgetGap,
    dailyBudget,

    // 상태 정보
    budgetStatus,

    // 형식 변환
    formatKRW,
  };
};
