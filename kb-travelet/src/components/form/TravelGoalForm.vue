<template>
  <div class="row g-3">
    <!-- 여행 정보 섹션 -->
    <div class="col-12">
      <div class="section-header mb-3">
        <i class="fas fa-plane-departure me-2 text-primary"></i>여행 정보
      </div>
    </div>

    <div class="col-6">
      <label class="text-muted small mb-1">대륙</label>
      <select v-model="modelValue.continent" class="form-select fw-bold">
        <option value="" disabled>선택</option>
        <option v-for="opt in continentOptions" :key="opt.key" :value="opt.key">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="col-6">
      <label class="text-muted small mb-1">나라</label>
      <select
        v-model="modelValue.country"
        class="form-select fw-bold"
        :disabled="!modelValue.continent"
        @change="updateDestinationCode"
      >
        <option value="" disabled>나라 선택</option>
        <option
          v-for="country in filteredCountries"
          :key="country.name"
          :value="country.name"
        >
          {{ country.name }}
        </option>
      </select>
    </div>
    <div class="col-6">
      <label class="text-muted small mb-1">출발일</label>
      <input
        v-model="modelValue.startDate"
        type="date"
        :min="todayDate"
        class="form-control form-control-sm"
        @change="validateDates"
      />
    </div>

    <div class="col-6">
      <label class="text-muted small mb-1">귀국일</label>
      <input
        v-model="modelValue.endDate"
        type="date"
        :min="modelValue.startDate || todayDate"
        class="form-control form-control-sm"
        @change="validateDates"
      />
    </div>

    <!-- 재정 정보 섹션 -->
    <div class="col-12 mt-4">
      <div class="section-header mb-3">
        <i class="fas fa-wallet me-2 text-success"></i>재정 정보
      </div>
    </div>

    <div class="col-12 p-3 bg-light rounded-4">
      <!-- 기본 자산 정보 -->
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small fw-bold">현재 자산</span>
          <input
            v-model.number="modelValue.currentAsset"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-50 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="small fw-bold">월 수입</span>
          <input
            v-model.number="modelValue.monthlyIncome"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-50 text-end border-0 bg-white"
          />
        </div>
      </div>

      <hr class="my-3 opacity-25" />

      <!-- 고정지출 항목들 -->
      <div class="mb-3">
        <div class="label-group mb-2">
          <small class="fw-bold text-muted">월별 고정지출</small>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small">월세</span>
          <input
            v-model.number="modelValue.monthlyRent"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-40 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small">보험료</span>
          <input
            v-model.number="modelValue.monthlyInsurance"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-40 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small">통신비</span>
          <input
            v-model.number="modelValue.monthlyPhone"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-40 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small">교통비</span>
          <input
            v-model.number="modelValue.monthlyTransport"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-40 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="small">구독료</span>
          <input
            v-model.number="modelValue.monthlySubscription"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-40 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="small">기타 고정지출</span>
          <input
            v-model.number="modelValue.monthlyOtherFixed"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="form-control form-control-sm w-40 text-end border-0 bg-white"
          />
        </div>
      </div>
      <div class="col-12 mb-3">
        <button
          @click="toggleOptions"
          class="btn btn-sm btn-outline-primary w-100 border-2 fw-bold mb-2"
        >
          <i class="fas fa-magic me-1"></i> 여행 옵션 추천 (가이드 보기)
        </button>

        <div v-if="showOptions" class="row g-2">
          <div v-for="(opt, idx) in recommendOptions" :key="idx" class="col-4">
            <div
              @click="applyOption(opt)"
              class="recommend-card p-2 border rounded-4 h-100 shadow-sm transition-all position-relative"
              :class="{
                'bg-white': opt.isSelectable,
                'bg-danger-subtle border-danger opacity-75': !opt.isSelectable, // 🚩 예산 부족 시 빨간 배경
                'cursor-not-allowed': !opt.isSelectable,
              }"
              :style="
                !opt.isSelectable ? 'cursor: not-allowed;' : 'cursor: pointer;'
              "
            >
              <div
                v-if="!opt.isSelectable"
                class="position-absolute top-0 start-50 translate-middle"
              >
                <span
                  class="badge rounded-pill bg-danger"
                  style="font-size: 0.6rem"
                  >예산 부족</span
                >
              </div>

              <div class="text-center mb-2">
                <span
                  class="badge"
                  :class="
                    opt.isSelectable ? opt.class : 'bg-secondary text-white'
                  "
                >
                  {{ opt.title }}
                </span>
              </div>

              <div
                class="extra-small vstack gap-1"
                :class="opt.isSelectable ? 'text-muted' : 'text-danger'"
              >
                <div class="d-flex justify-content-between">
                  <span>🍕 식비/일</span>
                  <span>{{ opt.dailyTravelExpense / 10000 }}만</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>🏨 숙소/박</span>
                  <span>{{ opt.hotelExpense / 10000 }}만</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>✈️ 항공</span>
                  <span>{{ opt.flightExpense / 10000 }}만</span>
                </div>

                <hr class="my-1 opacity-25" />

                <div class="text-center mt-1">
                  <div class="fw-bold" style="font-size: 0.7rem">
                    여행 중 하루에
                  </div>
                  <div
                    class="fw-extrabold text-dark"
                    style="font-size: 0.85rem"
                  >
                    {{
                      opt.isSelectable
                        ? opt.dailyAvailable.toLocaleString()
                        : '0'
                    }}원
                  </div>
                  <div class="small">사용 가능</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 mt-2 vstack gap-2 bg-light p-3 rounded-4">
        <div class="d-flex justify-content-between align-items-center">
          <span class="small fw-bold">하루경비(1일)</span>
          <input
            v-model.number="modelValue.dailyTravelExpense"
            type="text"
            inputmode="numeric"
            class="form-control form-control-sm w-50 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="small fw-bold">숙소비(1박)</span>
          <input
            v-model.number="modelValue.hotelExpense"
            type="text"
            inputmode="numeric"
            class="form-control form-control-sm w-50 text-end border-0 bg-white"
          />
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="small fw-bold">비행기값</span>
          <input
            v-model.number="modelValue.flightExpense"
            type="text"
            inputmode="numeric"
            class="form-control form-control-sm w-50 text-end border-0 bg-white"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useProfileStore } from '@/stores/profile';
import { useTravelStore } from '@/stores/travel';

const props = defineProps({
  modelValue: { type: Object, required: true },
});

const profileStore = useProfileStore();
const travelStore = useTravelStore();
const { continentList } = storeToRefs(profileStore);
const { fetchContinents } = profileStore;

const showOptions = ref(false);
const todayDate = new Date().toISOString().split('T')[0];

const continentNameMap = {
  Asia: '아시아',
  Europe: '유럽',
  Americas: '아메리카',
  Africa: '아프리카',
  Oceania: '오세아니아',
};

// --- Computed ---
const continentOptions = computed(() => {
  return Object.keys(continentList.value).map((key) => ({
    key: key,
    label: continentNameMap[key] || key,
  }));
});

const filteredCountries = computed(() => {
  const selectedEngKey = props.modelValue.continent;
  if (!selectedEngKey || !continentList.value[selectedEngKey]) return [];
  return continentList.value[selectedEngKey];
});

const totalMonthlyFixed = computed(
  () =>
    (Number(props.modelValue.monthlyRent) || 0) +
    (Number(props.modelValue.monthlyInsurance) || 0) +
    (Number(props.modelValue.monthlyPhone) || 0) +
    (Number(props.modelValue.monthlyTransport) || 0) +
    (Number(props.modelValue.monthlySubscription) || 0) +
    (Number(props.modelValue.monthlyOtherFixed) || 0),
);

const monthlyAvailable = computed(() =>
  Math.max(
    (Number(props.modelValue.monthlyIncome) || 0) - totalMonthlyFixed.value,
    0,
  ),
);

const daysUntilDeparture = computed(() => {
  if (!props.modelValue.startDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(props.modelValue.startDate);
  start.setHours(0, 0, 0, 0);
  return Math.max(Math.ceil((start - today) / (1000 * 60 * 60 * 24)), 0);
});

const projectedFunds = computed(() => {
  const dailySavings = Math.floor(monthlyAvailable.value / 30);
  return (
    (Number(props.modelValue.currentAsset) || 0) +
    dailySavings * daysUntilDeparture.value
  );
});

const stayNights = computed(() => {
  if (!props.modelValue.startDate || !props.modelValue.endDate) return 0;
  const start = new Date(props.modelValue.startDate);
  const end = new Date(props.modelValue.endDate);
  return Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)), 0);
});

const tripDays = computed(() => stayNights.value + 1);

const recommendOptions = computed(() => {
  const levels = travelStore.selectedCountry?.levels ?? {
    eco: [5, 7, 40],
    std: [12, 18, 60],
    lux: [28, 40, 120],
  };

  const optionConfig = [
    {
      key: 'eco',
      title: '알뜰 가성비',
      class: 'bg-success-subtle text-success',
    },
    {
      key: 'std',
      title: '평범한 표준',
      class: 'bg-primary-subtle text-primary',
    },
    {
      key: 'lux',
      title: '플렉스 럭셔리',
      class: 'bg-danger-subtle text-danger',
    },
  ];

  return optionConfig.map((opt) => {
    const [daily, hotel, flight] = levels[opt.key];
    const total =
      (daily * tripDays.value + hotel * stayNights.value + flight) * 10000;
    const budgetGap = projectedFunds.value - total;
    const dailyAvailable =
      tripDays.value > 0 ? Math.floor(budgetGap / tripDays.value) : 0;

    return {
      ...opt,
      dailyTravelExpense: daily * 10000,
      hotelExpense: hotel * 10000,
      flightExpense: flight * 10000,
      total,
      dailyAvailable,
      isSelectable: budgetGap >= 0,
    };
  });
});

// --- Methods ---
const toggleOptions = () => {
  if (!props.modelValue.startDate || !props.modelValue.country) {
    alert('여행지와 날짜를 먼저 선택해야 정확한 예산 가이드를 드릴 수 있어요!');
    return;
  }
  showOptions.value = !showOptions.value;
};

const applyOption = (opt) => {
  if (!opt.isSelectable) return;
  props.modelValue.flightExpense = opt.flightExpense;
  props.modelValue.hotelExpense = opt.hotelExpense;
  props.modelValue.dailyTravelExpense = opt.dailyTravelExpense;
  props.modelValue.dailyAvailableBudget = opt.dailyAvailable;
};

const validateDates = () => {
  const start = props.modelValue.startDate;
  const end = props.modelValue.endDate;
  if (!start) return;
  if (end && start > end) {
    alert('귀국일은 출발일보다 빠를 수 없습니다!');
    props.modelValue.endDate = start;
  }
};

const updateDestinationCode = () => {
  const selectedCountryName = props.modelValue.country;
  const countryObj = filteredCountries.value.find(
    (c) => c.name === selectedCountryName,
  );
  if (countryObj) {
    props.modelValue.destination = countryObj.name;
    props.modelValue.destinationCode = countryObj.code;
  }
};

// --- Watch & Lifecycle ---
watch(
  () => props.modelValue.continent,
  (newContinent, oldContinent) => {
    if (oldContinent) {
      props.modelValue.country = '';
      props.modelValue.destination = '';
      props.modelValue.destinationCode = '';
    }
  },
);

onMounted(() => {
  fetchContinents();
  if (!props.modelValue.continent) {
    const travelGoal = profileStore.myTravelGoal;
    if (travelGoal && travelGoal.continent) {
      props.modelValue.continent = travelGoal.continent;
      props.modelValue.country = travelGoal.destination || '';
    }
  }
});
</script>

<style scoped>
.recommend-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: white;
}
.recommend-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
}
.extra-small {
  font-size: 0.65rem;
}
.badge {
  font-size: 0.7rem;
}
.section-header {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}
.label-group {
  display: block;
}
.w-40 {
  width: 40% !important;
}
</style>
