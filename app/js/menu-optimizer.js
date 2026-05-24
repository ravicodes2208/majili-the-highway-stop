// ================================================================
// menu-optimizer.js — Menu & Margin Optimizer (accordion layout)
// ================================================================

function renderMenuOptPage(el) {
  const R = calcAll();

  const menuCats = D.categories
    .map((cat, idx) => ({ ...cat, idx, stats: getMenuStats(cat) }))
    .filter(c => c.menuItems && c.menuItems.length > 0);

  let h = `
  <div class="page-head">
    <h2>🍽️ Menu & Margin Optimizer</h2>
    <p>Set individual item prices and costs. Computed margins flow into Category Breakeven and all dashboards.</p>
  </div>`;

  if (menuCats.length === 0) {
    h += `<div class="card" style="padding:24px;text-align:center"><p style="color:#888">No categories have menu items configured yet.</p></div>`;
    el.innerHTML = h;
    return;
  }

  // ---- Overview Summary Table ----
  h += `
  <div class="card" style="padding:16px">
    <h3 style="margin-bottom:8px">📋 All Categories Overview</h3>
    <table class="tbl">
      <thead><tr>
        <th>Category</th>
        <th class="num">Items</th>
        <th class="num">Avg Price</th>
        <th class="num">Avg Cost</th>
        <th class="num">Margin %</th>
        <th class="num">CapEx %</th>
        <th class="num">BE Units/Day</th>
      </tr></thead>
      <tbody>`;

  menuCats.forEach(cat => {
    const s = cat.stats;
    const c = R.cats[cat.idx];
    const mColor = s && s.marginPct >= 55 ? 'green' : s && s.marginPct >= 35 ? '' : 'red';
    h += `<tr style="cursor:pointer" onclick="toggleMenuCat(${cat.idx});document.getElementById('menu-acc-${cat.idx}').scrollIntoView({behavior:'smooth',block:'start'})">
      <td>${cat.icon} ${cat.name}</td>
      <td class="num">${s ? s.activeCount + '/' + s.totalCount : '--'}</td>
      <td class="num">${s ? fmt(s.avgPrice) : '--'}</td>
      <td class="num">${s ? fmt(s.avgCost) : '--'}</td>
      <td class="num bold ${mColor}">${s ? fmtP(s.marginPct / 100, 1) : '--'}</td>
      <td class="num">${cat.capexPct}%</td>
      <td class="num">${fmtD(c.unitsBE, 0)}</td>
    </tr>`;
  });

  h += `</tbody></table>
    <div class="info" style="margin-top:8px">Click any row to jump to that category. CapEx% must total 100% (set in <a href="#category" onclick="event.preventDefault();navigate('category')">Category Breakeven</a>).</div>
  </div>`;

  // ---- Category Accordions ----
  menuCats.forEach(cat => {
    const stats = cat.stats;
    const catCalc = R.cats[cat.idx];
    const subcats = [...new Set(cat.menuItems.map(i => i.subcat))];
    const mPct = stats ? stats.marginPct.toFixed(0) : '--';

    h += `
  <div class="menu-acc" id="menu-acc-${cat.idx}">
    <div class="menu-acc-header" onclick="toggleMenuCat(${cat.idx})">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:24px">${cat.icon}</span>
        <div>
          <div style="font-weight:700;font-size:15px">${cat.name}</div>
          <div style="font-size:11px;color:#888">${subcats.length} subcategories · ${cat.menuItems.length} items</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div class="menu-acc-stats">
          <span>Avg ${stats ? fmt(stats.avgPrice) : '--'}</span>
          <span class="stat-val">${mPct}% margin</span>
          <span>BE: ${fmtD(catCalc.unitsBE, 0)} units/d</span>
        </div>
        <span class="chevron" id="menu-chev-${cat.idx}">▶</span>
      </div>
    </div>
    <div class="menu-acc-body collapsed" id="menu-body-${cat.idx}">`;

    // Summary cards inside
    h += `
      <div class="dash-grid cols-4" style="margin:12px 0">
        ${dCard('Active Items', stats ? stats.activeCount + ' / ' + stats.totalCount : '0', 'on menu')}
        ${dCard('Avg Selling Price', stats ? fmt(stats.avgPrice) : '--', 'across active items')}
        ${dCard('Avg Cost', stats ? fmt(stats.avgCost) : '--', 'material + prep')}
        ${dCard('Avg Margin', stats ? fmtP(stats.marginPct / 100, 1) : '--', stats ? fmt(stats.avgPrice - stats.avgCost) + ' per unit' : '')}
      </div>`;

    // Subcategory tables
    subcats.forEach(sc => {
      const items = cat.menuItems.filter(i => i.subcat === sc);
      const scActive = items.filter(i => i.on);
      const scAvgSell = scActive.length > 0 ? scActive.reduce((s, i) => s + i.sell, 0) / scActive.length : 0;
      const scAvgCost = scActive.length > 0 ? scActive.reduce((s, i) => s + i.cost, 0) / scActive.length : 0;
      const scMargin = scAvgSell > 0 ? ((scAvgSell - scAvgCost) / scAvgSell * 100) : 0;
      const scId = sc.replace(/\s+/g, '-');

      h += `
      <div class="card" style="padding:12px 16px;margin-bottom:8px">
        <div class="section-head" onclick="toggleCollapse(this)">
          <h3 style="font-size:14px">${sc} <span class="tag">${scActive.length}/${items.length} items · ${fmt(scAvgSell)} avg · ${scMargin.toFixed(0)}% margin</span></h3>
          <span class="chevron">▼</span>
        </div>
        <div class="collapsible">
          <table class="tbl" style="margin-top:6px">
            <thead><tr>
              <th style="width:36px">On</th>
              <th>Item</th>
              <th class="num yellow-head">Sell ₹</th>
              <th class="num yellow-head">Cost ₹</th>
              <th class="num">Margin ₹</th>
              <th class="num">Margin %</th>
              <th class="num" style="width:80px">Bar</th>
              <th style="width:30px"></th>
            </tr></thead>
            <tbody>`;

      items.forEach(item => {
        const gIdx = cat.menuItems.indexOf(item);
        const margin = item.sell - item.cost;
        const marginPct = item.sell > 0 ? (margin / item.sell * 100) : 0;
        const rowCls = item.on ? '' : ' class="item-off"';
        const mColor = marginPct >= 60 ? 'green' : marginPct >= 40 ? '' : 'red';
        const barW = Math.min(marginPct, 100);
        const barColor = marginPct >= 60 ? '#2e7d32' : marginPct >= 40 ? '#ff9800' : '#c62828';

        h += `<tr${rowCls}>
          <td><label class="toggle"><input type="checkbox" ${item.on ? 'checked' : ''} onchange="toggleMenuItem(${cat.idx},${gIdx},this.checked)"><span class="slider"></span></label></td>
          <td>${esc(item.name)}</td>
          <td class="num"><input type="number" class="inp-yellow sm" value="${item.sell}" min="0" onchange="updateMenuItem(${cat.idx},${gIdx},'sell',+this.value)"></td>
          <td class="num"><input type="number" class="inp-yellow sm" value="${item.cost}" min="0" onchange="updateMenuItem(${cat.idx},${gIdx},'cost',+this.value)"></td>
          <td class="num bold">${fmt(margin)}</td>
          <td class="num ${mColor}">${marginPct.toFixed(1)}%</td>
          <td><div class="impact-bar"><div class="fill" style="width:${barW}%;background:${barColor}"></div></div></td>
          <td><button onclick="removeMenuItem(${cat.idx},${gIdx})" style="border:none;background:none;cursor:pointer;color:#c62828;font-size:14px" title="Remove">✕</button></td>
        </tr>`;
      });

      // Subtotal
      h += `<tr class="total-row">
            <td></td><td>${sc} Avg</td>
            <td class="num">${fmt(scAvgSell)}</td><td class="num">${fmt(scAvgCost)}</td>
            <td class="num bold">${fmt(scAvgSell - scAvgCost)}</td><td class="num">${scMargin.toFixed(1)}%</td>
            <td></td><td></td>
          </tr></tbody></table>
          <div class="add-row">
            <input type="text" placeholder="Item name" id="add-name-${cat.idx}-${scId}" style="width:140px">
            <input type="number" placeholder="Sell ₹" id="add-sell-${cat.idx}-${scId}" style="width:70px">
            <input type="number" placeholder="Cost ₹" id="add-cost-${cat.idx}-${scId}" style="width:70px">
            <button onclick="addMenuItem(${cat.idx},'${sc.replace(/'/g,"\\'")}','${cat.idx}-${scId}')" class="btn-add-item">+ Add</button>
          </div>
        </div>
      </div>`;
    });

    // Add to new subcategory
    h += `
      <div class="add-row" style="margin:8px 0 4px;padding:8px 12px;background:#fafafa;border-radius:6px">
        <span style="font-size:11px;color:#888;font-weight:600">NEW SUBCAT:</span>
        <input type="text" placeholder="Subcategory" id="add-newsc-${cat.idx}" style="width:110px">
        <input type="text" placeholder="Item name" id="add-newname-${cat.idx}" style="width:120px">
        <input type="number" placeholder="Sell ₹" id="add-newsell-${cat.idx}" style="width:70px">
        <input type="number" placeholder="Cost ₹" id="add-newcost-${cat.idx}" style="width:70px">
        <button onclick="addNewSubcatItem(${cat.idx})" class="btn-add-item" style="background:#e65100">+ Add New</button>
      </div>`;

    // Impact on breakeven
    h += `
      <div class="card" style="padding:12px 16px;margin-top:8px">
        <div class="section-head" onclick="toggleCollapse(this)">
          <h3 style="font-size:14px">📈 Breakeven Impact</h3>
          <span class="chevron">▶</span>
        </div>
        <div class="collapsible collapsed">
          <table class="tbl" style="margin-top:6px">
            <tbody>
              <tr><td>Effective Avg Price</td><td class="num bold">${stats ? fmt(stats.avgPrice) : fmt(cat.avgPrice)}</td><td class="sub-text">${stats ? 'from ' + stats.activeCount + ' items' : 'manual'}</td></tr>
              <tr><td>Effective Margin %</td><td class="num bold">${stats ? fmtP(stats.marginPct / 100, 1) : fmtP(cat.marginPct / 100, 1)}</td><td class="sub-text">computed from menu</td></tr>
              <tr><td>CapEx Allocation</td><td class="num">${fmt(catCalc.capexAlloc)}</td><td class="sub-text">${cat.capexPct}% of ${fmtL(D.totalCapex)}</td></tr>
              <tr><td>Rev/Day (Break-Even)</td><td class="num">${fmt(catCalc.revDayBE)}</td><td class="sub-text">costs + CapEx recovery</td></tr>
              <tr><td>Units/Day (BE)</td><td class="num bold">${fmtD(catCalc.unitsBE, 0)} units</td><td class="sub-text">at ${fmt(catCalc.effectiveAvgPrice)} avg</td></tr>
              <tr><td>Units/Day (with profit)</td><td class="num bold">${fmtD(catCalc.unitsProfit, 0)} units</td><td class="sub-text">includes ${fmt(D.targetMonthlyProfit)} target</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;

    h += `
    </div>
  </div>`;
  });

  // ---- Charts: Cross-Category Comparison ----
  h += `
  <div class="charts-grid" style="margin-top:16px">
    <div class="chart-card"><h4>Avg Margin % by Category</h4><canvas id="menu-cat-margin-bar"></canvas></div>
    <div class="chart-card"><h4>Avg Price by Category</h4><canvas id="menu-cat-price-bar"></canvas></div>
  </div>`;

  el.innerHTML = h;

  // ---- Draw Charts ----
  setTimeout(() => {
    const catBarData = menuCats.map((cat, i) => ({
      label: cat.icon + ' ' + cat.name,
      value: cat.stats ? cat.stats.marginPct : 0,
      color: CAT_COLORS[cat.idx % CAT_COLORS.length]
    }));
    drawHBar('menu-cat-margin-bar', catBarData);

    const priceBarData = menuCats.map((cat, i) => ({
      label: cat.icon + ' ' + cat.name,
      value: cat.stats ? cat.stats.avgPrice : 0,
      color: CAT_COLORS[cat.idx % CAT_COLORS.length]
    }));
    drawHBar('menu-cat-price-bar', priceBarData);
  }, 50);
}

// ================================================================
// Accordion toggle for category sections
// ================================================================
function toggleMenuCat(idx) {
  const body = document.getElementById('menu-body-' + idx);
  const chev = document.getElementById('menu-chev-' + idx);
  if (body) body.classList.toggle('collapsed');
  if (chev) chev.textContent = body && body.classList.contains('collapsed') ? '▶' : '▼';
}

// ================================================================
// Menu Item Actions
// ================================================================
function toggleMenuItem(catIdx, itemIdx, on) {
  D.categories[catIdx].menuItems[itemIdx].on = on;
  save(); reRender();
}

function updateMenuItem(catIdx, itemIdx, field, value) {
  D.categories[catIdx].menuItems[itemIdx][field] = value;
  save(); reRender();
}

function removeMenuItem(catIdx, itemIdx) {
  if (!confirm('Remove this item from the menu?')) return;
  D.categories[catIdx].menuItems.splice(itemIdx, 1);
  save(); reRender();
}

function addMenuItem(catIdx, subcat, prefix) {
  const nameEl = document.getElementById('add-name-' + prefix);
  const sellEl = document.getElementById('add-sell-' + prefix);
  const costEl = document.getElementById('add-cost-' + prefix);
  const name = nameEl ? nameEl.value.trim() : '';
  const sell = sellEl ? +sellEl.value : 0;
  const cost = costEl ? +costEl.value : 0;
  if (!name) { alert('Enter an item name.'); return; }
  if (sell <= 0) { alert('Enter a selling price > 0.'); return; }
  if (!D.categories[catIdx].menuItems) D.categories[catIdx].menuItems = [];
  D.categories[catIdx].menuItems.push({ name, subcat, sell, cost: cost || 0, on: true });
  save(); reRender();
}

function addNewSubcatItem(catIdx) {
  const scEl = document.getElementById('add-newsc-' + catIdx);
  const nameEl = document.getElementById('add-newname-' + catIdx);
  const sellEl = document.getElementById('add-newsell-' + catIdx);
  const costEl = document.getElementById('add-newcost-' + catIdx);
  const subcat = scEl ? scEl.value.trim() : '';
  const name = nameEl ? nameEl.value.trim() : '';
  const sell = sellEl ? +sellEl.value : 0;
  const cost = costEl ? +costEl.value : 0;
  if (!subcat) { alert('Enter a subcategory name.'); return; }
  if (!name) { alert('Enter an item name.'); return; }
  if (sell <= 0) { alert('Enter a selling price > 0.'); return; }
  if (!D.categories[catIdx].menuItems) D.categories[catIdx].menuItems = [];
  D.categories[catIdx].menuItems.push({ name, subcat, sell, cost: cost || 0, on: true });
  save(); reRender();
}
