/* ZETA//MIRROR · 临界之镜: the functional-equation mirror Re(s) = 1/2 and the prime shadow Gz(x) − ln 2π, in two scenes.
     mirror  the s-plane, Re(s) ∈ [−4.5, 1.4] (compressed left of an axis break at −1/2), Im(s) ∈ [−3, 18]: the critical
             strip 0 < Re(s) < 1, the critical line
             Re(s) = 1/2, the trivial zeros −2, −4, the pole s = 1, the first zero 1/2 + 14.1347i, the zeros 2πki/ln p of the
             extra Euler factors 1 − p^(−s) (p = 2, 3, 5) on Re(s) = 0, and a would-be zero ρ = σ + it (drag it) with its
             mirror image 1 − ρ̄ = (1 − σ) + it. The rail is the height h of a scan line climbing from Im(s) = −3 to 18:
             when it reaches ρ, the twin flies across the critical line.
     landau  the prime shadow Gz(x) − ln 2π for 2 ≤ x ≤ 120, computed term by term from the von Mangoldt function Λ(n),
             Sz(x) = Σ_{n ≤ x} Λ(n)(x/n − 1) and Gz(x) = Sz(x) − x ln x + (1 + γ)x; the barrier ±0.05√x; and the MODEL wave
             −2 Re(x^ρ/(ρ(ρ − 1))) of one pair of zeros, ρ taken as the right-hand one of ρ and its twin. The rail is x.
   Colours: green = the critical line (Lean: every nontrivial zero lies on it) and the barrier of the Landau criterion,
   cyan = the critical strip and the real prime shadow, magenta = the twin and the MODEL wave, violet = Re(s) = 0 and the
   Euler-factor zeros, amber = the current zero ρ, the scan line and the current x. Read-only probe: MIRROR_DEBUG. */
(() => {
  'use strict';
  const { kit, L } = TRV, { fix, clamp } = kit, P = TRV.palette;
  const $ = (id) => document.getElementById(id);

  /* ---------- constants ---------- */
  const GAMMA = 0.5772156649015329, LN2PI = Math.log(2 * Math.PI), NMAX = 120, X0 = 2, X1 = 120, BAR = 0.05;
  const S_MIN = 0.05, S_MAX = 0.98, T_MIN = 2, T_MAX = 17, ON = 0.004;
  const RE = [-4.5, 1.4], IM = [-3, 18], RE_MINI = [-0.8, 1.4], H0 = IM[0], H1 = IM[1];
  const RHO1 = 14.134725141734693;                    // the first nontrivial zero 1/2 + 14.1347…i
  /* Left of Re(s) = −1/2 the plane is drawn SQ times as wide (an axis break marks it), so that the critical strip, where
     the mirror acts, gets the room; right of the break the plane keeps one scale and the mirror is drawn to scale. */
  const BRK = -0.5, SQ = 0.32;
  const u = (re) => (re >= BRK ? re : BRK + (re - BRK) * SQ), unU = (v) => (v >= BRK ? v : BRK + (v - BRK) / SQ);
  const URE = [u(RE[0]), u(RE[1])], URE_MINI = [u(RE_MINI[0]), u(RE_MINI[1])];
  const PRIMES = [2, 3, 5];

  /* ---------- the prime shadow: Λ(n), Sz(x), Gz(x) ---------- */
  /** Λ(n) = ln p when n is a power of a prime p, else 0 (trial division by the least prime factor). */
  const LAM = new Float64Array(NMAX + 1);
  for (let n = 2; n <= NMAX; n++) { let p = 2; while (n % p) p++; let m = n; while (m % p === 0) m /= p; LAM[n] = m === 1 ? Math.log(p) : 0; }
  /** Sz(x) = Σ_{1 ≤ n ≤ x} Λ(n)(x/n − 1), summed term by term as in Formalism/StatementOC.lean. */
  function Sz(x) { let s = 0; const top = Math.min(NMAX, Math.floor(x)); for (let n = 2; n <= top; n++) if (LAM[n]) s += LAM[n] * (x / n - 1); return s; }
  const Gz = (x) => Sz(x) - x * Math.log(x) + (1 + GAMMA) * x;
  const shadow = (x) => Gz(x) - LN2PI;
  /* sample grid x = 2, 2.05, …, 120 (x = (40 + i)/20, so the integers are hit exactly) */
  const NX = (X1 - X0) * 20 + 1, XS = new Float64Array(NX), SH = new Float64Array(NX);
  let worst = 0, worstAt = X0, shMax = 0;
  for (let i = 0; i < NX; i++) {
    const x = (40 + i) / 20; XS[i] = x; SH[i] = shadow(x);
    const r = Math.abs(SH[i]) / (BAR * Math.sqrt(x)); if (r > worst) { worst = r; worstAt = x; }
    shMax = Math.max(shMax, Math.abs(SH[i]));
  }
  const SHADOW = { worst, worstAt, inside: worst <= 1, max: shMax };

  /** −2 Re(x^ρ / (ρ(ρ − 1))) for ρ = a + it: one pair ρ, ρ̄ of the explicit formula. */
  function wave(x, a, t) {
    const lx = Math.log(x), m = Math.exp(a * lx), c = m * Math.cos(t * lx), s = m * Math.sin(t * lx);   // x^ρ = c + is
    const dr = a * (a - 1) - t * t, di = t * (2 * a - 1);                                                  // ρ(ρ − 1) = dr + i·di
    return -2 * (c * dr + s * di) / (dr * dr + di * di);
  }
  const rightRe = () => Math.max(S.sigma, 1 - S.sigma);
  const waves = new Map();
  /** The wave of the current pair on the grid, its largest swing and where it first leaves ±0.05√x (bisection). */
  function rogue() {
    const a = rightRe(), t = S.t, key = `${a.toFixed(6)}|${t.toFixed(6)}`;
    let R = waves.get(key);
    if (R) return R;
    const w = new Float64Array(NX); let max = 0, maxAt = X0, ratio = 0, first = -1;
    for (let i = 0; i < NX; i++) {
      const v = wave(XS[i], a, t), m = Math.abs(v), r = m / (BAR * Math.sqrt(XS[i]));
      w[i] = v; if (m > max) { max = m; maxAt = XS[i]; } if (r > ratio) ratio = r; if (first < 0 && r > 1) first = i;
    }
    let burst = null;
    if (first === 0) burst = X0;
    else if (first > 0) {
      const f = (x) => Math.abs(wave(x, a, t)) - BAR * Math.sqrt(x);
      let lo = XS[first - 1], hi = XS[first];
      for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (f(mid) > 0) hi = mid; else lo = mid; }
      burst = hi;
    }
    R = { a, t, w, max, maxAt, ratio, burst, at120: wave(X1, a, t) };
    if (waves.size > 500) waves.clear();
    waves.set(key, R);
    return R;
  }

  /* ---------- the extra Euler factors 1 − p^(−s): zeros s = 2πki / ln p on Re(s) = 0 ---------- */
  const IMPOSTORS = [];
  for (const p of PRIMES) {
    const d = 2 * Math.PI / Math.log(p);
    for (let k = Math.ceil(IM[0] / d) + 0; k * d <= IM[1] + 1e-12; k++) IMPOSTORS.push({ p, k, re: 0, im: k * d });   // + 0: no −0
  }
  /** |1 − p^(−s)| at s = re + i·im. */
  const factorAbs = (p, re, im) => { const m = Math.pow(p, -re), ph = -im * Math.log(p); return Math.hypot(1 - m * Math.cos(ph), -m * Math.sin(ph)); };
  const IMP_OK = IMPOSTORS.every((z) => factorAbs(z.p, z.re, z.im) < 1e-9);
  const IMP_IN_STRIP = IMPOSTORS.filter((z) => z.re > 0 && z.re < 1).length;

  /* ---------- state ---------- */
  const S = { scene: 'mirror', sigma: 0.76, t: 10 };
  let geo = {}, booting = true, tw = null;
  const SC = { mirror: { max: H1 - H0, rate: 4.2, step: 1 }, landau: { max: X1 - X0, rate: 23.6, step: 2 } };
  const scanH = () => H0 + clock.t, curX = () => X0 + clock.t;
  const onLine = () => Math.abs(S.sigma - 0.5) < ON;
  const focus = () => cards.current === 'imprimitive';
  /** How far the twin has flown from ρ to 1 − ρ̄ (0 … 1): it leaves when the scan line reaches the height of ρ. */
  const flyAt = (h) => (h == null ? 1 : TRV.smooth(clamp((h - S.t) / 0.9, 0, 1)));
  const scanning = () => S.scene === 'mirror' && clock.t < clock.max - 1e-9;

  /* ---------- formatting ---------- */
  const trimmed = (v) => fix(v, 2).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  const fmtZ = (a, b) => `${trimmed(a)} + ${trimmed(b)}i`;
  const OB = '<span class="ob">ρ</span>';
  const face = (f) => (f === 'body' ? TRV.fonts.body : f === 'display' ? TRV.fonts.display : TRV.fonts.data);
  const runsOf = (parts) => (Array.isArray(parts) ? parts : [parts]).map((p) => (typeof p === 'string' ? { t: p } : p));
  function widths(ctx, runs, size, o) {
    return runs.map((r) => { ctx.font = `${o.weight ? o.weight + ' ' : ''}${r.sub || r.sup ? size * 0.74 : size}px ${face(o.face)}`; return ctx.measureText(r.t).width; });
  }
  /** Canvas text with a dark halo; runs may carry { bar: true } (an overline, for ρ̄), { sub: true } or { sup: true }. */
  function ink(ctx, x, y, runs, ws, size, color, o) {
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    const font = (r) => `${o.weight ? o.weight + ' ' : ''}${r.sub || r.sup ? size * 0.74 : size}px ${face(o.face)}`, dy = (r) => (r.sub ? size * 0.3 : r.sup ? -size * 0.34 : 0);
    ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = P.stage;
    let cx = x; runs.forEach((r, i) => { ctx.font = font(r); ctx.strokeText(r.t, cx, y + dy(r)); cx += ws[i]; });
    ctx.fillStyle = color; cx = x;
    runs.forEach((r, i) => {
      ctx.font = font(r); ctx.fillText(r.t, cx, y + dy(r));
      if (r.bar) ctx.fillRect(cx + ws[i] * 0.12, y - size * 0.56, ws[i] * 0.76, Math.max(1, size * 0.08));
      cx += ws[i];
    });
    ctx.globalAlpha = 1;
  }
  /** Labels placed at the first candidate offset whose box lies in `area` and clear of everything placed or blocked. */
  function labeller(ctx, area) {
    const boxes = [];
    const meets = (b) => boxes.some((q) => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h);
    const inside = (b) => b.x >= area.x && b.y >= area.y && b.x + b.w <= area.x + area.w && b.y + b.h <= area.y + area.h;
    return {
      block(x, y, r) { boxes.push({ x: x - r, y: y - r, w: 2 * r, h: 2 * r }); },
      put(px, py, parts, color, o, cands) {
        o = o || {};
        const size = o.size || 11, runs = runsOf(parts), ws = widths(ctx, runs, size, o), w = ws.reduce((s, v) => s + v, 0), h = size + 5;
        const box = ([dx, dy, al]) => ({ x: (al === 'right' ? px + dx - w : al === 'center' ? px + dx - w / 2 : px + dx) - 2, y: py + dy - h / 2, w: w + 4, h });
        const list = cands || [[8, 0, 'left']];
        let b = null;
        for (const c of list) { const q = box(c); if (inside(q) && !meets(q)) { b = q; break; } }
        if (!b) {
          if (o.optional) return null;
          b = box(list[0]); b.x = clamp(b.x, area.x, area.x + area.w - b.w); b.y = clamp(b.y, area.y, area.y + area.h - b.h);
        }
        boxes.push(b);
        ink(ctx, b.x + 2, b.y + h / 2, runs, ws, size, color, o);
        return b;
      }
    };
  }

  /* ---------- scene: the critical mirror ---------- */
  /** Marker of an Euler-factor zero: a square for p = 2, a diamond for 3, a triangle for 5. */
  function marker(ctx, x, y, p, r) {
    ctx.beginPath();
    if (p === 2) ctx.rect(x - r * 0.8, y - r * 0.8, r * 1.6, r * 1.6);
    else if (p === 3) { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); }
    else { ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.95, y + r * 0.7); ctx.lineTo(x - r * 0.95, y + r * 0.7); ctx.closePath(); }
    ctx.fill();
  }
  /** The s-plane on g (kit.plot over u(Re s) × Im s). o: h (scan height, null: none), k (line scale), words, focus. */
  function drawPlane(g, o) {
    const ctx = g.ctx, k = o.k || 1, h = o.h == null ? Infinity : o.h, lit = (y) => (y <= h + 1e-9 ? 1 : 0.22);
    const fly = flyAt(o.h == null ? null : o.h), on = onLine(), twinX = S.sigma + fly * (1 - 2 * S.sigma);
    const area = { x: g.pl, y: g.pt, w: g.iw, h: g.ih }, lab = o.words ? labeller(ctx, area) : null;
    ctx.save(); ctx.beginPath(); ctx.rect(g.pl - 1, g.pt - 1, g.iw + 2, g.ih + 2); ctx.clip();
    // the critical strip, a light grid, the real axis
    g.rect(0, IM[0], 1, IM[1], P.cyan, { alpha: 0.08 });
    g.vline(1, P.cyan, { alpha: 0.35, width: k });
    for (const y of [5, 10, 15]) g.hline(y, P.panelEdge, { alpha: 0.8 });
    for (const x of [-4, -3, -2, -1]) g.vline(u(x), P.panelEdge, { alpha: 0.5 });
    g.hline(0, P.lineHot, { width: 1.2 * k });
    // Re(s) = 0: the dashed violet line of the Euler-factor zeros
    g.vline(0, P.violet, { dash: [6 * k, 5 * k], width: (o.focus ? 1.8 : 1.3) * k, alpha: o.focus ? 0.95 : 0.6 });
    // the critical line Re(s) = 1/2
    g.line([[0.5, IM[0]], [0.5, IM[1]]], P.ok, { width: 2.2 * k, glow: 8 * k });
    // trivial zeros, the pole, the first zero
    for (const x of [-2, -4]) g.dot(u(x), 0, P.ink, 4.5 * k, { ring: true, width: 1.6 * k, alpha: 0.9 * lit(0) });
    if (g.x0 < BRK) {   // the axis break: two short slanted strokes across the real axis and along the bottom edge
      ctx.strokeStyle = P.dim; ctx.lineWidth = 1.2 * k; ctx.globalAlpha = 0.9;
      for (const py of [g.Y(0), g.pt + g.ih]) for (const d of [-3, 3]) { const px = g.X(BRK) + d * k; ctx.beginPath(); ctx.moveTo(px - 3 * k, py + 5 * k); ctx.lineTo(px + 3 * k, py - 5 * k); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    { const px = g.X(1), py = g.Y(0), r = 5 * k; ctx.strokeStyle = P.ink; ctx.lineWidth = 1.8 * k; ctx.globalAlpha = 0.9 * lit(0); ctx.beginPath(); ctx.moveTo(px - r, py - r); ctx.lineTo(px + r, py + r); ctx.moveTo(px + r, py - r); ctx.lineTo(px - r, py + r); ctx.stroke(); ctx.globalAlpha = 1; }
    g.dot(0.5, RHO1, P.ok, 4.2 * k, { ring: true, width: 1.8 * k, alpha: lit(RHO1) });
    // the zeros 2πki / ln p of the extra Euler factors
    for (const z of IMPOSTORS) {
      ctx.fillStyle = P.violet; ctx.globalAlpha = lit(z.im) * (o.focus ? 1 : 0.75);
      if (o.focus) { ctx.shadowColor = P.violet; ctx.shadowBlur = 10 * k; }
      marker(ctx, g.X(0), g.Y(z.im), z.p, (o.focus ? 5.2 : 3.8) * k);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    // the scan line
    if (o.h != null && o.h < H1 - 1e-9) g.hline(o.h, P.amber, { alpha: 0.6, width: 1.2 * k });
    // ρ, its twin, the dashed mirror vector
    const fixedPoint = [0.5, S.t];
    if (!on && fly > 0) {
      g.arrow([S.sigma, S.t], [twinX, S.t], { color: P.magenta, width: 1.6 * k, dash: [5 * k, 4 * k], alpha: 0.9, headSize: 9 * k });
      g.dot(fixedPoint[0], fixedPoint[1], P.ok, 3 * k);
      g.dot(twinX, S.t, P.magenta, 5.6 * k, { glow: 10 * k, alpha: 0.35 + 0.65 * fly });
    }
    g.dot(S.sigma, S.t, P.amber, 6.4 * k, { glow: 12 * k });
    if (on && fly > 0) g.dot(S.sigma, S.t, P.ok, 11 * k, { ring: true, width: 2 * k, alpha: fly });
    ctx.restore();
    if (!lab) return { g, twinX, fly };

    // words: markers first, so that no label sits on a mark
    lab.block(g.X(S.sigma), g.Y(S.t), 11); lab.block(g.X(twinX), g.Y(S.t), 9); lab.block(g.X(0.5), g.Y(RHO1), 7);
    for (const x of [-2, -4, 1]) lab.block(g.X(u(x)), g.Y(0), 8);
    for (const z of IMPOSTORS) lab.block(g.X(0), g.Y(z.im), o.focus ? 7 : 5);
    const px = g.X(S.sigma), py = g.Y(S.t), left = twinX < S.sigma - 1e-9, right = twinX > S.sigma + 1e-9;
    const away = right ? [[-12, -13, 'right'], [-12, 13, 'right'], [0, -20, 'center'], [12, -13, 'left']] : [[12, -13, 'left'], [12, 13, 'left'], [0, -20, 'center'], [-12, -13, 'right']];
    lab.put(px, py, on && fly > 0 ? ['ρ = 1 − ', { t: 'ρ', bar: true }] : ['ρ'], P.amber, { size: 13, weight: 600 }, away);
    if (!on && fly > 0.5) {
      const tx = g.X(twinX), toward = left ? [[-11, -13, 'right'], [-11, 13, 'right'], [0, 20, 'center'], [11, 13, 'left']] : [[11, -13, 'left'], [11, 13, 'left'], [0, 20, 'center'], [-11, 13, 'right']];
      lab.put(tx, py, ['1 − ', { t: 'ρ', bar: true }], P.magenta, { size: 12, weight: 600 }, toward);
    }
    lab.put(g.X(0.5), g.Y(RHO1), ['ρ', { t: '1', sub: true }, ' ≈ ½ + 14.13i'], P.ok, { size: 10.5, alpha: lit(RHO1), optional: true }, [[-9, -11, 'right'], [9, -11, 'left'], [9, 11, 'left'], [-9, 11, 'right']]);
    lab.put(g.X(0.5), g.pt + 9, 'Re(s) = 1/2', P.ok, { size: 10.5, optional: true }, [[7, 0, 'left'], [-7, 0, 'right'], [7, 16, 'left']]);
    lab.put(g.X(0), g.pt + 9, 'Re(s) = 0', P.violet, { size: 10.5, optional: true }, [[-7, 0, 'right'], [-7, 16, 'right']]);
    lab.put(g.X(u(-3)), g.Y(0), L('平凡零点', 'trivial zeros'), P.dim, { size: 10.5, face: 'body', optional: true, alpha: lit(0) }, [[0, -14, 'center'], [0, 14, 'center']]);
    lab.put(g.X(1), g.Y(0), L('极点 s = 1', 'pole s = 1'), P.dim, { size: 10.5, face: 'body', optional: true, alpha: lit(0) }, [[-7, -18, 'right'], [-7, 18, 'right'], [9, -18, 'left'], [0, -20, 'center']]);
    lab.put(g.pl + 4, g.pt + 9, 'Im(s) ↑', P.dim, { size: 10, optional: true }, [[0, 0, 'left'], [0, 16, 'left']]);
    if (o.focus) {
      lab.put(g.X(0), g.Y(17.157), ['1 − p', { t: '−s', sup: true }, ' = 0'], P.violet, { size: 11, optional: true }, [[-12, -14, 'right'], [-12, 0, 'right'], [-12, 14, 'right']]);
      for (const p of PRIMES) {
        const z = IMPOSTORS.find((q) => q.p === p && q.k === 1);
        if (z) lab.put(g.X(0), g.Y(z.im), `p = ${p}`, P.violet, { size: 10.5, optional: true, alpha: lit(z.im) }, [[-11, 0, 'right'], [-11, -9, 'right'], [-11, 9, 'right']]);
      }
    }
    if (o.h != null && o.h < H1 - 1e-9) lab.put(g.pl + 4, g.Y(o.h), `Im(s) = ${fix(o.h, 1)}`, P.amber, { size: 10.5, optional: true }, [[0, -10, 'left'], [0, 10, 'left']]);
    // ticks
    const tick = (s, x, y, al, base) => { ctx.font = `10px ${face()}`; ctx.fillStyle = P.dim; ctx.textAlign = al; ctx.textBaseline = base; ctx.fillText(s, x, y); };
    for (const [v, s] of [[-4, '−4'], [-2, '−2'], [0, '0'], [0.5, '½'], [1, '1']]) tick(s, g.X(u(v)), g.pt + g.ih + 4, 'center', 'top');
    for (const v of [0, 5, 10, 15]) tick(String(v), g.pl - 6, g.Y(v), 'right', 'middle');
    ctx.font = `10px ${face()}`;
    if (g.pl + g.iw - ctx.measureText('Re(s)').width > g.X(1) + 10) tick('Re(s)', g.pl + g.iw, g.pt + g.ih + 4, 'right', 'top');
    return { g, twinX, fly };
  }

  /* ---------- scene: the prime shadow and the Landau trap ---------- */
  const yRange = (R) => Math.max(0.8, 1.12 * Math.max(R.max, SHADOW.max, BAR * Math.sqrt(X1)));
  /** Gz(x) − ln 2π, the barrier ±0.05√x and the MODEL wave on g (kit.plot over [2, 120]). o: upto (x), k, words, axes. */
  function drawShadow(g, o) {
    const ctx = g.ctx, k = o.k || 1, R = rogue(), upto = clamp(o.upto, X0, X1), n = Math.round((upto - X0) * 20);
    const ym = g.y1, ticks = ym >= 2 ? [-Math.floor(ym), 0, Math.floor(ym)] : [-0.5, 0, 0.5];
    if (o.axes !== false) g.axes({ yTicks: ticks.map((v) => [v, fix(v, ym >= 2 ? 0 : 1)]), xTicks: o.mini ? [2, 60, 120] : [2, 20, 40, 60, 80, 100, 120], xLabel: o.words ? 'x' : '' });
    ctx.save(); ctx.beginPath(); ctx.rect(g.pl, g.pt - 1, g.iw + 1, g.ih + 2); ctx.clip();
    g.hline(0, P.lineHot, { width: k });
    const env = [], envDn = [], sh = [], wv = [], out = [];
    for (let i = 0; i < NX; i++) { const x = XS[i], b = BAR * Math.sqrt(x); env.push([x, b]); envDn.push([x, -b]); }
    for (let i = 0; i <= n; i++) {
      const x = XS[i], b = BAR * Math.sqrt(x), v = R.w[i];
      sh.push([x, SH[i]]); wv.push([x, v]); out.push(Math.abs(v) > b ? [x, v] : null);
    }
    g.line(env, P.ok, { dash: [6 * k, 4 * k], width: 1.5 * k, alpha: 0.9 }); g.line(envDn, P.ok, { dash: [6 * k, 4 * k], width: 1.5 * k, alpha: 0.9 });
    g.line(wv, P.magenta, { width: 1.3 * k, alpha: 0.7 });
    // where the wave is outside the barrier: bold (a run of one sample is joined to its neighbours)
    for (let i = 1; i < out.length; i++) if (out[i] && !out[i - 1]) out[i - 1] = [XS[i - 1], R.w[i - 1]];
    g.line(out, P.magenta, { width: 2.8 * k, glow: 10 * k });
    g.line(sh, P.cyan, { width: 2 * k, glow: 6 * k });
    if (R.burst != null && R.burst <= upto) g.dot(R.burst, wave(R.burst, R.a, R.t), P.magenta, 7 * k, { ring: true, width: 2 * k });
    // the current x
    if (!o.mini) {
      g.vline(upto, P.amber, { alpha: 0.7, width: k });
      g.dot(upto, shadow(upto), P.amber, 4.5 * k, { glow: 10 * k });
      g.dot(upto, wave(upto, R.a, R.t), P.amber, 4.5 * k, { glow: 10 * k });
    }
    ctx.restore();
    if (!o.words) return { g, R };
    const lab = labeller(ctx, { x: g.pl, y: g.pt, w: g.iw, h: g.ih });
    lab.block(g.X(upto), g.Y(shadow(upto)), 8); lab.block(g.X(upto), g.Y(wave(upto, R.a, R.t)), 8);
    if (R.burst != null && R.burst <= upto) {
      const bx = g.X(R.burst), by = g.Y(wave(R.burst, R.a, R.t)), up = wave(R.burst, R.a, R.t) > 0;
      lab.block(bx, by, 9);
      lab.put(bx, by, `x ≈ ${fix(R.burst, 2)}`, P.magenta, { size: 11, weight: 600 }, up ? [[0, -17, 'center'], [10, -12, 'left'], [-10, -12, 'right']] : [[0, 17, 'center'], [10, 12, 'left'], [-10, 12, 'right']]);
    }
    const xl = Math.min(upto, 104), il = Math.round((xl - X0) * 20);
    lab.put(g.X(xl), g.Y(SH[il]), ['G', { t: 'z', sub: true }, '(x) − ln 2π'], P.cyan, { size: 11, optional: true }, [[0, -15, 'center'], [0, 15, 'center'], [-8, -15, 'right'], [-8, 15, 'right']]);
    lab.put(g.X(24), g.Y(BAR * Math.sqrt(24)), '+0.05√x', P.ok, { size: 10.5, optional: true }, [[0, -11, 'center'], [0, 11, 'center']]);
    lab.put(g.X(24), g.Y(-BAR * Math.sqrt(24)), '−0.05√x', P.ok, { size: 10.5, optional: true }, [[0, 11, 'center'], [0, -11, 'center']]);
    let im = -1;   // the largest swing of the wave between x = 14 and 12 short of the cursor: room on both sides for a label
    for (let i = 12 * 20; i <= n - 12 * 20; i++) if (im < 0 || Math.abs(R.w[i]) > Math.abs(R.w[im])) im = i;
    if (im >= 0) {
      const mx = XS[im], my = R.w[im], s = my >= 0 ? -1 : 1;
      lab.block(g.X(mx), g.Y(my), 6);
      lab.put(g.X(mx), g.Y(my), `MODEL · σ = ${fix(R.a, 2)}`, P.magenta, { size: 10.5, optional: true }, [[0, 17 * s, 'center'], [-10, 15 * s, 'right'], [10, 15 * s, 'left'], [0, -17 * s, 'center']]);
    }
    return { g, R };
  }

  /* ---------- the stage ---------- */
  function hudBand() {
    const st = $('stage').getBoundingClientRect(), below = (el) => (el ? el.getBoundingClientRect().bottom - st.top : 0);
    TRV.hudFit();
    return { top: Math.max(40, below($('hudBig').parentElement), below($('sceneChips'))) + 8, bottom: Math.max(16, $('legend').offsetHeight + 18) };
  }
  function drawCover(cv) {
    const g0 = kit.plot(cv, { x: [0, 1], y: [0, 1], pad: [0, 0, 0, 0] }), W = g0.W, H = g0.H, ctx = g0.ctx;
    const glow = ctx.createRadialGradient(W * 0.28, H * 0.5, 0, W * 0.28, H * 0.5, W * 0.5);
    glow.addColorStop(0, TRV.alpha(P.ok, 0.07)); glow.addColorStop(1, TRV.alpha(P.ok, 0)); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    const gl = kit.plot(cv, { x: [u(-1.6), u(1.4)], y: IM, pad: [W * 0.05, W * 0.56, H * 0.07, H * 0.07], clear: false });
    drawPlane(gl, { h: null, k: 2, words: false, focus: true });
    const R = rogue(), ym = yRange(R);
    const gr = kit.plot(cv, { x: [X0, X1], y: [-ym, ym], pad: [W * 0.5, W * 0.04, H * 0.12, H * 0.12], clear: false });
    drawShadow(gr, { upto: X1, k: 2, words: false, axes: false, mini: true });
  }
  function drawStage() {
    const cv = $('cv');
    if (TRV.thumbMode) { geo = {}; drawCover(cv); return; }
    const band = hudBand();
    if (S.scene === 'mirror') {
      const g = kit.plot(cv, { x: URE, y: IM, pad: [30, 12, band.top, band.bottom + 16] });
      geo = { scene: 'mirror', ...drawPlane(g, { h: scanning() ? scanH() : null, k: 1, words: true, focus: focus() }) };
    } else {
      const ym = yRange(rogue()), g = kit.plot(cv, { x: [X0, X1], y: [-ym, ym], pad: [40, 14, band.top, band.bottom + 16] });
      geo = { scene: 'landau', ...drawShadow(g, { upto: curX(), k: 1, words: true }) };
    }
  }

  /* ---------- the strip: the other scene, small ---------- */
  function drawPlots() {
    if (TRV.still || TRV.figure) return;
    const cv = $('plot'), R = rogue();
    if (S.scene === 'mirror') {
      const ym = yRange(R), g = kit.plot(cv, { x: [X0, X1], y: [-ym, ym], pad: [34, 10, 8, 18] });
      drawShadow(g, { upto: X1, k: 0.8, words: false, mini: true });
      $('pTitle').textContent = L('素数影子：这枚 ρ 的波冲出 √x 了吗', 'Prime shadow: does the wave of this ρ break √x?');
      $('pMeta').textContent = R.burst == null ? L('x ≤ 120 内没有冲出', 'stays inside for x ≤ 120') : L(`在 x ≈ ${fix(R.burst, 2)} 冲出`, `breaks out near x ≈ ${fix(R.burst, 2)}`);
    } else {
      const g = kit.plot(cv, { x: URE_MINI, y: IM, pad: [8, 8, 6, 6] });
      drawPlane(g, { h: null, k: 0.75, words: false, focus: focus() });
      $('pTitle').textContent = L('临界带：ρ 与它的镜像', 'Critical strip: ρ and its mirror image');
      $('pMeta').textContent = `ρ = ${fmtZ(S.sigma, S.t)}`;
    }
  }

  /* ---------- words: HUD, legend, readouts, pills ---------- */
  const LEGEND = {
    mirror: [['ok', '临界线 Re(s) = 1/2', 'critical line Re(s) = 1/2'], ['am', 'ρ（可拖动）', 'ρ (drag it)'], ['mg', `孪生 1 − ${OB}`, `twin 1 − ${OB}`], ['vi', '欧拉因子零点', 'Euler-factor zeros']],
    landau: [['cy', 'G<sub>z</sub>(x) − ln 2π', 'G<sub>z</sub>(x) − ln 2π'], ['ok', '屏障 ±0.05√x', 'barrier ±0.05√x'], ['mg', '假想零点的波（MODEL）', 'wave of a would-be zero (MODEL)'], ['am', '当前 x', 'current x']]
  };
  function drawText() {
    const R = rogue(), on = onLine(), sig = S.sigma, t = S.t, gap = Math.abs(1 - 2 * sig);
    let big, sub, note;
    if (S.scene === 'mirror') {
      const h = scanH();
      big = L(`临界之镜 · ρ ↔ 1 − ${OB}`, `Critical mirror · ρ ↔ 1 − ${OB}`);
      if (focus()) sub = L(`${IMPOSTORS.length} 个欧拉因子零点全在 Re(s) = 0 上，临界带内 ${IMP_IN_STRIP} 个`, `all ${IMPOSTORS.length} Euler-factor zeros sit on Re(s) = 0; ${IMP_IN_STRIP} inside the critical strip`);
      else if (scanning() && h < t) sub = L(`扫描线升到 Im(s) = ${fix(h, 1)}，还没碰到 ρ`, `the scan line is at Im(s) = ${fix(h, 1)} and has not reached ρ yet`);
      else if (on) sub = L('σ = 1/2：镜像落回 ρ 自己，临界线是镜子唯一不动的地方', 'σ = 1/2: the image falls back on ρ; the critical line is the only place the mirror leaves fixed');
      else sub = L(`σ = ${fix(sig, 2)}：孪生落在 Re(s) = ${fix(1 - sig, 2)}，隔着绿线相距 ${fix(gap, 2)}`, `σ = ${fix(sig, 2)}: the twin lands on Re(s) = ${fix(1 - sig, 2)}, ${fix(gap, 2)} away across the green line`);
      note = L('镜子把 σ 换成 1 − σ，高度 t 不变；只有 σ = 1/2 原地不动。时间轴是扫描线的高度。', 'The mirror turns σ into 1 − σ and keeps the height t; only σ = 1/2 stays put. The rail is the height of the scan line.');
    } else {
      const x = curX();
      big = L(`素数影子 · x ≤ ${fix(x, 0)}`, `Prime shadow · x ≤ ${fix(x, 0)}`);
      if (R.burst == null) sub = L(`σ = ${fix(R.a, 2)} 的波在 x ≤ 120 内始终在 ±0.05√x 之内`, `the wave of σ = ${fix(R.a, 2)} stays inside ±0.05√x for x ≤ 120`);
      else if (x < R.burst) sub = L(`青色在屏障内；品红波将在 x ≈ ${fix(R.burst, 2)} 冲出`, `cyan stays inside; the magenta wave will break out near x ≈ ${fix(R.burst, 2)}`);
      else sub = L(`品红波在 x ≈ ${fix(R.burst, 2)} 冲出 ±0.05√x；青色仍在里面`, `the magenta wave breaks ±0.05√x near x ≈ ${fix(R.burst, 2)}; cyan stays inside`);
      note = L('青色由 Λ(n) 逐项算出；品红只是一对假想零点的一项（MODEL）。时间轴是 x。', 'Cyan is computed term by term from Λ(n); magenta is just the term of one pair of would-be zeros (MODEL). The rail is x.');
    }
    if ($('hudBig')._h !== big) { $('hudBig').innerHTML = big; $('hudBig')._h = big; }
    $('hudSub').textContent = sub; $('roNote').textContent = note;
    const leg = LEGEND[S.scene].map(([cl, zh, en]) => `<span><i class="sw ${cl}"></i>${L(zh, en)}</span>`).join('');
    if ($('legend')._h !== leg) { $('legend').innerHTML = leg; $('legend')._h = leg; }
    $('roPair').innerHTML = `<span class="c-am">${fmtZ(sig, t)}</span> ↔ <span class="${on ? '' : 'c-mg'}">${fmtZ(1 - sig, t)}</span>`;
    $('roPairSub').innerHTML = on ? L('重合：ρ 就是自己的镜像', 'they coincide: ρ is its own image')
      : `${L('实部之和', 'real parts add up to')} ${fix(sig, 2)} + ${fix(1 - sig, 2)} = 1 <span class="nummark">✓</span>`;
    $('roDist').textContent = fix(Math.abs(sig - 0.5), 2);
    $('roAmp').innerHTML = `${fix(R.max, 3)} <small>x ≈ ${fix(R.maxAt, 1)}</small>`;
    $('roEnv').innerHTML = `${fix(BAR * Math.sqrt(X1), 3)} <small>${L('青色 G<sub>z</sub>(x) − ln 2π 全程在内', 'cyan G<sub>z</sub>(x) − ln 2π stays inside')} <span class="nummark">${SHADOW.inside ? '✓' : '✗'}</span></small>`;
    $('roBurst').innerHTML = R.burst == null ? `${L('x ≤ 120 内没有冲出', 'not for x ≤ 120')} <span class="nummark">✓</span>`
      : `<span class="c-mg">x ≈ ${fix(R.burst, 2)}</span> <small>${L('之后 |波| > 0.05√x', 'beyond it |wave| > 0.05√x')}</small>`;
    $('roImp').innerHTML = `${IMPOSTORS.length} ${L('个，全在 Re(s) = 0 上；带内', 'zeros, all on Re(s) = 0; inside the strip')} ${IMP_IN_STRIP} <span class="nummark">${IMP_OK && IMP_IN_STRIP === 0 ? '✓' : '✗'}</span>`;
    $('pillRho').querySelector('strong').textContent = fmtZ(sig, t);
    $('pillTwin').querySelector('strong').textContent = fmtZ(1 - sig, t);
  }

  const paint = kit.painter(() => { drawText(); drawStage(); drawPlots(); }, [$('stage'), $('plot')]);

  /* ---------- the rail and the scenes ---------- */
  const clock = kit.clock({
    range: $('now'), play: $('play'), label: $('tau'), speeds: $('speedChips'), max: SC.mirror.max, t: SC.mirror.max, rate: SC.mirror.rate, step: 1,
    // the label is first drawn while the clock is being built: it reads t and the page state, never the clock itself
    format: (t) => (S.scene === 'mirror' ? `Im = ${fix(H0 + t, 1)} <small>/ ${H1}</small>` : `x = ${fix(X0 + t, 1)} <small>/ ${X1}</small>`),
    onChange: () => paint()
  });
  const sceneChips = kit.chips($('sceneChips'), 'scene', (v) => { leave(); setScene(v); });
  function setScene(sc, t) {
    S.scene = sc; sceneChips.set(sc, true); $('stage').dataset.scene = sc;
    const c = SC[sc];
    clock.pause(); clock.rate = c.rate; clock.step = c.step; clock.setMax(c.max, true); clock.set(t == null ? c.max : t);
  }
  const fields = {
    sigma: kit.field($('sigma'), { out: $('oSigma'), fmt: (v) => fix(v, 2), onInput: (v) => setRho(v, S.t) }),
    t: kit.field($('height'), { out: $('oT'), fmt: (v) => fix(v, 2), onInput: (v) => setRho(S.sigma, v) })
  };
  function syncInputs() {
    if (document.activeElement !== $('sigma')) fields.sigma.set(Math.round(S.sigma * 100) / 100); else fields.sigma.show();
    if (document.activeElement !== $('height')) fields.t.set(Math.round(S.t * 100) / 100); else fields.t.show();
    $('oSigma').textContent = fix(S.sigma, 2); $('oT').textContent = fix(S.t, 2);
  }
  const leave = () => cards.mark(null);
  /** Put ρ at (σ, t), rounded to the slider steps, and show the finished mirror (the scan line has passed). */
  function setRho(sig, t, snap) {
    leave();
    if (tw) { tw.cancel(); tw = null; }
    sig = clamp(Math.round(Number(sig) * 100) / 100, S_MIN, S_MAX); t = clamp(Math.round(Number(t) * 100) / 100, T_MIN, T_MAX);
    if (snap && Math.abs(sig - 0.5) < 0.015) sig = 0.5;
    S.sigma = sig; S.t = t; syncInputs();
    if (S.scene === 'mirror' && clock.t < clock.max) { clock.pause(); clock.set(clock.max); } else paint();
  }
  /** Move ρ to a card: a short glide, at once for a still or while the page boots. */
  function glide(sig, t, animate) {
    if (tw) { tw.cancel(); tw = null; }
    if (!animate) { S.sigma = sig; S.t = t; syncInputs(); return; }
    const a = { s: S.sigma, t: S.t };
    tw = kit.tween(450, (e) => { S.sigma = a.s + (sig - a.s) * e; S.t = a.t + (t - a.t) * e; syncInputs(); paint(); }, () => { tw = null; S.sigma = sig; S.t = t; syncInputs(); paint(); });
  }
  $('snap').addEventListener('click', () => setRho(0.5, S.t));
  $('rew').addEventListener('click', () => { clock.pause(); clock.set(0); });
  $('plot').addEventListener('click', () => { leave(); setScene(S.scene === 'mirror' ? 'landau' : 'mirror'); });
  kit.keys({ 1: () => { leave(); setScene('mirror'); }, 2: () => { leave(); setScene('landau'); }, h: () => setRho(0.5, S.t) });

  /* ---------- direct manipulation on the stage ---------- */
  // A drag keeps the plot geometry of its pointerdown: the HUD may rewrap while ρ moves, and ρ must stay under the pointer.
  let drag = null;
  const local = (g, ev) => { const b = $('cv').getBoundingClientRect(), px = ev.clientX - b.left, py = ev.clientY - b.top; return { px, py, x: g.invX(px), y: g.invY(py), inside: px >= g.pl && px <= g.pl + g.iw && py >= g.pt && py <= g.pt + g.ih }; };
  function moveTo(ev) {
    const d = local(drag.g, ev);
    if (drag.kind === 'x') { clock.pause(); clock.set(clamp(d.x, X0, X1) - X0); }
    else if (drag.kind === 'twin') setRho(1 - unU(d.x), d.y, true);
    else setRho(unU(d.x), d.y, true);
  }
  $('cv').addEventListener('pointerdown', (ev) => {
    if (TRV.still || !geo.g) return;
    const g = geo.g, d = local(g, ev);
    if (!d.inside) return;
    let kind = 'x';
    if (geo.scene === 'mirror') {
      const dR = Math.hypot(g.X(S.sigma) - d.px, g.Y(S.t) - d.py), dT = Math.hypot(g.X(1 - S.sigma) - d.px, g.Y(S.t) - d.py);
      kind = !onLine() && dT < 16 && dT < dR ? 'twin' : 'rho';
    }
    drag = { kind, g, x0: ev.clientX, y0: ev.clientY, mouse: ev.pointerType === 'mouse' };
    if (drag.mouse) { try { $('cv').setPointerCapture(ev.pointerId); } catch (e) { /* synthetic events */ } moveTo(ev); }
  });
  $('cv').addEventListener('pointermove', (ev) => { if (drag && drag.mouse) moveTo(ev); });
  $('cv').addEventListener('pointerup', (ev) => {   // touch and pen: a tap moves ρ (or x); a swipe scrolls the page
    if (drag && !drag.mouse && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 8) moveTo(ev);
    drag = null;
  });
  for (const type of ['pointercancel', 'lostpointercapture']) $('cv').addEventListener(type, () => { drag = null; });

  /* ---------- experiment cards ---------- */
  // every card plays (the scan line climbs, or x runs to 120) and declares its still: the finished frame ('end')
  const PRESETS = {
    'on-line': { scene: 'mirror', sigma: 0.5, t: 14.13, play: true, still: 'end' },
    'off-line': { scene: 'mirror', sigma: 0.76, t: 10, play: true, still: 'end' },
    imprimitive: { scene: 'mirror', sigma: 0.5, t: 14.13, play: true, still: 'end' },
    'landau-trap': { scene: 'landau', sigma: 0.78, t: 11.13, play: true, still: 'end' }
  };
  const NOTES = {
    'on-line': [`把 ρ 放在临界线上：σ = 1/2，t = 14.13，紧挨第一个零点 ρ₁ ≈ ½ + 14.1347i。镜子把 σ 换成 1 − σ，而 1 − 1/2 = 1/2，所以镜像 1 − ${OB} 落回 ρ 自己：扫描线一过，绿圈就套住琥珀点。`,
      `Put ρ on the critical line: σ = 1/2, t = 14.13, right next to the first zero ρ₁ ≈ ½ + 14.1347i. The mirror turns σ into 1 − σ, and 1 − 1/2 = 1/2, so the image 1 − ${OB} falls back on ρ itself: once the scan line passes, a green ring closes around the amber dot.`],
    'off-line': [`假设右半带有一枚零点 ρ = 0.76 + 10i。扫描线一碰到它，品红的孪生 1 − ${OB} 就沿虚线飞过绿线，停在 0.24 + 10i：两枚零点隔着镜子相距 0.52。右半平面只要一个零点都没有，左边的孪生也就无从出现。`,
      `Suppose the right half of the strip held a zero ρ = 0.76 + 10i. The moment the scan line reaches it, the magenta twin 1 − ${OB} flies across the green line along the dashed arrow and stops at 0.24 + 10i: two zeros, 0.52 apart across the mirror. Empty the right half-plane and the twin on the left has nowhere to come from.`],
    imprimitive: ['非本原特征的 L 函数多乘了几枚欧拉因子 1 − p⁻ˢ。它们的零点 s = 2πki/ln p 沿紫色虚线 Re(s) = 0 一级级往上排（方块 p = 2，菱形 p = 3，三角 p = 5）。Re(s) > 0 时 |p⁻ˢ| < 1，因子不可能为零：冒牌零点一个也进不了青色的临界带。',
      'The L-function of an imprimitive character carries a few extra Euler factors 1 − p⁻ˢ. Their zeros s = 2πki/ln p climb the dashed violet line Re(s) = 0 rung by rung (squares p = 2, diamonds p = 3, triangles p = 5). For Re(s) > 0 we have |p⁻ˢ| < 1, so a factor cannot vanish there: not one impostor gets into the cyan critical strip.'],
    'landau-trap': ['舞台换成素数的影子。青色是 Λ(n) 逐项算出的 G<sub>z</sub>(x) − ln 2π，一路待在绿色虚线 ±0.05√x 之间。品红是 σ = 0.78、t = 11.13 这枚假想零点激起的波（MODEL）：振幅按 x 的 0.78 次方长，在 x ≈ 66.89 冲出堤坝，到 x = 120 摆到 0.672，高过 0.548。',
      'The stage turns to the shadow of the primes. Cyan is G<sub>z</sub>(x) − ln 2π, computed term by term from Λ(n); it stays between the dashed green lines ±0.05√x all the way. Magenta is the wave a would-be zero at σ = 0.78, t = 11.13 would stir up (MODEL): its swing grows like x to the power 0.78, breaks through near x ≈ 66.89 and reaches 0.672 at x = 120, above 0.548.']
  };
  // A cited figure keeps one sentence next to ◀ ▶; the full lab keeps the explanations above.
  const FIGURE_NOTES = {
    'on-line': [`σ = 1/2 时镜像 1 − ${OB} 落回 ρ：临界线是镜子唯一不动的地方。`, `At σ = 1/2 the image 1 − ${OB} falls back on ρ: the critical line is the only place the mirror leaves fixed.`],
    'off-line': ['右半带的 ρ = 0.76 + 10i 被镜子映成左半带的孪生 0.24 + 10i。', 'ρ = 0.76 + 10i on the right is mirrored to its twin 0.24 + 10i on the left.'],
    imprimitive: ['多余欧拉因子的零点全排在紫色虚线 Re(s) = 0 上，进不了临界带。', 'The zeros of the extra Euler factors all sit on the violet line Re(s) = 0, outside the critical strip.'],
    'landau-trap': ['σ = 0.78 的零点激起的波在 x ≈ 67 冲出 ±0.05√x，真实的素数影子留在里面。', 'A zero at σ = 0.78 would break ±0.05√x near x ≈ 67; the prime shadow stays inside.']
  };
  function applyPreset(id) {
    const p = PRESETS[id];
    glide(p.sigma, p.t, !booting && !TRV.still);
    setScene(p.scene);
    if (TRV.still && p.still != null) clock.set(p.still === 'end' ? clock.max : p.still);
    // a still (cover, cited figure for PDF/EPUB) and the opening view of the full page show the finished frame;
    // inside a chapter the card plays once the reader has scrolled it into view; a click plays at once
    if (!p.play || TRV.still || (booting && !TRV.embed)) { paint(); return; }
    clock.set(0);
    if (booting) kit.autoplay(clock, $('stage')); else clock.play();
  }
  const cards = kit.cards($('presets'), { presets: PRESETS, notes: TRV.figure ? FIGURE_NOTES : NOTES, noteEl: $('presetNote'), tour: $('tour'), onPick: applyPreset,
    idle: ['自由探索：拖动 ρ、换场景、拖时间轴。随时可以再选一张卡。', 'Free play: drag ρ, switch scenes, scrub the rail. Pick a card again at any time.'] });

  TRV.drawer({ drawer: $('drawer'), open: $('infoBtn'), close: $('drawerClose') });
  TRV.startGlitch(document.querySelector('.brand'));

  /* ---------- read-only probe for the browser suite, cover, start ---------- */
  window.MIRROR_DEBUG = {
    get state() {
      const R = rogue(), g = geo.g, cvBox = $('cv').getBoundingClientRect(), fly = S.scene === 'mirror' ? flyAt(scanning() ? scanH() : null) : 1;
      const integers = (f) => Array.from({ length: X1 - X0 + 1 }, (_, i) => [X0 + i, f(X0 + i)]);
      return {
        scene: S.scene, sigma: S.sigma, t: S.t, mirror: [1 - S.sigma, S.t], onLine: onLine(), distance: Math.abs(S.sigma - 0.5),
        rail: clock.t, max: clock.max, playing: clock.playing, preset: cards.current, focus: focus(),
        h: S.scene === 'mirror' ? scanH() : null, x: S.scene === 'landau' ? curX() : null, fly, twin: [S.sigma + fly * (1 - 2 * S.sigma), S.t],
        rogue: { re: R.a, t: R.t, max: R.max, maxAt: R.maxAt, ratio: R.ratio, burst: R.burst, at120: R.at120, barrier120: BAR * Math.sqrt(X1) },
        shadow: { ln2pi: LN2PI, gamma: GAMMA, worst: SHADOW.worst, worstAt: SHADOW.worstAt, inside: SHADOW.inside, sz: { 10: Sz(10), 100: Sz(100) },
          gz: Object.fromEntries([2, 3, 5, 10, 30, 100, 120].map((x) => [x, Gz(x)])), integers: integers(shadow) },
        vonMangoldt: Array.from(LAM), wave: integers((x) => wave(x, R.a, R.t)),
        impostors: IMPOSTORS.map((z) => ({ ...z })), impostorsOk: IMP_OK, inStrip: IMP_IN_STRIP,
        // the plot box in viewport pixels; in the mirror scene the horizontal axis is u(Re s): Re s itself right of the break
        view: g ? { scene: geo.scene, re: [g.x0, g.x1], im: [g.y0, g.y1], box: [cvBox.left + g.pl, cvBox.top + g.pt, g.iw, g.ih], warp: geo.scene === 'mirror' ? { at: BRK, factor: SQ } : null } : null,
        readouts: { pair: $('roPair').textContent, burst: $('roBurst').textContent, imp: $('roImp').textContent, hud: $('hudSub').textContent }
      };
    },
    /** For tests: { sigma, t, scene, rail | x | h } (pauses the clock first, leaves the current card as it is). */
    setParams(p) {
      clock.pause(); if (tw) { tw.cancel(); tw = null; }
      if (p.scene) setScene(p.scene);
      if (p.sigma != null) S.sigma = clamp(p.sigma, S_MIN, S_MAX);
      if (p.t != null) S.t = clamp(p.t, T_MIN, T_MAX);
      syncInputs();
      if (p.rail != null) clock.set(p.rail); else if (p.x != null) clock.set(p.x - X0); else if (p.h != null) clock.set(p.h - H0);
      paint.now();
      return this.state;
    },
    draw() { paint.now(); }
  };
  /** Cover: the off-line zero and its twin beside the wave that zero would stir up. */
  window.TRV_THUMB = () => { S.sigma = 0.76; S.t = 10; setScene('mirror'); paint.now(); };
  cards.pick(cards.initial('off-line'));   // a chapter may cite another card: ::: {.viz src="critical-mirror" preset="landau-trap"}
  booting = false;
  paint();
})();
