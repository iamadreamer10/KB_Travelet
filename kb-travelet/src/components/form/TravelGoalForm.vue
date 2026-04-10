<template>
  <div class="row g-3">
    <!-- 여행 정보 섹션 -->
    <div class="col-12">
      <div class="section-header mb-3">
        <i class="fas fa-plane-departure me-2 text-primary"></i>여행 정보
      </div>
    </div>

    <div class="col-6">
      <label class="text-muted small mb-1">목적지</label>
      <input
        v-model="modelValue.destination"
        type="text"
        class="form-control form-control-sm fw-bold"
      />
    </div>
    <div class="col-6">
      <label class="text-muted small mb-1">대륙</label>
      <select
        v-model="modelValue.continent"
        class="form-select form-select-sm fw-bold"
      >
        <option>아시아</option>
        <option>유럽</option>
        <option>북미</option>
        <option>남미</option>
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
    <div class="col-12 mb-3">
      <button
        @click="showOptions = !showOptions"
        class="btn btn-sm btn-outline-primary w-100 border-2 fw-bold mb-2"
      >
        <i class="fas fa-magic me-1"></i> 여행 옵션 추천 (가이드 보기)
      </button>

      <div v-if="showOptions" class="row g-2">
        <div v-for="(opt, idx) in recommendOptions" :key="idx" class="col-4">
          <div
            @click="applyOption(opt)"
            class="recommend-card p-2 border rounded-3 h-100 shadow-sm"
          >
            <div class="text-center mb-2">
              <span class="badge" :class="opt.class">{{ opt.title }}</span>
            </div>
            <div class="extra-small text-muted vstack gap-1">
              <div class="d-flex justify-content-between">
                <span>✈️</span> <span>{{ opt.flightExpense / 10000 }}만</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>🏨</span> <span>{{ opt.hotelExpense / 10000 }}만</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>🍕</span> <span>{{ opt.etcExpense / 10000 }}만</span>
              </div>
              <hr class="my-1 opacity-25" />
              <div
                class="fw-bold text-dark text-center"
                style="font-size: 0.8rem"
              >
                총 {{ opt.total / 10000 }}만원
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 mt-2 vstack gap-2 bg-light p-3 rounded-4">
      <div class="d-flex justify-content-between align-items-center">
        <span class="small fw-bold">비행기값</span>
        <input
          v-model.number="modelValue.flightExpense"
          type="text"
          inputmode="numeric"
          class="form-control form-control-sm w-50 text-end border-0 bg-white"
        />
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="small fw-bold">총 숙소비</span>
        <input
          v-model.number="modelValue.hotelExpense"
          type="text"
          inputmode="numeric"
          class="form-control form-control-sm w-50 text-end border-0 bg-white"
        />
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="small fw-bold">기타 경비</span>
        <input
          v-model.number="modelValue.etcExpense"
          type="text"
          inputmode="numeric"
          class="form-control form-control-sm w-50 text-end border-0 bg-white"
        />
      </div>
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
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
});

// 1. 오늘 날짜 구하기 (YYYY-MM-DD 형식)
const todayDate = new Date().toISOString().split('T')[0];

// 2. 로직 검증 함수
const validateDates = () => {
  const start = props.modelValue.startDate;
  const end = props.modelValue.endDate;

  if (!start) return;

  // 귀국일이 출발일보다 빠르면 귀국일을 출발일로 맞춤
  if (end && start > end) {
    alert('귀국일은 출발일보다 빠를 수 없습니다!');
    props.modelValue.endDate = start;
  }
};

const showOptions = ref(false);

// 상세 내역을 포함한 추천 옵션
const recommendOptions = [
  {
    title: '알뜰 가성비',
    class: 'bg-success-subtle text-success',
    flightExpense: 350000,
    hotelExpense: 600000,
    etcExpense: 500000,
    total: 1450000,
  },
  {
    title: '평범한 표준',
    class: 'bg-primary-subtle text-primary',
    flightExpense: 550000,
    hotelExpense: 1500000,
    etcExpense: 1200000,
    total: 3250000,
  },
  {
    title: '플렉스 럭셔리',
    class: 'bg-danger-subtle text-danger',
    flightExpense: 1100000,
    hotelExpense: 3500000,
    etcExpense: 2500000,
    total: 7100000,
  },
];

const applyOption = (opt) => {
  props.modelValue.flightExpense = opt.flightExpense;
  props.modelValue.hotelExpense = opt.hotelExpense;
  props.modelValue.etcExpense = opt.etcExpense;
};
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
