// ================================================================
// data.js — State model matching the Excel calculator
// ================================================================

const COLORS = ['#1565c0','#2e7d32','#e65100','#7b1fa2','#00838f','#c62828','#4e342e','#283593'];
const CAT_COLORS = ['#e74c3c','#3498db','#f39c12','#e91e63','#2ecc71','#9b59b6','#00838f'];

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
    // ---- 1. Hot Beverages (25%) — Coffee machines, tea equipment ----
    { name:"Hot Beverages", icon:"☕", capexPct:25, marginPct:50, avgPrice:28, menuItems: [
      { name:"Filter Coffee",         subcat:"Hot Coffee", sell:40, cost:12, on:true },
      { name:"Thati Bellam Coffee",    subcat:"Hot Coffee", sell:40, cost:14, on:true },
      { name:"Premium Coffee",        subcat:"Hot Coffee", sell:40, cost:15, on:true },
      { name:"Sukku Coffee",          subcat:"Hot Coffee", sell:45, cost:16, on:true },
      { name:"Black Coffee",          subcat:"Hot Coffee", sell:40, cost:8,  on:true },
      { name:"Hot Milk",              subcat:"Hot Milk", sell:15, cost:10, on:true },
      { name:"Sukku Milk",            subcat:"Hot Milk", sell:25, cost:12, on:true },
      { name:"Horlicks / Boost",      subcat:"Hot Milk", sell:25, cost:14, on:true },
      { name:"Badam Milk / Ragi Malt",subcat:"Hot Milk", sell:25, cost:13, on:true },
      { name:"Hot Chocolate",         subcat:"Hot Milk", sell:40, cost:18, on:true },
      { name:"Sp. Tea",               subcat:"Tea", sell:20, cost:6,  on:true },
      { name:"Bellam Tea",            subcat:"Tea", sell:25, cost:8,  on:true },
      { name:"Badam Tea",             subcat:"Tea", sell:25, cost:10, on:true },
      { name:"Lemon Tea",             subcat:"Tea", sell:25, cost:7,  on:true },
      { name:"Green Tea",             subcat:"Tea", sell:25, cost:8,  on:true },
      { name:"Spl. Masala Green Tea", subcat:"Tea", sell:25, cost:10, on:true },
      { name:"Black Tea",             subcat:"Tea", sell:25, cost:5,  on:true }
    ]},
    // ---- 2. Cold Beverages (12%) — Cold milk, cold coffee, lassi ----
    { name:"Cold Beverages", icon:"🧊", capexPct:12, marginPct:55, avgPrice:90, menuItems: [
      { name:"Spl. Rose Milk",        subcat:"Cold Milk",   sell:75,  cost:25, on:true },
      { name:"Spl. Badam Milk",       subcat:"Cold Milk",   sell:75,  cost:28, on:true },
      { name:"Spl. Pista Milk",       subcat:"Cold Milk",   sell:75,  cost:28, on:true },
      { name:"Cold Coffee",           subcat:"Cold Coffee",  sell:130, cost:40, on:true },
      { name:"Chocolate Cold Coffee", subcat:"Cold Coffee",  sell:150, cost:50, on:true },
      { name:"Caramel Cold Coffee",   subcat:"Cold Coffee",  sell:150, cost:50, on:true },
      { name:"Nutella Cold Coffee",   subcat:"Cold Coffee",  sell:150, cost:55, on:true },
      { name:"Lassi",                 subcat:"Lassi",        sell:50,  cost:15, on:true },
      { name:"Black Current Lassi",   subcat:"Lassi",        sell:60,  cost:20, on:true },
      { name:"Strawberry Lassi",      subcat:"Lassi",        sell:60,  cost:20, on:true },
      { name:"Mango Lassi",           subcat:"Lassi",        sell:60,  cost:20, on:true }
    ]},
    // ---- 3. Milkshakes (13%) — Blenders, milkshake machines ----
    { name:"Milkshakes", icon:"🥤", capexPct:13, marginPct:60, avgPrice:130, menuItems: [
      { name:"Chocolate Milkshake",     subcat:"Milkshakes", sell:120, cost:40, on:true },
      { name:"Oreo Milkshake",          subcat:"Milkshakes", sell:150, cost:50, on:true },
      { name:"Kit Kat Milkshake",       subcat:"Milkshakes", sell:150, cost:50, on:true },
      { name:"Raspberry Milkshake",     subcat:"Milkshakes", sell:150, cost:50, on:true },
      { name:"Mango Milkshake",         subcat:"Milkshakes", sell:120, cost:38, on:true },
      { name:"Strawberry Milkshake",    subcat:"Milkshakes", sell:120, cost:38, on:true },
      { name:"Badam Milkshake",         subcat:"Milkshakes", sell:120, cost:40, on:true },
      { name:"Vanilla Milkshake",       subcat:"Milkshakes", sell:120, cost:35, on:true },
      { name:"Black Current Milkshake", subcat:"Milkshakes", sell:130, cost:45, on:true },
      { name:"Blue Berry Milkshake",    subcat:"Milkshakes", sell:130, cost:45, on:true },
      { name:"Spl. Rose Milkshake",     subcat:"Milkshakes", sell:130, cost:42, on:true },
      { name:"Spl. Pista Milkshake",    subcat:"Milkshakes", sell:130, cost:42, on:true }
    ]},
    // ---- 4. Snacks (20%) — Kitchen, fryer, stove, sandwich maker ----
    { name:"Snacks", icon:"🍟", capexPct:20, marginPct:55, avgPrice:35, menuItems: [
      { name:"Samosa (2 pcs)",    subcat:"Quick Bites",  sell:20, cost:8,  on:true },
      { name:"Vada Pav",          subcat:"Quick Bites",  sell:25, cost:10, on:true },
      { name:"Aloo Pakora",       subcat:"Quick Bites",  sell:30, cost:12, on:true },
      { name:"Onion Pakora",      subcat:"Quick Bites",  sell:30, cost:12, on:true },
      { name:"Veg Puff",          subcat:"Quick Bites",  sell:25, cost:10, on:true },
      { name:"Egg Puff",          subcat:"Quick Bites",  sell:30, cost:12, on:true },
      { name:"Maggi",             subcat:"Prepared",     sell:40, cost:15, on:true },
      { name:"Bread Butter",      subcat:"Prepared",     sell:30, cost:10, on:true },
      { name:"Bread Jam",         subcat:"Prepared",     sell:30, cost:10, on:true },
      { name:"Paneer Sandwich",   subcat:"Prepared",     sell:50, cost:20, on:true },
      { name:"Veg Sandwich",      subcat:"Prepared",     sell:40, cost:15, on:true },
      { name:"French Fries",      subcat:"Prepared",     sell:60, cost:22, on:true },
      { name:"Idli (2 pcs)",      subcat:"South Indian", sell:30, cost:10, on:true },
      { name:"Dosa",              subcat:"South Indian", sell:40, cost:14, on:true },
      { name:"Upma",              subcat:"South Indian", sell:30, cost:10, on:true },
      { name:"Poha",              subcat:"South Indian", sell:30, cost:10, on:true }
    ]},
    // ---- 5. Ice Creams (10%) — Deep freezer, display ----
    { name:"Ice Creams", icon:"🍦", capexPct:10, marginPct:50, avgPrice:50, menuItems: [
      { name:"Single Scoop",             subcat:"Scoops",  sell:40,  cost:15, on:true },
      { name:"Double Scoop",             subcat:"Scoops",  sell:70,  cost:28, on:true },
      { name:"Cone",                     subcat:"Scoops",  sell:30,  cost:12, on:true },
      { name:"Cup Ice Cream (branded)",  subcat:"Packed",  sell:50,  cost:32, on:true },
      { name:"Kulfi Stick",              subcat:"Packed",  sell:40,  cost:18, on:true },
      { name:"Ice Cream Sundae",         subcat:"Sundae",  sell:90,  cost:35, on:true },
      { name:"Brownie Sundae",           subcat:"Sundae",  sell:120, cost:48, on:true }
    ]},
    // ---- 6. Packaged Beverages (12%) — Refrigerators, cooler display ----
    { name:"Packaged Beverages", icon:"📦", capexPct:12, marginPct:25, avgPrice:30, menuItems: [
      { name:"Water Bottle (500ml)", subcat:"Water",       sell:20,  cost:10,  on:true },
      { name:"Water Bottle (1L)",    subcat:"Water",       sell:30,  cost:15,  on:true },
      { name:"Soft Drink (300ml)",   subcat:"Soft Drinks", sell:30,  cost:20,  on:true },
      { name:"Soft Drink (600ml)",   subcat:"Soft Drinks", sell:40,  cost:28,  on:true },
      { name:"Juice Pack",          subcat:"Juice",       sell:30,  cost:20,  on:true },
      { name:"Coconut Water",       subcat:"Juice",       sell:40,  cost:25,  on:true },
      { name:"Buttermilk Pack",     subcat:"Juice",       sell:20,  cost:12,  on:true },
      { name:"Energy Drink",        subcat:"Energy",      sell:125, cost:100, on:true }
    ]},
    // ---- 7. Condiments & Extras (8%) — Display racks, counter ----
    { name:"Condiments & Extras", icon:"🫙", capexPct:8, marginPct:30, avgPrice:25, menuItems: [
      { name:"Chips Packet",        subcat:"Snack Packs",   sell:20, cost:14, on:true },
      { name:"Biscuit Pack",        subcat:"Snack Packs",   sell:20, cost:14, on:true },
      { name:"Chocolate Bar",       subcat:"Confectionery", sell:40, cost:30, on:true },
      { name:"Candy / Toffee Pack", subcat:"Confectionery", sell:10, cost:7,  on:true },
      { name:"Chewing Gum",         subcat:"Confectionery", sell:10, cost:7,  on:true },
      { name:"Mints",               subcat:"Confectionery", sell:10, cost:7,  on:true },
      { name:"Cup Noodles",         subcat:"Ready-to-Eat",  sell:50, cost:32, on:true },
      { name:"Tissue Pack",         subcat:"Others",        sell:10, cost:5,  on:true }
    ]}
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
      // Migrate: upgrade from old 6-category structure to 7 categories with menuItems
      if (data.categories && !data.categories.find(c => c.name === 'Milkshakes')) {
        const oldHotBevMenu = data.categories[0] && data.categories[0].menuItems
          ? data.categories[0].menuItems : null;
        data.categories = JSON.parse(JSON.stringify(DEFAULT_DATA.categories));
        if (oldHotBevMenu) data.categories[0].menuItems = oldHotBevMenu;
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
