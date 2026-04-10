<template>
  <div class="budget-calculation-section">
    <div class="card mb-4 border-0 shadow-sm">
      <div class="card-body p-4">
        <h6 class="mb-3 fw-bold">
          <i class="fas fa-calculator me-2 text-info"></i>자동 계산 표시
        </h6>

        <div class="row g-3">
          <div class="col-md-4">
            <div class="stat-item">
              <div class="stat-label text-muted small">월 고정지출 합계</div>
              <div class="stat-value text-danger">
                {{ budget.formatKRW(budget.totalMonthlyFixed.value) }}
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-item">
              <div class="stat-label text-muted small">월 가용 금액</div>
              <div
                class="stat-value"
                :class="
                  budget.monthlyAvailableRaw.value > 0
                    ? 'text-success'
                    : 'text-danger'
                "
              >
                {{ budget.formatKRW(budget.monthlyAvailable.value) }}
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-item">
              <div class="stat-label text-muted small">월 여행 저축 가능 금액</div>
              <div class="stat-value text-primary">
                {{ budget.formatKRW(budget.monthlySavingsForTravel.value) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="budget.financeWarningMessage.value" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ budget.financeWarningMessage.value }}
    </div>

    <div v-if="!budget.resultStatus.value.isReady" class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>
      {{ budget.resultStatus.value.message }}
    </div>

    <div v-else class="card border-0 shadow-sm">
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
                  (하루 {{ budget.formatKRW(budget.dailySavingsForTravel.value) }}
                  적립 기준 / 출발까지 {{ budget.daysUntilDeparture.value }}일)
                </span>
              </div>
              <div class="result-value text-success">
                {{ budget.formatKRW(budget.projectedFunds.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">{{ budget.gapLabel.value }}</div>
              <div
                class="result-value fw-bold"
                :class="
                  budget.resultStatus.value.status === 'sufficient'
                    ? 'text-success'
                    : 'text-danger'
                "
              >
                {{ budget.formatKRW(Math.abs(budget.budgetGap.value)) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item daily-result-item">
              <div class="result-label">{{ budget.dailyTargetLabel.value }}</div>
              <div
                class="result-value fw-bold"
                :class="
                  budget.resultStatus.value.status === 'sufficient'
                    ? 'text-success'
                    : 'text-danger'
                "
              >
                {{ budget.formatKRW(budget.dailyTargetAmount.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div
              class="alert mb-0"
              :class="
                budget.resultStatus.value.status === 'sufficient'
                  ? 'alert-success'
                  : 'alert-warning'
              "
            >
              <i
                class="fas me-2"
                :class="
                  budget.resultStatus.value.status === 'sufficient'
                    ? 'fa-check-circle'
                    : 'fa-wallet'
                "
              ></i>
              {{ budget.statusGuideMessage.value }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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

.stat-item,
.result-item {
  height: 100%;
  padding: 0.85rem;
  background-color: #f9f9f9;
  border-radius: 0.75rem;
  border-left: 3px solid #e9ecef;
}

.daily-result-item {
  border-left-color: var(--color-primary);
  background: linear-gradient(135deg, #f7fbff 0%, #eef5ff 100%);
}

.stat-label,
.result-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value,
.result-value {
  font-size: 1.2rem;
  font-weight: 700;
}

.extra-small {
  font-size: 0.75rem;
}

.alert {
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}
</style>
