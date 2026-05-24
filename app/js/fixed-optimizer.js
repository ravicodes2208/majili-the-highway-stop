// ================================================================
// fixed-optimizer.js — Fixed Cost Optimization Calculator
// ================================================================

function renderFixedOptPage(el) {
  const R = calcAll();
  const fmc = R.fixedMonthlyCost;
  const grossContrib = R.grossContrib;
  const dailyFixed = fmc / D.operatingDays;

  // Group items by category
  const groups = {};
  D.fixedCosts.forEach((item, i) => {
    if (!groups[item.cat]) groups[item.cat] = [];
    groups[item.cat].push({...item, idx:i});
  });
  const catOrder = ['Staff','Premises','Utilities','Operations','Admin'];
  // Include any custom categories the user may have added
  Object.keys(groups).forEach(cat => { if (!catOrder.includes(cat)) catOrder.push(cat); });

  let h = `
  <div class="page-head">
    <h2>📅 Fixed Cost Optimizer</h2>
    <p>Every rupee of fixed cost raises your break-even. Toggle items on/off, add or remove costs, and see the impact ripple through all calculators.</p>
  </div>

  <!-- Summary Cards -->
  <div class="dash-grid cols-4">
    ${dCard('Active Fixed Cost', fmt(fmc)+'/mo', D.fixedCosts.filter(i=>i.on).length+' of '+D.fixedCosts.length+' items active')}
    ${dCard('Daily Fixed Cost', fmt(dailyFixed)+'/day', '÷ '+D.operatingDays+' operating days')}
    ${dCard('Operational BE', fmtN(R.opBeCars)+' cars/d', 'Just to cover fixed costs')}
    ${dCard('BE Impact', fmtD(fmc/D.operatingDays/grossContrib,1)+' cars/d', 'Each ₹'+fmtN(grossContrib)+' contribution/car')}
  </div>

  <!-- Category Summary Bar -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Cost Distribution by Category</h3>
    <div class="opt-summary">`;

  catOrder.forEach(cat => {
    const g = groups[cat];
    if (!g) return;
    const catActive = g.filter(i=>i.on).reduce((s,i)=>s+i.c, 0);
    const pct = fmc > 0 ? catActive / fmc * 100 : 0;
    const color = FIXED_CAT_COLORS[cat] || '#999';
    if (catActive > 0) {
      h += `<div class="seg" style="width:${Math.max(pct,5)}%;background:${color}" title="${cat}: ${fmt(catActive)} (${fmtD(pct,0)}%)">${pct > 12 ? cat+' '+fmtD(pct,0)+'%' : fmtD(pct,0)+'%'}</div>`;
    }
  });

  h += `</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px">`;
  catOrder.forEach(cat => {
    const g = groups[cat];
    if (!g) return;
    const catActive = g.filter(i=>i.on).reduce((s,i)=>s+i.c, 0);
    const color = FIXED_CAT_COLORS[cat] || '#999';
    const beImpact = catActive / D.operatingDays / (grossContrib || 1);
    h += `<div style="font-size:12px"><span class="cat-badge" style="background:${color}">${cat}</span> ${fmt(catActive)} <span style="color:#888">(${fmtD(beImpact,1)} cars/d)</span></div>`;
  });
  h += `</div></div>

  <!-- Charts -->
  <div class="charts-grid">
    <div class="chart-card"><h4>Cost by Category</h4><canvas id="fo-pie"></canvas></div>
    <div class="chart-card"><h4>Top Items by Cost</h4><canvas id="fo-hbar"></canvas></div>
  </div>

  <!-- Impact Analysis -->
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Break-Even Impact — Every Item</h3>
    <p class="info">Each item's cost translates to extra cars/day you need. Toggle off to see the impact instantly.</p>
    <table class="tbl">
      <thead><tr>
        <th class="ctr" style="width:40px">On/Off</th>
        <th>Item</th>
        <th>Category</th>
        <th class="num">Monthly (₹)</th>
        <th class="num">Daily</th>
        <th class="num">% of Total</th>
        <th class="num">BE Impact (cars/d)</th>
        <th class="ctr">Actions</th>
      </tr></thead>
      <tbody>`;

  // Sort by cost descending for impact view
  const allSorted = D.fixedCosts.map((item,i) => ({...item, idx:i})).sort((a,b) => b.c - a.c);
  const maxImpact = allSorted.length > 0 ? allSorted[0].c / D.operatingDays / (grossContrib||1) : 1;

  allSorted.forEach(item => {
    const daily = item.c / D.operatingDays;
    const pct = fmc > 0 ? item.c / fmc * 100 : 0;
    const impact = daily / (grossContrib || 1);
    const barW = maxImpact > 0 ? impact / maxImpact * 100 : 0;
    const color = FIXED_CAT_COLORS[item.cat] || '#999';
    const rowClass = item.on ? '' : ' class="item-off"';

    h += `<tr${rowClass}>
      <td class="ctr">
        <label class="toggle">
          <input type="checkbox" ${item.on?'checked':''} onchange="D.fixedCosts[${item.idx}].on=this.checked;save();renderFixedOptPage(document.getElementById('content'))">
          <span class="slider"></span>
        </label>
      </td>
      <td><input type="text" value="${esc(item.n)}" onchange="D.fixedCosts[${item.idx}].n=this.value;save()" class="inp-text" style="width:180px"></td>
      <td><span class="cat-badge" style="background:${color}">${item.cat}</span></td>
      <td class="num"><input type="number" value="${item.c}" onchange="D.fixedCosts[${item.idx}].c=+this.value;save();renderFixedOptPage(document.getElementById('content'))" class="inp-yellow sm" style="width:80px"></td>
      <td class="num">${fmt(daily)}</td>
      <td class="num">${fmtD(pct,1)}%</td>
      <td class="num">
        <div class="impact-bar"><div class="fill" style="width:${barW}%;background:${color}"></div></div>
        ${fmtD(impact,2)}
      </td>
      <td class="ctr"><button class="btn-sm danger" onclick="if(confirm('Remove '+D.fixedCosts[${item.idx}].n+'?')){D.fixedCosts.splice(${item.idx},1);save();renderFixedOptPage(document.getElementById('content'))}">✕</button></td>
    </tr>`;
  });

  // Total row
  const totalAll = D.fixedCosts.reduce((s,i)=>s+i.c, 0);
  const disabledCost = D.fixedCosts.filter(i=>!i.on).reduce((s,i)=>s+i.c, 0);
  h += `<tr class="total-row">
    <td class="ctr">${D.fixedCosts.filter(i=>i.on).length}/${D.fixedCosts.length}</td>
    <td>TOTAL (active)</td><td></td>
    <td class="num bold">${fmt(fmc)}</td>
    <td class="num">${fmt(dailyFixed)}</td>
    <td class="num">100%</td>
    <td class="num bold">${fmtD(R.opBeCars,1)} cars/d</td>
    <td></td>
  </tr>`;
  if (disabledCost > 0) {
    h += `<tr style="background:#fff3e0"><td></td><td>Disabled items</td><td></td>
      <td class="num" style="color:#e65100">${fmt(disabledCost)}</td>
      <td class="num">${fmt(disabledCost/D.operatingDays)}</td>
      <td></td>
      <td class="num" style="color:#e65100">${fmtD(disabledCost/D.operatingDays/(grossContrib||1),2)} saved</td>
      <td></td></tr>`;
  }

  h += `</tbody></table></div>`;

  // ---- Add New Item ----
  h += `<div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">Add Fixed Cost Item</h3>
    <div class="add-row">
      <input type="text" id="fo-new-name" placeholder="Item name" style="width:200px">
      <input type="number" id="fo-new-cost" placeholder="Monthly ₹" style="width:100px">
      <select id="fo-new-cat">
        ${catOrder.map(c => `<option value="${c}">${c}</option>`).join('')}
        <option value="__new">+ New Category...</option>
      </select>
      <button class="btn-primary" onclick="addFixedItem()">+ Add</button>
    </div>
  </div>`;

  // ---- Category-wise Breakdown ----
  catOrder.forEach(cat => {
    const g = groups[cat];
    if (!g) return;
    const catTotal = g.reduce((s,i)=>s+i.c, 0);
    const catActive = g.filter(i=>i.on).reduce((s,i)=>s+i.c, 0);
    const color = FIXED_CAT_COLORS[cat] || '#999';

    h += `<div class="card" style="padding:16px">
      <div class="section-head" onclick="toggleCollapse(this)">
        <h3><span class="cat-badge" style="background:${color}">${cat}</span>
          <span class="tag">${fmt(catActive)} active of ${fmt(catTotal)} total • ${g.filter(i=>i.on).length} items</span></h3>
        <span class="chevron">▾</span>
      </div>
      <div class="collapsible">
        <table class="tbl">
          <thead><tr><th class="ctr" style="width:40px">On</th><th>Item</th><th class="num">Monthly</th><th class="num">Daily</th><th class="num">BE Cars</th></tr></thead>
          <tbody>`;

    g.forEach(item => {
      const daily = item.c / D.operatingDays;
      const impact = daily / (grossContrib || 1);
      const rowClass = item.on ? '' : ' class="item-off"';
      h += `<tr${rowClass}>
        <td class="ctr"><label class="toggle"><input type="checkbox" ${item.on?'checked':''} onchange="D.fixedCosts[${item.idx}].on=this.checked;save();renderFixedOptPage(document.getElementById('content'))"><span class="slider"></span></label></td>
        <td>${item.n}</td>
        <td class="num">${fmt(item.c)}</td>
        <td class="num">${fmt(daily)}</td>
        <td class="num">${fmtD(impact,2)}</td>
      </tr>`;
    });

    h += `<tr class="total-row">
      <td></td><td>${cat} Total</td>
      <td class="num bold">${fmt(catActive)}</td>
      <td class="num">${fmt(catActive/D.operatingDays)}</td>
      <td class="num bold">${fmtD(catActive/D.operatingDays/(grossContrib||1),1)}</td>
    </tr></tbody></table></div></div>`;
  });

  // ---- What-If Scenarios ----
  h += `<div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">What-If — Fixed Cost Reduction Scenarios</h3>
    <table class="tbl">
      <thead><tr>
        <th>Scenario</th><th class="num">Monthly Fixed</th><th class="num">Daily</th>
        <th class="num">Op. BE Cars</th><th class="num">Full BE Cars</th><th class="num">Cars Saved</th>
      </tr></thead>
      <tbody>`;

  [0, -5, -10, -15, -20, -30, -50].forEach(pct => {
    const newFixed = fmc * (1 + pct/100);
    const newDaily = newFixed / D.operatingDays;
    const newOpBE = newDaily / (grossContrib || 1);
    const newFullBE = (newDaily + R.monthlyCapexRecovery/D.operatingDays) / (grossContrib || 1);
    const saved = R.carsPerDay - newFullBE;
    const cls = pct === 0 ? ' style="background:#e8f5e9"' : '';
    h += `<tr${cls}>
      <td>${pct===0?'Current':pct+'% reduction'}</td>
      <td class="num">${fmt(newFixed)}</td>
      <td class="num">${fmt(newDaily)}</td>
      <td class="num">${fmtD(newOpBE,0)}</td>
      <td class="num bold">${fmtD(newFullBE,0)}</td>
      <td class="num ${pct<0?'green':''}">${pct===0?'—':'−'+fmtD(saved,1)+' cars'}</td>
    </tr>`;
  });
  h += '</tbody></table></div>';

  // ---- Staff Optimization ----
  const staffItems = D.fixedCosts.filter(i => i.cat === 'Staff' && i.on);
  const staffTotal = staffItems.reduce((s,i) => s + i.c, 0);
  if (staffTotal > 0) {
    const staffPct = fmc > 0 ? staffTotal / fmc * 100 : 0;
    const staffBE = staffTotal / D.operatingDays / (grossContrib || 1);
    h += `<div class="card" style="padding:16px;border-left:4px solid #e74c3c">
      <h3 style="margin-bottom:8px">👥 Staff Cost Deep-Dive</h3>
      <div class="dash-grid cols-3">
        ${dCard('Staff Cost', fmt(staffTotal)+'/mo', fmtD(staffPct,0)+'% of all fixed costs')}
        ${dCard('Staff BE Impact', fmtD(staffBE,1)+' cars/day', 'Revenue just for staff: '+fmt(staffTotal/D.operatingDays/(R.grossMargin||0.5)))}
        ${dCard('Per ₹1K Saved', fmtD(1000/D.operatingDays/(grossContrib||1),2)+' cars less', 'Each ₹1,000 salary cut')}
      </div>
      <table class="tbl" style="margin-top:8px">
        <thead><tr><th>Staff Member</th><th class="num">Salary</th><th class="num">% of Fixed</th><th class="num">Cars Needed</th></tr></thead>
        <tbody>`;
    staffItems.sort((a,b) => b.c - a.c).forEach(item => {
      h += `<tr><td>${item.n}</td><td class="num">${fmt(item.c)}</td><td class="num">${fmtD(item.c/fmc*100,1)}%</td><td class="num">${fmtD(item.c/D.operatingDays/(grossContrib||1),2)}</td></tr>`;
    });
    h += `</tbody></table></div>`;
  }

  // ---- Recommendations ----
  h += buildFixedRecommendations(R, groups, catOrder);

  el.innerHTML = h;

  // ---- Charts ----
  setTimeout(() => {
    // Pie by category
    const pieData = catOrder.filter(cat => groups[cat]).map(cat => {
      const active = groups[cat].filter(i=>i.on).reduce((s,i)=>s+i.c, 0);
      return { label:cat, value:active, color: FIXED_CAT_COLORS[cat] || '#999' };
    });
    drawPie('fo-pie', pieData);

    // Top items bar
    const topItems = D.fixedCosts.filter(i=>i.on).sort((a,b)=>b.c-a.c).slice(0,10);
    drawHBar('fo-hbar', topItems.map(i => ({
      label: i.n, value: i.c, color: FIXED_CAT_COLORS[i.cat] || '#999'
    })));
  }, 50);
}

// ---- Add Item ----
function addFixedItem() {
  const name = document.getElementById('fo-new-name').value.trim();
  const cost = parseInt(document.getElementById('fo-new-cost').value) || 0;
  let cat = document.getElementById('fo-new-cat').value;
  if (!name) { alert('Enter an item name'); return; }
  if (cost <= 0) { alert('Enter a valid monthly cost'); return; }
  if (cat === '__new') {
    cat = prompt('New category name:');
    if (!cat) return;
  }
  D.fixedCosts.push({ n:name, c:cost, cat:cat, on:true });
  save();
  renderFixedOptPage(document.getElementById('content'));
}

// ---- Recommendations ----
function buildFixedRecommendations(R, groups, catOrder) {
  const recs = [];
  const fmc = R.fixedMonthlyCost;
  const grossContrib = R.grossContrib;

  // Biggest category
  let bigCat = '', bigVal = 0;
  catOrder.forEach(cat => {
    const g = groups[cat];
    if (!g) return;
    const v = g.filter(i=>i.on).reduce((s,i)=>s+i.c, 0);
    if (v > bigVal) { bigVal = v; bigCat = cat; }
  });
  if (bigCat) {
    recs.push(`<strong>${bigCat}</strong> is your biggest category at ${fmt(bigVal)} (${fmtD(bigVal/fmc*100,0)}% of total). Focus optimization here first.`);
  }

  // Items that could be seasonal
  const seasonalCandidates = D.fixedCosts.filter(i => i.on && (
    i.n.toLowerCase().includes('marketing') || i.n.toLowerCase().includes('cable') ||
    i.n.toLowerCase().includes('misc')
  ));
  if (seasonalCandidates.length > 0) {
    const total = seasonalCandidates.reduce((s,i)=>s+i.c, 0);
    recs.push(`<strong>${seasonalCandidates.length} items could be seasonal/optional</strong> (${fmt(total)}): ${seasonalCandidates.map(i=>i.n).join(', ')}. Toggle off during slow months to save ${fmtD(total/D.operatingDays/(grossContrib||1),1)} cars/day.`);
  }

  // Staff % warning
  const staffTotal = (groups['Staff']||[]).filter(i=>i.on).reduce((s,i)=>s+i.c, 0);
  if (staffTotal / fmc > 0.45) {
    recs.push(`<strong>Staff costs are ${fmtD(staffTotal/fmc*100,0)}% of fixed costs</strong> — consider multi-tasking roles or part-time arrangements for off-peak hours.`);
  }

  // Disabled items saving
  const disabled = D.fixedCosts.filter(i => !i.on);
  if (disabled.length > 0) {
    const saved = disabled.reduce((s,i)=>s+i.c, 0);
    recs.push(`<strong>${disabled.length} items currently disabled</strong>, saving ${fmt(saved)}/mo (${fmtD(saved/D.operatingDays/(grossContrib||1),1)} cars/day). Review if any should be re-enabled.`);
  }

  // Operating days optimization
  if (D.operatingDays < 30) {
    const extra = 30 - D.operatingDays;
    const extraRev = extra * D.actualCarsPerDay * R.grossContrib;
    recs.push(`<strong>Operating ${D.operatingDays} days/month</strong> — ${extra} more days would generate ${fmt(extraRev)} extra contribution.`);
  }

  let html = `<div class="card" style="padding:16px;border-left:4px solid #ff9800">
    <h3>💡 Optimization Recommendations</h3><ul style="margin:8px 0 0 20px;font-size:13px;line-height:1.8">`;
  recs.forEach(r => { html += `<li>${r}</li>`; });
  if (recs.length === 0) html += '<li>All looking good! Toggle items off to simulate cost-cutting scenarios.</li>';
  html += '</ul></div>';
  return html;
}
