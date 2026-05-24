// ================================================================
// data.js — State model matching the Excel calculator
// ================================================================

const COLORS = ['#1565c0','#2e7d32','#e65100','#7b1fa2','#00838f','#c62828','#4e342e','#283593'];
const CAT_COLORS = ['#e74c3c','#3498db','#f39c12','#e91e63','#2ecc71','#9b59b6'];

const FIXED_CAT_COLORS = {
  'Staff':'#e74c3c', 'Premises':'#3498db', 'Utilities':'#f39c12',
  'Operations':'#2ecc71', 'Admin':'#9b59b6'
};

const DEFAULT_DATA = {
  // ---- Sheet 1: Car-Based Breakeven Inputs ----
  spendPerCar: 100,                // Avg bill per car (≈2 people)
  materialCostPerCar: 50,          // Variable cost per bill
  totalCapex: 2500000,             // Total investment
  operatingDays: 30,               // Days per month
  paybackYears: 3,                 // Target payback period

  // ---- Traffic Inputs ----
  personsPerCar: 2,
  visibleCars: 2500,               // 15-month avg visible cars/day
  visibleCarsApril: 3251,          // April count
  visibleCarsPostShift: 4162,      // After shift

  // ---- Sheet 2: Category Allocation ----
  targetMonthlyProfit: 50000,      // Desired profit AFTER all costs + recovery
  categories: [
    { name:"Hot Beverages", icon:"☕", capexPct:30, marginPct:50, avgPrice:28, menuItems: [
      // Hot Coffee
      { name:"Filter Coffee",         subcat:"Hot Coffee", sell:40, cost:12, on:true },
      { name:"Thati Bellam Coffee",    subcat:"Hot Coffee", sell:40, cost:14, on:true },
      { name:"Premium Coffee",        subcat:"Hot Coffee", sell:40, cost:15, on:true },
      { name:"Sukku Coffee",          subcat:"Hot Coffee", sell:45, cost:16, on:true },
      { name:"Black Coffee",          subcat:"Hot Coffee", sell:40, cost:8,  on:true },
      // Hot Milk
      { name:"Hot Milk",              subcat:"Hot Milk", sell:15, cost:10, on:true },
      { name:"Sukku Milk",            subcat:"Hot Milk", sell:25, cost:12, on:true },
      { name:"Horlicks / Boost",      subcat:"Hot Milk", sell:25, cost:14, on:true },
      { name:"Badam Milk / Ragi Malt",subcat:"Hot Milk", sell:25, cost:13, on:true },
      { name:"Hot Chocolate",         subcat:"Hot Milk", sell:40, cost:18, on:true },
      // Tea
      { name:"Sp. Tea",               subcat:"Tea", sell:20, cost:6,  on:true },
      { name:"Bellam Tea",            subcat:"Tea", sell:25, cost:8,  on:true },
      { name:"Badam Tea",             subcat:"Tea", sell:25, cost:10, on:true },
      { name:"Lemon Tea",             subcat:"Tea", sell:25, cost:7,  on:true },
      { name:"Green Tea",             subcat:"Tea", sell:25, cost:8,  on:true },
      { name:"Spl. Masala Green Tea", subcat:"Tea", sell:25, cost:10, on:true },
      { name:"Black Tea",             subcat:"Tea", sell:25, cost:5,  on:true }
    ]},
    { name:"Cold Beverages",     icon:"🧊", capexPct:20, marginPct:50, avgPrice:90 },
    { name:"Snacks",             icon:"🍟", capexPct:20, marginPct:50, avgPrice:35 },
    { name:"Ice Creams",         icon:"🍦", capexPct:12, marginPct:50, avgPrice:50 },
    { name:"Packaged Beverages", icon:"📦", capexPct:10, marginPct:50, avgPrice:30 },
    { name:"Condiments/Other",   icon:"🫙", capexPct:8,  marginPct:50, avgPrice:25 }
  ],

  // ---- Fixed Costs (detailed line items) ----
  fixedCosts: [
    // Staff — ₹65,000
    { n:"Manager / Cashier",      c:15000, cat:"Staff",      on:true },
    { n:"Cook",                   c:14000, cat:"Staff",      on:true },
    { n:"Helper 1 (kitchen)",     c:10000, cat:"Staff",      on:true },
    { n:"Helper 2 (service)",     c:10000, cat:"Staff",      on:true },
    { n:"Cleaner / toilet attendant", c:9000, cat:"Staff",   on:true },
    { n:"Night watchman (part-time)", c:7000, cat:"Staff",   on:true },
    // Premises — ₹35,000
    { n:"Rent / lease",           c:25000, cat:"Premises",   on:true },
    { n:"Electricity",            c:8000,  cat:"Premises",   on:true },
    { n:"Water (bore well running)", c:2000, cat:"Premises", on:true },
    // Utilities — ₹12,000
    { n:"Gas / LPG cylinders",    c:8000,  cat:"Utilities",  on:true },
    { n:"Internet + WiFi",        c:1500,  cat:"Utilities",  on:true },
    { n:"Phone / mobile",         c:500,   cat:"Utilities",  on:true },
    { n:"Cable TV (for customers)", c:2000, cat:"Utilities", on:true },
    // Operations — ₹15,000
    { n:"Maintenance & repairs",  c:5000,  cat:"Operations", on:true },
    { n:"Cleaning supplies",      c:2000,  cat:"Operations", on:true },
    { n:"Disposables (cups/plates/tissues)", c:3000, cat:"Operations", on:true },
    { n:"Marketing upkeep",       c:5000,  cat:"Operations", on:true },
    // Admin — ₹13,000
    { n:"Insurance",              c:3000,  cat:"Admin",      on:true },
    { n:"POS / banking fees",     c:1500,  cat:"Admin",      on:true },
    { n:"Licenses & permits",     c:2000,  cat:"Admin",      on:true },
    { n:"Accounting / legal",     c:1500,  cat:"Admin",      on:true },
    { n:"Miscellaneous",          c:5000,  cat:"Admin",      on:true }
  ],

  // ---- Sheet 3: Actual Sales Input ----
  actualCarsPerDay: 140
};

// ================================================================
// STATE MANAGEMENT (localStorage)
// ================================================================

function loadState() {
  try {
    const saved = localStorage.getItem('vishranti_v2');
    if (saved) {
      const data = JSON.parse(saved);
      // Migrate: if old state has no fixedCosts array, add default
      if (!data.fixedCosts) {
        data.fixedCosts = JSON.parse(JSON.stringify(DEFAULT_DATA.fixedCosts));
      }
      // Migrate: if Hot Beverages category has no menuItems, add default
      if (data.categories && data.categories[0] && !data.categories[0].menuItems) {
        data.categories[0].menuItems = JSON.parse(JSON.stringify(DEFAULT_DATA.categories[0].menuItems));
      }
      return data;
    }
  } catch(e) { console.warn('localStorage unavailable'); }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// Compute total fixed monthly cost from line items
function getFixedMonthlyCost() {
  return D.fixedCosts.filter(i => i.on).reduce((s, i) => s + i.c, 0);
}

// Compute effective avgPrice and marginPct from menu items
function getMenuStats(cat) {
  if (!cat.menuItems || cat.menuItems.length === 0) return null;
  const active = cat.menuItems.filter(i => i.on);
  if (active.length === 0) return null;
  const avgSell = active.reduce((s, i) => s + i.sell, 0) / active.length;
  const avgCost = active.reduce((s, i) => s + i.cost, 0) / active.length;
  const avgMarginPct = avgSell > 0 ? ((avgSell - avgCost) / avgSell) * 100 : 0;
  return {
    avgPrice: Math.round(avgSell * 100) / 100,
    avgCost: Math.round(avgCost * 100) / 100,
    marginPct: Math.round(avgMarginPct * 100) / 100,
    activeCount: active.length,
    totalCount: cat.menuItems.length
  };
}

function saveState(data) {
  try {
    data._savedAt = new Date().toISOString();
    localStorage.setItem('vishranti_v2', JSON.stringify(data));
  } catch(e) {}
}

function getLastSaved() {
  return D._savedAt ? new Date(D._savedAt) : null;
}

// ---- Export: download state as JSON file ----
function exportData() {
  const blob = new Blob([JSON.stringify(D, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0,10);
  a.download = `majili-data-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showSaveToast('📥 Exported!');
}

// ---- Import: load state from JSON file ----
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        // Basic validation
        if (typeof imported !== 'object' || !imported.spendPerCar) {
          alert('Invalid file — not a Majili data export.');
          return;
        }
        // Merge with defaults for any missing keys
        Object.keys(DEFAULT_DATA).forEach(key => {
          if (!(key in imported)) imported[key] = JSON.parse(JSON.stringify(DEFAULT_DATA[key]));
        });
        D = imported;
        saveState(D);
        showSaveToast('📤 Imported!');
        // Re-render everything
        if (typeof reRender === 'function') reRender();
        if (typeof renderNav === 'function') renderNav();
        updateSaveBar();
      } catch(err) {
        alert('Could not read file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ---- Explicit save with visual feedback ----
function explicitSave() {
  saveState(D);
  updateTopBar();
  showSaveToast('✓ Saved!');
  updateSaveBar();
}

function showSaveToast(msg) {
  const toast = document.getElementById('save-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function updateSaveBar() {
  const el = document.getElementById('last-saved');
  if (!el) return;
  const ts = getLastSaved();
  if (ts) {
    const now = new Date();
    const diff = Math.round((now - ts) / 1000);
    let ago;
    if (diff < 5) ago = 'just now';
    else if (diff < 60) ago = diff + 's ago';
    else if (diff < 3600) ago = Math.round(diff/60) + 'm ago';
    else ago = ts.toLocaleTimeString();
    el.textContent = 'Last saved: ' + ago;
  } else {
    el.textContent = 'Not saved yet';
  }
}

function resetState() {
  try { localStorage.removeItem('vishranti_v2'); } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

let D = loadState();
