(() => {
'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* ==========================================================================
   UTILITIES
   ========================================================================== */
function tweenNumber(el, from, to, duration, decimals, formatFn){
  if(reducedMotion){ el.textContent = formatFn ? formatFn(to) : to.toFixed(decimals); return; }
  const start = performance.now();
  function frame(now){
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = from + (to - from) * eased;
    el.textContent = formatFn ? formatFn(val) : val.toFixed(decimals);
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function euro(n){ return Math.round(n).toLocaleString('en-US'); }
function showToast(message){
  const container = $('#toastContainer');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span><div class="toast-bar"></div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 320);
  }, 3000);
}

/* ==========================================================================
   LOADING SCREEN
   ========================================================================== */
function initLoading(){
  const screen = $('#loadingScreen');
  const fill = $('#loadingBarFill');
  const pct = $('#loadingPct');
  let value = 0;
  const duration = reducedMotion ? 200 : 1400;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / duration, 1);
    value = Math.floor(p * 100);
    fill.style.width = value + '%';
    pct.textContent = String(value).padStart(2, '0') + '%';
    if(p < 1){ requestAnimationFrame(tick); }
    else{
      setTimeout(() => {
        screen.classList.add('hide');
        document.body.classList.remove('no-scroll');
        const heroContent = $('.hero-content');
        if(heroContent) heroContent.classList.add('ready');
      }, 180);
    }
  }
  document.body.classList.add('no-scroll');
  requestAnimationFrame(tick);
}

/* ==========================================================================
   CUSTOM CURSOR
   ========================================================================== */
function initCursor(){
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  const label = $('#cursorLabel');
  if(!dot || !ring) return;
  if(matchMedia('(pointer: coarse)').matches){ document.body.classList.add('touch'); return; }

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  function loop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  $$('a, button, .swatch, .option-row, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('grow');
      const hint = el.getAttribute('data-cursor');
      if(hint){ label.textContent = hint.toUpperCase(); ring.classList.add('label'); }
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('grow', 'label');
      label.textContent = '';
    });
  });
  $$('.car-card-media, .journal-media, img').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.classList.add('grow','label'); label.textContent = 'VIEW'; });
    el.addEventListener('mouseleave', () => { ring.classList.remove('grow','label'); label.textContent = ''; });
  });
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function initHeader(){
  const header = $('#siteHeader');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('[data-nav]');
  const sections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => io.observe(s));
}

function initMobileNav(){
  const toggle = $('#navToggle');
  const menu = $('#mobileNav');
  if(!toggle || !menu) return;
  function close(){
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }
  function open(){
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  toggle.addEventListener('click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
  });
  $$('[data-mobile-nav]').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
}

/* ==========================================================================
   SEARCH
   ========================================================================== */
function initSearch(){
  const toggle = $('#searchToggle');
  const overlay = $('#searchOverlay');
  const closeBtn = $('#searchClose');
  const input = $('#searchInput');
  if(!toggle || !overlay) return;
  function open(){
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 260);
  }
  function close(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    input.value = '';
  }
  toggle.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.classList.contains('open')) close(); });
  $$('[data-suggest]').forEach(chip => chip.addEventListener('click', () => { input.value = chip.textContent; input.focus(); }));
}

/* ==========================================================================
   SCROLL EFFECTS (reveal-on-scroll, scroll indicator, immersive scale)
   ========================================================================== */
function initRevealObserver(){
  const items = $$('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

function initScrollIndicator(){
  const indicator = $('#scrollIndicator');
  if(!indicator) return;
  window.addEventListener('scroll', () => {
    indicator.classList.toggle('faded', window.scrollY > 80);
  }, { passive: true });
}

function initImmersiveScale(){
  const section = $('#immersive');
  const media = $('#immersiveMedia');
  if(!section || !media) return;
  let ticking = false;
  function update(){
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = 1 - Math.min(Math.max((rect.top) / vh, -1), 1);
    const scale = 1.08 - progress * 0.1;
    media.style.transform = `scale(${Math.max(0.98, Math.min(1.08, scale))})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if(!ticking && !reducedMotion){ requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ==========================================================================
   MAGNETIC BUTTONS
   ========================================================================== */
function initMagnetic(){
  if(reducedMotion || matchMedia('(pointer: coarse)').matches) return;
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
  });
}

/* ==========================================================================
   COUNTERS (tickers)
   ========================================================================== */
function initCounters(){
  const tickers = $$('.ticker');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        tweenNumber(el, 0, target, 1700, decimals, v => v.toFixed(decimals) + suffix);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  tickers.forEach(el => io.observe(el));
}

/* ==========================================================================
   COLLECTION CAROUSEL
   ========================================================================== */
function initCarousel(){
  const track = $('#collectionTrack');
  const prev = $('#collPrev');
  const next = $('#collNext');
  const dotsWrap = $('#collDots');
  if(!track) return;
  const cards = $$('.car-card', track);

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    if(i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(dot);
  });
  const dots = $$('button', dotsWrap);

  function scrollToCard(i){
    const card = cards[i];
    if(!card) return;
    track.scrollTo({ left: card.offsetLeft - 4, behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  function currentIndex(){
    let closest = 0, minDist = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(c.offsetLeft - track.scrollLeft);
      if(dist < minDist){ minDist = dist; closest = i; }
    });
    return closest;
  }
  function syncDots(){
    const idx = currentIndex();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  track.addEventListener('scroll', () => { window.requestAnimationFrame(syncDots); }, { passive: true });

  prev.addEventListener('click', () => scrollToCard(Math.max(0, currentIndex() - 1)));
  next.addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)));

  track.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ e.preventDefault(); scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)); }
    if(e.key === 'ArrowLeft'){ e.preventDefault(); scrollToCard(Math.max(0, currentIndex() - 1)); }
  });

  // Drag to scroll (mouse)
  let isDown = false, startX = 0, startScroll = 0;
  track.addEventListener('pointerdown', e => {
    isDown = true;
    track.classList.add('dragging');
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if(!isDown) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  function endDrag(){ isDown = false; track.classList.remove('dragging'); }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);
}

/* ==========================================================================
   FAVORITES
   ========================================================================== */
function initFavorites(){
  const favCount = $('#favCount');
  let favorites = [];
  try{ favorites = JSON.parse(localStorage.getItem('dreamgarage_favorites') || '[]'); }catch(e){ favorites = []; }

  function render(){
    $$('.fav-heart').forEach(btn => {
      const id = btn.dataset.fav;
      const active = favorites.includes(id);
      btn.setAttribute('aria-pressed', String(active));
    });
    if(favorites.length > 0){ favCount.hidden = false; favCount.textContent = favorites.length; }
    else{ favCount.hidden = true; }
  }
  $$('.fav-heart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.fav;
      const name = btn.closest('.car-card').querySelector('h3').textContent;
      if(favorites.includes(id)){
        favorites = favorites.filter(f => f !== id);
        showToast(name + ' removed from favorites');
      }else{
        favorites.push(id);
        showToast(name + ' added to favorites');
      }
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 420);
      localStorage.setItem('dreamgarage_favorites', JSON.stringify(favorites));
      render();
    });
  });
  render();
}

/* ==========================================================================
   PERFORMANCE GRAPH
   ========================================================================== */
function initPerfGraph(){
  const svg = $('#perfGraphSvg');
  if(!svg) return;
  const dataPoints = [
    { rpm: 1000, hp: 95 }, { rpm: 1500, hp: 140 }, { rpm: 2000, hp: 190 },
    { rpm: 2500, hp: 245 }, { rpm: 3000, hp: 295 }, { rpm: 3500, hp: 340 },
    { rpm: 4000, hp: 380 }, { rpm: 4500, hp: 415 }, { rpm: 5000, hp: 445 },
    { rpm: 5500, hp: 470 }, { rpm: 6000, hp: 492 }, { rpm: 6500, hp: 508 },
    { rpm: 7000, hp: 518 }, { rpm: 7500, hp: 512 }, { rpm: 8000, hp: 495 }
  ];
  const pad = { l: 54, r: 20, t: 20, b: 40 };
  const W = 800, H = 340;
  const rpmMin = 1000, rpmMax = 8000, hpMax = 560;
  const mapX = rpm => pad.l + (rpm - rpmMin) / (rpmMax - rpmMin) * (W - pad.l - pad.r);
  const mapY = hp => pad.t + (1 - hp / hpMax) * (H - pad.t - pad.b);

  const points = dataPoints.map(d => ({ x: mapX(d.rpm), y: mapY(d.hp), rpm: d.rpm, hp: d.hp }));

  function smoothPath(pts){
    let d = `M${pts[0].x},${pts[0].y}`;
    for(let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const linePath = smoothPath(points);
  const baseY = mapY(0);
  const fillPath = linePath + ` L${points[points.length - 1].x},${baseY} L${points[0].x},${baseY} Z`;

  const lineEl = $('#perfGraphLine');
  const fillEl = $('#perfGraphFill');
  lineEl.setAttribute('d', linePath);
  fillEl.setAttribute('d', fillPath);

  // Axes
  const axesGroup = $('#graphAxes');
  let axesSvg = '';
  for(let hp = 0; hp <= 500; hp += 100){
    const y = mapY(hp);
    axesSvg += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}"/>`;
    axesSvg += `<text x="${pad.l - 12}" y="${y + 4}" text-anchor="end">${hp}</text>`;
  }
  for(let rpm = 1000; rpm <= 8000; rpm += 1000){
    const x = mapX(rpm);
    axesSvg += `<text x="${x}" y="${H - pad.b + 20}" text-anchor="middle">${rpm / 1000}k</text>`;
  }
  axesGroup.innerHTML = axesSvg;

  // Draw-in animation
  const len = lineEl.getTotalLength();
  lineEl.style.strokeDasharray = len;
  lineEl.style.strokeDashoffset = len;
  fillEl.style.opacity = 0;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        lineEl.style.transition = reducedMotion ? 'none' : 'stroke-dashoffset 1600ms cubic-bezier(.16,1,.3,1)';
        fillEl.style.transition = 'opacity 900ms ease 600ms';
        lineEl.style.strokeDashoffset = 0;
        fillEl.style.opacity = 1;
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(svg);

  // Hover tooltip
  const hit = $('#perfGraphHit');
  const dot = $('#perfGraphDot');
  const tooltip = $('#graphTooltip');
  const tRpm = $('#graphTooltipRpm');
  const tHp = $('#graphTooltipHp');

  function svgPoint(evt){
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    return { x: (evt.clientX - rect.left) * scaleX, y: (evt.clientY - rect.top) * scaleY };
  }
  hit.addEventListener('mousemove', evt => {
    const p = svgPoint(evt);
    const rpm = Math.max(rpmMin, Math.min(rpmMax, rpmMin + (p.x - pad.l) / (W - pad.l - pad.r) * (rpmMax - rpmMin)));
    let i = 0;
    while(i < dataPoints.length - 2 && dataPoints[i + 1].rpm < rpm) i++;
    const a = dataPoints[i], b = dataPoints[i + 1] || a;
    const t = b.rpm === a.rpm ? 0 : (rpm - a.rpm) / (b.rpm - a.rpm);
    const hp = a.hp + (b.hp - a.hp) * t;
    const cx = mapX(rpm), cy = mapY(hp);
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('opacity', 1);
    const rect = svg.getBoundingClientRect();
    tooltip.style.left = (cx / W) * rect.width + 'px';
    tooltip.style.top = (cy / H) * rect.height + 'px';
    tRpm.textContent = 'RPM: ' + Math.round(rpm).toLocaleString('en-US');
    tHp.textContent = 'POWER: ' + Math.round(hp) + ' HP';
    tooltip.classList.add('show');
  });
  hit.addEventListener('mouseleave', () => { tooltip.classList.remove('show'); dot.setAttribute('opacity', 0); });
}

/* ==========================================================================
   ENGINE TELEMETRY ANIMATION
   ========================================================================== */
function initEngine(){
  const ring = $('#engineRingProgress');
  const rpmValue = $('#engineRpmValue');
  if(!ring || !rpmValue) return;
  const circumference = 2 * Math.PI * 82;
  function setRpm(rpm){
    const pct = Math.min(1, rpm / 9000);
    ring.style.strokeDashoffset = circumference * (1 - pct);
    rpmValue.textContent = Math.round(rpm).toLocaleString('en-US');
  }
  setRpm(6420);
  if(!reducedMotion){
    setInterval(() => {
      const variance = 6420 + (Math.random() * 700 - 350);
      setRpm(variance);
    }, 1800);
  }
}

/* ==========================================================================
   CONFIGURATOR
   ========================================================================== */
const pricing = {
  base: 184900,
  colors: { '#15171B': 0, '#F2F3F5': 900, '#E86F3D': 1800, '#1F5C46': 1800, '#9BA1AA': 900, '#1B2A4A': 900 },
  wheels: { forged19: 0, carbon20: 4200, aero21: 6800 },
  brakes: { steel: 0, ceramic: 8900, ceramicPro: 14500 },
  interior: { 'black-leather': 0, 'ivory-leather': 2100, alcantara: 3400, 'carbon-sport': 5600 },
  packages: { trackPackage: 9800, aeroPackage: 6200, lightweightPackage: 11500 }
};
const brakeCaliperColor = { steel: '#B7BCC4', ceramic: '#E86F3D', ceramicPro: '#FF9A63' };
const basePerf = { hp: 518, weight: 1450, accel: 3.2, topSpeed: 296 };

let carState = {
  exterior: '#15171B',
  exteriorName: 'Obsidian Black',
  wheels: 'forged19',
  brakes: 'steel',
  interior: 'black-leather',
  interiorName: 'Black Leather',
  trackPackage: false,
  aeroPackage: false,
  lightweightPackage: false
};

function initConfigurator(){
  const pvWheelFront = $('#pv-wheel-front');
  const pvWheelRear = $('#pv-wheel-rear');
  const previewColorName = $('#previewColorName');

  function applyWheels(){
    const href = '#wheel-' + carState.wheels;
    const rim = { forged19: '#3a3d44', carbon20: '#2c2f35', aero21: '#33363c' }[carState.wheels];
    const caliper = brakeCaliperColor[carState.brakes];
    [pvWheelFront, pvWheelRear].forEach(u => {
      if(!u) return;
      u.setAttribute('href', href);
      u.style.setProperty('--wheel-rim-color', rim);
      u.style.setProperty('--caliper-color', caliper);
    });
  }
  function applyColor(){
    document.documentElement.style.setProperty('--car-color', carState.exterior);
  }
  function applyInterior(){
    document.documentElement.style.setProperty('--interior-color', carState.interiorName === 'Carbon Sport' ? '#14161A' : carState.interior === 'ivory-leather' ? '#E9E2D3' : carState.interior === 'alcantara' ? '#2B2E35' : '#1B1D22');
  }
  function updatePreviewLabel(){
    const activeView = $('.view-btn.active');
    const view = activeView ? activeView.dataset.view : 'side';
    previewColorName.textContent = (view === 'interior' ? carState.interiorName : carState.exteriorName).toUpperCase();
  }
  function updateVehiclePreview(){
    applyWheels();
    applyColor();
    applyInterior();
    updatePreviewLabel();
  }

  function updatePerformance(){
    let hp = basePerf.hp, weight = basePerf.weight, accel = basePerf.accel, top = basePerf.topSpeed;
    if(carState.trackPackage){ hp += 18; accel -= 0.1; }
    if(carState.aeroPackage){ top += 6; }
    if(carState.lightweightPackage){ weight -= 32; accel -= 0.1; }
    accel = Math.max(2.7, accel);
    const set = (id, val) => {
      const el = document.getElementById(id);
      if(el.textContent !== String(val)){ el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 500); }
      el.textContent = val;
    };
    set('liveHp', hp);
    set('liveWeight', weight);
    set('liveAccel', accel.toFixed(1));
    set('liveTopSpeed', top);
  }

  function updatePrice(){
    let options = pricing.colors[carState.exterior] || 0;
    options += pricing.wheels[carState.wheels] || 0;
    options += pricing.brakes[carState.brakes] || 0;
    options += pricing.interior[carState.interior] || 0;
    if(carState.trackPackage) options += pricing.packages.trackPackage;
    if(carState.aeroPackage) options += pricing.packages.aeroPackage;
    if(carState.lightweightPackage) options += pricing.packages.lightweightPackage;

    const total = pricing.base + options;
    const optionsEl = $('#optionsPrice');
    const totalEl = $('#totalPrice');
    const prevOptions = parseFloat((optionsEl.textContent || '0').replace(/,/g, '')) || 0;
    const prevTotal = parseFloat((totalEl.textContent || '0').replace(/,/g, '')) || pricing.base;
    tweenNumber(optionsEl, prevOptions, options, 500, 0, euro);
    tweenNumber(totalEl, prevTotal, total, 500, 0, euro);
  }

  function saveConfiguration(){
    localStorage.setItem('dreamgarage_config', JSON.stringify(carState));
  }
  function loadConfiguration(){
    try{
      const saved = JSON.parse(localStorage.getItem('dreamgarage_config'));
      if(saved) carState = Object.assign({}, carState, saved);
    }catch(e){ /* ignore malformed storage */ }
  }
  function syncUIFromState(){
    $$('.swatch').forEach(s => s.classList.toggle('active', s.dataset.color === carState.exterior));
    $$('#wheelOptions .option-row').forEach(o => o.classList.toggle('active', o.dataset.wheels === carState.wheels));
    $$('#brakeOptions .option-row').forEach(o => o.classList.toggle('active', o.dataset.brakes === carState.brakes));
    $$('#interiorOptions .option-row').forEach(o => o.classList.toggle('active', o.dataset.interior === carState.interior));
    $('#trackPackage').checked = carState.trackPackage;
    $('#aeroPackage').checked = carState.aeroPackage;
    $('#lightweightPackage').checked = carState.lightweightPackage;
    const colorBtn = $(`.swatch[data-color="${carState.exterior}"]`);
    $('#colorDetail').textContent = carState.exteriorName.toUpperCase() + (pricing.colors[carState.exterior] ? ' — +€' + euro(pricing.colors[carState.exterior]) : ' — INCLUDED');
  }
  function resetConfiguration(){
    carState = {
      exterior: '#15171B', exteriorName: 'Obsidian Black',
      wheels: 'forged19', brakes: 'steel',
      interior: 'black-leather', interiorName: 'Black Leather',
      trackPackage: false, aeroPackage: false, lightweightPackage: false
    };
    saveConfiguration();
    syncUIFromState();
    updateVehiclePreview();
    updatePerformance();
    updatePrice();
    showToast('Configuration reset');
  }

  // Color swatches
  $$('.swatch').forEach(swatch => {
    swatch.style.setProperty('--swatch-color', swatch.dataset.color);
    swatch.style.background = swatch.dataset.color;
    swatch.addEventListener('click', () => {
      carState.exterior = swatch.dataset.color;
      carState.exteriorName = swatch.dataset.name;
      syncUIFromState();
      updateVehiclePreview();
      updatePrice();
      saveConfiguration();
      showToast('Configuration updated');
    });
  });

  // Wheels
  $$('#wheelOptions .option-row').forEach(row => {
    row.addEventListener('click', () => {
      carState.wheels = row.dataset.wheels;
      syncUIFromState();
      updateVehiclePreview();
      updatePrice();
      saveConfiguration();
      showToast('Configuration updated');
    });
  });

  // Brakes
  $$('#brakeOptions .option-row').forEach(row => {
    row.addEventListener('click', () => {
      carState.brakes = row.dataset.brakes;
      syncUIFromState();
      updateVehiclePreview();
      updatePrice();
      saveConfiguration();
      showToast('Configuration updated');
    });
  });

  // Interior
  $$('#interiorOptions .option-row').forEach(row => {
    row.addEventListener('click', () => {
      carState.interior = row.dataset.interior;
      carState.interiorName = row.querySelector('.option-name').textContent.replace(/\s+/g,' ').trim()
        .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      syncUIFromState();
      updateVehiclePreview();
      updatePrice();
      saveConfiguration();
      showToast('Configuration updated');
    });
  });

  // Packages
  $$('[data-package]').forEach(input => {
    input.addEventListener('change', () => {
      carState[input.dataset.package] = input.checked;
      updatePerformance();
      updatePrice();
      saveConfiguration();
      showToast(input.previousElementSibling.querySelector('.option-name').textContent + (input.checked ? ' enabled' : ' disabled'));
    });
  });

  // Progress tabs
  $$('.progress-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.progress-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $$('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.tabPanel === tab.dataset.tab));
    });
  });

  // View angle buttons
  $$('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.preview-svg').forEach(svg => svg.classList.toggle('active', svg.dataset.viewSvg === btn.dataset.view));
      updatePreviewLabel();
    });
  });

  $('#resetConfigBtn').addEventListener('click', resetConfiguration);

  // Init
  loadConfiguration();
  syncUIFromState();
  updateVehiclePreview();
  updatePerformance();
  const totalEl = $('#totalPrice');
  const optionsEl = $('#optionsPrice');
  let opt = pricing.colors[carState.exterior] || 0;
  opt += pricing.wheels[carState.wheels] || 0;
  opt += pricing.brakes[carState.brakes] || 0;
  opt += pricing.interior[carState.interior] || 0;
  if(carState.trackPackage) opt += pricing.packages.trackPackage;
  if(carState.aeroPackage) opt += pricing.packages.aeroPackage;
  if(carState.lightweightPackage) opt += pricing.packages.lightweightPackage;
  optionsEl.textContent = euro(opt);
  totalEl.textContent = euro(pricing.base + opt);

  return { updateVehiclePreview };
}

/* ==========================================================================
   FULLSCREEN VEHICLE VIEWER
   ========================================================================== */
const vehiclesData = [
  { id: '911r', name: 'DG 911R', hp: 518, accel: '3.2', top: 296, price: '184,900', wheel: 'wheel-forged19', rim: '#3a3d44', caliper: '#E86F3D', paint: '#15171B' },
  { id: 'v12',  name: 'DG V12',  hp: 720, accel: '2.9', top: 340, price: '312,000', wheel: 'wheel-forged19', rim: '#4a4e56', caliper: '#FF9A63', paint: '#1B2A4A' },
  { id: 'gtx',  name: 'DG GT-X', hp: 612, accel: '3.0', top: 320, price: '268,500', wheel: 'wheel-aero21', rim: '#3a3d44', caliper: '#73D6A2', paint: '#1F5C46' }
];
function initFullscreenViewer(){
  const modal = $('#fullscreenViewer');
  const openBtn = $('#expandViewBtn');
  const closeBtn = $('#fsvClose');
  const prevBtn = $('#fsvPrev');
  const nextBtn = $('#fsvNext');
  const body = $('#fsv-body');
  const wheelFront = $('#fsv-wheel-front');
  const wheelRear = $('#fsv-wheel-rear');
  const nameEl = $('#fsvName');
  const specsEl = $('#fsvSpecs');
  if(!modal || !openBtn) return;
  let index = 0;

  function render(){
    const v = vehiclesData[index];
    body.setAttribute('fill', v.paint);
    [wheelFront, wheelRear].forEach(u => {
      u.setAttribute('href', '#' + v.wheel);
      u.style.setProperty('--wheel-rim-color', v.rim);
      u.style.setProperty('--caliper-color', v.caliper);
    });
    nameEl.textContent = v.name;
    specsEl.innerHTML = `<span><b>${v.hp}</b> HP</span><span><b>${v.accel}</b> SEC 0&ndash;100</span><span><b>${v.top}</b> KM/H</span><span>FROM <b>&euro;${v.price}</b></span>`;
  }
  function open(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    render();
  }
  function close(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }
  openBtn.addEventListener('click', () => { index = 0; open(); });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => { index = (index - 1 + vehiclesData.length) % vehiclesData.length; render(); });
  nextBtn.addEventListener('click', () => { index = (index + 1) % vehiclesData.length; render(); });
  document.addEventListener('keydown', e => {
    if(!modal.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight') nextBtn.click();
    if(e.key === 'ArrowLeft') prevBtn.click();
  });
}

/* ==========================================================================
   TEST DRIVE MODAL
   ========================================================================== */
function initDriveModal(){
  const modal = $('#driveModal');
  const openBtn = $('#openDriveModal');
  const contactBtn = $('#footerContactBtn');
  const closeBtn = $('#driveModalClose');
  const form = $('#driveForm');
  const formWrap = $('#driveFormWrap');
  const successWrap = $('#driveSuccessWrap');
  const successClose = $('#driveSuccessClose');
  if(!modal) return;

  function open(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  function close(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { formWrap.hidden = false; successWrap.hidden = true; form.reset(); }, 300);
  }
  openBtn.addEventListener('click', open);
  if(contactBtn) contactBtn.addEventListener('click', e => { e.preventDefault(); open(); });
  closeBtn.addEventListener('click', close);
  successClose.addEventListener('click', close);
  modal.addEventListener('click', e => { if(e.target === modal) close(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('open')) close(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    formWrap.hidden = true;
    successWrap.hidden = false;
    showToast('Request received');
  });
}

/* ==========================================================================
   EASTER EGGS
   ========================================================================== */
function initEasterEggs(){
  let buffer = [];
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  document.addEventListener('keydown', e => {
    buffer.push(e.key);
    buffer = buffer.slice(-Math.max(konami.length, 3));

    if(buffer.slice(-3).join('') === '911'){
      showToast('911. Nice choice.');
    }
    if(buffer.slice(-konami.length).join(',') === konami.join(',')){
      document.body.classList.toggle('track-mode');
      showToast(document.body.classList.contains('track-mode') ? 'TRACK MODE ACTIVATED' : 'Track mode disabled');
    }
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initCursor();
  initHeader();
  initMobileNav();
  initSearch();
  initRevealObserver();
  initScrollIndicator();
  initImmersiveScale();
  initMagnetic();
  initCounters();
  initCarousel();
  initFavorites();
  initPerfGraph();
  initEngine();
  initConfigurator();
  initFullscreenViewer();
  initDriveModal();
  initEasterEggs();
});

})();
