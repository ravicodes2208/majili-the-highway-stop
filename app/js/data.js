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
    { name:"Hot Beverages",      icon:"☕",  capexPct:30, marginPct:50, avgPrice:28 },
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
      return data;
    }
  } catch(e) { console.warn('localStorage unavailable'); }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// Compute total fixed monthly cost from line items
function getFixedMonthlyCost() {
  return D.fixedCosts.filter(i => i.on).reduce((s, i) => s + i.c, 0);
}

function saveState(data) {
  try { localStorage.setItem('vishranti_v2', JSON.stringify(data)); } catch(e) {}
}

function resetState() {
  try { localStorage.removeItem('vishranti_v2'); } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

let D = loadState();
