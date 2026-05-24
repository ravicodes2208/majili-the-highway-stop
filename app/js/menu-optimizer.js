// ================================================================
// menu-optimizer.js — Menu & Margin Optimizer
// ================================================================

function renderMenuOptPage(el) {
  const R = calcAll();

  // Find categories with menuItems
  const menuCats = D.categories
    .map((cat, idx) => ({ ...cat, idx, stats: getMenuStats(cat) }))
    .filter(c => c.menuItems && c.menuItems.length > 0);

  let h = `
  <div class="page-head">
    <h2>🍽️ Menu & Margin Optimizer</h2>
    <p>Set selling price and cost for each item. Computed margins flow into Category Breakeven and all dashboards.</p>
  </div>`;

  if (menuCats.length === 0) {
    h += `<div class="card" style="padding:24px;text-align:center">
      <p style="color:#888;font-size:14px">No categories have menu items yet. Menu items will be added as you configure each category.</p>
    </div>`;
    el.innerHTML = h;
    return;
  }

  // ---- Render each category ----
  menuCats.forEach(cat => {
    const stats = cat.stats;
    const catCalc = R.cats[cat.idx];
    const subcats = [...new Set(cat.menuItems.map(i => i.subcat))];

    // ---- Summary Cards ----
    h += `
    <div class="card" style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0">${cat.icon} ${cat.name}</h3>
        <span style="font-size:12px;color:#888">${subcats.length} subcategories · ${cat.menuItems.length} total items</span>
      </div>
      <div class="dash-grid cols-4" style="margin-top:12px">
        ${dCard('Active Items', stats ? stats.activeCount + ' / ' + stats.totalCount : '0', 'on menu')}
        ${dCard('Avg Selling Price', stats ? fmt(stats.avgPrice) : '--', 'across active items')}
        ${dCard('Avg Cost', stats ? fmt(stats.avgCost) : '--', 'material + prep')}
        ${dCard('Avg Margin', stats ? fmtP(stats.marginPct / 100, 1) : '--', stats ? fmt(stats.avgPrice - stats.avgCost) + ' per unit' : '')}
      </div>
    </div>`;

    // ---- Subcategory Tables ----
    subcats.forEach(sc => {
      const items = cat.menuItems.filter(i => i.subcat === sc);
      const scActive = items.filter(i => i.on);
      const scAvgSell = scActive.length > 0 ? scActive.reduce((s, i) => s + i.sell, 0) / scActive.length : 0;
      const scAvgCost = scActive.length > 0 ? scActive.reduce((s, i) => s + i.cost, 0) / scActive.length : 0;
      const scMargin = scAvgSell > 0 ? ((scAvgSell - scAvgCost) / scAvgSell * 100) : 0;
      const scId = sc.replace(/\s+/g, '-');

      h += `
    <div class="card" style="padding:16px">
      <div class="section-head" onclick="toggleCollapse(this)">
        <h3>${sc} <span class="tag">${scActive.length}/${items.length} items · Avg ${fmt(scAvgSell)} · ${scMargin.toFixed(0)}% margin</span></h3>
        <span class="chevron">▼</span>
      </div>
      <div class="collapsible">
        <table class="tbl" style="margin-top:8px">
          <thead><tr>
            <th style="width:40px">On</th>
            <th>Item</th>
            <th class="num yellow-head">Sell ₹</th>
            <th class="num yellow-head">Cost ₹</th>
            <th class="num">Margin ₹</th>
            <th class="num">Margin %</th>
            <th class="num">Margin Bar</th>
            <th style="width:40px"></th>
          </tr></thead>
          <tbody>`;

      items.forEach(item => {
        const globalIdx = cat.menuItems.indexOf(item);
        const margin = item.sell - item.cost;
        const marginPct = item.sell > 0 ? (margin / item.sell * 100) : 0;
        const rowCls = item.on ? '' : ' class="item-off"';
        const mColor = marginPct >= 65 ? 'green' : marginPct >= 45 ? '' : 'red';
        const barW = Math.min(marginPct, 100);
        const barColor = marginPct >= 65 ? '#2e7d32' : marginPct >= 45 ? '#ff9800' : '#c62828';

        h += `<tr${rowCls}>
          <td><label class="toggle"><input type="checkbox" ${item.on ? 'checked' : ''} onchange="toggleMenuItem(${cat.idx},${globalIdx},this.checked)"><span class="slider"></span></label></td>
          <td>${esc(item.name)}</td>
          <td class="num"><input type="number" class="inp-yellow sm" value="${item.sell}" min="0" onchange="updateMenuItem(${cat.idx},${globalIdx},'sell',+this.value)"></td>
          <td class="num"><input type="number" class="inp-yellow sm" value="${item.cost}" min="0" onchange="updateMenuItem(${cat.idx},${globalIdx},'cost',+this.value)"></td>
          <td class="num bold">${fmt(margin)}</td>
          <td class="num ${mColor}">${marginPct.toFixed(1)}%</td>
          <td class="num"><div class="impact-bar"><div class="fill" style="width:${barW}%;background:${barColor}"></div></div></td>
          <td><button onclick="removeMenuItem(${cat.idx},${globalIdx})" style="border:none;background:none;cursor:pointer;color:#c62828;font-size:16px" title="Remove item">✕</button></td>
        </tr>`;
      });

      // Subtotal row
      h += `<tr class="total-row">
          <td></td>
          <td>${sc} Average</td>
          <td class="num">${fmt(scAvgSell)}</td>
          <td class="num">${fmt(scAvgCost)}</td>
          <td class="num bold">${fmt(scAvgSell - scAvgCost)}</td>
          <td class="num">${scMargin.toFixed(1)}%</td>
          <td></td>
          <td></td>
        </tr>`;

      h += `</tbody></table>

        <!-- Add Item to this subcategory -->
        <div class="add-row">
          <input type="text" placeholder="Item name" id="add-name-${cat.idx}-${scId}" style="width:160px">
          <input type="number" placeholder="Sell ₹" id="add-sell-${cat.idx}-${scId}" style="width:75px">
          <input type="number" placeholder="Cost ₹" id="add-cost-${cat.idx}-${scId}" style="width:75px">
          <button onclick="addMenuItem(${cat.idx},'${esc(sc)}','${cat.idx}-${scId}')" style="border:none;background:#1565c0;color:#fff;border-radius:4px;padding:5px 12px;cursor:pointer;font-size:12px;font-weight:600">+ Add</button>
        </div>
      </div>
    </div>`;
    });

    // ---- Add item to NEW subcategory ----
    h += `
    <div class="card" style="padding:16px">
      <h4 style="margin-bottom:8px">Add Item to New Subcategory</h4>
      <div class="add-row">
        <input type="text" placeholder="Subcategory name" id="add-newsc-${cat.idx}" style="width:140px">
        <input type="text" placeholder="Item name" id="add-newname-${cat.idx}" style="width:140px">
        <input type="number" placeholder="Sell ₹" id="add-newsell-${cat.idx}" style="width:75px">
        <input type="number" placeholder="Cost ₹" id="add-newcost-${cat.idx}" style="width:75px">
        <button onclick="addNewSubcatItem(${cat.idx})" style="border:none;background:#e65100;color:#fff;border-radius:4px;padding:5px 12px;cursor:pointer;font-size:12px;font-weight:600">+ Add New</button>
      </div>
    </div>`;

    // ---- Breakeven Impact ----
    h += `
    <div class="card" style="padding:16px">
      <h3 style="margin-bottom:8px">📈 Breakeven Impact — ${cat.name}</h3>
      <div class="info">These computed values flow into the <a href="#category" onclick="event.preventDefault();navigate('category')">Category Breakeven</a> page and all dashboards.</div>
      <table class="tbl" style="margin-top:8px">
        <tbody>
          <tr>
            <td>Effective Avg Price</td>
            <td class="num bold">${stats ? fmt(stats.avgPrice) : fmt(cat.avgPrice)}</td>
            <td class="sub-text">${stats ? 'computed from ' + stats.activeCount + ' active items' : 'manual value (no menu items)'}</td>
          </tr>
          <tr>
            <td>Effective Margin %</td>
            <td class="num bold">${stats ? fmtP(stats.marginPct / 100, 1) : fmtP(cat.marginPct / 100, 1)}</td>
            <td class="sub-text">${stats ? 'avg across menu items' : 'manual value'}</td>
          </tr>
          <tr>
            <td>CapEx Allocation</td>
            <td class="num">${fmt(catCalc.capexAlloc)}</td>
            <td class="sub-text">${cat.capexPct}% of ${fmtL(D.totalCapex)}</td>
          </tr>
          <tr>
            <td>Revenue/Day (Break-Even)</td>
            <td class="num">${fmt(catCalc.revDayBE)}</td>
            <td class="sub-text">to cover costs + CapEx recovery</td>
          </tr>
          <tr>
            <td>Units/Day (Break-Even)</td>
            <td class="num bold">${fmtD(catCalc.unitsBE, 0)} units</td>
            <td class="sub-text">at ${fmt(catCalc.effectiveAvgPrice)} avg price</td>
          </tr>
          <tr>
            <td>Revenue/Day (with ${fmt(D.targetMonthlyProfit)} profit)</td>
            <td class="num">${fmt(catCalc.revDayProfit)}</td>
            <td class="sub-text">includes profit target share</td>
          </tr>
          <tr>
            <td>Units/Day (with profit)</td>
            <td class="num bold">${fmtD(catCalc.unitsProfit, 0)} units</td>
            <td class="sub-text">to hit your profit goal</td>
          </tr>
        </tbody>
      </table>
    </div>`;

    // ---- What-If: Margin Reduction Scenarios ----
    if (stats) {
      h += `
    <div class="card" style="padding:16px">
      <h3 style="margin-bottom:8px">🔍 What-If: Price / Margin Sensitivity</h3>
      <p class="info" style="margin-bottom:8px">What happens to break-even units if your average margin changes?</p>
      <table class="tbl">
        <thead><tr>
          <th>Scenario</th>
          <th class="num">Avg Margin %</th>
          <th class="num">Rev/Day (BE)</th>
          <th class="num">Units/Day (BE)</th>
          <th class="num">Change</th>
        </tr></thead>
        <tbody>`;

      const baseUnits = catCalc.unitsBE;
      [stats.marginPct, stats.marginPct - 5, stats.marginPct - 10, stats.marginPct + 5, stats.marginPct + 10].forEach((mp, idx) => {
        const m = mp / 100;
        const revBE = m > 0 ? (catCalc.monthlyRecovery + catCalc.fixedAlloc) / m / D.operatingDays : Infinity;
        const units = stats.avgPrice > 0 ? revBE / stats.avgPrice : Infinity;
        const diff = units - baseUnits;
        const diffPct = baseUnits > 0 ? (diff / baseUnits * 100) : 0;
        const label = idx === 0 ? 'Current' : (mp > stats.marginPct ? '+' : '') + (mp - stats.marginPct).toFixed(0) + '% margin';
        const hl = idx === 0 ? ' style="background:#e8f5e9"' : '';
        const dColor = diff > 0 ? 'red' : diff < 0 ? 'green' : '';

        h += `<tr${hl}>
          <td>${label}</td>
          <td class="num">${mp.toFixed(1)}%</td>
          <td class="num">${fmt(revBE)}</td>
          <td class="num bold">${fmtD(units, 0)}</td>
          <td class="num ${dColor}">${idx === 0 ? '--' : (diff > 0 ? '+' : '') + fmtD(diff, 0) + ' (' + (diffPct > 0 ? '+' : '') + fmtD(diffPct, 0) + '%)'}</td>
        </tr>`;
      });

      h += `</tbody></table>
    </div>`;
    }
  });

  // ---- Charts ----
  h += `
  <div class="charts-grid">
    <div class="chart-card"><h4>Margin % by Subcategory</h4><canvas id="menu-margin-bar"></canvas></div>
    <div class="chart-card"><h4>Sell Price vs Cost by Item</h4><canvas id="menu-price-cost-bar"></canvas></div>
  </div>`;

  el.innerHTML = h;

  // ---- Draw Charts ----
  setTimeout(() => {
    // Margin by subcategory
    const subcatData = [];
    menuCats.forEach(cat => {
      const subcats = [...new Set(cat.menuItems.map(i => i.subcat))];
      subcats.forEach(sc => {
        const items = cat.menuItems.filter(i => i.subcat === sc && i.on);
        if (items.length === 0) return;
        const avgSell = items.reduce((s, i) => s + i.sell, 0) / items.length;
        const avgCost = items.reduce((s, i) => s + i.cost, 0) / items.length;
        const margin = avgSell > 0 ? (avgSell - avgCost) / avgSell * 100 : 0;
        subcatData.push({ label: sc + ' (' + margin.toFixed(0) + '%)', value: margin, color: COLORS[subcatData.length % COLORS.length] });
      });
    });
    drawHBar('menu-margin-bar', subcatData);

    // Sell vs Cost paired bar
    const allItems = [];
    menuCats.forEach(cat => {
      cat.menuItems.filter(i => i.on).forEach(item => allItems.push(item));
    });
    if (allItems.length > 0) {
      drawPairedBar('menu-price-cost-bar', allItems.map(i => ({
        label: i.name.length > 16 ? i.name.slice(0, 15) + '…' : i.name,
        v1: i.sell, v2: i.cost,
        color: '#1565c0'
      })), 'Sell', 'Cost');
    }
  }, 50);
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
  if (!subcat) { alert('Enter a subcategory name (e.g. "Smoothies").'); return; }
  if (!name) { alert('Enter an item name.'); return; }
  if (sell <= 0) { alert('Enter a selling price > 0.'); return; }
  if (!D.categories[catIdx].menuItems) D.categories[catIdx].menuItems = [];
  D.categories[catIdx].menuItems.push({ name, subcat, sell, cost: cost || 0, on: true });
  save(); reRender();
}
