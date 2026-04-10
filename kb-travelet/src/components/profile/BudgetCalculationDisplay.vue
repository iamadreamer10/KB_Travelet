<template>
  <div class="budget-calculation-section">
    <!-- 자동 계산 표시 섹션 -->
    <div class="card mb-4 border-0 shadow-sm">
      <div class="card-body p-4">
        <h6 class="mb-3 fw-bold">
          <i class="fas fa-calculator me-2 text-info"></i>자동 계산 결과
        </h6>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="stat-item">
              <div class="stat-label text-muted small">월 고정지출 합계</div>
              <div class="stat-value text-danger">
                {{ budget.formatKRW(budget.totalMonthlyFixed.value) }}
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="stat-item">
              <div class="stat-label text-muted small">월 가용 금액</div>
              <div
                class="stat-value"
                :class="
                  budget.monthlyAvailable.value > 0
                    ? 'text-success'
                    : 'text-danger'
                "
              >
                {{ budget.formatKRW(budget.monthlyAvailable.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="stat-item">
              <div class="stat-label text-muted small">
                월 여행 저축 금액 (월 가용 금액의 60%)
              </div>
              <div class="stat-value text-primary">
                {{ budget.formatKRW(budget.monthlySavingsForTravel.value) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상태 안내 -->
    <div
      v-if="!budget.budgetStatus.value.isReady"
      class="alert"
      :class="{
        'alert-warning': budget.budgetStatus.value.status === 'warning',
        'alert-info': [
          'incomplete',
          'past',
          'today',
        ].includes(budget.budgetStatus.value.status),
      }"
    >
      <i
        class="fas me-2"
        :class="{
          'fa-exclamation-triangle':
            budget.budgetStatus.value.status === 'warning',
          'fa-info-circle': [
            'incomplete',
            'past',
            'today',
          ].includes(budget.budgetStatus.value.status),
        }"
      ></i>
      {{ budget.budgetStatus.value.message }}
    </div>

    <!-- 여행 목표 결과 섹션 -->
    <div v-if="budget.budgetStatus.value.isReady" class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <h6 class="mb-3 fw-bold">
          <i class="fas fa-chart-line me-2 text-warning"></i>여행 목표 결과
        </h6>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="result-item">
              <div class="result-label">여행일수</div>
              <div class="result-value">{{ budget.travelDays.value }}일</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="result-item">
              <div class="result-label">숙박일수</div>
              <div class="result-value">{{ budget.nightlyDays.value }}박</div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">총 필요 예산</div>
              <div class="result-value text-primary fw-bold">
                {{ budget.formatKRW(budget.totalTravelBudget.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">
                출발 전 예상 확보 자금
                <span class="extra-small text-muted">
                  ({{ budget.monthsUntilDeparture.value }}개월)
                </span>
              </div>
              <div class="result-value text-success">
                {{ budget.formatKRW(budget.projectedFunds.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <hr class="opacity-25" />
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">
                {{
                  budget.budgetStatus.value.status === 'sufficient'
                    ? '여유 금액'
                    : '부족 금액'
                }}
              </div>
              <div
                class="result-value fw-bold"
                :class="{
                  'text-success':
                    budget.budgetStatus.value.status === 'sufficient',
                  'text-danger':
                    budget.budgetStatus.value.status === 'insufficient',
                }"
              >
                {{
                  budget.formatKRW(Math.abs(budget.budgetGap.value))
                }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">
                {{ budget.budgetStatus.value.label }}
                <span class="extra-small text-muted">
                  (출발까지 {{ budget.daysUntilDeparture.value }}일)
                </span>
              </div>
              <div
                class="result-value fw-bold"
                :class="{
                  'text-success':
                    budget.budgetStatus.value.status === 'sufficient',
                  'text-danger':
                    budget.budgetStatus.value.status === 'insufficient',
                }"
              >
                {{ budget.formatKRW(budget.dailyBudget.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div
              class="alert mb-0"
              :class="{
                'alert-success':
                  budget.budgetStatus.value.status === 'sufficient',
                'alert-warning':
                  budget.budgetStatus.value.status === 'insufficient',
              }"
            >
              <i
                class="fas me-2"
                :class="{
                  'fa-check-circle':
                    budget.budgetStatus.value.status === 'sufficient',
                  'fa-exclamation-circle':
                    budget.budgetStatus.value.status === 'insufficient',
                }"
              ></i>
              {{
                budget.budgetStatus.value.status === 'sufficient'
                  ? '예산이 충분합니다! 계획된 일정으로 여행을 즐길 수 있어요.'
                  : `매일 ${budget.formatKRW(
                      budget.dailyBudget.value
                    )}씩 절약하면 목표를 달성할 수 있습니다.`
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  budget: { type: Object, required: true },
});
</script>

<style scoped>
.budget-calculation-section {
  margin-top: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
}

.card-body {
  position: relative;
}

.stat-item,
.result-item {
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  border-left: 3px solid #e9ecef;
}

.stat-label,
.result-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.stat-value,
.result-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.extra-small {
  font-size: 0.75rem;
}

.alert {
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
</style>
