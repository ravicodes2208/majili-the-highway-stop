// ================================================================
// charts.js — Canvas chart library (zero dependencies)
// ================================================================

function setupCanvas(id, h) {
  const c = document.getElementById(id);
  if (!c) return null;
  const dpr = window.devicePixelRatio || 1;
  const w = c.offsetWidth || 500;
  c.width = w * dpr; c.height = h * dpr;
  c.style.height = h + 'px';
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

// ---- DONUT ----
function drawDonut(id, data, centerText, centerSub) {
  const cv = setupCanvas(id, 260);
  if (!cv) return;
  const { ctx, w } = cv;
  const total = data.reduce((s,d) => s+d.value, 0) || 1;
  const cx = Math.min(130, w*0.28), cy = 125, r = 95, ir = 52;
  let angle = -Math.PI/2;

  data.filter(d=>d.value>0).forEach(d => {
    const sl = (d.value/total) * 2 * Math.PI;
    ctx.beginPath(); ctx.arc(cx,cy,r,angle,angle+sl); ctx.arc(cx,cy,ir,angle+sl,angle,true);
    ctx.closePath(); ctx.fillStyle = d.color; ctx.fill();
    angle += sl;
  });

  ctx.fillStyle = '#333'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(centerText || '', cx, cy-2);
  ctx.font = '10px system-ui'; ctx.fillStyle = '#888';
  ctx.fillText(centerSub || '', cx, cy+14);

  let ly = 14; const lx = Math.min(270, w*0.52);
  ctx.textAlign = 'left';
  data.filter(d=>d.value>0).forEach(d => {
    const pct = (d.value/total*100).toFixed(0);
    ctx.fillStyle = d.color; ctx.fillRect(lx, ly, 10, 10);
    ctx.fillStyle = '#333'; ctx.font = '11px system-ui';
    ctx.fillText(d.label, lx+15, ly+9);
    ctx.fillStyle = '#888'; ctx.font = '10px system-ui';
    ctx.fillText(`${fmt(d.value)} (${pct}%)`, lx+15, ly+22);
    ly += 32;
  });
}

// ---- HORIZONTAL BAR ----
function drawHBar(id, data, h) {
  h = h || (data.length * 34 + 20);
  const cv = setupCanvas(id, h);
  if (!cv) return;
  const { ctx, w } = cv;
  const maxV = Math.max(...data.map(d=>d.value)) || 1;
  const lp = 160, rp = 80;
  const barH = 24, gap = 10;

  ctx.font = '11px system-ui';
  data.forEach((d, i) => {
    const y = i*(barH+gap)+10;
    const bw = (d.value/maxV)*(w-lp-rp);
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(lp,y,w-lp-rp,barH);
    ctx.fillStyle = d.color||COLORS[i%8]; ctx.fillRect(lp,y,Math.max(bw,0),barH);
    ctx.fillStyle = '#333'; ctx.textAlign = 'right';
    const label = d.label.length > 20 ? d.label.slice(0,20)+'…' : d.label;
    ctx.fillText(label, lp-6, y+barH/2+4);
    ctx.fillStyle = '#555'; ctx.textAlign = 'left';
    ctx.fillText(typeof d.value === 'number' ? fmt(d.value) : d.value, lp+Math.max(bw,0)+4, y+barH/2+4);
  });
}

// ---- PAIRED BAR (v1 vs v2) ----
function drawPairedBar(id, data, h) {
  h = h || (data.length * 50 + 30);
  const cv = setupCanvas(id, h);
  if (!cv) return;
  const { ctx, w } = cv;
  const maxV = Math.max(...data.map(d=>Math.max(d.v1,d.v2))) || 1;
  const lp = 160, rp = 80;
  const barH = 16, gap = 18;

  ctx.font = '11px system-ui';
  data.forEach((d, i) => {
    const y = i*(barH*2+gap)+14;
    const bw1 = (d.v1/maxV)*(w-lp-rp);
    const bw2 = (d.v2/maxV)*(w-lp-rp);

    ctx.fillStyle = '#333'; ctx.textAlign = 'right';
    const label = d.label.length > 20 ? d.label.slice(0,20)+'…' : d.label;
    ctx.fillText(label, lp-6, y+barH);

    ctx.fillStyle = d.color+'50'; ctx.fillRect(lp,y,bw1,barH);
    ctx.fillStyle = '#888'; ctx.textAlign = 'left'; ctx.font = '10px system-ui';
    ctx.fillText('W/ Profit: '+fmtD(d.v1,0), lp+bw1+3, y+barH/2+3);

    ctx.fillStyle = d.color; ctx.fillRect(lp,y+barH+2,bw2,barH);
    ctx.fillText('BE: '+fmtD(d.v2,0), lp+bw2+3, y+barH*1.5+5);
    ctx.font = '11px system-ui';
  });
}

// ---- PIE (simple) ----
function drawPie(id, data, h) {
  h = h || 220;
  const cv = setupCanvas(id, h);
  if (!cv) return;
  const { ctx, w } = cv;
  const total = data.reduce((s,d)=>s+d.value,0) || 1;
  const cx = Math.min(110,w*0.25), cy = h/2, r = Math.min(90,h/2-10);
  let angle = -Math.PI/2;

  data.filter(d=>d.value>0).forEach(d => {
    const sl = (d.value/total)*2*Math.PI;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,angle,angle+sl); ctx.closePath();
    ctx.fillStyle = d.color; ctx.fill();
    angle += sl;
  });

  let ly = 10; const lx = cx + r + 20;
  ctx.textAlign = 'left';
  data.filter(d=>d.value>0).forEach(d => {
    ctx.fillStyle = d.color; ctx.fillRect(lx,ly,10,10);
    ctx.fillStyle = '#333'; ctx.font = '11px system-ui';
    ctx.fillText(`${d.label}: ${fmt(d.value)} (${(d.value/total*100).toFixed(0)}%)`, lx+14, ly+9);
    ly += 20;
  });
}

// ---- LINE CHART (generic, x = numbers) ----
function drawLineChart(id, points, markers, targetY, h) {
  h = h || 260;
  const cv = setupCanvas(id, h);
  if (!cv) return;
  const { ctx, w } = cv;
  const pad = { t:25, r:25, b:45, l:65 };
  const cW = w-pad.l-pad.r, cH = h-pad.t-pad.b;

  const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys, targetY !== undefined ? targetY : Infinity) * 1.1;
  const maxY = Math.max(...ys) * 1.05;
  const sx = x => pad.l + ((x-minX)/(maxX-minX||1))*cW;
  const sy = y => pad.t + ((maxY-y)/(maxY-minY||1))*cH;

  // Grid
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) {
    const y = pad.t + i/4*cH;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
    const val = maxY - i/4*(maxY-minY);
    ctx.fillStyle = '#888'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
    ctx.fillText(fmt(val), pad.l-6, y+4);
  }
  for (let i=0;i<=4;i++) {
    const x = pad.l + i/4*cW;
    const val = minX + i/4*(maxX-minX);
    ctx.fillStyle = '#888'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(val), x, h-pad.b+16);
  }

  // Axes
  ctx.strokeStyle = '#ccc';
  ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+cH); ctx.lineTo(pad.l+cW,pad.t+cH); ctx.stroke();

  // Zero line
  if (targetY !== undefined && sy(targetY) >= pad.t && sy(targetY) <= pad.t+cH) {
    ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(pad.l,sy(targetY)); ctx.lineTo(pad.l+cW,sy(targetY)); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#ff9800'; ctx.textAlign = 'right'; ctx.font = '10px system-ui';
    ctx.fillText(targetY === 0 ? 'Break-Even' : fmt(targetY), pad.l+cW, sy(targetY)-4);
  }

  // Line
  ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
  ctx.beginPath();
  points.forEach((p,i) => { const x=sx(p.x),y=sy(p.y); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.stroke();

  // Fill below/above zero
  if (targetY !== undefined) {
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    points.forEach((p,i) => { const x=sx(p.x),y=sy(p.y); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.lineTo(sx(maxX), sy(targetY));
    ctx.lineTo(sx(minX), sy(targetY));
    ctx.closePath();
    ctx.fillStyle = points[points.length-1].y >= targetY ? '#2e7d32' : '#c62828';
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Markers
  (markers||[]).forEach(m => {
    if (m.x < minX || m.x > maxX) return;
    ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(sx(m.x),sy(m.y),5,0,Math.PI*2); ctx.fill();
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(m.label, sx(m.x)+8, sy(m.y)+(m.below?12:-6));
  });

  // X-axis label
  ctx.fillStyle = '#555'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('Cars/Day', pad.l+cW/2, h-4);
}
