/* Tokenmetry Launch PV — deterministic renderer.
   Every animated property is a pure function of absolute time t (seconds,
   relative to video start). Frame capture calls window.PROMO.render(t);
   browser preview (?preview) drives the same function with rAF. */
(() => {
  const TL = window.TIMELINE;
  const beats = TL.beats;
  const period = TL.period_s;
  const bar = period * 4;
  const DUR = TL.duration_s;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const eoCubic = x => 1 - Math.pow(1 - x, 3);
  const eoExpo = x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const eoBack = x => { const c = 2.0; const p = x - 1; return 1 + (c + 1) * p * p * p + c * p * p; };
  const li = x => x * x * (3 - 2 * x);

  const flashEl = $('.flash');
  const fadeEl = $('.fadeout');
  const cameraEl = $('.camera');

  /* ── init: wrap CTA wordmark into per-letter spans ── */
  for (const sel of ['.logo-word', '.cta-word']) {
    const el = $(sel);
    const text = el.textContent;
    el.textContent = '';
    for (const ch of text) {
      const sp = document.createElement('span');
      sp.textContent = ch;
      el.appendChild(sp);
    }
  }

  /* ── init: parse overview KPI values for count-up ── */
  const counts = $$('.slot-overview .ta-kpi-val').map(el => {
    const raw = el.textContent.trim();
    const m = raw.match(/^([^0-9]*)([\d.,]+)(.*)$/);
    if (!m) return null;
    const num = m[2].replace(/,/g, '');
    const dot = num.indexOf('.');
    return {
      el,
      prefix: m[1],
      suffix: m[3],
      final: parseFloat(num),
      dec: dot === -1 ? 0 : num.length - dot - 1,
      grouped: m[2].includes(','),
    };
  }).filter(Boolean);

  function fmt(c, v) {
    let s = v.toFixed(c.dec);
    if (c.grouped) {
      const [i, d] = s.split('.');
      s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
    }
    return c.prefix + s + c.suffix;
  }

  /* ── init: collect source chips ── */
  const chips = $$('.slot-sources .wall .cell');

  /* ── init: collect logo bars (logo + cta scenes) ── */
  const logoBars = $$('.scene[data-scene="logo"] rect.bar');
  const ctaBars = $$('.scene[data-scene="cta"] rect.bar');
  const logoLetters = $$('.scene[data-scene="logo"] .logo-word span');
  const ctaLetters = $$('.scene[data-scene="cta"] .cta-word span');
  const ctaChips = $$('.scene[data-scene="cta"] .chip');
  const ctaTag = $('.cta-tag');
  const ctaFoot = $('.cta-foot');
  const logoTag = $('.logo-tag');

  /* ── scene table (montage spans split per bar) ── */
  const by = {};
  TL.scenes.forEach(s => { by[s.name] = s; });
  const SCENES = [];
  const push = (name, start, end, render, flash) => SCENES.push({ name, start, end, render, flash });
  push('hook', by.hook.start_s, by.hook.end_s, renderHook, false);
  push('logo', by.logo.start_s, by.logo.end_s, renderLogo, true);
  push('overview', by.overview.start_s, by.overview.end_s, renderOverview, true);
  const m = by.montage;
  ['time', 'models', 'agents', 'cost'].forEach((name, i) => {
    push(name, m.start_s + i * bar, m.start_s + (i + 1) * bar, renderMontage(name), true);
  });
  push('sources', by.sources.start_s, by.sources.end_s, renderSources, true);
  push('tray', by.tray.start_s, by.tray.end_s, renderTray, true);
  push('cta', by.cta.start_s, by.cta.end_s, renderCta, true);

  const sceneEls = {};
  $$('.scene').forEach(el => { sceneEls[el.dataset.scene] = el; });

  /* ── scene renderers ── */

  function renderHook(lt, t) {
    const typedEl = $('.hook-type .typed');
    const cursorEl = $('.hook-type .cursor');
    const text = typedEl.dataset.text;
    const typeDur = 1.9;
    const n = clamp(Math.floor((lt / typeDur) * text.length), 0, text.length);
    typedEl.textContent = text.slice(0, n);
    cursorEl.style.opacity = lt > typeDur + 0.6 ? 0 : (Math.sin(lt * 9) > -0.2 ? 1 : 0.1);

    const slamT = bar; // strong beat: start of bar 1
    const dt = lt - slamT;
    const numEl = $('.hook-num');
    if (dt >= 0) {
      const p = clamp(dt / 0.5);
      numEl.style.opacity = eoCubic(clamp(dt / 0.12)).toFixed(4);
      numEl.style.transform = `scale(${(2.35 - 1.35 * eoExpo(p)).toFixed(4)})`;
    } else {
      numEl.style.opacity = '0';
      numEl.style.transform = 'scale(2.35)';
    }
    const ruleEl = $('.hook-rule');
    ruleEl.style.width = (dt >= 0 ? 300 * eoCubic(clamp(dt / 0.7)) : 0) + 'px';
    const subEl = $('.hook-sub');
    subEl.style.opacity = (dt >= 0 ? eoCubic(clamp((dt - 0.55) / 0.5)) * 0.65 : 0).toFixed(4);
  }

  function renderLogo(lt, t) {
    const wrap = $('.logo-wrap');
    wrap.style.opacity = eoCubic(clamp(lt / 0.3)).toFixed(4);
    wrap.style.transform = `scale(${(0.92 + 0.08 * eoBack(clamp(lt / 0.5))).toFixed(4)})`;
    logoBars.forEach((r, i) => {
      const p = clamp((lt - 0.18 - i * period * 0.5) / 0.45);
      r.style.transform = `scaleY(${Math.max(0.001, eoBack(p)).toFixed(4)})`;
    });
    logoLetters.forEach((sp, i) => {
      const p = clamp((lt - 0.55 - i * 0.035) / 0.4);
      sp.style.opacity = eoCubic(p).toFixed(4);
      sp.style.transform = `translateY(${(26 * (1 - eoCubic(p))).toFixed(2)}px)`;
    });
    const tp = clamp((lt - 2.4) / 0.5);
    logoTag.style.opacity = (eoCubic(tp) * 0.66).toFixed(4);
  }

  function renderOverview(lt, t) {
    const slot = $('.slot-overview');
    const p = clamp(lt / 0.9);
    slot.style.opacity = eoCubic(clamp(lt / 0.35)).toFixed(4);
    slot.style.transform =
      `translateY(calc(-50% + ${(70 * (1 - eoCubic(p))).toFixed(2)}px)) scale(${(0.97 + 0.03 * eoCubic(p)).toFixed(4)})`;
    const cp = eoExpo(clamp((lt - 0.4) / 1.8));
    for (const c of counts) c.el.textContent = fmt(c, c.final * cp);
  }

  function renderMontage(name) {
    const sceneEl = () => sceneEls[name];
    return (lt, t) => {
      const slot = $('.slot-' + name);
      slot.style.opacity = eoCubic(clamp(lt / 0.25)).toFixed(4);
      slot.style.transform =
        `translateY(-50%) scale(${(0.965 + 0.035 * eoCubic(clamp(lt / 0.45))).toFixed(4)})`;
    };
  }

  function renderSources(lt, t) {
    const head = $('.slot-sources .section-head');
    const hp = clamp(lt / 0.55);
    head.style.opacity = eoCubic(hp).toFixed(4);
    head.style.transform = `translateY(${(30 * (1 - eoCubic(hp))).toFixed(2)}px)`;
    const step = period / 2; // two chips per beat
    chips.forEach((chip, i) => {
      const p = clamp((lt - 0.55 - i * step) / 0.38);
      chip.style.opacity = eoCubic(p).toFixed(4);
      chip.style.transform =
        `translateY(${(26 * (1 - eoCubic(p))).toFixed(2)}px) scale(${(0.86 + 0.14 * eoBack(p)).toFixed(4)})`;
    });
  }

  function renderTray(lt, t) {
    const mb = $('.menubar');
    mb.style.opacity = eoCubic(clamp(lt / 0.3)).toFixed(4);
    const pop = $('.slot-tray');
    const p = clamp((lt - 0.3) / 0.55);
    pop.style.opacity = eoCubic(p).toFixed(4);
    pop.style.transform = `translateY(${(-26 * (1 - eoCubic(p))).toFixed(2)}px)`;
    const dot = $('.slot-tray .ta-dot');
    if (dot) {
      const k = t % period;
      dot.style.opacity = (0.5 + 0.5 * Math.exp(-k * 6)).toFixed(4);
    }
    const copy = $('.scene[data-scene="tray"] .tray-copy');
    const c2 = clamp((lt - 0.15) / 0.55);
    copy.style.opacity = eoCubic(c2).toFixed(4);
    copy.style.transform = `translateY(calc(-50% + ${(26 * (1 - eoCubic(c2))).toFixed(2)}px))`;
  }

  function renderCta(lt, t) {
    const wrap = $('.cta-wrap');
    wrap.style.opacity = eoCubic(clamp(lt / 0.25)).toFixed(4);
    ctaBars.forEach((r, i) => {
      const p = clamp((lt - 0.1 - i * period * 0.5) / 0.45);
      r.style.transform = `scaleY(${Math.max(0.001, eoBack(p)).toFixed(4)})`;
    });
    const breathe = lt > bar ? 1 + 0.01 * Math.sin(2 * Math.PI * (lt - bar) / bar) : 1;
    const ws = (0.94 + 0.06 * eoBack(clamp(lt / 0.5))) * breathe;
    wrap.style.transform = `scale(${ws.toFixed(5)})`;
    ctaLetters.forEach((sp, i) => {
      const p = clamp((lt - period * 1.2 - i * 0.035) / 0.4);
      sp.style.opacity = eoCubic(p).toFixed(4);
      sp.style.transform = `translateY(${(22 * (1 - eoCubic(p))).toFixed(2)}px)`;
    });
    const tp = clamp((lt - period * 2.1) / 0.5);
    ctaTag.style.opacity = (eoCubic(tp) * 0.66).toFixed(4);
    ctaChips.forEach((chip, i) => {
      const p = clamp((lt - period * 3 - i * period * 0.5) / 0.42);
      chip.style.opacity = eoCubic(p).toFixed(4);
      chip.style.transform = `scale(${(0.8 + 0.2 * eoBack(p)).toFixed(4)})`;
    });
    const fp = clamp((lt - period * 4.2) / 0.5);
    ctaFoot.style.opacity = (eoCubic(fp) * 0.5).toFixed(4);
  }

  /* ── master render ── */
  function render(t) {
    let active = null;
    for (const s of SCENES) {
      const on = t >= s.start && t < s.end;
      sceneEls[s.name].classList.toggle('on', on);
      if (on) active = s;
    }
    if (active) active.render(t - active.start, t);

    // cut flash
    let f = 0;
    for (const s of SCENES) {
      if (s.flash) {
        const dt = t - s.start;
        if (dt >= 0 && dt < 0.4) f = Math.max(f, Math.exp(-dt * 16) * 0.07);
      }
    }
    flashEl.style.opacity = f.toFixed(4);

    // camera punch + hook shake
    let scale = 1, dx = 0, dy = 0;
    for (const s of SCENES) {
      const dt = t - s.start;
      if (dt >= 0 && dt < 0.5) scale = Math.max(scale, 1 + 0.016 * Math.exp(-dt * 10));
    }
    const hdt = t - by.hook.start_s - bar;
    if (hdt >= 0 && hdt < 0.5) {
      dx = Math.sin(hdt * 57) * 5 * Math.exp(-hdt * 9);
      dy = Math.cos(hdt * 47) * 3.5 * Math.exp(-hdt * 9);
    }
    cameraEl.style.transform =
      `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${scale.toFixed(5)})`;

    // ending fade
    const fo = t > DUR - 1.0 ? li(clamp((t - (DUR - 1.0)) / 1.0)) : 0;
    fadeEl.style.opacity = fo.toFixed(4);
  }

  window.PROMO = { render, DUR, ready: true };

  /* Fit each window slot to the stage: the window is the hero — dead-center,
     max size (height ≤ 976 / width ≤ 1740, ~50px breathing margins).
     Some replicas declare a design height with a large EMPTY tail below the
     drawn content; crop that tail (converted back to --u design units so it
     keeps scaling) before centering. */
  function fit() {
    $$('.slot').forEach(slot => {
      const tapp = slot.querySelector('.tapp');
      if (!tapp) return;
      const tappR = tapp.getBoundingClientRect();
      if (!tappR.width) return;
      let maxBottom = 0;
      tapp.querySelectorAll('*').forEach(el => {
        const er = el.getBoundingClientRect();
        if (er.height > 0) maxBottom = Math.max(maxBottom, er.bottom - tappR.top);
      });
      const dwM = (tapp.getAttribute('style') || '').match(/--dw:\s*([\d.]+)/);
      const u = tappR.width / (dwM ? parseFloat(dwM[1]) : 1280);
      if (tappR.height - maxBottom > 80) {
        tapp.style.height = `calc(${(maxBottom / u + 10).toFixed(1)} * var(--u))`;
      }
      const r = slot.getBoundingClientRect();
      const ratio = r.height / r.width;
      const w = Math.min(1740, 976 / ratio, r.width);
      slot.style.width = w.toFixed(1) + 'px';
      slot.style.marginLeft = (-w / 2).toFixed(1) + 'px';
      slot.style.height = '';
    });
  }
  fit();
  window.PROMO.fit = fit;

  // browser preview
  if (location.search.includes('preview')) {
    let start = performance.now(), paused = false, pausedAt = 0;
    const loop = now => {
      if (!paused) {
        const t = ((now - start) / 1000) % DUR;
        render(t);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    addEventListener('keydown', e => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!paused) { paused = true; pausedAt = performance.now(); }
        else { paused = false; start += performance.now() - pausedAt; }
      }
    });
    addEventListener('click', () => { start = performance.now(); paused = false; });
  } else {
    render(0);
  }
})();
