// ================================================================
// dashboard.js — Dashboard / overview page
// ================================================================

function renderDashboard(el) {
  const R = calcAll();
  const plC = R.actual.netProfit >= 0 ? 'green' : 'red';
  const beRatio = Math.min(D.actualCarsPerDay / R.carsPerDay * 100, 100);
  const beClass = beRatio < 60 ? 'low' : beRatio < 95 ? 'mid' : 'high';

  let h = `
  <div class="page-head">
    <h2>📊 Vishranti — Business Dashboard</h2>
    <p>Highway Coffee Rest Stop · NH-365BB, Telangana. Live summary of all calculators.</p>
  </div>

  <!-- Key Metrics -->
  <div class="opt-row">
    <a href="#breakeven" onclick="event.preventDefault();navigate('breakeven')" class="opt-card">
      <div class="opt-icon">🚗</div><div class="opt-title">Cars Needed</div>
      <div class="opt-val">${fmtN(R.carsPerDay)}/day</div>
      <div class="opt-sub">For ${D.paybackYears}-year payback</div>
    </a>
    <a href="#category" onclick="event.preventDefault();navigate('category')" class="opt-card">
      <div class="opt-icon">🏷️</div><div class="opt-title">Categories</div>
      <div class="opt-val">${D.categories.length} sections</div>
      <div class="opt-sub">${fmtN(R.catTotals.unitsBE)} units/day needed</div>
    </a>
    <a href="#fixedopt" onclick="event.preventDefault();navigate('fixedopt')" class="opt-card">
      <div class="opt-icon">📅</div><div class="opt-title">Fixed Costs</div>
      <div class="opt-val">${fmt(R.fixedMonthlyCost)}/mo</div>
      <div class="opt-sub">${D.fixedCosts.filter(i=>i.on).length} active items</div>
    </a>
    <a href="#profit" onclick="event.preventDefault();navigate('profit')" class="opt-card">
      <div class="opt-icon">💹</div><div class="opt-title">Actual P&L</div>
      <div class="opt-val ${plC}">${fmt(R.actual.netProfit)}/mo</div>
      <div class="opt-sub">At ${D.actualCarsPerDay} cars/day</div>
    </a>
    <div class="opt-card highlight">
      <div class="opt-icon">🎯</div><div class="opt-title">Operational BE</div>
      <div class="opt-val">${fmtN(R.opBeCars)} cars/d</div>
      <div class="opt-sub">Just to cover running costs</div>
    </div>
  </div>

  <!-- Break-even Progress -->
  <div class="card" style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>Break-Even Progress (at ${D.actualCarsPerDay} actual cars/day)</h3>
      <span style="font-size:13px">${D.actualCarsPerDay} of ${fmtN(R.carsPerDay)} needed</span>
    </div>
    <div class="pbar" style="height:28px;margin-top:8px">
      <div class="fill ${beClass}" style="width:${beRatio}%">${fmtD(beRatio,0)}%</div>
    </div>
    <div style="font-size:12px;margin-top:4px;color:${R.actual.netProfit>=0?'#2e7d32':'#c62828'}">
      ${R.actual.netProfit>=0
        ? '✅ Above break-even — profit of '+fmt(R.actual.netProfit)+'/month'
        : '❌ Need '+ fmtN(R.carsPerDay - D.actualCarsPerDay) +' more cars/day to break even'}
    </div>
  </div>

  <!-- Financial Summary -->
  <div class="dash-grid cols-4">
    ${dCard('Revenue/Day', fmt(R.revenuePerDay), fmt(R.revenuePerMonth)+'/month')}
    ${dCard('Gross Margin', fmtP(R.grossMargin,0), fmt(R.grossContrib)+' contribution/car')}
    ${dCard('Fixed Costs', fmt(R.fixedMonthlyCost)+'/mo', fmt(R.fixedMonthlyCost/D.operatingDays)+'/day')}
    ${dCard('CapEx Recovery', fmt(R.monthlyCapexRecovery)+'/mo', fmtL(D.totalCapex)+' over '+D.paybackYears+'yr')}
  </div>
  <div class="dash-grid cols-3">
    ${dCard('Stop Rate', fmtP(R.stopRate2500), '1 in every '+fmtN(R.oneInEvery)+' visible cars')}
    ${dCard('Material Cost/Day', fmt(R.materialPerDay), fmt(R.materialPerMonth)+'/month')}
    ${dCard('After Payback', fmt(R.actual.afterPayback)+'/mo', 'Once CapEx is fully recovered')}
  </div>

  <!-- Charts -->
  <div class="charts-grid">
    <div class="chart-card"><h4>Category Revenue Needed (Break-Even)</h4><canvas id="dash-cat-bar"></canvas></div>
    <div class="chart-card"><h4>Fixed Costs by Category</h4><canvas id="dash-fixed-pie"></canvas></div>
  </div>

  <!-- Monthly P&L Proof -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Monthly P&L Proof (at ${fmtN(R.carsPerDay)} cars/day target)</h3>
    <table class="tbl">
      <tbody>
        <tr><td>Revenue</td><td class="num">${fmt(R.proofRevenue)}</td><td class="sub-text">${fmtN(R.carsPerDay)} cars × ₹${D.spendPerCar} × ${D.operatingDays} days</td></tr>
        <tr><td>(−) Raw materials</td><td class="num red">${fmt(R.proofMaterial)}</td><td class="sub-text">${fmtN(R.carsPerDay)} cars × ₹${D.materialCostPerCar} × ${D.operatingDays} days</td></tr>
        <tr><td>(−) Fixed costs</td><td class="num red">${fmt(R.proofFixed)}</td><td class="sub-text">Rent, staff, power, etc.</td></tr>
        <tr class="total-row"><td>(=) Surplus → CapEx recovery</td><td class="num">${fmt(R.proofSurplus)}</td><td class="sub-text">Should match monthly CapEx recovery</td></tr>
        <tr><td>Months to recover CapEx</td><td class="num">${fmtD(R.monthsToRecover,0)} months</td><td class="sub-text">${fmtL(D.totalCapex)} ÷ ${fmt(R.proofSurplus)}/mo</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Stop Rate Comparison -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Stop Rate at Different Traffic Levels</h3>
    <table class="tbl">
      <thead><tr><th>Traffic Scenario</th><th class="num">Visible Cars/Day</th><th class="num">Stop Rate Needed</th><th class="num">1 in Every</th></tr></thead>
      <tbody>
        <tr><td>15-month average</td><td class="num">${fmtN(D.visibleCars)}</td><td class="num">${fmtP(R.stopRate2500)}</td><td class="num">${fmtN(D.visibleCars/R.carsPerDay)}</td></tr>
        <tr><td>April peak</td><td class="num">${fmtN(D.visibleCarsApril)}</td><td class="num">${fmtP(R.stopRateApril)}</td><td class="num">${fmtN(D.visibleCarsApril/R.carsPerDay)}</td></tr>
        <tr><td>Post-shift projection</td><td class="num">${fmtN(D.visibleCarsPostShift)}</td><td class="num">${fmtP(R.stopRatePostShift)}</td><td class="num">${fmtN(D.visibleCarsPostShift/R.carsPerDay)}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Payback Quick View -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Payback Scenarios (Quick View)</h3>
    <canvas id="dash-payback-bar"></canvas>
  </div>`;

  el.innerHTML = h;

  // ---- Charts ----
  setTimeout(() => {
    // Category revenue bar
    drawHBar('dash-cat-bar', R.cats.map(c => ({
      label: c.icon + ' ' + c.name,
      value: c.revDayBE,
      color: c.color
    })));

    // Fixed costs by category pie
    const fixedCatData = Object.entries(R.fixedByCat).map(([cat, data]) => ({
      label: cat,
      value: data.active,
      color: FIXED_CAT_COLORS[cat] || '#999'
    }));
    drawPie('dash-fixed-pie', fixedCatData);

    // Payback scenarios bar
    drawHBar('dash-payback-bar', R.scenarios.map((s,i) => ({
      label: s.label,
      value: s.cars,
      color: i === 0 ? '#4caf50' : COLORS[i]
    })), R.scenarios.length * 34 + 20);
  }, 50);
}
