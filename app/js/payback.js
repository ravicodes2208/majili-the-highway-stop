// ================================================================
// payback.js — Sheet 4: Payback Comparison
// ================================================================

function renderPaybackPage(el) {
  const R = calcAll();

  let h = `
  <div class="page-head">
    <h2>⏱️ Payback Scenarios — Side by Side</h2>
    <p>Same inputs (₹${D.spendPerCar}/car, ₹${D.materialCostPerCar} material, ${fmtL(getFixedMonthlyCost()*100000/100000)} fixed, ${fmtL(D.totalCapex)} capex). Stop rate shown at 3 traffic levels.</p>
  </div>

  <!-- Scenario Table -->
  <div class="card" style="padding:16px;overflow-x:auto">
    <h3 style="margin-bottom:8px">Scenario Comparison</h3>
    <table class="tbl">
      <thead><tr>
        <th>Scenario</th>
        <th class="num">Cars/Day</th>
        <th class="num">Revenue/Day</th>
        <th class="num">Stop% @ ${fmtN(D.visibleCars)}</th>
        <th class="num">Stop% @ ${fmtN(D.visibleCarsApril)}</th>
        <th class="num">Stop% @ ${fmtN(D.visibleCarsPostShift)}</th>
      </tr></thead>
      <tbody>`;

  R.scenarios.forEach((s, i) => {
    const cls = i === 0 ? ' style="background:#e8f5e9"' : '';
    h += `<tr${cls}>
      <td>${s.label}</td>
      <td class="num bold">${fmtN(s.cars)}</td>
      <td class="num">${fmt(s.revDay)}</td>
      <td class="num">${fmtP(s.stop2500)}</td>
      <td class="num">${fmtP(s.stopApril)}</td>
      <td class="num">${fmtP(s.stopPostShift)}</td>
    </tr>`;
  });

  h += `</tbody></table>
    <div class="info" style="margin-top:8px">
      Note: "Operational break-even" = covers running costs only (no capex recovery). Above that, you are also repaying your ${fmtL(D.totalCapex)} investment.
    </div>
  </div>

  <!-- Visual: Cars Needed -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Cars/Day Required</h3>
    <canvas id="payback-cars-bar"></canvas>
  </div>

  <!-- Custom Payback Calculator -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Custom Payback Explorer</h3>
    <p class="info">See how changing the payback period affects the car requirement.</p>
    <table class="tbl">
      <thead><tr>
        <th>Payback (years)</th>
        <th class="num">CapEx Recovery/mo</th>
        <th class="num">Cars/Day</th>
        <th class="num">Revenue/Day</th>
        <th class="num">Monthly P&L</th>
        <th class="num">Stop Rate @ ${fmtN(D.visibleCars)}</th>
      </tr></thead>
      <tbody>`;

  const grossContrib = D.spendPerCar - D.materialCostPerCar;
  const dailyContrib = D.operatingDays * grossContrib || 1;

  [1, 1.5, 2, 2.5, 3, 4, 5, 7, 10].forEach(yr => {
    const recovery = D.totalCapex / (yr * 12);
    const cars = (recovery + getFixedMonthlyCost()) / dailyContrib;
    const revDay = cars * D.spendPerCar;
    const stopRate = D.visibleCars > 0 ? cars / D.visibleCars : 0;
    const hl = yr === D.paybackYears ? ' style="background:#e8f5e9"' : '';
    const marker = yr === D.paybackYears ? ' ◄ current' : '';

    // What profit do you get at your ACTUAL cars
    const actualProfit = D.actualCarsPerDay * grossContrib * D.operatingDays - getFixedMonthlyCost() - recovery;
    const plC = actualProfit >= 0 ? 'green' : 'red';

    h += `<tr${hl}>
      <td>${yr}${marker}</td>
      <td class="num">${fmt(recovery)}</td>
      <td class="num bold">${fmtD(cars,0)}</td>
      <td class="num">${fmt(revDay)}</td>
      <td class="num ${plC}">${fmt(actualProfit)}</td>
      <td class="num">${fmtP(stopRate)}</td>
    </tr>`;
  });

  h += `</tbody></table>
    <div class="info" style="margin-top:4px">Monthly P&L column shows profit at your current ${D.actualCarsPerDay} cars/day for each payback period.</div>
  </div>

  <!-- Traffic Sensitivity -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Traffic Sensitivity</h3>
    <table class="tbl input-tbl" style="margin-bottom:12px">
      <tbody>
        <tr>
          <td>15-month avg visible cars/day</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.visibleCars}" onchange="D.visibleCars=+this.value;save();reRender()"></td>
        </tr>
        <tr>
          <td>April peak visible cars/day</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.visibleCarsApril}" onchange="D.visibleCarsApril=+this.value;save();reRender()"></td>
        </tr>
        <tr>
          <td>Post-shift projection</td>
          <td class="num"><input type="number" class="inp-yellow" value="${D.visibleCarsPostShift}" onchange="D.visibleCarsPostShift=+this.value;save();reRender()"></td>
        </tr>
      </tbody>
    </table>

    <h4 style="margin-bottom:8px">Stop Rates Across Scenarios × Traffic Levels</h4>
    <table class="tbl">
      <thead><tr>
        <th>Scenario</th>
        <th class="num">@ ${fmtN(D.visibleCars)}</th>
        <th class="num">@ ${fmtN(D.visibleCarsApril)}</th>
        <th class="num">@ ${fmtN(D.visibleCarsPostShift)}</th>
        <th class="num">Feasibility</th>
      </tr></thead>
      <tbody>`;

  R.scenarios.forEach(s => {
    // Feasibility: if stop rate under 5% → green, 5-8% → yellow, 8%+ → red
    const maxStop = Math.max(s.stop2500, s.stopApril, s.stopPostShift);
    const feasibility = s.stop2500 < 0.05 ? '🟢 Easy' : s.stop2500 < 0.08 ? '🟡 Moderate' : '🔴 Hard';
    h += `<tr>
      <td>${s.label}</td>
      <td class="num">${fmtP(s.stop2500)}</td>
      <td class="num">${fmtP(s.stopApril)}</td>
      <td class="num">${fmtP(s.stopPostShift)}</td>
      <td class="num">${feasibility}</td>
    </tr>`;
  });

  h += `</tbody></table>
  </div>

  <!-- Chart: Stop Rate Visual -->
  <div class="charts-grid">
    <div class="chart-card"><h4>Cars/Day by Payback Scenario</h4><canvas id="payback-scenario-bar"></canvas></div>
    <div class="chart-card"><h4>Payback Period vs Cars Needed</h4><canvas id="payback-line"></canvas></div>
  </div>`;

  el.innerHTML = h;

  // Charts
  setTimeout(() => {
    drawHBar('payback-cars-bar', R.scenarios.map((s,i) => ({
      label: s.label, value: s.cars,
      color: i === 0 ? '#4caf50' : ['#1565c0','#ff9800','#c62828'][i-1] || '#999'
    })));

    drawHBar('payback-scenario-bar', R.scenarios.map((s,i) => ({
      label: s.label, value: s.revDay,
      color: i === 0 ? '#4caf50' : ['#1565c0','#ff9800','#c62828'][i-1] || '#999'
    })));

    // Line: payback period vs cars needed
    const points = [];
    for (let yr = 1; yr <= 10; yr += 0.5) {
      const recovery = D.totalCapex / (yr * 12);
      const cars = (recovery + getFixedMonthlyCost()) / dailyContrib;
      points.push({x: yr, y: cars});
    }
    drawPaybackLine('payback-line', points, D.paybackYears, R.carsPerDay, R.opBeCars);
  }, 50);
}

// Special line chart for payback (x = years, not ₹)
function drawPaybackLine(id, points, currentYr, currentCars, opBE) {
  const c = document.getElementById(id);
  if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const w = c.offsetWidth || 500;
  const h = 260;
  c.width = w * dpr; c.height = h * dpr;
  c.style.height = h + 'px';
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pad = { t:25, r:25, b:45, l:55 };
  const cW = w-pad.l-pad.r, cH = h-pad.t-pad.b;

  const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(opBE * 0.8, Math.min(...ys)), maxY = Math.max(...ys) * 1.05;
  const sx = x => pad.l + ((x-minX)/(maxX-minX||1))*cW;
  const sy = y => pad.t + ((maxY-y)/(maxY-minY||1))*cH;

  // Grid
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) {
    const y = pad.t + i/4*cH;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
    const val = maxY - i/4*(maxY-minY);
    ctx.fillStyle = '#888'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(val), pad.l-6, y+4);
  }
  for (let i=0;i<=4;i++) {
    const x = pad.l + i/4*cW;
    const val = minX + i/4*(maxX-minX);
    ctx.fillStyle = '#888'; ctx.textAlign = 'center';
    ctx.fillText(val.toFixed(1) + 'yr', x, h-pad.b+16);
  }

  // Axes
  ctx.strokeStyle = '#ccc';
  ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+cH); ctx.lineTo(pad.l+cW,pad.t+cH); ctx.stroke();

  // Op BE line
  if (sy(opBE) >= pad.t && sy(opBE) <= pad.t+cH) {
    ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(pad.l,sy(opBE)); ctx.lineTo(pad.l+cW,sy(opBE)); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#4caf50'; ctx.textAlign = 'right'; ctx.font = '10px system-ui';
    ctx.fillText('Op BE: '+Math.round(opBE)+' cars', pad.l+cW, sy(opBE)-4);
  }

  // Line
  ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
  ctx.beginPath();
  points.forEach((p,i) => { const x=sx(p.x),y=sy(p.y); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.stroke();

  // Current marker
  ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.arc(sx(currentYr),sy(currentCars),6,0,Math.PI*2); ctx.fill();
  ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#c62828';
  ctx.fillText(currentYr+'yr: '+Math.round(currentCars)+' cars', sx(currentYr)+10, sy(currentCars)-4);

  // Axis label
  ctx.fillStyle = '#555'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('Payback Period (years)', pad.l+cW/2, h-4);
}
