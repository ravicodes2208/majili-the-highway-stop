// ================================================================
// app.js — Router, navigation, format helpers
// ================================================================

const PAGES = {
  dashboard:  { title:'Dashboard',           icon:'📊', render: renderDashboard },
  breakeven:  { title:'Car-Based Breakeven', icon:'🚗', render: renderBreakevenPage },
  category:   { title:'Category Breakeven',  icon:'🏷️', render: renderCategoryPage },
  profit:     { title:'Actual Sales → Profit', icon:'💹', render: renderProfitPage },
  payback:    { title:'Payback Comparison',  icon:'⏱️', render: renderPaybackPage },
  fixedopt:   { title:'Fixed Cost Optimizer', icon:'📅', render: renderFixedOptPage, section:'Optimizers' },
  menuopt:    { title:'Menu & Margin Optimizer', icon:'🍽️', render: renderMenuOptPage, section:'Optimizers' },
};

let currentPage = 'dashboard';

// ---- Formatting ----
const fmt  = n => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtL = n => '₹' + (n/100000).toFixed(2) + 'L';
const fmtN = n => (n===Infinity||isNaN(n)) ? '∞' : Math.round(n).toLocaleString('en-IN');
const fmtD = (n,d=1) => (n===Infinity||isNaN(n)) ? '∞' : n.toFixed(d);
const fmtP = (n,d=1) => (n*100).toFixed(d) + '%';
const esc  = s => String(s).replace(/"/g,'&quot;').replace(/</g,'&lt;');

// ---- Navigation ----
function navigate(page) {
  currentPage = page;
  window.location.hash = page;
  renderNav();
  renderPage();
  updateTopBar();
}

function renderNav() {
  const nav = document.getElementById('nav-items');
  let html = '';
  let lastSection = null;
  Object.entries(PAGES).forEach(([key, pg]) => {
    if (pg.section && pg.section !== lastSection) {
      html += `<div class="nav-section">${pg.section}</div>`;
      lastSection = pg.section;
    }
    html += `<a href="#${key}" class="nav-link${currentPage===key?' active':''}" onclick="event.preventDefault();navigate('${key}')">
      <span class="nav-icon">${pg.icon}</span><span class="nav-text">${pg.title}</span>
    </a>`;
  });
  html += `<a href="#" class="nav-link reset" onclick="event.preventDefault();if(confirm('Reset all data to defaults?')){D=resetState();navigate(currentPage);}">
    <span class="nav-icon">🔄</span><span class="nav-text">Reset</span>
  </a>`;
  nav.innerHTML = html;
}

function renderPage() {
  const content = document.getElementById('content');
  if (PAGES[currentPage]) {
    PAGES[currentPage].render(content);
  }
}

function updateTopBar() {
  const R = calcAll();
  setText('tb-cars', fmtN(R.carsPerDay) + ' cars/d');
  setText('tb-rev', fmt(R.revenuePerDay) + '/d');
  setText('tb-fixed', fmt(R.fixedMonthlyCost) + '/mo');
  setText('tb-be', fmtN(R.opBeCars) + ' cars');
  setText('tb-stop', fmtP(R.stopRate2500));
  const plEl = document.getElementById('tb-pl');
  if (plEl) {
    plEl.textContent = fmt(R.actual.netProfit) + '/mo';
    plEl.className = 'tm-v ' + (R.actual.netProfit >= 0 ? 'green' : 'red');
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function save() { saveState(D); updateTopBar(); updateSaveBar(); }

function reRender() { renderPage(); updateTopBar(); }

function toggleCollapse(el) {
  el.nextElementSibling.classList.toggle('collapsed');
}

// ---- Helper: dashboard card ----
function dCard(label, value, sub, cls) {
  return `<div class="dash-card${cls?' '+cls:''}"><div class="dc-label">${label}</div><div class="dc-value">${value}</div><div class="dc-sub">${sub||''}</div></div>`;
}

// ---- Init ----
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (PAGES[hash]) currentPage = hash;
  renderNav();
  renderPage();
  updateTopBar();
  updateSaveBar();
  // Refresh "last saved" timestamp every 30s
  setInterval(updateSaveBar, 30000);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (PAGES[hash] && hash !== currentPage) navigate(hash);
});
