// ================================================================
// breakeven.js — Sheet 1: Car-Based Breakeven Calculator
// ================================================================

function renderBreakevenPage(el) {
  const R = calcAll();

  let h = `
  <div class="page-head">
    <h2>🚗 Car-Based Breakeven Calculator</h2>
    <p>1 car = 1 bill. Edit the yellow inputs — everything recalculates automatically.</p>
  </div>

  <!-- INPUTS -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:12px">📝 Inputs <span class="tag">(edit yellow cells)</span></h3>
    <div class="input-table">
      <table class="tbl input-tbl">
        <tbody>
          <tr>
            <td>Fixed monthly cost (₹)</td>
            <td class="num calc-cell" style="padding:6px 10px;font-size:14px">${fmt(R.fixedMonthlyCost)}</td>
            <td class="sub-text"><a href="#fixedopt" onclick="event.preventDefault();navigate('fixedopt')" style="color:#1565c0">✏️ Edit in Fixed Cost Optimizer</a> (${D.fixedCosts.filter(i=>i.on).length} items)</td>
          </tr>
          <tr>
            <td>Customer spend per car (₹)</td>
            <td class="num"><input type="number" class="inp-yellow" value="${D.spendPerCar}" onchange="D.spendPerCar=+this.value;save();reRender()"></td>
            <td class="sub-text">Avg bill per car (≈${D.personsPerCar} people)</td>
          </tr>
          <tr>
            <td>Raw material cost per car (₹)</td>
            <td class="num"><input type="number" class="inp-yellow" value="${D.materialCostPerCar}" onchange="D.materialCostPerCar=+this.value;save();reRender()"></td>
            <td class="sub-text">Variable cost per bill</td>
          </tr>
          <tr>
            <td>CapEx to recover (₹)</td>
            <td class="num"><input type="number" class="inp-yellow" value="${D.totalCapex}" onchange="D.totalCapex=+this.value;save();reRender()"></td>
            <td class="sub-text">Total investment</td>
          </tr>
          <tr>
            <td>Operating days per month</td>
            <td class="num"><input type="number" class="inp-yellow" value="${D.operatingDays}" min="1" max="31" onchange="D.operatingDays=+this.value;save();reRender()"></td>
            <td class="sub-text"></td>
          </tr>
          <tr>
            <td>Target payback (years)</td>
            <td class="num"><input type="number" class="inp-yellow" value="${D.paybackYears}" step="0.5" min="0.5" onchange="D.paybackYears=+this.value;save();reRender()"></td>
            <td class="sub-text">Try 2, 2.5, 3</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- CONTRIBUTION -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Contribution Per Car <span class="tag">(auto-calculated)</span></h3>
    <table class="tbl">
      <tbody>
        <tr><td>Gross contribution per car (₹)</td><td class="num bold">${fmt(R.grossContrib)}</td><td class="sub-text">Bill minus material</td></tr>
        <tr><td>Gross margin %</td><td class="num bold">${fmtP(R.grossMargin,0)}</td><td class="sub-text"></td></tr>
        <tr><td>Monthly CapEx recovery needed (₹)</td><td class="num">${fmt(R.monthlyCapexRecovery)}</td><td class="sub-text">CapEx ÷ months</td></tr>
      </tbody>
    </table>
  </div>

  <!-- ★ THE ANSWER ★ -->
  <div class="card answer-card" style="padding:20px">
    <h3>★ THE ANSWER — to hit your payback target ★</h3>
    <div class="answer-grid">
      <div class="answer-item big">
        <div class="answer-label">CARS to STOP per day</div>
        <div class="answer-value">${fmtD(R.carsPerDay,1)}</div>
      </div>
      <div class="answer-item">
        <div class="answer-label">Revenue per day</div>
        <div class="answer-value">${fmt(R.revenuePerDay)}</div>
      </div>
      <div class="answer-item">
        <div class="answer-label">Revenue per month</div>
        <div class="answer-value">${fmt(R.revenuePerMonth)}</div>
      </div>
      <div class="answer-item">
        <div class="answer-label">Bills per day (= cars)</div>
        <div class="answer-value">${fmtD(R.carsPerDay,1)}</div>
      </div>
      <div class="answer-item">
        <div class="answer-label">People served/day</div>
        <div class="answer-value">${fmtN(R.peoplePerDay)}</div>
      </div>
      <div class="answer-item">
        <div class="answer-label">Material cost/day</div>
        <div class="answer-value">${fmt(R.materialPerDay)}</div>
      </div>
      <div class="answer-item">
        <div class="answer-label">Material cost/month</div>
        <div class="answer-value">${fmt(R.materialPerMonth)}</div>
      </div>
    </div>
  </div>

  <!-- MONTHLY P&L PROOF -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Monthly P&L at This Volume <span class="tag">(proof)</span></h3>
    <table class="tbl">
      <tbody>
        <tr><td>Revenue</td><td class="num">${fmt(R.proofRevenue)}</td></tr>
        <tr><td>(−) Raw materials</td><td class="num red">${fmt(R.proofMaterial)}</td></tr>
        <tr><td>(−) Fixed costs</td><td class="num red">${fmt(R.proofFixed)}</td></tr>
        <tr class="total-row"><td>(=) Surplus to CapEx recovery</td><td class="num">${fmt(R.proofSurplus)}</td></tr>
        <tr><td>Months to recover CapEx</td><td class="num bold">${fmtD(R.monthsToRecover,0)} months</td></tr>
      </tbody>
    </table>
  </div>

  <!-- STOP RATE -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Stop Rate Needed <span class="tag">(vs visible cars/day)</span></h3>
    <table class="tbl input-tbl">
      <tbody>
        <tr>
          <td>Visible cars/day on your side</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.visibleCars}" onchange="D.visibleCars=+this.value;save();reRender()"></td>
          <td class="sub-text">15-mo avg=2,500; April=3,251; post-shift=4,162</td>
        </tr>
      </tbody>
    </table>
    <table class="tbl" style="margin-top:8px">
      <tbody>
        <tr><td>Stop rate needed</td><td class="num bold">${fmtP(R.stopRate2500)}</td></tr>
        <tr><td>Roughly 1 car in every</td><td class="num bold">${fmtD(R.oneInEvery,0)} cars</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Visualization -->
  <div class="charts-grid">
    <div class="chart-card"><h4>Cost Breakdown Per Car</h4><canvas id="be-pie"></canvas></div>
    <div class="chart-card"><h4>Monthly Cash Flow Waterfall</h4><canvas id="be-waterfall"></canvas></div>
  </div>`;

  el.innerHTML = h;

  // Charts
  setTimeout(() => {
    drawPie('be-pie', [
      {label:'Material Cost', value:D.materialCostPerCar, color:'#e74c3c'},
      {label:'Contribution', value:R.grossContrib, color:'#2ecc71'}
    ]);

    // Waterfall as horizontal bar
    drawHBar('be-waterfall', [
      {label:'Revenue', value:R.proofRevenue, color:'#2ecc71'},
      {label:'Materials', value:-R.proofMaterial, color:'#e74c3c'},
      {label:'Fixed Costs', value:-R.proofFixed, color:'#e67e22'},
      {label:'CapEx Recovery', value:R.proofSurplus, color:'#3498db'}
    ]);
  }, 50);
}
