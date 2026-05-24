// ================================================================
// profit.js — Sheet 3: Actual Sales → Profit (reverse calculator)
// ================================================================

function renderProfitPage(el) {
  const R = calcAll();
  const A = R.actual;
  const plC = A.netProfit >= 0 ? 'green' : 'red';

  let h = `
  <div class="page-head">
    <h2>💹 Actual Sales → Profit</h2>
    <p>Type how many cars OR customers stop per day → see revenue, costs, and real profit.</p>
  </div>

  <!-- INPUTS -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:12px">📝 Inputs <span class="tag">(edit yellow)</span></h3>
    <table class="tbl input-tbl">
      <tbody>
        <tr>
          <td>Cars per day (stopping)</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.actualCarsPerDay}" onchange="D.actualCarsPerDay=+this.value;save();reRender()"></td>
          <td class="sub-text">Type cars here...</td>
        </tr>
        <tr>
          <td>People per car</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.personsPerCar}" step="0.5" onchange="D.personsPerCar=+this.value;save();reRender()"></td>
          <td class="sub-text">...customers = cars × this</td>
        </tr>
        <tr>
          <td>Avg bill per car (₹)</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.spendPerCar}" onchange="D.spendPerCar=+this.value;save();reRender()"></td>
          <td class="sub-text"></td>
        </tr>
        <tr>
          <td>Gross margin %</td>
          <td class="num calc-cell">${fmtP(R.grossMargin,0)}</td>
          <td class="sub-text">Variable cost = 1 − margin</td>
        </tr>
        <tr>
          <td>Fixed monthly cost (₹)</td>
          <td class="num calc-cell" style="padding:6px 10px;font-size:14px">${fmt(R.fixedMonthlyCost)}</td>
          <td class="sub-text"><a href="#fixedopt" onclick="event.preventDefault();navigate('fixedopt')" style="color:#1565c0">✏️ Edit in Optimizer</a></td>
        </tr>
        <tr>
          <td>Total CapEx (₹)</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.totalCapex}" onchange="D.totalCapex=+this.value;save();reRender()"></td>
          <td class="sub-text"></td>
        </tr>
        <tr>
          <td>Payback period (years)</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.paybackYears}" step="0.5" onchange="D.paybackYears=+this.value;save();reRender()"></td>
          <td class="sub-text">For capex recovery line</td>
        </tr>
        <tr>
          <td>Operating days/month</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.operatingDays}" onchange="D.operatingDays=+this.value;save();reRender()"></td>
          <td class="sub-text"></td>
        </tr>
      </tbody>
    </table>
    <div class="calc-highlight" style="margin-top:10px">
      Customers/day (= cars × people) = <strong>${fmtN(A.customers)}</strong>
      <span class="sub-text" style="margin-left:12px">To drive by customers: set people/car=1 & type customers as "cars"</span>
    </div>
  </div>

  <!-- RESULT: Monthly P&L -->
  <div class="card answer-card" style="padding:20px">
    <h3>📊 Result — Monthly P&L at This Volume</h3>
    <table class="tbl result-tbl">
      <tbody>
        <tr><td>Revenue / month</td><td class="num">${fmt(A.revMonth)}</td></tr>
        <tr><td>(−) Variable cost (materials)</td><td class="num red">${fmt(-A.varCostMonth)}</td></tr>
        <tr><td>(=) Contribution / month</td><td class="num">${fmt(A.contribMonth)}</td></tr>
        <tr><td>(−) Fixed cost</td><td class="num red">${fmt(-A.fixedCost)}</td></tr>
        <tr><td>(−) CapEx recovery (for payback)</td><td class="num red">${fmt(-A.capexRecovery)}</td></tr>
        <tr class="total-row"><td>(=) NET PROFIT / month</td><td class="num bold ${plC}">${fmt(A.netProfit)}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- QUICK VIEW -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Quick View</h3>
    <div class="dash-grid cols-3">
      ${dCard('Revenue/Day', fmt(A.revDay), '')}
      ${dCard('Net Profit/Day', fmt(A.profitDay), '', A.profitDay>=0?'':'loss')}
      ${dCard('Net Profit/Year', fmt(A.profitYear), '', A.profitYear>=0?'':'loss')}
    </div>
    <div class="dash-grid cols-3">
      ${dCard('Stop Rate @ 2,500 cars', fmtP(A.stopRate2500), '')}
      ${dCard('Stop Rate @ 3,251 (April)', fmtP(A.stopRateApril), '')}
      ${dCard('After Payback (profit/mo)', fmt(A.afterPayback), 'No capex recovery line', A.afterPayback>=0?'':'loss')}
    </div>
  </div>

  <!-- What-If: Different Car Counts -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">What-If — Profit at Different Car Counts</h3>
    <table class="tbl">
      <thead><tr>
        <th>Cars/Day</th><th class="num">Revenue/Day</th><th class="num">Revenue/Month</th>
        <th class="num">Net Profit/Month</th><th class="num">Profit/Year</th>
        <th class="num">Stop Rate @ ${fmtN(D.visibleCars)}</th>
      </tr></thead>
      <tbody>`;

  [60, 80, 93, 100, 120, 140, 150, 170, 200, 250].forEach(cars => {
    const s = calcActual(cars);
    const cls = s.netProfit >= 0 ? 'green' : 'red';
    const hl = cars === D.actualCarsPerDay ? ' style="background:#e8f5e9"' : '';
    const marker = cars === D.actualCarsPerDay ? ' ◄ current' : cars === Math.round(R.opBeCars) ? ' ◄ op. BE' : '';
    h += `<tr${hl}>
      <td>${cars}${marker}</td>
      <td class="num">${fmt(s.revDay)}</td>
      <td class="num">${fmt(s.revMonth)}</td>
      <td class="num bold ${cls}">${fmt(s.netProfit)}</td>
      <td class="num ${cls}">${fmt(s.profitYear)}</td>
      <td class="num">${fmtP(s.stopRate2500)}</td>
    </tr>`;
  });

  h += `</tbody></table>
  </div>

  <!-- Charts -->
  <div class="charts-grid">
    <div class="chart-card"><h4>Monthly P&L Waterfall</h4><canvas id="profit-waterfall"></canvas></div>
    <div class="chart-card"><h4>Profit Curve (Cars vs Profit)</h4><canvas id="profit-line"></canvas></div>
  </div>`;

  el.innerHTML = h;

  // Charts
  setTimeout(() => {
    drawHBar('profit-waterfall', [
      {label:'Revenue', value:A.revMonth, color:'#2ecc71'},
      {label:'Variable Costs', value:A.varCostMonth, color:'#e74c3c'},
      {label:'Fixed Costs', value:A.fixedCost, color:'#e67e22'},
      {label:'CapEx Recovery', value:A.capexRecovery, color:'#3498db'},
      {label:'Net Profit', value:Math.abs(A.netProfit), color: A.netProfit >= 0 ? '#27ae60' : '#c0392b'}
    ]);

    // Line: cars vs monthly profit
    const points = [];
    for (let c = 40; c <= 300; c += 10) {
      const s = calcActual(c);
      points.push({x: c, y: s.netProfit});
    }
    drawLineChart('profit-line', points, [
      {x: D.actualCarsPerDay, y: A.netProfit, label: 'Current', color:'#1565c0'},
      {x: Math.round(R.opBeCars), y: 0, label: 'Op. BE', color:'#ff9800', below:true},
      {x: Math.round(R.carsPerDay), y: 0, label: 'Full BE', color:'#c62828', below:true}
    ], 0);
  }, 50);
}
