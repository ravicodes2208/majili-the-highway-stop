// ================================================================
// category.js — Sheet 2: Category-Wise Breakeven
// ================================================================

function renderCategoryPage(el) {
  const R = calcAll();

  let h = `
  <div class="page-head">
    <h2>🏷️ Category-Wise Breakeven</h2>
    <p>Allocate CapEx % + Margin % per category. Calculator finds the daily revenue each must earn to recover its slice.</p>
  </div>

  <!-- Global Inputs -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:12px">📝 Global Inputs</h3>
    <div class="form-grid">
      <div class="form-group">
        <label>Total CapEx (₹)</label>
        <input type="number" class="inp-yellow" value="${D.totalCapex}" onchange="D.totalCapex=+this.value;save();reRender()">
      </div>
      <div class="form-group">
        <label>Fixed Monthly Cost (₹)</label>
        <div class="calc-value" style="font-size:16px">${fmt(R.fixedMonthlyCost)}</div>
        <a href="#fixedopt" onclick="event.preventDefault();navigate('fixedopt')" style="font-size:11px;color:#1565c0">✏️ Edit in Optimizer</a>
      </div>
      <div class="form-group">
        <label>Operating Days/Month</label>
        <input type="number" class="inp-yellow" value="${D.operatingDays}" onchange="D.operatingDays=+this.value;save();reRender()">
      </div>
      <div class="form-group">
        <label>Payback Period (years)</label>
        <input type="number" class="inp-yellow" value="${D.paybackYears}" step="0.5" onchange="D.paybackYears=+this.value;save();reRender()">
      </div>
      <div class="form-group">
        <label>Avg Bill per Car (₹)</label>
        <input type="number" class="inp-yellow" value="${D.spendPerCar}" onchange="D.spendPerCar=+this.value;save();reRender()">
      </div>
      <div class="form-group">
        <label>Target Monthly PROFIT (₹)</label>
        <input type="number" class="inp-yellow" value="${D.targetMonthlyProfit}" onchange="D.targetMonthlyProfit=+this.value;save();reRender()">
      </div>
    </div>
  </div>

  <!-- Category Allocation Table -->
  <div class="card" style="padding:16px;overflow-x:auto">
    <h3 style="margin-bottom:8px">Category Allocation Table <span class="tag">(edit yellow columns)</span></h3>
    <table class="tbl">
      <thead><tr>
        <th>Category</th>
        <th class="num yellow-head">CapEx %</th>
        <th class="num">Fixed %</th>
        <th class="num yellow-head">Margin %</th>
        <th class="num">CapEx Allocated</th>
        <th class="num">Fixed/mo</th>
        <th class="num">Monthly Recovery</th>
        <th class="num">Rev/day (BE)</th>
        <th class="num">% of Total Rev</th>
        <th class="num">Profit Share/mo</th>
        <th class="num">Rev/day (w/ profit)</th>
        <th class="num yellow-head">Avg Price ₹</th>
        <th class="num">Units/day (BE)</th>
        <th class="num">Units/day (w/ profit)</th>
      </tr></thead>
      <tbody>`;

  R.cats.forEach((c, i) => {
    const revPct = R.catTotals.revDayBE > 0 ? c.revDayBE / R.catTotals.revDayBE * 100 : 0;
    h += `<tr>
      <td>${c.icon} ${c.name}</td>
      <td class="num"><input type="number" class="inp-yellow sm" value="${c.capexPct}" min="0" max="100" onchange="D.categories[${i}].capexPct=+this.value;save();reRender()"></td>
      <td class="num">${c.capexPct}%</td>
      <td class="num"><input type="number" class="inp-yellow sm" value="${c.marginPct}" min="1" max="100" onchange="D.categories[${i}].marginPct=+this.value;save();reRender()"></td>
      <td class="num">${fmtL(c.capexAlloc)}</td>
      <td class="num">${fmt(c.fixedAlloc)}</td>
      <td class="num">${fmt(c.monthlyRecovery)}</td>
      <td class="num bold">${fmt(c.revDayBE)}</td>
      <td class="num">${fmtD(revPct,0)}%</td>
      <td class="num">${fmt(c.profitShare)}</td>
      <td class="num bold">${fmt(c.revDayProfit)}</td>
      <td class="num"><input type="number" class="inp-yellow sm" value="${c.avgPrice}" min="1" onchange="D.categories[${i}].avgPrice=+this.value;save();reRender()"></td>
      <td class="num">${fmtD(c.unitsBE,1)}</td>
      <td class="num">${fmtD(c.unitsProfit,1)}</td>
    </tr>`;
  });

  // Totals row
  h += `<tr class="total-row">
    <td>TOTAL</td>
    <td class="num">${D.categories.reduce((s,c)=>s+c.capexPct,0)}%</td>
    <td class="num">${D.categories.reduce((s,c)=>s+c.capexPct,0)}%</td>
    <td class="num"></td>
    <td class="num">${fmtL(R.catTotals.capexAlloc)}</td>
    <td class="num">${fmt(R.catTotals.fixedAlloc)}</td>
    <td class="num">${fmt(R.catTotals.monthlyRecovery)}</td>
    <td class="num bold">${fmt(R.catTotals.revDayBE)}</td>
    <td class="num">100%</td>
    <td class="num">${fmt(R.catTotals.profitShare)}</td>
    <td class="num bold">${fmt(R.catTotals.revDayProfit)}</td>
    <td class="num">total units →</td>
    <td class="num bold">${fmtD(R.catTotals.unitsBE,0)}</td>
    <td class="num bold">${fmtD(R.catTotals.unitsProfit,0)}</td>
  </tr>`;

  h += `</tbody></table>
    <div class="info" style="margin-top:8px">Note: Fixed % auto-matches CapEx % (green column). Edit only <strong>CapEx %</strong>, <strong>Margin %</strong>, and <strong>Avg Price</strong>. CapEx % should total 100%.</div>
  </div>

  <!-- Whole-Shop Summary -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Whole-Shop Summary (sum of all categories)</h3>
    <table class="tbl">
      <thead><tr><th></th><th class="num">Break-Even</th><th class="num">With ${fmt(D.targetMonthlyProfit)} Profit</th></tr></thead>
      <tbody>
        <tr><td>Total revenue/day needed</td><td class="num bold">${fmt(R.catTotals.revDayBE)}</td><td class="num bold">${fmt(R.catTotals.revDayProfit)}</td></tr>
        <tr><td>Total revenue/month needed</td><td class="num">${fmt(R.catTotals.revDayBE * D.operatingDays)}</td><td class="num">${fmt(R.catTotals.revDayProfit * D.operatingDays)}</td></tr>
        <tr><td>Cars/day needed (at avg bill)</td><td class="num bold">${fmtD(R.catTotals.revDayBE/D.spendPerCar,0)}</td><td class="num bold">${fmtD(R.carsWithProfit,0)}</td></tr>
        <tr><td>Stop rate @ ${fmtN(D.visibleCars)} visible cars</td><td class="num">${fmtP(R.stopRate2500)}</td><td class="num">${fmtP(R.stopRateWithProfit2500)}</td></tr>
        <tr><td>Stop rate @ ${fmtN(D.visibleCarsApril)} (April)</td><td class="num">${fmtP(R.stopRateApril)}</td><td class="num">${fmtP(R.stopRateWithProfitApril)}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Charts -->
  <div class="charts-grid">
    <div class="chart-card"><h4>Revenue/Day Needed by Category</h4><canvas id="cat-rev-bar"></canvas></div>
    <div class="chart-card"><h4>CapEx Allocation</h4><canvas id="cat-capex-pie"></canvas></div>
  </div>
  <div class="charts-grid">
    <div class="chart-card"><h4>Units/Day Needed (Break-Even vs With Profit)</h4><canvas id="cat-units-paired"></canvas></div>
    <div class="chart-card"><h4>Monthly Recovery Required</h4><canvas id="cat-recovery-bar"></canvas></div>
  </div>

  <!-- How This Works -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">📖 How This Works</h3>
    <ul class="how-list">
      <li>Each category is allocated a share of CapEx (equipment + shared) and a share of monthly fixed cost.</li>
      <li>Given its margin %, the calculator finds the daily revenue that category must earn to recover its CapEx slice (over the payback period) AND cover its fixed-cost share.</li>
      <li>Sum of all category revenues = total shop revenue/day needed (matches the main car calculator).</li>
      <li>Change any margin % later (e.g. snacks 55%, cold drinks 65%) and that category's target updates.</li>
      <li><strong>Tip:</strong> give high-equipment categories (ice cream, cold) a bigger CapEx % to reflect their machines.</li>
    </ul>
  </div>`;

  el.innerHTML = h;

  // Charts
  setTimeout(() => {
    drawHBar('cat-rev-bar', R.cats.map(c => ({
      label: c.icon + ' ' + c.name, value: c.revDayBE, color: c.color
    })));

    drawPie('cat-capex-pie', R.cats.map(c => ({
      label: c.name, value: c.capexAlloc, color: c.color
    })));

    drawPairedBar('cat-units-paired', R.cats.map(c => ({
      label: c.icon + ' ' + c.name,
      v1: isFinite(c.unitsProfit) ? c.unitsProfit : 0,
      v2: isFinite(c.unitsBE) ? c.unitsBE : 0,
      color: c.color
    })));

    drawHBar('cat-recovery-bar', R.cats.map(c => ({
      label: c.icon + ' ' + c.name, value: c.monthlyRecovery, color: c.color
    })));
  }, 50);
}
