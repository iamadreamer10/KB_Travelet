import { computed, unref } from 'vue';

const DAY_MS = 1000 * 60 * 60 * 24;

export const useGoalBudgetCalculation = ({
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
  dayExpense = 0,
  nightly = 0,
  flightExpense = 0,
} = {}) => {
  const safeNum = (value) => Number(unref(value)) || 0;
  const safeText = (value) => String(unref(value) ?? '').trim();

  const normalizedDepartureDate = computed(() => safeText(departureDate));
  const normalizedReturnDate = computed(() => safeText(returnDate));
  const parsedDepartureDate = computed(() =>
    parseIsoDate(normalizedDepartureDate.value),
  );
  const parsedReturnDate = computed(() => parseIsoDate(normalizedReturnDate.value));

  const inputStatus = computed(() => {
    if (!normalizedDepartureDate.value || !normalizedReturnDate.value) {
      return {
        isReady: false,
        code: 'incomplete',
        message: '출발일과 도착일을 입력하면 예산 계산이 시작돼요.',
      };
    }

    if (!parsedDepartureDate.value || !parsedReturnDate.value) {
      return {
        isReady: false,
        code: 'invalid',
        message: '날짜 형식을 다시 확인해 주세요.',
      };
    }

    if (parsedReturnDate.value < parsedDepartureDate.value) {
      return {
        isReady: false,
        code: 'reversed',
        message: '도착일은 출발일보다 빠를 수 없어요.',
      };
    }

    return {
      isReady: true,
      code: 'valid',
      message: '',
    };
  });

  const travelDays = computed(() => {
    if (!inputStatus.value.isReady) {
      return 0;
    }

    const diffMs =
      parsedReturnDate.value.getTime() - parsedDepartureDate.value.getTime();
    return Math.floor(diffMs / DAY_MS) + 1;
  });

  const nightlyDays = computed(() => {
    if (!inputStatus.value.isReady) {
      return 0;
    }

    const diffMs =
      parsedReturnDate.value.getTime() - parsedDepartureDate.value.getTime();
    return Math.floor(diffMs / DAY_MS);
  });

  const totalMonthlyFixed = computed(
    () =>
      safeNum(monthlyRent) +
      safeNum(monthlyInsurance) +
      safeNum(monthlyPhone) +
      safeNum(monthlyTransport) +
      safeNum(monthlySubscription) +
      safeNum(monthlyOtherFixed),
  );

  const monthlyAvailableRaw = computed(
    () => safeNum(monthlyIncome) - totalMonthlyFixed.value,
  );
  const monthlyAvailable = computed(() => Math.max(monthlyAvailableRaw.value, 0));
  const monthlySavingsForTravel = computed(() => monthlyAvailable.value);
  const dailySavingsForTravel = computed(() =>
    Math.floor(monthlySavingsForTravel.value / 30),
  );

  const daysUntilDeparture = computed(() => {
    if (!parsedDepartureDate.value) {
      return 0;
    }

    const today = startOfDay(new Date());
    const departure = startOfDay(parsedDepartureDate.value);
    return Math.floor((departure.getTime() - today.getTime()) / DAY_MS);
  });

  const totalTravelBudget = computed(
    () =>
      safeNum(dayExpense) * travelDays.value +
      safeNum(nightly) * nightlyDays.value +
      safeNum(flightExpense),
  );

  const projectedFunds = computed(
    () =>
      safeNum(currentAsset) +
      dailySavingsForTravel.value * Math.max(daysUntilDeparture.value, 0),
  );

  const budgetGap = computed(() => projectedFunds.value - totalTravelBudget.value);

  const resultStatus = computed(() => {
    if (!inputStatus.value.isReady) {
      return {
        status: inputStatus.value.code,
        isReady: false,
        message: inputStatus.value.message,
      };
    }

    if (daysUntilDeparture.value <= 0) {
      return {
        status: daysUntilDeparture.value < 0 ? 'past' : 'today',
        isReady: false,
        message:
          daysUntilDeparture.value < 0
            ? '출발일이 오늘보다 이전이라 계산할 수 없어요.'
            : '출발일이 오늘이라 하루 기준 계산을 할 수 없어요.',
      };
    }

    return {
      status: budgetGap.value >= 0 ? 'sufficient' : 'insufficient',
      isReady: true,
      message:
        budgetGap.value >= 0
          ? '현재 계획으로 여행 예산을 준비할 수 있어요.'
          : '현재 계획 기준으로는 추가 절약이 필요해요.',
    };
  });

  const dailyTargetAmount = computed(() => {
    if (!resultStatus.value.isReady || daysUntilDeparture.value <= 0) {
      return 0;
    }

    return Math.floor(Math.abs(budgetGap.value) / daysUntilDeparture.value);
  });

  const dailyTargetLabel = computed(() =>
    resultStatus.value.status === 'sufficient'
      ? '하루 사용 가능 금액'
      : '하루 절약 필요 금액',
  );

  const gapLabel = computed(() =>
    resultStatus.value.status === 'sufficient' ? '여유 금액' : '부족 금액',
  );

  const financeWarningMessage = computed(() => {
    if (!inputStatus.value.isReady) {
      return '';
    }

    if (monthlyAvailableRaw.value <= 0) {
      return '현재 고정지출이 수입보다 많아 여행 자금을 모으기 어려워요.';
    }

    return '';
  });

  const statusGuideMessage = computed(() => {
    if (!resultStatus.value.isReady) {
      return resultStatus.value.message;
    }

    if (resultStatus.value.status === 'sufficient') {
      return `출발일까지 하루 ${formatKRW(dailyTargetAmount.value)}까지는 사용할 수 있어요.`;
    }

    return `출발일까지 하루 ${formatKRW(dailyTargetAmount.value)}씩 절약이 필요해요.`;
  });

  function formatKRW(value) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(safeNum(value));
  }

  return {
    travelDays,
    nightlyDays,
    totalMonthlyFixed,
    monthlyAvailable,
    monthlyAvailableRaw,
    monthlySavingsForTravel,
    dailySavingsForTravel,
    daysUntilDeparture,
    totalTravelBudget,
    projectedFunds,
    budgetGap,
    resultStatus,
    dailyTargetAmount,
    dailyTargetLabel,
    gapLabel,
    financeWarningMessage,
    statusGuideMessage,
    formatKRW,
  };
};

function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
