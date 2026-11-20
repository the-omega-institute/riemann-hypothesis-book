/* THETA//SLOPE · Theta 链预算: how far a chain of √X theta mirrors can push the zero-free edge, in two scenes on one
   rail (the chain budget b = m/√X, with √X = 5 so that m = 5b):
     chain  the ladder U(X₀) → U(X₁) → … → U(Xₘ) between two walls of mirrors, the seesaw that trades the lifted period
            (carrying the characters μ₁ … μₘ) for the Hecke-free Bessel period, and the budget curves σ(b):
              one character   σ₁(b) = 2/3 + ⅓·e^(−b/0.45)                     (stays above the 2/3 wall)
              glued family    σ_g(b) = σ₁(b) − e/6,  e = Γ(g)·(1 − e^(−b/0.45)),  Γ(g) = g if g ≥ 0.6 else 0
            Both curves are an illustrative MODEL, chosen for the picture; they come from no Lean theorem.
     hn     the Harder–Narasimhan roof of a rank-7 lattice: the (rk, deg) points (0, 0), (1, h₁), (3, 4.4), (5, 5.4),
            (7, 5.0) of chapter 5, pulled toward the mean-slope line by the same share e (deg ↦ deg − e·(deg − 5/7·rk),
            a shear that keeps convexity), and their upper concave hull by a monotone chain. The first hull segment is
            μ_max; the Lean theorems shortVector and muMaxLeMin turn rk 7, deg 5 and μ_max into two short-vector radii,
            √7·e^(−5/7) and √7·e^(−μ_max).
   The readout of final_gaussOp sums gaussOp ∘ gaussOpDual over 𝔽₅ for the multiplicative character of order 4.
   Colours: magenta one character (and the 2/3 wall), cyan the glued family and the roof, green σ = 1/2, violet the
   seesaw, amber the current step and the steepest rafter. Read-only probe for the browser suite: THETA_DEBUG. */
(() => {
  'use strict';
  const { kit, L } = TRV, { fix, clamp } = kit, P = TRV.palette;
  const $ = (id) => document.getElementById(id);
  const ROOT_X = 5, X = ROOT_X * ROOT_X, B_MAX = 4, BETA = 0.45, G_GATE = 0.6, WALL = 2 / 3, FLOOR = 1 / 2;
  const RANK = 7, DEG = 5, MU_MEAN = DEG / RANK, RK = [0, 1, 3, 5, 7], DEG0 = [0, 1.8, 4.4, 5.4, 5.0];
  const H1_MIN = 0.5, H1_MAX = 2.8, N_NODES = B_MAX * ROOT_X + 1;   // the mirror slots U(X₀) … U(X₂₀)
  const SUBS = '₀₁₂₃₄₅₆₇₈₉', subNum = (n) => String(n).split('').map((d) => SUBS[+d]).join('');

  /* ---------- the budget model (MODEL) ---------- */
  const decay = (b) => Math.exp(-b / BETA);
  const sigmaSingle = (b) => WALL + decay(b) / 3;
  const gain = (g) => (g >= G_GATE ? g : 0);
  const flatShare = (b, g) => gain(g) * (1 - decay(b));
  const sigmaGlued = (b, g) => sigmaSingle(b) - flatShare(b, g) / 6;
  /** Where the glued curve passes the wall: (1/3)u < (Γ/6)(1 − u) with u = e^(−b/0.45), i.e. u < Γ/(2 + Γ). */
  const crossAt = (g) => { const G = gain(g); return G > 0 ? BETA * Math.log((2 + G) / G) : Infinity; };

  /* ---------- the HN roof (exact convex geometry on the points shown) ---------- */
  /** The filtration points with the first rafter at h₁, pulled toward the mean-slope line by the share e. */
  const filtration = (h1, e) => RK.map((r, i) => { const d = i === 1 ? h1 : DEG0[i]; return [r, d - e * (d - MU_MEAN * r)]; });
  /** Upper concave hull of points sorted by rk (Andrew's monotone chain): drop a point on or under the next chord. */
  function upperHull(pts) {
    const h = [];
    for (const p of pts) {
      while (h.length >= 2) {
        const a = h[h.length - 2], o = h[h.length - 1];
        if ((o[0] - a[0]) * (p[1] - a[1]) - (o[1] - a[1]) * (p[0] - a[0]) >= 0) h.pop(); else break;
      }
      h.push(p);
    }
    return h;
  }
  function roofOf(h1, e) {
    const pts = filtration(h1, e), hull = upperHull(pts);
    const slopes = hull.slice(1).map((p, i) => (p[1] - hull[i][1]) / (p[0] - hull[i][0]));
    const end = hull[hull.length - 1], mean = end[1] / end[0], muMax = slopes[0];
    return { pts, hull, slopes, muMax, mean, spike: muMax - mean, onHull: pts.map((p) => hull.some((q) => q[0] === p[0])),
      rMuMax: Math.sqrt(RANK) * Math.exp(-muMax), rShort: Math.sqrt(RANK) * Math.exp(-end[1] / RANK) };
  }

  /* ---------- one mirror undone on 𝔽₅ (final_gaussOp): V = ℂ, ρ = χ with χ(2) = i, ψ(x) = e^(2πix/5) ---------- */
  const GAUSS = (() => {
    const p = 5, chi = { 1: [1, 0], 2: [0, 1], 4: [-1, 0], 3: [0, -1] };
    const psi = (x) => { const a = 2 * Math.PI * (((x % p) + p) % p) / p; return [Math.cos(a), Math.sin(a)]; };
    const inv = (c) => { for (let d = 1; d < p; d++) if ((c * d) % p === 1) return d; return 0; };
    const mul = (u, v) => [u[0] * v[0] - u[1] * v[1], u[0] * v[1] + u[1] * v[0]], add = (u, v) => [u[0] + v[0], u[1] + v[1]];
    let op = [0, 0], dual = [0, 0], hyp = [0, 0];
    for (let c = 1; c < p; c++) { op = add(op, mul(psi(c), chi[c])); dual = add(dual, mul(psi(-c), chi[inv(c)])); hyp = add(hyp, chi[c]); }
    return { p, op, dual, hyp, there: mul(op, dual), back: mul(dual, op) };
  })();

  /* ---------- state: b is the clock; g and h₁ are the knobs ---------- */
  const S = { scene: 'chain', g: 1, h1: 1.8 };
  let geo = {}, stopAt = null, morph = null, booting = true;
  function derive() {
    const b = clock.t, g = S.g, e = flatShare(b, g), R = roofOf(S.h1, e);
    return { b, g, e, m: b * ROOT_X, gate: gain(g) > 0, s1: sigmaSingle(b), sg: sigmaGlued(b, g), cross: crossAt(g), ...R };
  }
  const mText = (b) => { const m = b * ROOT_X; return Math.abs(m - Math.round(m)) < 1e-6 ? String(Math.round(m)) : fix(m, 1); };
  const kc = (s) => `<span class="keepcase">${s}</span>`;
  const num = (v) => fix(v, 2).replace(/\.?0+$/, '');   // 4.40 → 4.4, 5.00 → 5
  const MUMAX = `μ<sub>${kc('max')}</sub>`;

  /* ---------- canvas text ---------- */
  const face = (f) => (f === 'body' ? TRV.fonts.body : f === 'display' ? TRV.fonts.display : TRV.fonts.data);
  /** o: size, face, weight, align, base, alpha, plate (a dark plate under a label that sits on lines). */
  function text(ctx, str, x, y, color, o) {
    o = o || {};
    ctx.font = `${o.weight ? o.weight + ' ' : ''}${o.size || 11}px ${face(o.face)}`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    if (o.plate) {
      const w = ctx.measureText(str).width + 10, h = (o.size || 11) + 7, px = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w + 5 : x - 5;
      ctx.fillStyle = TRV.alpha(P.stage, 0.88); ctx.fillRect(px, y - h / 2, w, h);
      ctx.strokeStyle = TRV.alpha(color, 0.55); ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
    }
    ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.globalAlpha = 1;
  }
  /** A label centred on x but kept inside [x0, x1]. */
  function textIn(ctx, str, x, y, color, x0, x1, o) {
    o = o || {};
    ctx.font = `${o.weight ? o.weight + ' ' : ''}${o.size || 11}px ${face(o.face)}`;
    const w = ctx.measureText(str).width, cx = clamp(x, x0 + w / 2, x1 - w / 2);
    text(ctx, str, cx, y, color, { ...o, align: 'center' });
  }
  const dot = (ctx, x, y, r, color, o) => {
    o = o || {}; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, kit.TAU);
    if (o.ring) { ctx.strokeStyle = color; ctx.lineWidth = o.width || 1.5; ctx.stroke(); } else { if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; } ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0; }
    ctx.globalAlpha = 1;
  };
  const seg = (ctx, a, c, color, width, o) => {
    o = o || {}; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(o.dash || []); ctx.lineCap = 'round';
    if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; }
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); ctx.shadowBlur = 0; ctx.setLineDash([]); ctx.globalAlpha = 1;
  };

  /* ---------- scene 1: the ladder of mirrors and the seesaw ---------- */
  function drawLadder(ctx, bx, D, wide, lw) {
    lw = lw || 1;
    const words = lw === 1, col = D.gate ? P.cyan : P.magenta, lanes = D.gate ? [-4.5, 0, 4.5] : [0];
    const full = Math.min(N_NODES - 1, Math.floor(D.m + 1e-9)), frac = full >= N_NODES - 1 ? 0 : clamp(D.m - full, 0, 1);
    let ch, sw;
    if (wide) {
      const chH = clamp(bx.h * 0.46, 84, 200);
      ch = { x: bx.x + 8, y: bx.y + 2, w: bx.w - 16, h: chH };
      sw = { x: bx.x, y: bx.y + chH + 10, w: bx.w, h: bx.h - chH - 10 };
    } else {
      const sww = clamp(bx.w * 0.32, 96, 170);
      ch = { x: bx.x + 2, y: bx.y, w: bx.w - sww - 8, h: bx.h };
      sw = { x: bx.x + bx.w - sww, y: bx.y, w: sww, h: bx.h };
    }
    const fs = wide ? 11 : 10;
    const amp = Math.min(ch.h * (wide ? 0.24 : 0.22), 34), yc = ch.y + ch.h / 2, xs = ch.x + 6, xe = ch.x + ch.w - 6, dx = (xe - xs) / (N_NODES - 1);
    const node = (j) => [xs + j * dx, yc + (j % 2 ? amp : -amp)];
    geo.nodes = Array.from({ length: N_NODES }, (_, j) => node(j));
    // the two walls of mirrors
    for (const s of [-1, 1]) seg(ctx, [xs - 4, yc + s * (amp + 7)], [xe + 4, yc + s * (amp + 7)], P.lineHot, 1, { alpha: 0.7, dash: [2, 4] });
    for (let j = 0; j < N_NODES; j++) { const p = node(j), s = j % 2 ? 1 : -1; seg(ctx, [p[0] - Math.min(5, dx * 0.4), yc + s * (amp + 7)], [p[0] + Math.min(5, dx * 0.4), yc + s * (amp + 7)], P.dim, 1.4 * lw, { alpha: j <= full ? 0.95 : 0.35 }); }
    // the light path: done lifts in the strand colour, the lift under way in amber, the rest faint
    const here = frac > 0 ? [node(full)[0] + (node(full + 1)[0] - node(full)[0]) * frac, node(full)[1] + (node(full + 1)[1] - node(full)[1]) * frac] : node(full);
    for (let j = 0; j < N_NODES - 1; j++) {
      const a = node(j), c = node(j + 1);
      if (j < full) for (const o of lanes) seg(ctx, [a[0], a[1] + o], [c[0], c[1] + o], col, (D.gate ? 1.3 : 1.8) * lw, { alpha: 0.95 });
      else seg(ctx, a, c, P.faint, 1, { alpha: 0.6, dash: [2, 3] });
    }
    if (frac > 0) for (const o of lanes) seg(ctx, [node(full)[0], node(full)[1] + o], [here[0], here[1] + o], P.amber, 2 * lw, { glow: 8 });
    for (let j = 0; j < N_NODES; j++) {
      const p = node(j);
      if (j <= full) {
        if (D.gate) seg(ctx, [p[0], p[1] - 7], [p[0], p[1] + 7], P.cyan, 1.4 * lw, { alpha: 0.85 });   // the glue at a node
        dot(ctx, p[0], p[1], 3 * lw, col);
      } else dot(ctx, p[0], p[1], 2.2, P.faint, { ring: true, width: 1 });
    }
    dot(ctx, here[0], here[1], 5 * lw, P.amber, { glow: 12 });
    const k = frac > 0 ? full + 1 : full;
    if (words) {
      const up = here[1] < yc;   // label on the outside of the corridor
      const cur = `U(X${subNum(k)})`, y = up ? yc - amp - 20 : yc + amp + 20;
      textIn(ctx, cur, here[0], y, P.amber, ch.x, ch.x + ch.w, { size: fs, weight: 600 });
      ctx.font = `${fs}px ${face()}`;
      if (!(up && Math.abs(here[0] - xs) < ctx.measureText(cur).width + 8)) textIn(ctx, 'U(X₀)', xs, yc - amp - 20, P.dim, ch.x, ch.x + ch.w, { size: fs });
      if (wide) text(ctx, L(`${mText(D.b)} 次提升 · √X = 5`, `${mText(D.b)} lift${D.m === 1 ? '' : 's'} · √X = 5`), ch.x + ch.w / 2, yc + amp + 36, P.dim, { align: 'center', size: 10.5, face: 'body' });
    }
    // the seesaw: a rhombus, lifted period (characters on its left edges) = Bessel period (none on its right)
    const cx = sw.x + sw.w / 2, cy = sw.y + sw.h * (wide ? 0.52 : 0.5);
    const rw = wide ? Math.min(sw.w * 0.3, 100) : sw.w * 0.34, rh = wide ? clamp(sw.h * 0.26, 14, 54) : clamp(sw.h * 0.26, 12, 28);
    const Lv = [cx - rw, cy], Rv = [cx + rw, cy], Tv = [cx, cy - rh], Bv = [cx, cy + rh];
    ctx.fillStyle = TRV.alpha(P.violet, 0.07); ctx.beginPath(); ctx.moveTo(...Lv); ctx.lineTo(...Tv); ctx.lineTo(...Rv); ctx.lineTo(...Bv); ctx.closePath(); ctx.fill();
    for (const [a, c] of [[Lv, Tv], [Tv, Rv], [Rv, Bv], [Bv, Lv]]) seg(ctx, a, c, P.violet, 1.6 * lw, { alpha: 0.95 });
    seg(ctx, [here[0], here[1]], Lv, P.violet, 1, { alpha: 0.45, dash: [3, 4] });
    const beads = Math.min(full, N_NODES - 1);
    for (let i = 0; i < beads; i++) {
      const edge = i % 2 ? Bv : Tv, t = (Math.floor(i / 2) + 1) / (Math.ceil(beads / 2) + 1);
      dot(ctx, Lv[0] + (edge[0] - Lv[0]) * t, Lv[1] + (edge[1] - Lv[1]) * t, 2.2 * lw, col);
    }
    dot(ctx, Lv[0], Lv[1], 4.5 * lw, col); dot(ctx, Rv[0], Rv[1], 4.5 * lw, P.violet, { glow: 8 });
    if (words) {
      text(ctx, '=', cx, cy, P.violet, { align: 'center', size: wide ? 18 : 14, weight: 600 });
      const sz = wide ? 11 : 9.5, ya = Math.max(Tv[1], cy - rh) - (wide ? 12 : 9), yb = cy + rh + (wide ? 13 : 9);
      textIn(ctx, wide ? L('提升周期', 'lifted period') : L('提升', 'lifted'), Lv[0], Math.min(ya, cy - 12), col, sw.x, sw.x + sw.w, { size: sz, face: 'body' });
      textIn(ctx, wide ? L('贝塞尔周期', 'Bessel period') : L('贝塞尔', 'Bessel'), Rv[0], Math.min(ya, cy - 12), P.violet, sw.x, sw.x + sw.w, { size: sz, face: 'body' });
      const lifted = !beads ? L('无 μ', 'no μ') : wide ? `μ₁ … μ${subNum(beads)}` : `${beads} μ`;
      textIn(ctx, lifted, Lv[0], Math.max(yb, cy + 12), col, sw.x, sw.x + sw.w, { size: sz });
      textIn(ctx, wide ? L('无赫克特征', 'Hecke-free') : L('无 μ', 'no μ'), Rv[0], Math.max(yb, cy + 12), P.violet, sw.x, sw.x + sw.w, { size: sz, face: wide ? 'body' : 'data' });
      if (wide && sw.h > 120) text(ctx, L('跷跷板：同一个周期，两种写法', 'Seesaw: one period, written two ways'), cx, sw.y + 6, P.dim, { align: 'center', size: 10.5, face: 'body', base: 'top' });
    }
  }

  /* ---------- scene 1: the budget curves σ(m/√X) (also the small plot under the roof, and the cover) ---------- */
  function drawBudget(cv, bx, D, o) {
    o = o || {};
    const W = cv.clientWidth, H = cv.clientHeight, lw = o.lw || 1, words = !o.bare && !o.mini;
    const pad = bx ? [bx.x + (o.bare ? 6 : 40), W - bx.x - bx.w + 8, bx.y + 8, H - bx.y - bx.h + (o.bare ? 6 : 22)] : [32, 12, 8, 20];
    const g = kit.plot(cv, { x: [0, B_MAX], y: [0.42, 1.04], pad, clear: !bx }), roomy = words && g.ih >= 150 && g.iw >= 300;
    if (!o.bare) g.axes({ yTicks: [[FLOOR, '1/2'], [WALL, '2/3'], ...(roomy ? [[5 / 6, '5/6']] : []), [1, '1']], xTicks: [0, 1, 2, 3, 4], xLabel: roomy ? 'm/√X' : null, yLabel: roomy ? 'σ' : null });
    g.hline(1, P.dim, { dash: [3, 4], alpha: 0.7 });
    g.hline(WALL, P.magenta, { dash: [7, 5], alpha: 0.85, width: 1.3 * lw });
    g.hline(FLOOR, P.ok, { width: 1.6 * lw, alpha: 0.9 });
    const n = 200, s1 = [], sg = [];
    for (let i = 0; i <= n; i++) { const b = B_MAX * i / n; s1.push([b, sigmaSingle(b)]); sg.push([b, sigmaGlued(b, D.g)]); }
    if (D.gate) g.poly([...s1, ...sg.slice().reverse()], P.cyan, { alpha: 0.09 });
    g.line(s1, P.magenta, { width: 2.2 * lw });
    if (D.gate) g.line(sg, P.cyan, { width: 2.2 * lw, glow: lw > 1 ? 6 : 0 });
    else g.line(sg, P.cyan, { width: 1.3 * lw, dash: [4, 6], alpha: 0.9 });
    if (D.gate && D.cross <= B_MAX) {
      g.dot(D.cross, WALL, P.cyan, 3.5 * lw);
      if (roomy) g.text(D.cross, WALL, L(`穿墙 ${fix(D.cross, 2)}`, `through at ${fix(D.cross, 2)}`), P.cyan, { align: 'left', dx: 8, dy: -11, size: 10.5 });
    }
    if (words) {
      g.text(B_MAX, WALL, L('2/3 墙', '2/3 wall'), P.magenta, { align: 'right', dy: -10, size: 11 });
      if (roomy) {
        g.text(0.05, FLOOR, L('σ = 1/2 临界线', 'σ = 1/2 critical line'), P.ok, { align: 'left', dy: 11, size: 10.5 });
        g.text(B_MAX, 1, L('σ = 1：平凡边界', 'σ = 1: trivial edge'), P.dim, { align: 'right', dy: 10, size: 10.5 });
      }
    }
    if (!o.bare) {
      g.vline(D.b, P.amber, { alpha: 0.85 });
      g.dot(D.b, D.s1, P.amber, (o.mini ? 3.5 : 5) * lw, { ring: true, width: 2 });
      if (Math.abs(D.sg - D.s1) > 1e-9) g.dot(D.b, D.sg, P.amber, (o.mini ? 3.5 : 5) * lw, { ring: true, width: 2 });
    }
    return g;
  }

  /* ---------- scene 2: the HN roof (also the small plot under the chain, and the cover) ---------- */
  function drawRoof(cv, bx, R, o) {
    o = o || {};
    const W = cv.clientWidth, H = cv.clientHeight, lw = o.lw || 1, words = !o.bare && !o.mini;
    const ys = R.pts.map((p) => p[1]), top = Math.max(6, ...ys) + (o.mini ? 0.4 : 0.7);
    const pad = bx ? [bx.x + (o.bare ? 6 : 34), W - bx.x - bx.w + 10, bx.y + 6, H - bx.y - bx.h + (o.bare ? 6 : 22)] : [28, 10, 8, 20];
    const g = kit.plot(cv, { x: [-0.25, 7.35], y: [-0.6, top], pad, clear: !bx }), ctx = g.ctx, roomy = words && g.iw >= 380 && g.ih >= 200;
    if (!o.bare) g.axes({ yTicks: o.mini ? [0, 2, 4, 6] : [0, 1, 2, 3, 4, 5, 6], xTicks: [0, 1, 2, 3, 4, 5, 6, 7], xLabel: words ? 'rk' : null, yLabel: words ? 'deg' : null });
    const end = R.hull[R.hull.length - 1];
    g.poly(R.hull, P.cyan, { alpha: 0.09 });
    g.line([[0, 0], end], P.dim, { dash: [6, 5], width: 1.4 * lw, alpha: 0.9 });
    R.hull.slice(1).forEach((p, i) => {
      const a = R.hull[i];
      if (i === 0) g.line([a, p], P.amber, { width: 3.2 * lw, glow: 10 });
      else g.line([a, p], P.cyan, { width: 2.4 * lw });
    });
    R.pts.forEach((p, i) => {
      if (i === 1) return;
      if (R.onHull[i]) g.dot(p[0], p[1], P.ink, (o.mini ? 3 : 4) * lw); else g.dot(p[0], p[1], P.dim, 4.5 * lw, { ring: true, width: 1.5 });
    });
    const h = R.pts[1];
    if (R.onHull[1]) g.dot(h[0], h[1], P.amber, (o.mini ? 3.5 : 4.5) * lw, { glow: 10 }); else g.dot(h[0], h[1], P.dim, 4 * lw);
    if (!o.mini && !o.bare) g.dot(h[0], h[1], P.amber, 9, { ring: true, width: 2 });   // the handle: drag it up and down
    if (words) {
      // the mean slope under its dashed line, the coordinates of the fixed points, the slope of every rafter
      if (roomy) g.text(4.2, MU_MEAN * 4.2, `μ(L) = 5/7 ≈ ${fix(R.mean, 3)}`, P.dim, { align: 'left', dy: 15, size: 10.5 });
      else g.text(3.4, MU_MEAN * 3.4, `μ(L) ≈ ${fix(R.mean, 3)}`, P.dim, { align: 'left', dy: 13, size: 10 });
      if (roomy) for (let i = 2; i < R.pts.length; i++) { const p = R.pts[i]; g.text(p[0], p[1], `(${p[0]}, ${num(p[1])})`, P.ink, { align: i === R.pts.length - 1 ? 'right' : 'center', dy: -14, size: 10, alpha: R.onHull[i] ? 0.9 : 0.6 }); }
      R.hull.slice(2).forEach((p, i) => {
        const a = R.hull[i + 1], ax = g.X(a[0]), ay = g.Y(a[1]), bxp = g.X(p[0]), byp = g.Y(p[1]), len = Math.hypot(bxp - ax, byp - ay) || 1;
        // the normal on the upper side of a rising rafter; a falling one is labelled inside the roof, clear of its end point
        const side = R.slopes[i + 1] < 0 ? -1 : 1, nx = side * (byp - ay) / len, ny = -side * (bxp - ax) / len;
        text(ctx, fix(R.slopes[i + 1], 2), (ax + bxp) / 2 + nx * 13, (ay + byp) / 2 + ny * 13, P.cyan, { align: 'center', size: 10.5 });
      });
      const k = R.hull[1], kx = g.X(k[0]) + 14, ky = g.Y(k[1]) + 18, label = `μ_{max} = ${fix(R.muMax, 2)}`;
      ctx.font = `600 11px ${face()}`;
      const pw = ctx.measureText(`μmax = ${fix(R.muMax, 2)}`).width + 10;
      ctx.fillStyle = TRV.alpha(P.stage, 0.88); ctx.fillRect(kx - 5, ky - 9, pw, 18);
      ctx.strokeStyle = TRV.alpha(P.amber, 0.55); ctx.lineWidth = 1; ctx.strokeRect(kx - 4.5, ky - 8.5, pw - 1, 17);
      g.text(k[0], k[1], label, P.amber, { dx: 14, dy: 18, size: 11 });
      const hx = g.X(h[0]), hy = g.Y(h[1]);
      if (R.onHull[1]) { if (roomy) text(ctx, `(1, ${num(h[1])})`, hx - 12, hy - 12, P.amber, { align: 'right', size: 10 }); }
      else text(ctx, L(roomy ? `(1, ${num(h[1])}) 在屋顶下` : '在屋顶下', roomy ? `(1, ${num(h[1])}) under the roof` : 'under the roof'), hx + 12, hy + 6, P.dim, { size: 10, face: 'body', plate: true });
    }
    return g;
  }
  /** The two short-vector radii as balls around a lattice point: √7·e^(−μ_max) (muMaxLeMin) inside √7·e^(−5/7) (shortVector). */
  function drawRadii(ctx, bx, R) {
    const k = Math.min(bx.w * 0.34, bx.h * 0.24, 56) / R.rShort, cx = bx.x + bx.w / 2, cy = bx.y + Math.max(k * R.rShort + 30, bx.h * 0.36);
    text(ctx, L('短向量的长度上界', 'short-vector bound'), cx, cy - k * R.rShort - 16, P.dim, { align: 'center', size: 10.5, face: 'body' });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = P.dim; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(cx, cy, k * R.rShort, 0, kit.TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = TRV.alpha(P.amber, 0.1); ctx.beginPath(); ctx.arc(cx, cy, k * R.rMuMax, 0, kit.TAU); ctx.fill();
    ctx.strokeStyle = P.amber; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cx, cy, k * R.rMuMax, 0, kit.TAU); ctx.stroke();
    const a = -0.7, r = k * R.rMuMax * 0.86;
    if (r > 7) seg(ctx, [cx, cy], [cx + r * Math.cos(a), cy + r * Math.sin(a)], P.ink, 1.6);
    dot(ctx, cx, cy, 2.6, P.ink);
    const y0 = cy + k * R.rShort + 16;
    text(ctx, `‖v‖ ≤ ${fix(R.rMuMax, 3)}`, cx, y0, P.amber, { align: 'center', size: 11, weight: 600 });
    text(ctx, 'muMaxLeMin', cx, y0 + 14, P.dim, { align: 'center', size: 10 });
    text(ctx, `‖v‖ ≤ ${fix(R.rShort, 3)}`, cx, y0 + 33, P.ink, { align: 'center', size: 11 });
    text(ctx, 'shortVector', cx, y0 + 47, P.dim, { align: 'center', size: 10 });
  }

  /* ---------- the stage ---------- */
  function drawStage() {
    const base = kit.plot($('cv'), { x: [0, 1], y: [0, 1], pad: [0, 0, 0, 0] }), ctx = base.ctx, W = base.W, H = base.H, D = derive();
    geo = {};
    if (TRV.thumbMode) {   // the cover is wordless: the roof of chapter 5 beside the two budget curves
      const glow = ctx.createRadialGradient(W * 0.72, H * 0.6, 0, W * 0.72, H * 0.6, W * 0.5);
      glow.addColorStop(0, TRV.alpha(P.cyan, 0.08)); glow.addColorStop(1, TRV.alpha(P.cyan, 0)); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      drawRoof($('cv'), { x: W * 0.05, y: H * 0.12, w: W * 0.4, h: H * 0.76 }, roofOf(1.8, 0), { bare: true, lw: 2 });
      drawBudget($('cv'), { x: W * 0.52, y: H * 0.12, w: W * 0.43, h: H * 0.76 }, D, { bare: true, lw: 2 });
      return;
    }
    const st = $('stage').getBoundingClientRect(), below = (el) => (el ? el.getBoundingClientRect().bottom - st.top : 0);
    TRV.hudFit();
    const top = Math.max(42, below($('hudBig').parentElement), below($('sceneChips'))) + 8, bottom = Math.max(18, $('legend').offsetHeight + 18);
    const bx = { x: 14, y: top, w: W - 28, h: Math.max(80, H - top - bottom) };
    geo.box = bx;
    if (S.scene === 'chain') {
      const wide = bx.w >= 600;
      let lad, plt;
      if (wide) { const lw = Math.min(bx.w * 0.42, 380); lad = { x: bx.x, y: bx.y, w: lw - 10, h: bx.h }; plt = { x: bx.x + lw + 4, y: bx.y, w: bx.w - lw - 4, h: bx.h }; }
      else { const lh = clamp(bx.h * 0.3, 58, 140); lad = { x: bx.x, y: bx.y, w: bx.w, h: lh }; plt = { x: bx.x, y: bx.y + lh + 6, w: bx.w, h: bx.h - lh - 6 }; }
      drawLadder(ctx, lad, D, wide);
      geo.budget = drawBudget($('cv'), plt, D);
    } else {
      const inset = bx.w >= 560, plotBox = inset ? { x: bx.x, y: bx.y, w: bx.w - 170, h: bx.h } : bx;
      geo.roof = drawRoof($('cv'), plotBox, D);
      if (inset) drawRadii(ctx, { x: bx.x + bx.w - 160, y: bx.y, w: 160, h: bx.h }, D);
    }
  }

  /* ---------- the strip: the other scene in small ---------- */
  function drawStrip() {
    if (TRV.still || TRV.figure) return;
    const D = derive();
    if (S.scene === 'chain') {
      drawRoof($('plot'), null, D, { mini: true });
      $('stripTitle').textContent = L('另一面：HN 屋顶被压平了多少', 'The other side: how flat the HN roof is');
      $('stripMeta').innerHTML = `${MUMAX} ${fix(D.muMax, 2)} · μ(L) ${fix(D.mean, 3)}`;
    } else {
      drawBudget($('plot'), null, D, { mini: true });
      $('stripTitle').textContent = L('另一面：σ 能压到哪里', 'The other side: how low σ goes');
      $('stripMeta').innerHTML = `σ₁ ${fix(D.s1, 4)} · σ<sub>g</sub> ${fix(D.sg, 4)}`;
    }
  }

  /* ---------- words: HUD, legend, readouts, pills, inputs ---------- */
  const LEGEND = {
    chain: [['mg', '单特征 σ₁', 'one character σ₁'], ['cy', '胶合族 σ<sub>g</sub>', 'glued family σ<sub>g</sub>'], ['ok', 'σ = 1/2', 'σ = 1/2'], ['vi', '跷跷板', 'seesaw'], ['am', '当前一步', 'current step']],
    hn: [['cy', 'HN 屋顶（上凸包）', 'HN roof (upper hull)'], ['am', `最陡的椽 ${MUMAX}`, `steepest rafter ${MUMAX}`], ['dm', '平均斜率 μ(L)', 'mean slope μ(L)'], ['ik', `滤过点 (${kc('rk')}, ${kc('deg')})`, `filtration points (${kc('rk')}, ${kc('deg')})`]]
  };
  const lessThan = (x, y) => (x < y ? '&lt;' : x > y ? '&gt;' : '=');
  function drawText() {
    const D = derive();
    let big, hud, note;
    if (S.scene === 'chain') {
      big = L('镜链 · σ(m/√X)', 'Chain · σ(m/√X)');
      hud = `m/√X = ${fix(D.b, 2)} · ${L('单特征', 'one character')} σ₁ = ${fix(D.s1, 4)} · ${D.gate ? `${L('胶合', 'glued')} σ<sub>g</sub> = ${fix(D.sg, 4)}` : L('胶合未成立（g &lt; 0.6）', 'no gluing (g &lt; 0.6)')}`;
      note = D.gate
        ? L(`胶合正交成立（g = ${fix(D.g, 2)}）：青色曲线在 m/√X = ${fix(D.cross, 2)} 处穿过 2/3 墙，下限是 2/3 − g/6 = ${fix(WALL - D.g / 6, 3)}。品红曲线永远在 2/3 之上。`,
          `The gluing is orthogonal (g = ${fix(D.g, 2)}): the cyan curve passes the 2/3 wall at m/√X = ${fix(D.cross, 2)} and levels off at 2/3 − g/6 = ${fix(WALL - D.g / 6, 3)}. The magenta curve stays above 2/3 for good.`)
        : L('只有一个特征（或正交度不到 0.6）：青色虚线与品红曲线重合，两条都只能贴着 2/3 墙走。', 'One character (or orthogonality below 0.6): the dashed cyan curve lies on the magenta one, and both can only hug the 2/3 wall.');
    } else {
      big = `${L('HN 屋顶', 'HN roof')} · ${MUMAX}`;
      hud = `${MUMAX} = ${fix(D.muMax, 2)} · μ(L) = ${fix(D.mean, 3)} · ${L('椽的斜率', 'rafter slopes')} ${D.slopes.map((s) => fix(s, 2)).join(' &gt; ')}`;
      note = R1note(D);
    }
    $('hudBig').innerHTML = big; $('hudSub').innerHTML = hud; $('roNote').innerHTML = note;
    const leg = LEGEND[S.scene].map(([cl, zh, en]) => `<span><i class="sw ${cl}"></i>${L(zh, en)}</span>`).join('');
    if ($('legend')._h !== leg) { $('legend').innerHTML = leg; $('legend')._h = leg; }
    if (S.scene === 'chain') {
      $('roKeyLabel').innerHTML = L('零点自由边界 σ（胶合族 · 单特征）', 'Zero-free edge σ (glued family · one character)');
      $('roKey').innerHTML = `<span class="c-cy">${fix(D.sg, 4)}</span> · <span class="c-mg">${fix(D.s1, 4)}</span>`;
      $('roKeySub').innerHTML = `${L('单特征', 'one character')} σ₁ ${lessThan(D.s1, WALL)} 2/3 <span class="nummark">${D.s1 > WALL ? '✓' : '✗'}</span> · ${L('胶合族', 'glued')} σ<sub>g</sub> ${lessThan(D.sg, WALL)} 2/3`;
    } else {
      $('roKeyLabel').innerHTML = L(`最陡的椽 ${MUMAX} 对平均斜率 μ(L)`, `Steepest rafter ${MUMAX} against the mean slope μ(L)`);
      $('roKey').innerHTML = `<span class="c-am">${fix(D.muMax, 3)}</span> · ${fix(D.mean, 3)}`;
      $('roKeySub').innerHTML = `${L('凸包顶点', 'hull vertices')} ${D.hull.map((p) => `(${p[0]}, ${num(p[1])})`).join(' ')}`;
    }
    $('roBudget').innerHTML = `${fix(D.b, 2)} · m = ${mText(D.b)}`;
    $('roGluing').innerHTML = `${fix(D.g, 2)} · ${D.gate ? L('正交成立', 'orthogonal') : L('不到 0.6', 'below 0.6')}`;
    $('roFlat').textContent = fix(D.e, 3);
    $('roSpike').textContent = fix(D.spike, 3);
    const ok = Math.abs(GAUSS.there[0] - GAUSS.p) < 1e-9 && Math.abs(GAUSS.there[1]) < 1e-9 && Math.hypot(...GAUSS.hyp) < 1e-12;
    $('roGauss').innerHTML = `Σρ(c)v = ${fix(Math.hypot(...GAUSS.hyp), 3)} · ${fix(GAUSS.there[0], 3)}·v = |𝔽₅|·v <span class="nummark">${ok ? '✓' : '✗'}</span>`;
    $('leanShort').innerHTML = L(`有 ‖v‖ ≤ √7·e<sup>−5/7</sup> ≈ ${fix(D.rShort, 3)}`, `some ‖v‖ ≤ √7·e<sup>−5/7</sup> ≈ ${fix(D.rShort, 3)}`);
    $('leanMuMax').innerHTML = L(`${MUMAX} = ${fix(D.muMax, 2)}，任何 r &gt; √7·e<sup>−${fix(D.muMax, 2)}</sup> ≈ ${fix(D.rMuMax, 3)} 都不行，必有更短的非零向量`,
      `${MUMAX} = ${fix(D.muMax, 2)}, so no r &gt; √7·e<sup>−${fix(D.muMax, 2)}</sup> ≈ ${fix(D.rMuMax, 3)} works: some nonzero vector is shorter`);
    $('pillBudget').querySelector('strong').textContent = fix(D.b, 2);
    $('pillSigma').querySelector('strong').textContent = fix(D.gate ? D.sg : D.s1, 3);
    syncInputs();
  }
  function R1note(D) {
    const fell = !D.onHull[1];
    return fell
      ? L(`h₁ = ${fix(S.h1, 2)} 低于 4.4/3 ≈ 1.467：点 (1, h₁) 掉到屋顶下面，凸包从 (0, 0) 直接跨到 (3, ${num(D.pts[2][1])})，最陡的椽变成它，斜率 ${fix(D.muMax, 3)}。`,
        `h₁ = ${fix(S.h1, 2)} is below 4.4/3 ≈ 1.467: the point (1, h₁) drops under the roof and the hull jumps straight from (0, 0) to (3, ${num(D.pts[2][1])}), which becomes the steepest rafter, of slope ${fix(D.muMax, 3)}.`)
      : L(`屋顶的斜率 ${D.slopes.map((s) => fix(s, 2)).join(' &gt; ')} 严格递减。最陡的第一根椽比平均斜率高 ${fix(D.spike, 3)}；${D.e > 0.001 ? `胶合把它压平了 ${fix(100 * D.e, 1)}%。` : '没有胶合，屋顶保持原样。'}`,
        `The slopes ${D.slopes.map((s) => fix(s, 2)).join(' &gt; ')} strictly decrease. The steepest, first rafter is ${fix(D.spike, 3)} above the mean slope; ${D.e > 0.001 ? `gluing has flattened it by ${fix(100 * D.e, 1)}%.` : 'without gluing the roof stays as it is.'}`);
  }

  const fBudget = kit.field($('chainBudget'), { fmt: (v) => fix(v, 2), onInput: (v) => { leave(); clock.pause(); clock.set(v); } });
  const fGluing = kit.field($('gluing'), { fmt: (v) => fix(v, 2), onInput: (v) => { leave(); S.g = clamp(v, 0, 1); paint(); } });
  const fH1 = kit.field($('h1'), { fmt: (v) => fix(v, 2), onInput: (v) => { leave(); S.h1 = clamp(v, H1_MIN, H1_MAX); paint(); } });
  function syncInputs() {
    // never overwrite the slider the reader is holding
    if (document.activeElement !== $('chainBudget')) fBudget.set(Math.round(clock.t * 100) / 100); else fBudget.show();
    if (document.activeElement !== $('gluing')) fGluing.set(Math.round(S.g * 100) / 100); else fGluing.show();
    if (document.activeElement !== $('h1')) fH1.set(Math.round(S.h1 * 100) / 100); else fH1.show();
  }

  const paint = kit.painter(() => { drawText(); drawStage(); drawStrip(); }, [$('stage'), $('plot')]);

  /* ---------- the rail: the chain budget b = m/√X ---------- */
  const clock = kit.clock({
    range: $('now'), play: $('play'), label: $('tau'), speeds: $('speedChips'), max: B_MAX, rate: 0.8, step: 1 / ROOT_X,
    // (the label is drawn while the clock is being built: it reads t only, never the clock itself)
    format: (t) => `m/√X ${fix(t, 2)} <small>/ ${B_MAX} · m = ${mText(t)}</small>`,
    onChange: (t, c) => {
      if (!c.playing) stopAt = null;                        // a card that plays stops at its own budget
      else if (stopAt != null && t >= stopAt - 1e-9) { const s = stopAt; stopAt = null; c.pause(); c.set(s); return; }
      paint();
    }
  });
  const sceneChips = kit.chips($('sceneChips'), 'scene', (v) => { leave(); setScene(v); });
  function setScene(sc) {
    S.scene = sc; sceneChips.set(sc, true);
    document.querySelectorAll('[data-scenes]').forEach((el) => { el.hidden = !el.dataset.scenes.split(' ').includes(sc); });
    paint();
  }
  function leave() { if (morph) { morph.cancel(); morph = null; } stopAt = null; cards.mark(null); }
  $('rew').addEventListener('click', () => { clock.pause(); clock.set(0); });
  kit.keys({ 1: () => { leave(); setScene('chain'); }, 2: () => { leave(); setScene('hn'); } });

  /* ---------- direct manipulation: drag the budget, click a mirror, drag the first rafter ---------- */
  let drag = null;
  const local = (ev) => { const r = $('cv').getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  function target(x, y) {
    if (S.scene === 'chain') {
      const g = geo.budget;
      if (geo.nodes) { let best = -1, bd = 12 * 12; geo.nodes.forEach((p, j) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = j; } }); if (best >= 0) return { kind: 'node', j: best }; }
      if (g && x >= g.pl - 4 && x <= g.pl + g.iw + 4 && y >= g.pt && y <= g.pt + g.ih + 4) return { kind: 'budget' };
    } else if (geo.roof) {
      const g = geo.roof, hx = g.X(1);
      if (Math.abs(x - hx) <= 18 && y >= g.pt - 6 && y <= g.pt + g.ih + 6) return { kind: 'rafter' };
    }
    return null;
  }
  function apply(t, x, y) {
    if (t.kind === 'node') { clock.pause(); clock.set(t.j / ROOT_X); }
    else if (t.kind === 'budget') { clock.pause(); clock.set(clamp(geo.budget.invX(x), 0, B_MAX)); }
    else if (t.kind === 'rafter') {
      const e = derive().e, d = geo.roof.invY(y);
      S.h1 = clamp((d - e * MU_MEAN) / (1 - e), H1_MIN, H1_MAX); paint();
    }
  }
  const cv = $('cv');
  cv.addEventListener('pointerdown', (ev) => {
    const [x, y] = local(ev), t = target(x, y);
    if (!t) return;
    drag = { t, mouse: ev.pointerType === 'mouse', x0: ev.clientX, y0: ev.clientY };
    if (drag.mouse) { try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic events */ } leave(); apply(t, x, y); }
  });
  cv.addEventListener('pointermove', (ev) => {
    const [x, y] = local(ev);
    if (drag && drag.mouse && drag.t.kind !== 'node') { apply(drag.t, x, y); return; }
    const t = target(x, y);
    cv.style.cursor = !t ? 'default' : t.kind === 'rafter' ? 'ns-resize' : t.kind === 'budget' ? 'ew-resize' : 'pointer';
  });
  cv.addEventListener('pointerup', (ev) => {
    if (drag && !drag.mouse && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 8) { const [x, y] = local(ev); leave(); apply(drag.t, x, y); }   // a tap
    drag = null;
  });
  cv.addEventListener('pointercancel', () => { drag = null; });

  /* ---------- experiment cards ---------- */
  // a card that plays declares its still: the frame of the cover and of the figure a chapter cites (its own budget)
  const PRESETS = {
    'stepanov-m1': { scene: 'chain', b: 0.2, g: 0, h1: 1.8 },
    'two-thirds-wall': { scene: 'chain', b: 3, g: 0, h1: 1.8, play: true, still: 3 },
    'root-x-glued': { scene: 'chain', b: 3.5, g: 1, h1: 1.8, play: true, still: 3.5 },
    'hn-polygon': { scene: 'hn', b: 3, g: 0, h1: 1.8 }
  };
  const NOTES = {
    'stepanov-m1': ['m = 1：只照一面镜子（m/√X = 0.2）。品红的单特征曲线刚从 σ = 1 落下来，还停在 0.88 左右，离 2/3 墙远着呢：一层导数换不来多少相消。', 'm = 1: a single mirror (m/√X = 0.2). The magenta one-character curve has only just left σ = 1 and sits near 0.88, far above the 2/3 wall: one layer of derivative buys little cancellation.'],
    'two-thirds-wall': ['只用一个特征（g = 0），把链推到 m/√X = 3，也就是 15 面镜子。品红曲线越走越贴近 2/3 墙，却永远差一点：σ₁ = 0.6671 &gt; 2/3。收益和成本的指数抵消，单打独斗到此为止。', 'One character only (g = 0), pushed to m/√X = 3, that is fifteen mirrors. The magenta curve creeps ever closer to the 2/3 wall but never reaches it: σ₁ = 0.6671 &gt; 2/3. Gain and cost cancel, and the lone chain stops here.'],
    'root-x-glued': ['把一族近似正交的特征胶合起来（g = 1）：链变成三根青色的线，在每面镜子处粘在一起。青色曲线在 m/√X ≈ 0.49 处穿过 2/3 墙，到 3.5 时已贴近绿色的 σ = 1/2 线。', 'Glue a nearly orthogonal family (g = 1): the chain becomes three cyan lines joined at every mirror. The cyan curve breaks the 2/3 wall near m/√X ≈ 0.49 and by 3.5 lies close to the green line σ = 1/2.'],
    'hn-polygon': [`秩 7 的格，滤过点 (0, 0)、(1, 1.8)、(3, 4.4)、(5, 5.4)、(7, 5.0) 连成屋顶，四段斜率 1.8 &gt; 1.3 &gt; 0.5 &gt; −0.2 严格递减。琥珀色的第一根椽最陡：${MUMAX} = 1.8，平均斜率只有 5/7 ≈ 0.714。上下拖琥珀色的点；拖到 1.467 以下，它掉到屋顶下面。`,
      `A rank-7 lattice: the filtration points (0, 0), (1, 1.8), (3, 4.4), (5, 5.4), (7, 5.0) make a roof whose four slopes 1.8 &gt; 1.3 &gt; 0.5 &gt; −0.2 strictly decrease. The amber first rafter is the steepest: ${MUMAX} = 1.8, while the mean slope is only 5/7 ≈ 0.714. Drag the amber point up and down; below 1.467 it drops under the roof.`]
  };
  // A cited figure keeps one sentence next to ◀ ▶; the full lab keeps the explanations above.
  const FIGURE_NOTES = {
    'stepanov-m1': ['一面镜子：单特征的 σ 只降到 0.88 左右。', 'One mirror: the one-character σ only drops to about 0.88.'],
    'two-thirds-wall': ['单特征推到 m/√X = 3，σ 仍停在 2/3 墙上方。', 'One character pushed to m/√X = 3: σ still stays above the 2/3 wall.'],
    'root-x-glued': ['胶合正交的一族穿过 2/3 墙，贴向 σ = 1/2。', 'An orthogonal glued family breaks the 2/3 wall and nears σ = 1/2.'],
    'hn-polygon': ['最陡的琥珀色椽斜率 1.8，平均斜率只有 5/7。', 'The steepest amber rafter has slope 1.8; the mean slope is only 5/7.']
  };
  function applyPreset(id) {
    const p = PRESETS[id];
    if (morph) { morph.cancel(); morph = null; }
    stopAt = null; clock.pause();
    setScene(p.scene);
    // a still (cover, cited figure for PDF/EPUB) and the opening view of the full page show the telling frame;
    // inside a chapter the card plays once the reader has scrolled it into view; a click plays at once
    const plays = !!p.play && !TRV.still && !(booting && !TRV.embed);
    if (plays) clock.set(0);
    const g0 = S.g, h0 = S.h1, b0 = clock.t;
    const land = () => { S.g = p.g; S.h1 = p.h1; if (!plays) clock.set(p.b); else paint(); };
    if (booting || TRV.still) land();
    else morph = kit.tween(520, (e) => { S.g = g0 + (p.g - g0) * e; S.h1 = h0 + (p.h1 - h0) * e; if (!plays) clock.set(b0 + (p.b - b0) * e, true); paint(); }, () => { morph = null; land(); });
    if (!plays) return;
    stopAt = p.b;
    if (booting) kit.autoplay(clock, $('stage')); else clock.play();
  }
  const cards = kit.cards($('presets'), { presets: PRESETS, notes: TRV.figure ? FIGURE_NOTES : NOTES, noteEl: $('presetNote'), tour: $('tour'), onPick: applyPreset,
    idle: ['自由探索：拖时间轴、换胶合正交度、拖屋顶上的琥珀色点。随时可以再选一张卡。', 'Free play: scrub the rail, change the gluing, drag the amber point of the roof. Pick a card again at any time.'] });

  TRV.drawer({ drawer: $('drawer'), open: $('infoBtn'), close: $('drawerClose') });
  TRV.startGlitch(document.querySelector('.brand'));

  /* ---------- probe for the browser suite, cover, start ---------- */
  const at = (x, y) => { const r = $('cv').getBoundingClientRect(); return { x: r.left + x, y: r.top + y }; };
  window.THETA_DEBUG = {
    get state() {
      const D = derive();
      return { scene: S.scene, preset: cards.current, t: clock.t, max: clock.max, playing: clock.playing, b: D.b, m: D.m, rootX: ROOT_X, X,
        g: S.g, h1: S.h1, gate: D.gate, e: D.e, sigmaSingle: D.s1, sigmaGlued: D.sg, cross: Number.isFinite(D.cross) ? D.cross : null,
        points: D.pts.map((p) => p.slice()), hull: D.hull.map((p) => p.slice()), slopes: D.slopes.slice(), onHull: D.onHull.slice(),
        muMax: D.muMax, muMean: D.mean, spike: D.spike, rMuMax: D.rMuMax, rShort: D.rShort,
        gauss: { p: GAUSS.p, op: GAUSS.op.slice(), dual: GAUSS.dual.slice(), there: GAUSS.there.slice(), back: GAUSS.back.slice(), hyp: GAUSS.hyp.slice() } };
    },
    /** The two budget curves as the page draws them: n + 1 samples [b, σ₁, σ_g] over 0 … 4 for the gluing g. */
    curves: (n, g) => Array.from({ length: n + 1 }, (_, i) => { const b = B_MAX * i / n, gg = g == null ? S.g : g; return [b, sigmaSingle(b), sigmaGlued(b, gg)]; }),
    seek: (b) => { clock.pause(); clock.set(b); },
    set: (o) => { if (o.g != null) S.g = clamp(o.g, 0, 1); if (o.h1 != null) S.h1 = clamp(o.h1, H1_MIN, H1_MAX); if (o.b != null) { clock.pause(); clock.set(o.b); } paint(); },
    scene: (sc) => setScene(sc),
    /** Viewport coordinates for pointer tests: the amber handle (1, h₁), the budget axis at b, a mirror of the chain. */
    point: {
      handle: () => { if (!geo.roof) return null; const p = derive().pts[1]; return at(geo.roof.X(p[0]), geo.roof.Y(p[1])); },
      handleAt: (d) => (geo.roof ? at(geo.roof.X(1), geo.roof.Y(d)) : null),
      budget: (b) => (geo.budget ? at(geo.budget.X(b), geo.budget.pt + geo.budget.ih * 0.5) : null),
      node: (j) => (geo.nodes && geo.nodes[j] ? at(geo.nodes[j][0], geo.nodes[j][1]) : null)
    }
  };
  /** Cover: the roof of chapter 5 beside the curves of the glued family at m/√X = 3.5. */
  window.TRV_THUMB = () => { S.g = 1; S.h1 = 1.8; clock.set(3.5, true); setScene('chain'); paint.now(); };
  cards.pick(cards.initial('root-x-glued'));   // a chapter may cite another card: ::: {.viz src="theta-chain-budget" preset="hn-polygon"}
  booting = false;
  paint();
})();
