// ================================================================
// calc.js — Calculation engine (matches Excel formulas exactly)
// ================================================================

function calcAll() {
  // ---- Compute fixed cost from line items ----
  const fixedMonthlyCost = getFixedMonthlyCost();

  // ---- Fixed cost category breakdown ----
  const fixedByCat = {};
  D.fixedCosts.forEach(item => {
    if (!fixedByCat[item.cat]) fixedByCat[item.cat] = { total:0, active:0, items:0, activeItems:0 };
    fixedByCat[item.cat].total += item.c;
    fixedByCat[item.cat].items++;
    if (item.on) { fixedByCat[item.cat].active += item.c; fixedByCat[item.cat].activeItems++; }
  });

  // ---- Sheet 1: Car-Based Breakeven ----
  const grossContrib = D.spendPerCar - D.materialCostPerCar;          // B13: =B6-B7
  const grossMargin = D.spendPerCar > 0 ? grossContrib / D.spendPerCar : 0; // B14: =(B6-B7)/B6
  const paybackMonths = D.paybackYears * 12;
  const monthlyCapexRecovery = D.totalCapex / paybackMonths;          // B15: =B8/(B10*12)

  // ★ THE ANSWER
  const carsPerDay = (monthlyCapexRecovery + fixedMonthlyCost) / (D.operatingDays * grossContrib || 1); // B18
  const revenuePerDay = carsPerDay * D.spendPerCar;                   // B19
  const revenuePerMonth = revenuePerDay * D.operatingDays;            // B20
  const peoplePerDay = carsPerDay * D.personsPerCar;                  // B22
  const materialPerDay = carsPerDay * D.materialCostPerCar;           // B23
  const materialPerMonth = materialPerDay * D.operatingDays;          // B24

  // Monthly P&L proof
  const proofRevenue = revenuePerMonth;                               // B27
  const proofMaterial = -materialPerMonth;                             // B28
  const proofFixed = -fixedMonthlyCost;                             // B29
  const proofSurplus = proofRevenue + proofMaterial + proofFixed;     // B30
  const monthsToRecover = proofSurplus > 0 ? D.totalCapex / proofSurplus : Infinity; // B31

  // Stop rates
  const stopRate2500 = D.visibleCars > 0 ? carsPerDay / D.visibleCars : 0;          // B35
  const oneInEvery = D.visibleCars > 0 ? D.visibleCars / carsPerDay : Infinity;     // B36
  const stopRateApril = D.visibleCarsApril > 0 ? carsPerDay / D.visibleCarsApril : 0;
  const stopRatePostShift = D.visibleCarsPostShift > 0 ? carsPerDay / D.visibleCarsPostShift : 0;

  // ---- Operational break-even (no capex recovery) ----
  const opBeCars = fixedMonthlyCost / (D.operatingDays * grossContrib || 1);

  // ---- Sheet 2: Category Breakeven ----
  const cats = D.categories.map((cat, i) => {
    // Use menu-item computed values when available
    const menuStats = getMenuStats(cat);
    const effectiveAvgPrice = menuStats ? menuStats.avgPrice : cat.avgPrice;
    const effectiveMarginPct = menuStats ? menuStats.marginPct : cat.marginPct;

    const capexAlloc = D.totalCapex * (cat.capexPct / 100);           // E: =B5*B13
    const fixedAlloc = fixedMonthlyCost * (cat.capexPct / 100);    // F: =B6*C13 (Fixed% = CapEx%)
    const monthlyRecovery = capexAlloc / paybackMonths;                // G: =E13/(B8*12)
    const margin = effectiveMarginPct / 100;

    // Break-even revenue/day
    const revDayBE = margin > 0 ? (monthlyRecovery + fixedAlloc) / margin / D.operatingDays : Infinity; // H

    // Profit share
    const profitShare = D.targetMonthlyProfit * (cat.capexPct / 100);  // J: =$B$10*B13

    // Revenue/day with profit
    const revDayProfit = margin > 0 ? (monthlyRecovery + fixedAlloc + profitShare) / margin / D.operatingDays : Infinity; // K

    // Units/day
    const unitsBE = effectiveAvgPrice > 0 ? revDayBE / effectiveAvgPrice : Infinity;      // M
    const unitsProfit = effectiveAvgPrice > 0 ? revDayProfit / effectiveAvgPrice : Infinity; // N

    return {
      ...cat, idx: i,
      effectiveAvgPrice, effectiveMarginPct, menuStats,
      capexAlloc, fixedAlloc, monthlyRecovery,
      revDayBE, profitShare, revDayProfit,
      unitsBE, unitsProfit,
      color: CAT_COLORS[i % CAT_COLORS.length]
    };
  });

  // Category totals
  const catTotals = {
    capexAlloc: cats.reduce((s,c) => s + c.capexAlloc, 0),
    fixedAlloc: cats.reduce((s,c) => s + c.fixedAlloc, 0),
    monthlyRecovery: cats.reduce((s,c) => s + c.monthlyRecovery, 0),
    revDayBE: cats.reduce((s,c) => s + c.revDayBE, 0),
    profitShare: cats.reduce((s,c) => s + c.profitShare, 0),
    revDayProfit: cats.reduce((s,c) => s + c.revDayProfit, 0),
    unitsBE: cats.reduce((s,c) => s + (isFinite(c.unitsBE) ? c.unitsBE : 0), 0),
    unitsProfit: cats.reduce((s,c) => s + (isFinite(c.unitsProfit) ? c.unitsProfit : 0), 0)
  };

  // Whole-shop summary (with profit)
  const carsWithProfit = D.spendPerCar > 0 ? catTotals.revDayProfit / D.spendPerCar : 0;
  const stopRateWithProfit2500 = D.visibleCars > 0 ? carsWithProfit / D.visibleCars : 0;
  const stopRateWithProfitApril = D.visibleCarsApril > 0 ? carsWithProfit / D.visibleCarsApril : 0;

  // ---- Sheet 3: Actual Sales → Profit ----
  const actual = calcActual(D.actualCarsPerDay);

  // ---- Sheet 4: Payback Scenarios ----
  const scenarios = calcPaybackScenarios();

  return {
    // Fixed cost breakdown
    fixedMonthlyCost, fixedByCat,
    // Sheet 1
    grossContrib, grossMargin, monthlyCapexRecovery, paybackMonths,
    carsPerDay, revenuePerDay, revenuePerMonth, peoplePerDay,
    materialPerDay, materialPerMonth,
    proofRevenue, proofMaterial, proofFixed, proofSurplus, monthsToRecover,
    stopRate2500, oneInEvery, stopRateApril, stopRatePostShift,
    opBeCars,
    // Sheet 2
    cats, catTotals, carsWithProfit, stopRateWithProfit2500, stopRateWithProfitApril,
    // Sheet 3
    actual,
    // Sheet 4
    scenarios
  };
}

// ---- Sheet 3: Actual Sales calc for any car count ----
function calcActual(cars) {
  const fmc = getFixedMonthlyCost();
  const customers = cars * D.personsPerCar;
  const revMonth = cars * D.spendPerCar * D.operatingDays;
  const varCostMonth = cars * D.spendPerCar * (1 - (D.spendPerCar > 0 ? (D.spendPerCar - D.materialCostPerCar) / D.spendPerCar : 0)) * D.operatingDays;
  const contribMonth = cars * D.spendPerCar * (D.spendPerCar > 0 ? (D.spendPerCar - D.materialCostPerCar) / D.spendPerCar : 0) * D.operatingDays;
  const monthlyCapexRecovery = D.totalCapex / (D.paybackYears * 12);
  const netProfit = contribMonth - fmc - monthlyCapexRecovery;
  const profitDay = netProfit / D.operatingDays;
  const profitYear = netProfit * 12;
  const revDay = cars * D.spendPerCar;
  const stopRate2500 = D.visibleCars > 0 ? cars / D.visibleCars : 0;
  const stopRateApril = D.visibleCarsApril > 0 ? cars / D.visibleCarsApril : 0;
  const afterPayback = contribMonth - fmc; // No capex line

  return {
    cars, customers, revMonth, varCostMonth, contribMonth,
    fixedCost: fmc, capexRecovery: monthlyCapexRecovery,
    netProfit, profitDay, profitYear, revDay,
    stopRate2500, stopRateApril, afterPayback
  };
}

// ---- Sheet 4: Payback comparison scenarios ----
function calcPaybackScenarios() {
  const fmc = getFixedMonthlyCost();
  const grossContrib = D.spendPerCar - D.materialCostPerCar;
  const dailyContrib = D.operatingDays * grossContrib || 1;

  // Operational BE (no capex recovery)
  const opCars = Math.ceil(fmc / dailyContrib);
  const opRevDay = opCars * D.spendPerCar;

  const paybacks = [
    { label:"Operational break-even", years:null, cars:opCars, revDay:opRevDay },
  ];

  [3, 2.5, 2].forEach(yr => {
    const recovery = D.totalCapex / (yr * 12);
    const cars = Math.ceil((recovery + fmc) / dailyContrib);
    paybacks.push({ label:`${yr}-year payback`, years:yr, cars, revDay: cars * D.spendPerCar });
  });

  paybacks.forEach(p => {
    p.stop2500 = D.visibleCars > 0 ? p.cars / D.visibleCars : 0;
    p.stopApril = D.visibleCarsApril > 0 ? p.cars / D.visibleCarsApril : 0;
    p.stopPostShift = D.visibleCarsPostShift > 0 ? p.cars / D.visibleCarsPostShift : 0;
  });

  return paybacks;
}
