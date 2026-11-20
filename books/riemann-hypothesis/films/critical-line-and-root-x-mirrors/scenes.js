/* Film · The Critical Line and √X Mirrors · 临界线与 √X 面镜子 (book riemann-hypothesis).
   Scenes for theme/film/engine.js. Every number on screen is computed here on load, and FILM.init checks it (a failed
   check is a page error, which stops the render); the pictures follow figures/ch01–ch06 and the pages
   viz/critical-mirror, viz/theta-chain-budget and viz/behrend-sphere of this book:
     mirror    the s-plane (left of Re(s) = −1/2 drawn 0.3 times as wide): the strip 0 < Re(s) < 1, the critical line,
               the trivial zeros −2, −4, the pole 1, the first zero 1/2 + 14.1347…i (|ζ| < 1e−9 by the Euler transform
               of η, 65 terms), a would-be zero ρ = 0.76 + 10i and its twin 1 − ρ̄ = 0.24 + 10i, and the zeros 2πik/ln p
               of the Euler factors 1 − p^(−s), p = 2, 3, 5, all on Re(s) = 0.
     shadow    Λ(n) for n ≤ 120, Sz(x) = Σ_{n ≤ x} Λ(n)(x/n − 1) and Gz(x) = Sz(x) − x ln x + (1 + γ)x as in
               Formalism/StatementOC.lean; Gz(x) − ln 2π sampled every 0.05 on [2, 120] stays inside ±0.05√x; the MODEL
               wave −2 Re(x^ρ / (ρ(ρ − 1))) of one pair, ρ = 0.78 + 11.13i, first leaves it near x ≈ 66.9.
     stepanov  sgn(x)|x|^k morphing from x to x⁵ and the jet of x^m at 0; the 16 weights (p, q) of Sym³ ⊗ Sym³ and a
               lowering staircase from (3, 3) whose divided-power coefficients C(p, 1) are integers, every step in the box.
     chain     the chain U(X₀) → … → U(X₈) for X = 64 (m = √X = 8 lifts) and the seesaw: an argued picture. The identity
               final_gaussOp is evaluated on 𝔽₅ with V = ℂ, ρ = χ, χ(2) = i, ψ(x) = e^(2πix/5): G_ψ G*_ψ = 5 = q.
     slopes    the illustrative MODEL of viz/theta-chain-budget, σ₁(b) = 2/3 + e^(−b/0.45)/3 and
               σ_g(b) = σ₁(b) − g(1 − e^(−b/0.45))/6 (b = m/√X); the Harder–Narasimhan roof of the rank-7 points (0, 0),
               (1, 1.8), (3, 4.4), (5, 5.4), (7, 5), sheared toward the mean slope 5/7, its upper hull and μ_max; with
               deg = −log covol, shortVector bounds a nonzero vector by √7·e^(−5/7) ≈ 1.295.
     net       the cube {0, …, 4}³: 125 points on 32 shells, the shell R = 17 holding 9 of them, all 36 midpoints strictly
               inside (‖m‖² = R − ‖a − b‖²/4) and no 3-term progression; φ(N) Dirichlet characters mod N for N ≤ 12.
   Grounds: LEAN ✓ only for the six theorems of film.json "lean"; the badge says NUM for computations, ARGUED for the
   book's argument (the theta chain, the seesaw, the budget curves). Colours: green = Lean and the critical line those
   theorems put every zero on, amber = the current focus, violet = argued, magenta = the twin, the model wave and the
   2/3 wall, blue = Re(s) = 0, cyan = computed data. No clock, no randomness: every frame is a function of S.u. */
'use strict';

/* ---------- the Lean citations (film.json "lean"), looked up by the whole GID ---------- */
const GID = {
  rh: 'Main.riemannHypothesis',
  landau: 'Formalism/ZetaNonvanishing/ZetaLandau.Formalism.zetaLandau',
  gauss: 'Formalism/ThetaLiftIndependence/FinalThetaLiftAMFKIndep.Formalism.ThetaLiftIndependence.final_gaussOp',
  short: 'Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.shortVector',
  triv: 'Formalism/BehrendSets/FinalE.Formalism.BehrendSets.FinalE.trivStab',
  every: 'Development/AutomorphicArithmetic/CharacterBoxes/MainConclusion.UpperTheory.FinalTheorems.everyCharacter'
};

/* ---------- small helpers ---------- */
const DIGITS_SUB = '₀₁₂₃₄₅₆₇₈₉';
const subN = n => String(n).split('').map(c => DIGITS_SUB[+c]).join('');
const fmt = (v, d) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const fmtPt = p => `(${p.map(v => (Number.isInteger(v) ? String(v) : v.toFixed(1))).join(', ')})`;
/* opacity of a phase from s to e (scene seconds) with fades */
const win = (u, s, e, fin = 0.5, fout = 0.5) => clamp((u - s) / fin) * clamp((e - u) / fout);
const cmul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
const cdiv = (p, q) => { const d = q[0] * q[0] + q[1] * q[1]; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
const cpow = (x, s) => { const r = Math.exp(s[0] * Math.log(x)), t = s[1] * Math.log(x); return [r * Math.cos(t), r * Math.sin(t)]; };  // x^s, x > 0

function glow(x1, y1, x2, y2, col, a, w) {
  if (a <= 0.003) return;
  line(x1, y1, x2, y2, col, a * 0.1, w * 7);
  line(x1, y1, x2, y2, col, a * 0.28, w * 2.8);
  line(x1, y1, x2, y2, col, a, w);
}
function polyline(pts, col, a, w = 2, dash = null) {
  if (a <= 0.003 || pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
}
function disc(x, y, r, col, a) { if (a <= 0.003) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
function xmark(x, y, r, col, a, w = 3) { line(x - r, y - r, x + r, y + r, col, a, w); line(x - r, y + r, x + r, y - r, col, a, w); }
function clipRect(x, y, w, h) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); }
/* a formula from segments [text, colour?, overline?]: ρ̄ is drawn as ρ with a bar, independent of the font */
function rich(segs, x, y, o = {}) {
  const size = o.size || 28, fam = o.fam || F.math, w = o.w || 700, a = o.a == null ? 1 : o.a;
  const ws = segs.map(s => tw(s[0], size, fam, w)), total = ws.reduce((p, q) => p + q, 0);
  if (a <= 0.003) return total;
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  segs.forEach((s, i) => {
    const c = s[1] || o.c || C.white;
    txt(s[0], cx, y, { size, fam, w, c, a, ab: o.ab });
    if (s[2]) line(cx + size * 0.08, y - size * 0.74, cx + ws[i] - size * 0.04, y - size * 0.74, c, a, Math.max(1.6, size * 0.07));
    cx += ws[i];
  });
  return total;
}
const RHOBAR = col => [['1 − ', col], ['ρ', col, true]];
/* one Lean citation by its GID: a green LEAN ✓ block and the declaration's label (shrunk to fit maxW) */
function leanChip(x, y, gid, a, o = {}) {
  if (a <= 0.003) return 0;
  const r = leanCite(gid);
  if (!r || r.kind !== 'theorem') { window.FILM_ERRORS.push(`film.json does not cite the theorem ${gid}`); return 0; }
  const head = STR.en.lean || 'LEAN ✓', maxW = o.maxW || 1500;
  const measure = s => { const wh = tw(head, s * 0.72, F.mono, 700, 1) + 18; return [wh, wh + 14 + tw(r.label, s, F.mono, 700)]; };
  let size = o.size || 24, [wh, total] = measure(size);
  while (total > maxW && size > 13) { size -= 1; [wh, total] = measure(size); }
  const x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  fillBox(x0, y - size * 0.95, wh, size * 1.25, C.lean, a * 0.95);
  txt(head, x0 + 9, y - size * 0.12, { size: size * 0.72, fam: F.mono, w: 700, c: C.bg, a, ls: 1 });
  txt(r.label, x0 + wh + 14, y, { size, fam: F.mono, w: 700, c: C.lean, a });
  return total;
}

/* ======================================================================= */
/*                   the mathematics, computed on load                      */
/* ======================================================================= */

/* ζ(s) for Re(s) > 0 via η and its Euler transform, 65 terms (figures/ch01-critical-mirror.py) */
function zetaEta(s) {
  let terms = [];
  for (let n = 1; n <= 65; n++) terms.push(cpow(n, [-s[0], -s[1]]));
  let eta = [0, 0];
  for (let order = 0; terms.length; order++) {
    const k = Math.pow(2, -(order + 1));
    eta = [eta[0] + terms[0][0] * k, eta[1] + terms[0][1] * k];
    const next = [];
    for (let i = 0; i + 1 < terms.length; i++) next.push([terms[i][0] - terms[i + 1][0], terms[i][1] - terms[i + 1][1]]);
    terms = next;
  }
  const two = cpow(2, [1 - s[0], -s[1]]);
  return cdiv(eta, [1 - two[0], -two[1]]);
}
const FIRST_ZERO = 14.134725141734693;
const RHO_OFF = 0.76, RHO_T = 10;                     // the would-be zero ρ = 0.76 + 10i; its twin is 0.24 + 10i
const EULER = [2, 3, 5].map(p => {
  const step = TAU / Math.log(p), hs = [];
  for (let k = 0; k * step <= 17.5; k++) hs.push(k * step);
  return { p, step, hs };
});

/* the prime shadow Gz(x) − ln 2π and the MODEL wave of one off-line pair (figures/ch02-prime-shadow.py) */
const PS = (() => {
  const N = 120, GAMMA = 0.5772156649015329, LN2PI = Math.log(TAU);
  const LAM = new Float64Array(N + 1);
  for (let n = 2; n <= N; n++) { let p = 2; while (n % p) p++; let m = n; while (m % p === 0) m /= p; LAM[n] = m === 1 ? Math.log(p) : 0; }
  const Sz = x => { let s = 0; const top = Math.min(N, Math.floor(x)); for (let n = 2; n <= top; n++) if (LAM[n]) s += LAM[n] * (x / n - 1); return s; };
  const Gz = x => Sz(x) - x * Math.log(x) + (1 + GAMMA) * x;
  const env = x => 0.05 * Math.sqrt(x);
  const RHO = [0.78, 11.13], DEN = cmul(RHO, [RHO[0] - 1, RHO[1]]);
  const wave = x => -2 * cdiv(cpow(x, RHO), DEN)[0];
  const NX = 2361, XS = new Float64Array(NX), SH = new Float64Array(NX), WV = new Float64Array(NX);
  let worst = 0, worstAt = 2, cross = null;
  for (let i = 0; i < NX; i++) {
    const x = (40 + i) / 20; XS[i] = x; SH[i] = Gz(x) - LN2PI; WV[i] = wave(x);
    const r = Math.abs(SH[i]) / env(x); if (r > worst) { worst = r; worstAt = x; }
    if (cross == null && Math.abs(WV[i]) > env(x)) cross = x;
  }
  const isPrime = n => LAM[n] > 0 && Math.round(Math.exp(LAM[n])) === n;
  return { N, LAM, Gz, LN2PI, env, wave, RHO, XS, SH, WV, NX, worst, worstAt, cross, isPrime };
})();

/* final_gaussOp on 𝔽₅: V = ℂ, ρ(c) = χ(c) with χ(2) = i, ψ(x) = e^(2πix/5); Σ χ(c) = 0 */
const GAUSS = (() => {
  const p = 5, chi = { 1: [1, 0], 2: [0, 1], 4: [-1, 0], 3: [0, -1] };
  const psi = x => { const t = TAU * (((x % p) + p) % p) / p; return [Math.cos(t), Math.sin(t)]; };
  const inv = c => { for (let d = 1; d < p; d++) if ((c * d) % p === 1) return d; return 0; };
  let op = [0, 0], dual = [0, 0], hyp = [0, 0];
  for (let c = 1; c < p; c++) {
    const g = cmul(psi(c), chi[c]), h = cmul(psi(-c), chi[inv(c)]);
    op = [op[0] + g[0], op[1] + g[1]]; dual = [dual[0] + h[0], dual[1] + h[1]]; hyp = [hyp[0] + chi[c][0], hyp[1] + chi[c][1]];
  }
  return { p, op, dual, hyp, there: cmul(op, dual), back: cmul(dual, op) };
})();

/* the budget MODEL and the Harder–Narasimhan roof (viz/theta-chain-budget, figures/ch05-slope-barrier.py) */
const BETA = 0.45;
const sigma1 = b => 2 / 3 + Math.exp(-b / BETA) / 3;
const sigmaG = (b, g) => sigma1(b) - g * (1 - Math.exp(-b / BETA)) / 6;
const CROSS_B = BETA * Math.log(3);                   // σ_g with g = 1 passes 2/3 where e^(−b/0.45) = 1/3
const HN = (() => {
  const RK = [0, 1, 3, 5, 7], DEG = [0, 1.8, 4.4, 5.4, 5.0], MEAN = 5 / 7;
  const pts = e => RK.map((r, i) => [r, DEG[i] - e * (DEG[i] - MEAN * r)]);
  function hull(P) {   // upper concave hull, points sorted by rank (monotone chain)
    const h = [];
    for (const p of P) {
      while (h.length >= 2) {
        const q = h[h.length - 2], o = h[h.length - 1];
        if ((o[0] - q[0]) * (p[1] - q[1]) - (o[1] - q[1]) * (p[0] - q[0]) >= 0) h.pop(); else break;
      }
      h.push(p);
    }
    return h;
  }
  const roof = e => { const P = pts(e), Hh = hull(P); const sl = Hh.slice(1).map((q, i) => (q[1] - Hh[i][1]) / (q[0] - Hh[i][0])); return { P, H: Hh, sl, muMax: sl[0] }; };
  return { RK, DEG, MEAN, roof, short: Math.sqrt(7) * Math.exp(-MEAN) };
})();

/* Behrend's shells in the cube {0, …, 4}³ (viz/behrend-sphere) */
const keyOf = p => p.join(',');
const BEH = (() => {
  const M = 5, shells = new Map(), all = [];
  for (let x = 0; x < M; x++) for (let y = 0; y < M; y++) for (let z = 0; z < M; z++) {
    const p = [x, y, z], r = x * x + y * y + z * z; all.push(p);
    if (!shells.has(r)) shells.set(r, []);
    shells.get(r).push(p);
  }
  const R = 17, pts = shells.get(R), on = new Set(pts.map(keyOf));
  let aps = 0, inside = 0, pairs = 0;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const a = pts[i], b = pts[j], s = a.map((v, k) => v + b[k]), d = a.map((v, k) => v - b[k]);
    const m4 = s[0] * s[0] + s[1] * s[1] + s[2] * s[2], d2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];   // 4‖m‖², ‖a − b‖²
    pairs++;
    if (m4 === 4 * R - d2 && m4 < 4 * R) inside++;
    if (s.every(v => v % 2 === 0) && on.has(keyOf(s.map(v => v / 2)))) aps++;
  }
  const sizes = [...shells.values()].map(l => l.length), top = Math.max(...sizes);
  return { M, all, nShells: shells.size, R, pts, pairs, inside, aps, top, topCount: sizes.filter(n => n === top).length };
})();
const pairInfo = (a, b) => {
  const m = a.map((v, k) => (v + b[k]) / 2), d2 = a.reduce((s, v, k) => s + (v - b[k]) ** 2, 0);
  return { a, b, m, d2, m2: m.reduce((s, v) => s + v * v, 0) };
};
const SHOW_PAIRS = [[[0, 1, 4], [4, 1, 0]], [[1, 0, 4], [0, 4, 1]], [[2, 2, 3], [3, 2, 2]], [[4, 0, 1], [2, 3, 2]]].map(([a, b]) => pairInfo(a, b));
const PHI_N = Array.from({ length: 12 }, (_, i) => { const N = i + 1; let c = 0; for (let k = 1; k <= N; k++) { let x = k, y = N; while (y) [x, y] = [y, x % y]; if (x === 1) c++; } return c; });

FILM.init.push(() => {
  const E = window.FILM_ERRORS, z = zetaEta([0.5, FIRST_ZERO]);
  if (Math.hypot(z[0], z[1]) > 1e-9) E.push(`mirror: |ζ(1/2 + 14.1347i)| = ${Math.hypot(z[0], z[1])}`);
  for (const e of EULER) for (const h of e.hs) { const q = cpow(e.p, [0, -h]); if (Math.hypot(1 - q[0], q[1]) > 1e-12) E.push(`mirror: 1 − ${e.p}^(−s) ≠ 0 at ${h}i`); }
  if (Math.abs(PS.Gz(10) - 1.86080) > 1e-3 || Math.abs(PS.Gz(100) - 1.72169) > 1e-3) E.push('shadow: Gz(10) or Gz(100) changed');
  if (!(PS.worst <= 1)) E.push(`shadow: Gz − ln 2π leaves ±0.05√x (ratio ${PS.worst})`);
  if (!(PS.cross > 66.5 && PS.cross < 67.5)) E.push(`shadow: the model wave leaves the envelope at ${PS.cross}`);
  if (Math.hypot(GAUSS.hyp[0], GAUSS.hyp[1]) > 1e-12 || Math.hypot(GAUSS.there[0] - 5, GAUSS.there[1]) > 1e-9 ||
      Math.hypot(GAUSS.back[0] - 5, GAUSS.back[1]) > 1e-9) E.push('chain: G G* ≠ 5 on 𝔽₅');
  const r0 = HN.roof(0);
  if (r0.H.length !== 5 || [1.8, 1.3, 0.5, -0.2].some((s, i) => Math.abs(r0.sl[i] - s) > 1e-9)) E.push('slopes: the HN roof of chapter 5 changed');
  if (Math.abs(sigmaG(CROSS_B, 1) - 2 / 3) > 1e-12 || Math.abs(sigmaG(60, 1) - 0.5) > 1e-9) E.push('slopes: the budget model changed');
  if (BEH.all.length !== 125 || BEH.nShells !== 32 || BEH.pts.length !== 9 || BEH.top !== 9 || BEH.topCount !== 1 ||
      BEH.pairs !== 36 || BEH.inside !== 36 || BEH.aps !== 0) E.push('net: the Behrend shell R = 17 changed');
  const onShell = new Set(BEH.pts.map(keyOf));
  if (SHOW_PAIRS.some(q => !onShell.has(keyOf(q.a)) || !onShell.has(keyOf(q.b)) || Math.abs(q.m2 - (17 - q.d2 / 4)) > 1e-12)) E.push('net: a shown pair is off the shell');
  if (PHI_N.reduce((s, v) => s + v, 0) !== 46) E.push('net: φ(N) for N ≤ 12 changed');
});
Object.assign(FILM.speed, { mirror: 0.01, shadow: 0.018, stepanov: 0.016, chain: 0.03, slopes: 0.02, net: 0.012 });

/* ======================================================================= */
/*                       1 · the mirror on 1/2                              */
/* ======================================================================= */
function planeGeo(x0, x1, y0, y1) {
  const brk = -0.5, sq = 0.3, re0 = -4.5, re1 = 1.6, im0 = -2.5, im1 = 17.5;
  const uu = re => (re >= brk ? re : brk + (re - brk) * sq), u0 = uu(re0), u1 = uu(re1);
  return { x0, x1, y0, y1, X: re => x0 + (uu(re) - u0) / (u1 - u0) * (x1 - x0), Y: im => y1 - (im - im0) / (im1 - im0) * (y1 - y0) };
}
const MIRROR = planeGeo(150, 1190, 196, 812);
/* o: a, strip, line (0 → 1, drawn upward), first, trivial, rho (0 → 1, slides off the line), twin (0 → 1, flies across),
   euler; small: labels for the poster */
function sPlane(G, o) {
  const a = o.a;
  if (a <= 0.003) return;
  const { X, Y, x0, x1, y0, y1 } = G, f = o.small ? 0.85 : 1;
  /* frame, grid and axes */
  [5, 10, 15].forEach(h => {
    line(x0, Y(h), x1, Y(h), C.dim, a * 0.16, 1);
    txt(`${h}i`, x0 - 12, Y(h) + 6, { size: 16 * f, fam: F.mono, align: 'right', c: C.dim, a: a * 0.85 });
  });
  line(x0, Y(0), x1, Y(0), C.dim, a * 0.9, 1.6);
  line(X(0), y0, X(0), y1, C.dim, a * 0.35, 1);
  const bx = X(-0.5);   // the axis break: left of it the plane is drawn 0.3 times as wide
  line(bx - 9, Y(0) + 10, bx - 3, Y(0) - 10, C.dim, a, 1.6); line(bx + 3, Y(0) + 10, bx + 9, Y(0) - 10, C.dim, a, 1.6);
  [[-4, '−4'], [-2, '−2'], [0, '0'], [1, '1']].forEach(([re, s]) => txt(s, X(re), Y(0) + 32, { size: 18 * f, fam: F.mono, w: 700, align: 'center', c: C.dim, a }));
  txt('Re(s)', x1, Y(0) + 32, { size: 17 * f, fam: F.mono, align: 'right', c: C.dim, a: a * 0.9 });
  txt('Im(s)', x0 - 12, y0 - 6, { size: 17 * f, fam: F.mono, align: 'right', c: C.dim, a: a * 0.9 });
  /* the critical strip, rising */
  const st = clamp(o.strip || 0), sa = a * st;
  if (sa > 0.003) {
    const top = y1 - (y1 - y0) * ease(st);
    ctx.save(); ctx.globalAlpha = sa;
    const gr = ctx.createLinearGradient(X(0), 0, X(1), 0);
    gr.addColorStop(0, rgba(C.cyan, 0.05)); gr.addColorStop(0.5, rgba(C.cyan, 0.15)); gr.addColorStop(1, rgba(C.cyan, 0.05));
    ctx.fillStyle = gr; ctx.fillRect(X(0), top, X(1) - X(0), y1 - top); ctx.restore();
    line(X(1), top, X(1), y1, C.cyan, sa * 0.5, 1.2);
    line(X(0), top, X(0), y1, C.cyan, sa * 0.5, 1.2);
    if (!o.small) txt('critical strip', X(0) + 10, y0 + 24, { size: 17, fam: F.mono, w: 700, c: C.cyan, a: sa * clamp(st * 2 - 1) });
  }
  /* trivial zeros and the pole */
  const tz = a * clamp(o.trivial || 0);
  [-2, -4].forEach(re => ring(X(re), Y(0), 9, C.cyan, tz, 2.4));
  txt('trivial zeros', X(-3), Y(0) + 62, { size: 16 * f, fam: F.mono, align: 'center', c: C.dim, a: tz });
  xmark(X(1), Y(0), 8, C.mag, tz, 3);
  txt('pole', X(1) + 14, Y(0) - 14, { size: 16 * f, fam: F.mono, w: 700, c: C.mag, a: tz });
  /* Re(s) = 0 and the zeros of the Euler factors 1 − p^(−s) */
  const eu = a * clamp(o.euler || 0);
  if (eu > 0.003) {
    ctx.save(); ctx.setLineDash([9, 8]); glow(X(0), y1, X(0), y0, C.blue, eu * 0.9, 2); ctx.restore();
    txt('Re(s) = 0', X(0) - 12, y0 - 14, { size: 19 * f, fam: F.mono, w: 700, align: 'right', c: C.blue, a: eu });
    EULER.forEach((e, j) => e.hs.forEach((h, k) => {
      const pk = clamp((o.euler || 0) * 1.8 - 0.12 * k - 0.1 * j);
      dot(X(0), Y(h), 10 * f, 'b', a * pk);
    }));
  }
  /* the critical line */
  const ln = clamp(o.line || 0);
  if (ln > 0.003) {
    const top = y1 - (y1 - y0) * ease(ln);
    glow(X(0.5), y1, X(0.5), top, C.lean, a, 3);
    txt('Re(s) = 1/2', X(0.5), y0 - 14, { size: 21 * f, fam: F.mono, w: 700, align: 'center', c: C.lean, a: a * clamp(ln * 3 - 2) });
  }
  /* the first zero, computed */
  const fz = a * clamp(o.first || 0);
  if (fz > 0.003) {
    const yz = Y(FIRST_ZERO), xl = X(1) + 14;   // the label sits right of the strip, on a leader
    dot(X(0.5), yz, 12 * f, 'c', fz);
    line(X(0.5) + 12, yz, xl - 6, yz, C.cyan, fz * 0.5, 1.2);
    txt('1/2 + 14.1347i', xl, yz + 7, { size: 20 * f, fam: F.mono, w: 700, c: C.cyan, a: fz });
    if (!o.small) txt('|ζ| < 10⁻⁹ · computed', xl, yz + 31, { size: 15, fam: F.mono, c: C.dim, a: fz });
  }
  /* ρ slides off the line; its twin 1 − ρ̄ flies across */
  const rp = clamp(o.rho || 0);
  if (rp > 0.003) {
    const xr = X(lerp(0.5, RHO_OFF, ease(rp))), yr = Y(RHO_T), tq = ease(clamp(o.twin || 0));
    if (tq > 0.003) {
      const xt = lerp(xr, X(1 - RHO_OFF), tq), yt = yr - Math.sin(Math.PI * tq) * 64;
      if (tq > 0.98) {
        ctx.save(); ctx.setLineDash([6, 7]); line(xr - 14, yr, X(1 - RHO_OFF) + 14, yr, C.white, a * 0.55, 1.6); ctx.restore();
        ctx.save(); ctx.translate(X(0.5), yr); ctx.rotate(Math.PI / 4); ctx.globalAlpha = a; ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.strokeRect(-5, -5, 10, 10); ctx.restore();
      } else {
        const trail = [];
        for (let i = 0; i <= 24; i++) { const q = tq * i / 24; trail.push([lerp(xr, X(1 - RHO_OFF), q), yr - Math.sin(Math.PI * q) * 64]); }
        polyline(trail, C.mag, a * 0.6, 2, [4, 6]);
      }
      dot(xt, yt, 13 * f, 'm', a);
      rich(RHOBAR(C.mag), xt, yt - 24, { size: 26 * f, a: a * clamp(tq * 2 - 1), align: 'center' });
    }
    dot(xr, yr, 13 * f, 'g', a);
    txt('ρ', xr + 18, yr - 14, { size: 30 * f, fam: F.math, w: 700, c: C.now, a });
  }
}

SCENES.mirror = S => {
  const u = S.u, L0 = lineAt(S, 0);
  /* opening title during the lead */
  const ta = clamp(u / 0.5) * (1 - clamp((u - L0.s - 0.1) / 0.6));
  if (ta > 0.003) {
    const p = clamp(u / 1.4);
    txt(`${DATA.book.code} · FILM`, W / 2, 360, { size: 26, fam: F.mono, w: 700, align: 'center', c: C.cyan, a: ta, ls: 10 });
    txt(DATA.film.title_zh, W / 2, 500, { size: 112, fam: F.zh, w: 900, align: 'center', c: C.white, a: ta * clamp(p * 1.6), ab: 4 });
    txt(scramble(DATA.film.title.toUpperCase(), p, 5), W / 2, 596, { size: 50, fam: F.orb, w: 900, align: 'center', c: C.white, a: ta, ls: 8, ab: 2 });
  }
  badgeQ(S, [[0, null, 'computed'], [1, 'real part one half', 'lean'], [2, null, 'computed']]);
  const out = clamp((S.d - u) / 0.6);
  const pa = at(S, 0, 0.8, 0.05) * out;
  sPlane(MIRROR, {
    a: pa, strip: at(S, 0, 1.8, 0.3), trivial: at(S, 0, 0.8, 1.8), first: at(S, 0, 0.8, 2.6),
    line: Q(S, 1, 'a mirror', 1.4), rho: Q(S, 2, 'Push a zero', 1.1), twin: Q(S, 2, 'forces a twin', 1.3),
    euler: Q(S, 3, 'Euler factors', 1.2)
  });
  /* right column: the claim, the mirror, the Euler factors */
  const px = 1240, pw = 490;
  const ca = Q(S, 1, 'real part one half', 0.6) * out;
  panel(px, 196, pw, 176, ca, C.lean, 'THE CLAIM · 黎曼猜想');
  txt('every nontrivial zero s of ζ :', px + 22, 256, { size: 18, fam: F.mono, w: 700, c: C.white, a: ca * 0.85 });
  txt('Re(s) = 1/2', px + 22, 304, { size: 38, fam: F.math, w: 700, c: C.white, a: ca, ab: 2 });
  leanChip(px + 22, 348, GID.rh, Q(S, 1, 'real part one half', 0.6, 0.5) * out, { size: 20, maxW: pw - 44 });
  const ma = Q(S, 2, 'Push a zero', 0.6) * out;
  panel(px, 392, pw, 206, ma, C.cyan, 'MIRROR · 镜像');
  rich([['ζ(ρ) = 0  ⇒  ζ('], ['1 − '], ['ρ', null, true], [') = 0']], px + 22, 452, { size: 28, a: Q(S, 2, 'functional equation', 0.6) * out });
  txt(`ρ = ${RHO_OFF.toFixed(2)} + ${RHO_T}i`, px + 22, 500, { size: 26, fam: F.math, w: 700, c: C.now, a: ma });
  const tw2 = Q(S, 2, 'forces a twin', 0.6, 1.0) * out;
  rich(RHOBAR(C.mag).concat([[` = ${(1 - RHO_OFF).toFixed(2)} + ${RHO_T}i`, C.mag]]), px + 22, 544, { size: 26, a: tw2 });
  txt(`(${RHO_OFF.toFixed(2)} + ${(1 - RHO_OFF).toFixed(2)}) / 2 = 1/2 · on the mirror`, px + 22, 580, { size: 16, fam: F.mono, c: C.dim, a: tw2 });
  const ea = Q(S, 3, 'Euler factors', 0.6) * out;
  panel(px, 618, pw, 170, ea, C.blue, 'EULER FACTORS · 欧拉因子');
  txt('1 − p⁻ˢ = 0  ⇔  s = 2πik / ln p', px + 22, 676, { size: 24, fam: F.math, w: 700, c: C.white, a: ea });
  txt(EULER.map(e => `p = ${e.p}: ${e.step.toFixed(3)}i`).join(' · '), px + 22, 716, { size: 16, fam: F.mono, c: C.cyan, a: ea });
  txt('all on Re(s) = 0, the strip’s edge', px + 22, 756, { size: 17, fam: F.mono, w: 700, c: C.blue, a: Q(S, 3, 'they sit', 0.6) * out });
};

/* ======================================================================= */
/*                     2 · the prime shadow, Landau                         */
/* ======================================================================= */
const PL = { x0: 170, x1: 1210, yc: 450, ky: 300, stem: 796, sk: 12.5 };
const PX = x => PL.x0 + (x - 2) / 118 * (PL.x1 - PL.x0);
const PY = y => PL.yc - y * PL.ky;
function idxAt(x) { return Math.max(0, Math.min(PS.NX - 1, Math.round(x * 20 - 40))); }
SCENES.shadow = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L0 = lineAt(S, 0);
  badgeQ(S, [[0, null, 'computed'], [2, 'One zero off the line', 'argued'], [3, "Landau's trap", 'lean']]);
  const fa = at(S, 0, 0.6, -0.3) * out;
  /* frame, axes */
  box(PL.x0 - 12, PY(0.75) - 10, PL.x1 - PL.x0 + 24, PY(-0.75) - PY(0.75) + 20, C.dim, fa * 0.5, 1);
  [-0.5, 0.5].forEach(v => { line(PL.x0, PY(v), PL.x1, PY(v), C.dim, fa * 0.15, 1); txt(fmt(v, 1), PL.x0 - 22, PY(v) + 6, { size: 16, fam: F.mono, align: 'right', c: C.dim, a: fa }); });
  ctx.save(); ctx.setLineDash([6, 6]); line(PL.x0, PY(0), PL.x1, PY(0), C.dim, fa * 0.7, 1.2); ctx.restore();
  txt('0', PL.x0 - 22, PY(0) + 6, { size: 16, fam: F.mono, align: 'right', c: C.dim, a: fa });
  [2, 30, 60, 90, 120].forEach(x => txt(String(x), PX(x), PY(-0.75) + 36, { size: 17, fam: F.mono, w: 700, align: 'center', c: C.dim, a: fa }));
  txt('x', PL.x1 + 22, PY(-0.75) + 36, { size: 18, fam: F.math, c: C.dim, a: fa });
  txt('Gz(x) − ln 2π', PL.x0, PY(0.75) - 22, { size: 22, fam: F.math, w: 700, c: C.cyan, a: fa });
  /* the sweep along x while line 0 is spoken */
  const sw = ease(clamp((u - L0.s - 0.2) / Math.max(1, L0.e - L0.s + 0.2)));
  const xs = 2 + 118 * sw;
  /* Λ(n): one stem per prime power, height ln p */
  for (let n = 2; n <= PS.N; n++) {
    const L = PS.LAM[n]; if (!L) continue;
    const lit = n <= xs, x = PX(n), h = L * PL.sk;
    line(x, PL.stem, x, PL.stem - h, PS.isPrime(n) ? C.cyan : C.white, fa * (lit ? 0.95 : 0.18), 3);
  }
  line(PL.x0, PL.stem, PL.x1, PL.stem, C.dim, fa * 0.6, 1);
  txt('Λ(n) = ln p at n = pᵏ · prime powers ≤ 120', PL.x0, PL.stem + 28, { size: 16, fam: F.mono, c: C.dim, a: fa });
  /* the envelope ±0.05√x */
  const ev = at(S, 1, 1.4, 0.2) * out;
  if (ev > 0.003) {
    const xe = 2 + 118 * ease(ev), top = [], bot = [];
    for (let x = 2; x <= xe + 1e-9; x += 0.5) { top.push([PX(x), PY(PS.env(x))]); bot.push([PX(x), PY(-PS.env(x))]); }
    polyline(top, C.white, ev * 0.75, 2, [10, 8]); polyline(bot, C.white, ev * 0.75, 2, [10, 8]);
    txt('±0.05√x', PX(120) - 6, PY(PS.env(120)) - 14, { size: 20, fam: F.math, w: 700, align: 'right', c: C.white, a: ev });
  }
  /* the hum, traced */
  clipRect(PL.x0 - 4, PY(0.75) - 6, PL.x1 - PL.x0 + 8, PY(-0.75) - PY(0.75) + 12);
  if (fa > 0.003 && sw > 0) {
    const n = idxAt(xs), pts = [];
    for (let i = 0; i <= n; i += 2) pts.push([PX(PS.XS[i]), PY(PS.SH[i])]);
    pts.push([PX(PS.XS[n]), PY(PS.SH[n])]);
    polyline(pts, C.cyan, fa, 2.6);
  }
  /* the MODEL wave of one off-line pair, ρ = 0.78 + 11.13i */
  const wv = Q(S, 2, 'would roar', 3.2) * out;
  if (wv > 0.003) {
    const xw = 2 + 118 * wv, n = idxAt(xw), pre = [], post = [];
    for (let i = 0; i <= n; i += 2) { const x = PS.XS[i], p = [PX(x), PY(PS.WV[i])]; (x <= PS.cross ? pre : post).push(p); }
    if (post.length) post.unshift(pre[pre.length - 1]);
    polyline(pre, C.mag, out * 0.75, 2.6, [2, 7]);
    polyline(post, C.mag, out, 3.2, [2, 6]);
  }
  ctx.restore();
  const brk = Q(S, 2, 'break that ceiling', 0.5) * out;
  if (brk > 0.003 && wv * 118 + 2 >= PS.cross) {
    const x = PX(PS.cross), y = PY(PS.wave(PS.cross)), pulse = 1 + 0.25 * Math.sin(u * 6);
    ring(x, y, 16 * pulse, C.now, brk, 2.6);
    txt(`x ≈ ${PS.cross.toFixed(1)}`, x, y + (PS.wave(PS.cross) > 0 ? -28 : 44), { size: 22, fam: F.mono, w: 700, align: 'center', c: C.now, a: brk });
  }
  /* the cursor */
  const cu = fa * (1 - at(S, 1, 0.8, 0.6));
  if (cu > 0.003 && sw > 0) {
    line(PX(xs), PY(0.75), PX(xs), PY(-0.75), C.now, cu * 0.7, 1.5);
    disc(PX(xs), PY(PS.SH[idxAt(xs)]), 5, C.now, cu);
  }
  /* right column */
  const px = 1290, pw = 440;
  const r1 = fa;
  panel(px, 196, pw, 204, r1, C.cyan, 'PRIME SHADOW · 素数影子');
  txt('Sz(x) = Σ Λ(n)·(x/n − 1), n ≤ x', px + 20, 252, { size: 19, fam: F.math, w: 700, c: C.white, a: r1 });
  txt('Gz(x) = Sz(x) − x ln x + (1 + γ)x', px + 20, 288, { size: 19, fam: F.math, w: 700, c: C.white, a: r1 });
  const xr = Math.max(2, Math.min(120, xs));
  txt(`x = ${xr.toFixed(2)}`, px + 20, 334, { size: 18, fam: F.mono, w: 700, c: C.now, a: r1 * clamp(sw * 8) });
  txt(`Gz − ln 2π = ${fmt(PS.Gz(xr) - PS.LN2PI, 3)}`, px + 20, 362, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: r1 * clamp(sw * 8) });
  txt(`max |Gz − ln 2π| / 0.05√x = ${PS.worst.toFixed(3)}`, px + 20, 388, { size: 15, fam: F.mono, c: C.white, a: r1 * ev });
  const r2 = Q(S, 2, 'One zero off the line', 0.6) * out;
  panel(px, 418, pw, 150, r2, C.mag, 'MODEL · 假想离线零点');
  txt(`ρ = ${PS.RHO[0]} + ${PS.RHO[1]}i`, px + 20, 474, { size: 24, fam: F.math, w: 700, c: C.mag, a: r2 });
  txt('wave −2·Re(x^ρ / ρ(ρ − 1))', px + 20, 510, { size: 18, fam: F.math, w: 700, c: C.white, a: r2 });
  txt(`leaves ±0.05√x at x ≈ ${PS.cross.toFixed(1)}`, px + 20, 548, { size: 17, fam: F.mono, w: 700, c: C.now, a: brk });
  const r3 = Q(S, 3, "Landau's trap", 0.6) * out;
  panel(px, 588, pw, 206, r3, C.lean, 'LANDAU · 朗道陷阱');
  txt('s₀·Gz(x) ≤ C·x^θ  (x ≥ x₀, s₀ = ±1)', px + 20, 644, { size: 18, fam: F.math, w: 700, c: C.white, a: r3 });
  txt('⇒  ζ(s) ≠ 0 for Re(s) > θ', px + 20, 690, { size: 26, fam: F.math, w: 700, c: C.white, a: Q(S, 3, 'no zeros', 0.6) * out, ab: 1 });
  leanChip(px + 20, 738, GID.landau, Q(S, 3, 'no zeros', 0.6, 0.3) * out, { size: 20, maxW: pw - 40 });
  txt('0 < θ < 1 · a √x ceiling is θ = 1/2', px + 20, 776, { size: 16, fam: F.mono, c: C.dim, a: Q(S, 3, 'no zeros', 0.6, 0.6) * out });
};

/* ======================================================================= */
/*                   3 · differentiating integers                           */
/* ======================================================================= */
const ST = { cx: 520, cy: 456, kx: 300, ky: 205 };
const LAT = { x0: 1110, y0: 640, step: 115 };
const LX = p => LAT.x0 + p * LAT.step, LY = q => LAT.y0 - q * LAT.step;
const STAIR = (() => { const s = [[3, 3]]; for (let i = 0; i < 6; i++) { const [p, q] = s[s.length - 1]; s.push(i % 2 === 0 ? [p - 1, q] : [p, q - 1]); } return s; })();
const FACT = n => (n <= 1 ? 1 : n * FACT(n - 1));
const DER = ['f', 'f′', 'f″', 'f‴', 'f⁽⁴⁾', 'f⁽⁵⁾'];
SCENES.stepanov = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L2 = lineAt(S, 2);
  badgeQ(S, [[0, null, 'computed']]);
  /* left: x^k, from k = 1 to 5 */
  const la = at(S, 0, 0.6, -0.3) * out;
  const k = 1 + 4 * ease(Q(S, 1, 'hugs the axis', 2.6)), m = Math.floor(k + 1e-9);
  const SX = x => ST.cx + x * ST.kx, SY = y => ST.cy - y * ST.ky;
  box(SX(-1.06), SY(1.12), ST.kx * 2.12, ST.ky * 2.24, C.dim, la * 0.45, 1);
  line(SX(-1.06), SY(0), SX(1.06), SY(0), C.dim, la * 0.9, 1.6);
  ctx.save(); ctx.setLineDash([4, 6]); line(SX(0), SY(1.12), SX(0), SY(-1.12), C.dim, la * 0.5, 1); ctx.restore();
  const f = (x, e) => Math.sign(x) * Math.pow(Math.abs(x), e);
  const ghost = [], live = [];
  for (let i = 0; i <= 120; i++) { const x = -1 + i / 60; ghost.push([SX(x), SY(x)]); live.push([SX(x), SY(f(x, k))]); }
  polyline(ghost, C.dim, la * (k > 1.02 ? 0.7 : 0), 2);
  polyline(live, C.cyan, la, 3.2);
  dot(SX(0), SY(0), 12, 'g', la);
  txt('x₀ = 0', SX(0) + 14, SY(0) + 30, { size: 17, fam: F.mono, c: C.dim, a: la });
  txt('y = x', SX(0.4) - 12, SY(0.4) - 14, { size: 20, fam: F.math, w: 700, align: 'right', c: k < 1.02 ? C.cyan : C.dim, a: la });
  txt('y = x⁵', SX(0.66), SY(0) + 44, { size: 22, fam: F.math, w: 700, align: 'center', c: C.cyan, a: la * clamp(k - 4) });
  txt(`m = ${m}`, SX(-1.06) + 22, SY(1.12) + 46, { size: 44, fam: F.orb, w: 900, c: C.now, a: la, ab: 2 });
  txt(m === 1 ? 'one zero, counted once' : `one zero, counted ${m} times`, SX(-1.06) + 22, SY(1.12) + 78, { size: 18, fam: F.mono, w: 700, c: C.white, a: la });
  /* the jet of x^m at 0: m leading zeros, then m! */
  const ja = at(S, 1, 0.6, -0.2) * out;
  const cw = 100, jx = SX(0) - 3 * cw, jy = 742;
  for (let j = 0; j < 6; j++) {
    const v = j === m ? FACT(m) : 0, x = jx + j * cw + cw / 2, hot = j === m;
    box(jx + j * cw + 6, jy - 30, cw - 12, 44, hot ? C.now : C.cyan, ja * (hot ? 1 : 0.5), hot ? 2.2 : 1.2, hot ? rgba(C.now, 0.12) : null);
    txt(DER[j] + '(0)', x, jy - 40, { size: 15, fam: F.math, align: 'center', c: C.dim, a: ja });
    txt(String(v), x, jy + 2, { size: 24, fam: F.mono, w: 700, align: 'center', c: hot ? C.now : C.cyan, a: ja });
  }
  /* right: the 16 weights of Sym³ ⊗ Sym³ and a lowering staircase */
  const ra = Math.max(at(S, 2, 0.8, -0.4), 0.3 * at(S, 1, 0.8)) * out;
  if (ra > 0.003) {
    box(LX(0) - 44, LY(3) - 44, 3 * LAT.step + 88, 3 * LAT.step + 88, C.cyan, ra * 0.85, 1.6, rgba(C.cyan, 0.03));
    txt('Sym³ ⊗ Sym³ · 16 weights (p, q)', LX(1.5), LY(3) - 66, { size: 20, fam: F.mono, w: 700, align: 'center', c: C.cyan, a: ra });
    for (let p = 0; p < 4; p++) {
      line(LX(p), LY(0), LX(p), LY(3), C.dim, ra * 0.25, 1); line(LX(0), LY(p), LX(3), LY(p), C.dim, ra * 0.25, 1);
      txt(String(p), LX(p), LY(0) + 76, { size: 17, fam: F.mono, align: 'center', c: C.dim, a: ra });
      txt(String(p), LX(0) - 62, LY(p) + 6, { size: 17, fam: F.mono, align: 'right', c: C.dim, a: ra });
    }
    txt('p', LX(3) + 60, LY(0) + 76, { size: 18, fam: F.math, c: C.dim, a: ra });
    txt('q', LX(0) - 62, LY(3) - 50, { size: 18, fam: F.math, align: 'right', c: C.dim, a: ra });
    for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) disc(LX(p), LY(q), 5, C.dim, ra * 0.9);
    const t0 = L2.s + 1.0, beat = Math.max(0.5, (L2.e - L2.s - 1.4) / 6);
    STAIR.slice(1).forEach(([p, q], i) => {
      const [p0, q0] = STAIR[i], s = clamp((u - t0 - beat * i) / 0.4);
      if (s <= 0) return;
      const x1 = LX(p0), y1 = LY(q0), x2 = LX(p), y2 = LY(q), dx = (x2 - x1) * 0.18, dy = (y2 - y1) * 0.18;
      arrow(x1 + dx, y1 + dy, lerp(x1 + dx, x2 - dx, ease(s)), lerp(y1 + dy, y2 - dy, ease(s)), C.cyan, ra * out, 2.6);
      const coef = p < p0 ? p0 : q0;   // the divided-power coefficient C(p, 1) = p of x ↦ x + t·y
      txt(`×${coef}`, (x1 + x2) / 2 + (p < p0 ? 0 : 16), (y1 + y2) / 2 + (p < p0 ? -12 : 6), { size: 17, fam: F.mono, w: 700, align: p < p0 ? 'center' : 'left', c: C.now, a: ra * s });
      disc(x2, y2, 7, C.cyan, ra * s);
    });
    dot(LX(3), LY(3), 15, 'g', ra);
    const inBox = STAIR.every(([p, q]) => p >= 0 && p <= 3 && q >= 0 && q <= 3);
    txt('D⁽ᵏ⁾ xᵖ = C(p, k) · xᵖ⁻ᵏ · no division by k!', LX(1.5), LY(0) + 118, { size: 21, fam: F.math, w: 700, align: 'center', c: C.white, a: Q(S, 2, 'divided powers', 0.6) * out });
    txt(`${STAIR.length - 1} / ${STAIR.length - 1} steps inside the box`, LX(1.5), LY(0) + 152, { size: 17, fam: F.mono, w: 700, align: 'center', c: C.cyan, a: Q(S, 2, 'stays inside the box', 0.6) * out * (inBox ? 1 : 0) });
  }
};

/* ======================================================================= */
/*                     4 · chaining √X mirrors                              */
/* ======================================================================= */
const RUNGS = 8, ROOT_X = 8, X_SCALE = 64;   // X = 64, m = √X = 8 (figures/ch04-theta-chain.py)
const rungX = i => 268 + i * 30, rungY = i => 790 - i * 68;
SCENES.chain = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L0 = lineAt(S, 0);
  badgeQ(S, [[0, null, 'argued'], [2, 'Lean checks', 'lean']]);
  /* the ladder U(X₀) → … → U(X₈) */
  const la = at(S, 0, 0.6, -0.3) * out;
  const c0 = phraseAt(S, 0, 'Each theta lift'), climb = clamp((u - c0) / Math.max(1, L0.e - c0 + 0.4));
  const kf = RUNGS * ease(climb), kk = Math.floor(kf + 1e-6);
  for (let i = 0; i <= RUNGS; i++) {
    const x = rungX(i), y = rungY(i), lit = i <= kk, now = i === kk && climb < 1;
    if (i > 0) {
      const ga = la * clamp(kf - i + 1);
      arrow(rungX(i - 1) + 10, rungY(i - 1) - 25, x + 10, y + 25, C.cyan, Math.max(la * 0.2, ga), 2);
      txt('θ', (rungX(i - 1) + x) / 2 + 26, (rungY(i - 1) + y) / 2 + 6, { size: 18, fam: F.math, w: 700, c: C.cyan, a: Math.max(la * 0.25, ga) });
    }
    box(x - 84, y - 23, 168, 46, now ? C.now : lit ? C.cyan : C.dim, la * (lit ? 1 : 0.45), now ? 2.4 : 1.4, now ? rgba(C.now, 0.14) : rgba(C.bg, 0.6));
    txt(`U(X${subN(i)})`, x, y + 8, { size: 22, fam: F.math, w: 700, align: 'center', c: now ? C.now : lit ? C.white : C.dim, a: la });
    if (i >= 1 && i <= kk) txt('+1', x + 100, y + 8, { size: 18, fam: F.mono, w: 700, c: C.now, a: la * clamp(kf - i + 1) * (now ? 1 : 0.5) });
  }
  txt('= U(Xₘ)', rungX(RUNGS) + 146, rungY(RUNGS) + 8, { size: 20, fam: F.math, w: 700, c: C.white, a: la * clamp(kf - RUNGS + 1) });
  txt(`rung ${Math.min(RUNGS, kk)} / ${RUNGS}`, 640, 470, { size: 36, fam: F.orb, w: 900, c: C.now, a: la, ab: 2 });
  txt(`X = ${X_SCALE} · m = √X = ${ROOT_X}`, 640, 508, { size: 19, fam: F.mono, w: 700, c: C.white, a: la });
  txt('one theta lift = one rung', 640, 538, { size: 16, fam: F.mono, c: C.dim, a: la });
  /* right: the seesaw */
  const sa = at(S, 1, 0.8, -0.3) * out;
  if (sa > 0.003) {
    const swap = ease(Q(S, 1, 'A seesaw trades', 1.2));
    const N = { tl: [1090, 262], tr: [1480, 262], bl: [1090, 452], br: [1480, 452] };
    txt('SEESAW · 跷跷板', 1285, 214, { size: 18, fam: F.mono, w: 700, align: 'center', c: C.argued, a: sa, ls: 2 });
    ctx.save(); ctx.setLineDash([7, 7]);
    line(N.tl[0] + 60, N.tl[1] + 24, N.br[0] - 60, N.br[1] - 24, C.dim, sa * 0.8, 1.6);
    line(N.tr[0] - 60, N.tr[1] + 24, N.bl[0] + 60, N.bl[1] - 24, C.dim, sa * 0.8, 1.6);
    ctx.restore();
    fillBox(1285 - 52, 364 - 17, 104, 24, C.bg, sa * 0.85);
    txt('dual pairs', 1285, 364, { size: 15, fam: F.mono, align: 'center', c: C.dim, a: sa });
    line(N.tl[0], N.tl[1] + 25, N.bl[0], N.bl[1] - 25, C.cyan, sa, 2.2);
    line(N.tr[0], N.tr[1] + 25, N.br[0], N.br[1] - 25, C.argued, sa, 2.2);
    [['tl', 'U(Xₘ)', C.cyan], ['tr', 'U(Y)', C.argued], ['bl', 'U(X₀)', C.cyan], ['br', 'H', C.argued]].forEach(([k2, s, c]) => {
      box(N[k2][0] - 80, N[k2][1] - 25, 160, 50, c, sa, 1.8, rgba(C.bg, 0.7));
      txt(s, N[k2][0], N[k2][1] + 9, { size: 24, fam: F.math, w: 700, align: 'center', c: C.white, a: sa });
    });
    /* the plank: heavy on the tangled side, then tipped to the clean Bessel side */
    const tilt = lerp(-0.075, 0.075, swap), cx = 1285, cy = 586, half = 330;
    const ex = Math.cos(tilt) * half, ey = Math.sin(tilt) * half;
    ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = rgba(C.argued, 0.35); ctx.strokeStyle = C.argued; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx - 26, cy + 46); ctx.lineTo(cx + 26, cy + 46); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    glow(cx - ex, cy - ey, cx + ex, cy + ey, C.white, sa * 0.85, 3);
    const lx = cx - ex, ly = cy - ey, rx = cx + ex, ry = cy + ey;
    txt('lifted period', lx + 10, ly - 22, { size: 21, fam: F.mono, w: 700, c: C.cyan, a: sa });
    txt('Bessel period', rx - 10, ry - 22, { size: 21, fam: F.mono, w: 700, align: 'right', c: C.argued, a: sa });
    txt('Hecke-independent', rx - 10, ry + 30, { size: 15, fam: F.mono, align: 'right', c: C.argued, a: sa * swap });
    txt('=', cx, cy - 18, { size: 30, fam: F.math, w: 700, align: 'center', c: C.white, a: sa * swap });
    /* the Hecke characters μ₁ … μ₈ tangled around the lifted period, flung off by the swap */
    const tang = sa * (1 - swap) * (1 - Q(S, 2, 'Lean checks', 0.4));
    const mus = [];
    for (let i = 0; i < 8; i++) {
      const ang = i * TAU / 8 + u * 0.9 * (i % 2 ? 1 : -1), rr = 50 + 12 * Math.sin(u * 1.7 + i) + 70 * swap;
      mus.push([lx + 110 + Math.cos(ang) * rr * 1.6, ly + 62 + Math.sin(ang) * rr * 0.42]);
    }
    for (let i = 0; i < 8; i++) { const p = mus[i], q = mus[(i + 3) % 8]; line(p[0], p[1], q[0], q[1], C.mag, tang * 0.35, 1.2); }
    mus.forEach((p, i) => txt(`μ${subN(i + 1)}`, p[0], p[1] + 6, { size: 17, fam: F.math, w: 700, align: 'center', c: C.mag, a: tang }));
  }
  /* the Gauss identity, Lean-checked, evaluated on 𝔽₅ */
  const ga = Q(S, 2, 'Lean checks', 0.6) * out;
  panel(860, 664, 870, 166, ga, C.lean, 'GAUSS IDENTITY · 高斯恒等式 · final_gaussOp');
  txt('Σc ρ(c)v = 0  ⇒  Gψ(G*ψ v) = q·v  and  G*ψ(Gψ v) = q·v', 882, 724, { size: 23, fam: F.math, w: 700, c: C.white, a: ga });
  txt('Gψ = Σ ψ(c)·ρ(c),  G*ψ = Σ ψ(−c)·ρ(c⁻¹),  c ∈ 𝔽ˣ,  ψ ≠ 1,  q = |𝔽|', 882, 760, { size: 18, fam: F.math, c: C.white, a: ga * 0.8 });
  leanChip(882, 808, GID.gauss, Q(S, 2, 'go there and back', 0.6) * out, { size: 18, maxW: 590 });
  txt(`𝔽₅ (q = 5): G·G* = ${GAUSS.there[0].toFixed(3)}`, 1712, 808, { size: 17, fam: F.mono, w: 700, align: 'right', c: C.cyan, a: Q(S, 2, 'exactly q times', 0.6) * out });
};

/* ======================================================================= */
/*                  5 · breaking the 2/3 wall                               */
/* ======================================================================= */
const BG = { x0: 170, x1: 880, y0: 222, y1: 640, b1: 4, s0: 0.45, s1: 1.02 };
const BX = b => BG.x0 + b / BG.b1 * (BG.x1 - BG.x0), BY = s => BG.y1 - (s - BG.s0) / (BG.s1 - BG.s0) * (BG.y1 - BG.y0);
const HG = { x0: 1010, x1: 1690, y0: 222, y1: 640, r1: 7.4, d0: -0.3, d1: 6.2 };
const HX = r => HG.x0 + r / HG.r1 * (HG.x1 - HG.x0), HY = d => HG.y1 - (d - HG.d0) / (HG.d1 - HG.d0) * (HG.y1 - HG.y0);
SCENES.slopes = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L0 = lineAt(S, 0);
  badgeQ(S, [[0, null, 'argued'], [2, 'Lean checks', 'lean']]);
  const fa = at(S, 0, 0.6, -0.3) * out;
  const g = ease(Q(S, 1, 'So glue', 2.4));
  /* left: the zero-free edge σ(m/√X), a MODEL */
  box(BG.x0 - 10, BG.y0 - 10, BG.x1 - BG.x0 + 20, BG.y1 - BG.y0 + 20, C.dim, fa * 0.5, 1);
  txt('zero-free edge σ(m/√X)', BG.x0, BG.y0 - 26, { size: 21, fam: F.mono, w: 700, c: C.white, a: fa });
  txt('MODEL · illustrative', BG.x1, BG.y0 - 26, { size: 15, fam: F.mono, w: 700, align: 'right', c: C.argued, a: fa });
  [0, 1, 2, 3, 4].forEach(b => txt(String(b), BX(b), BG.y1 + 36, { size: 16, fam: F.mono, align: 'center', c: C.dim, a: fa }));
  txt('m / √X', BG.x1 + 26, BG.y1 + 36, { size: 17, fam: F.math, c: C.dim, a: fa });
  [0.6, 0.8, 1].forEach(s => { line(BG.x0, BY(s), BG.x1, BY(s), C.dim, fa * 0.15, 1); txt(s.toFixed(1), BG.x0 - 20, BY(s) + 6, { size: 15, fam: F.mono, align: 'right', c: C.dim, a: fa }); });
  const wall = Q(S, 0, 'hits a wall', 0.4), pulse = wall * Math.max(0, Math.sin(Math.min(1, (u - phraseAt(S, 0, 'hits a wall')) / 1.6) * Math.PI));
  ctx.save(); ctx.setLineDash([10, 8]);
  line(BG.x0, BY(2 / 3), BG.x1, BY(2 / 3), C.mag, fa * (0.8 + 0.2 * pulse), 2 + 3 * pulse);
  line(BG.x0, BY(0.5), BG.x1, BY(0.5), C.lean, fa * 0.85, 2);
  ctx.restore();
  txt('2/3', BG.x1 + 14, BY(2 / 3) + 7, { size: 20, fam: F.math, w: 700, c: C.mag, a: fa });
  txt('1/2', BG.x1 + 14, BY(0.5) + 7, { size: 20, fam: F.math, w: 700, c: C.lean, a: fa });
  const s1p = ease(clamp((u - L0.s - 0.2) / Math.max(1, L0.e - L0.s)));
  const one = [], glued = [];
  for (let i = 0; i <= 160; i++) { const b = BG.b1 * i / 160; if (b <= BG.b1 * s1p + 1e-9) one.push([BX(b), BY(sigma1(b))]); glued.push([BX(b), BY(sigmaG(b, g))]); }
  polyline(one, C.mag, fa, 3);
  if (s1p < 1 && one.length) { const p = one[one.length - 1]; disc(p[0], p[1], 6, C.now, fa); }
  txt('one character', BX(2.4), BY(2 / 3) - 18, { size: 17, fam: F.mono, w: 700, c: C.mag, a: fa * clamp(s1p * 3 - 1.5) });
  polyline(glued, C.cyan, fa * clamp(g * 4), 3.2);
  txt('glued family', BX(2.4), BY(sigmaG(2.4, g)) + 30, { size: 17, fam: F.mono, w: 700, c: C.cyan, a: fa * clamp(g * 2 - 1) });
  const run = Q(S, 2, 'The curve slips', 2.6);
  if (run > 0.003) {
    const b = BG.b1 * ease(run);
    dot(BX(b), BY(sigmaG(b, 1)), 13, 'g', fa);
    const pa = fa * clamp((b - CROSS_B) * 4);
    ring(BX(CROSS_B), BY(2 / 3), 13, C.now, pa, 2.4);
    line(BX(CROSS_B) + 9, BY(2 / 3) - 10, BX(0.8) - 6, BY(0.86) + 8, C.now, pa * 0.7, 1.2);
    txt(`passes 2/3 at m/√X ≈ ${CROSS_B.toFixed(2)}`, BX(0.8), BY(0.86), { size: 16, fam: F.mono, w: 700, c: C.now, a: pa });
  }
  /* right: the Harder–Narasimhan roof of a rank-7 lattice, flattened by the glue */
  const e = 0.82 * g, R = HN.roof(e);
  box(HG.x0 - 10, HG.y0 - 10, HG.x1 - HG.x0 + 20, HG.y1 - HG.y0 + 20, C.dim, fa * 0.5, 1);
  txt('Harder–Narasimhan roof · rk 7', HG.x0, HG.y0 - 26, { size: 21, fam: F.mono, w: 700, c: C.white, a: fa });
  [0, 1, 3, 5, 7].forEach(r => txt(String(r), HX(r), HG.y1 + 36, { size: 16, fam: F.mono, align: 'center', c: C.dim, a: fa }));
  [2, 4, 6].forEach(d => { line(HG.x0, HY(d), HG.x1, HY(d), C.dim, fa * 0.15, 1); txt(String(d), HG.x0 - 20, HY(d) + 6, { size: 15, fam: F.mono, align: 'right', c: C.dim, a: fa }); });
  txt('rk', HG.x1 + 24, HG.y1 + 36, { size: 17, fam: F.mono, c: C.dim, a: fa });
  txt('deg', HG.x0 - 20, HG.y0 - 22, { size: 16, fam: F.mono, align: 'right', c: C.dim, a: fa });
  ctx.save(); ctx.setLineDash([8, 7]); line(HX(0), HY(0), HX(7), HY(5), C.dim, fa * 0.9, 1.6); ctx.restore();
  polyline(R.H.map(p => [HX(p[0]), HY(p[1])]), C.cyan, fa, 3);
  glow(HX(R.H[0][0]), HY(R.H[0][1]), HX(R.H[1][0]), HY(R.H[1][1]), C.now, fa, 3.4);
  R.P.forEach(p => { const onHull = R.H.some(q => q[0] === p[0]); if (onHull) disc(HX(p[0]), HY(p[1]), 7, C.cyan, fa); else ring(HX(p[0]), HY(p[1]), 7, C.dim, fa, 2); });
  disc(HX(0), HY(0), 7, C.now, fa);
  txt(`μmax = ${R.muMax.toFixed(2)}`, HG.x1 - 14, HG.y1 - 52, { size: 24, fam: F.mono, w: 700, align: 'right', c: C.now, a: fa });
  txt('mean slope 5/7 ≈ 0.714', HG.x1 - 14, HG.y1 - 20, { size: 17, fam: F.mono, w: 700, align: 'right', c: C.dim, a: fa });
  txt(g > 0.02 ? `glue ${(100 * e).toFixed(0)}% toward the mean` : 'steep first rafter', HX(0) + 18, HY(5.6), { size: 16, fam: F.mono, w: 700, c: g > 0.02 ? C.cyan : C.now, a: fa });
  /* the short-vector bound, Lean-checked */
  const la = Q(S, 2, 'Lean checks', 0.6) * out;
  panel(170, 690, 1520, 140, la, C.lean, 'SHORT VECTOR · 短向量');
  txt('L ≠ 0 discrete  ⇒  ∃ v ∈ L,  v ≠ 0,  ‖v‖ ≤ √rk(L) · covol(L)^(1/rk(L))', 192, 750, { size: 21, fam: F.math, w: 700, c: C.white, a: la });
  txt(`rk 7, deg = −log covol = 5:  ‖v‖ ≤ √7·e^(−5/7) ≈ ${HN.short.toFixed(3)}`, 1668, 750, { size: 17, fam: F.mono, w: 700, align: 'right', c: C.cyan, a: Q(S, 2, 'under that roof', 0.6) * out });
  leanChip(192, 800, GID.short, Q(S, 2, 'short-vector bound', 0.6) * out, { size: 19, maxW: 1450 });
};

/* ======================================================================= */
/*               6 · Behrend's sphere and closing the net                   */
/* ======================================================================= */
const wpt = p => [(p[0] - 1.4) / 4, (p[1] - 1.4) / 4, (p[2] - 1.4) / 4];   // the cube {0, …, 4}³, edge 1
const SHELL = (() => {   // the part of x² + y² + z² = 17 inside the cube (viz/behrend-sphere shellPatch)
  const r = Math.sqrt(17), e = 4, t0 = Math.acos(Math.min(1, e / r));
  const t1 = phi => { const q = e / (r * Math.max(Math.cos(phi), Math.sin(phi))); return q >= 1 ? Math.PI / 2 : Math.asin(q); };
  return (uu, v) => { const th = t0 + uu * Math.max(0, t1(v) - t0); return [r * Math.sin(th) * Math.cos(v), r * Math.sin(th) * Math.sin(v), r * Math.cos(th)]; };
})();
const CUBE_EDGES = (() => {
  const E = [];
  for (let k = 0; k < 3; k++) for (const i of [0, 4]) for (const j of [0, 4]) {
    const a = [0, 0, 0], b = [0, 0, 0];
    a[(k + 1) % 3] = b[(k + 1) % 3] = i; a[(k + 2) % 3] = b[(k + 2) % 3] = j; b[k] = 4; E.push([a, b]);
  }
  return E;
})();
const SPHERE_RECT = { x: 140, y: 168, w: 740, h: 532 };
function behrendShot(S, a, q) {
  const sh = solid('behrend', Object.assign({ yaw: -2.25 + 0.075 * S.u, pitch: 0.36, radius: 0.35, cx: 0.5, cy: 0.47 }, SPHERE_RECT));
  sh.begin();
  const corner = wpt([0, 0, 0]);
  sh.glass('ball', corner, Math.sqrt(17) / 4, { color: C.cyan, alpha: 0.05, rim: 0.34 });
  sh.surface('shell', (uu, v) => wpt(SHELL(uu, v)), { u: [0, 1], v: [0, Math.PI / 2], nu: 24, nv: 40, color: C.cyan, alpha: 0.2, pick: false, occlude: false, grid: { every: [24, 5], color: C.cyan, alpha: 0.55 } });
  CUBE_EDGES.forEach(([p, r]) => sh.line([wpt(p), wpt(r)], { color: C.dim, width: 1.3, alpha: 0.85 }));
  BEH.pts.forEach(p => { if (keyOf(p) !== keyOf(q.a) && keyOf(p) !== keyOf(q.b)) sh.bead(wpt(p), { color: C.cyan, r: 6 }); });
  sh.line([corner, wpt(q.a)], { color: C.dim, width: 1.4, alpha: 0.7 });
  sh.line([corner, wpt(q.m)], { color: C.mag, width: 2, alpha: 0.9 });
  sh.line([wpt(q.a), wpt(q.b)], { color: C.now, width: 3 });
  sh.bead(wpt(q.a), { color: C.now, r: 8 }); sh.bead(wpt(q.b), { color: C.now, r: 8 }); sh.bead(wpt(q.m), { color: C.mag, r: 8 });
  sh.end(a);
  return sh;
}
SCENES.net = S => {
  const u = S.u, L1 = lineAt(S, 1), L2 = lineAt(S, 2);
  badgeQ(S, [[0, null, 'computed'], [1, 'Sets like this', 'lean']]);
  const tB = phraseAt(S, 1, 'Sets like this'), tC = L2.s, tEnd = L2.e + 0.5;
  const fin = clamp((u - tEnd) / 0.8);                         // the closing card takes over
  const sa = clamp(u / 0.6) * (1 - fin);
  /* four pairs while the midpoint is explained, then the widest pair is held */
  const pi = u < tB ? Math.min(SHOW_PAIRS.length - 1, Math.floor(Math.max(0, u - 0.4) / 2.2)) : 0, q = SHOW_PAIRS[pi];
  if (sa > 0.003) {
    const sh = behrendShot(S, sa, q);
    BEH.all.forEach(p => { const s = sh.p(wpt(p)); disc(s[0], s[1], 1.8, C.white, sa * 0.22); });
    const A = sh.anchor(wpt(q.a)), B = sh.anchor(wpt(q.b)), M = sh.anchor(wpt(q.m));
    txt('a', A.x + 12, A.y - 12, { size: 24, fam: F.math, w: 700, c: C.now, a: sa * (A.hidden ? 0.35 : 1) });
    txt('b', B.x + 12, B.y - 12, { size: 24, fam: F.math, w: 700, c: C.now, a: sa * (B.hidden ? 0.35 : 1) });
    txt('m', M.x + 12, M.y + 26, { size: 24, fam: F.math, w: 700, c: C.mag, a: sa * (M.hidden ? 0.35 : 1) });
    txt('R = 17 · {0, …, 4}³', SPHERE_RECT.x + 20, SPHERE_RECT.y + SPHERE_RECT.h - 18, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: sa, ls: 1 });
  }
  const px = 960, pw = 770;
  /* phase A: the midpoint sinks inside */
  const aA = win(u, 0.3, tB + 0.2, 0.6, 0.5);
  if (aA > 0.003) {
    panel(px, 196, pw, 360, aA, C.cyan, 'BEHREND SHELL · 球壳');
    txt(`{0, …, 4}³ · ${BEH.all.length} points · ${BEH.nShells} shells`, px + 24, 256, { size: 20, fam: F.mono, w: 700, c: C.white, a: aA });
    txt(`R = x² + y² + z² = ${BEH.R} · ${BEH.pts.length} points`, px + 24, 300, { size: 26, fam: F.math, w: 700, c: C.cyan, a: aA });
    const cyc = clamp((u - 0.4 - 2.2 * pi) / 0.35);
    txt(`a = ${fmtPt(q.a)}    b = ${fmtPt(q.b)}`, px + 24, 352, { size: 24, fam: F.math, w: 700, c: C.now, a: aA * cyc });
    txt(`m = (a + b) / 2 = ${fmtPt(q.m)}`, px + 24, 396, { size: 24, fam: F.math, w: 700, c: C.mag, a: aA * cyc });
    txt(`‖m‖² = R − ‖a − b‖²/4 = 17 − ${q.d2}/4 = ${q.m2} < 17`, px + 24, 444, { size: 25, fam: F.math, w: 700, c: C.white, a: aA * cyc, ab: 1 });
    txt(`${BEH.pairs} pairs · ${BEH.inside} midpoints strictly inside · ${BEH.aps} three-term APs`, px + 24, 500, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: aA * Q(S, 0, 'strictly inside', 0.6) });
    txt('computed here, exactly', px + 24, 532, { size: 15, fam: F.mono, c: C.dim, a: aA });
  }
  /* phase B: every Dirichlet character */
  const aB = win(u, tB, tC + 0.3, 0.6, 0.5);
  if (aB > 0.003) {
    panel(px, 196, pw, 470, aB, C.lean, 'EVERY CHARACTER · 每个狄利克雷特征');
    txt('χ mod N · φ(N) of them · N ≤ 12 shown', px + 24, 252, { size: 17, fam: F.mono, w: 700, c: C.dim, a: aB });
    const net = clamp((u - phraseAt(S, 1, 'the net closes')) / 1.6);
    PHI_N.forEach((n, i) => {
      const y = 290 + i * 30, lit = clamp(net * 13 - i);
      txt(`N = ${i + 1}`, px + 92, y + 6, { size: 15, fam: F.mono, align: 'right', c: C.dim, a: aB });
      for (let j = 0; j < n; j++) {
        const x = px + 114 + j * 26;
        disc(x, y, 6, C.dim, aB * 0.5 * (1 - lit));
        disc(x, y, 6.5, C.lean, aB * lit);
        if (j > 0) line(x - 20, y, x - 6, y, C.lean, aB * lit * 0.6, 1.4);
      }
      if (i > 0) line(px + 114, y - 24, px + 114, y - 6, C.lean, aB * lit * 0.6, 1.4);
    });
    txt('L(χ, s) ≠ 0', px + 404, 420, { size: 42, fam: F.math, w: 700, c: C.white, a: aB * clamp(net * 2), ab: 2 });
    txt('Re(s) > 1/2 · χ ≠ 1 or s ≠ 1', px + 404, 464, { size: 19, fam: F.math, w: 700, c: C.white, a: aB * clamp(net * 2) });
    txt('every N, every χ', px + 404, 502, { size: 18, fam: F.mono, w: 700, c: C.lean, a: aB * clamp(net * 2 - 0.6) });
  }
  /* phase C: no zero survives right of one half */
  const aC = win(u, tC, tEnd + 0.8, 0.6, 0.8);
  if (aC > 0.003) {
    panel(px, 196, pw, 470, aC, C.lean, 'THE NET CLOSES · 收网');
    txt('every nontrivial zero ρ of ζ', px + pw / 2, 290, { size: 24, fam: F.mono, w: 700, align: 'center', c: C.white, a: aC * 0.9 });
    txt('Re(ρ) = 1/2', px + pw / 2, 400, { size: 84, fam: F.math, w: 700, align: 'center', c: C.white, a: aC, ab: 3 });
    stamp('LEAN ✓', px + pw / 2, 528, Q(S, 2, 'Lean has checked', 0.45, 0.1) * (1 - fin), C.lean, 54, -0.06);
    leanChip(px + pw / 2, 630, GID.rh, Q(S, 2, 'The mirror holds', 0.6) * (1 - fin), { size: 26, align: 'center', maxW: pw - 60 });
  }
  /* the band of Lean citations under the sphere */
  const band = clamp((u - tB) / 0.6) * (1 - fin);
  leanChip(150, 752, GID.triv, band, { size: 19, maxW: 640 });
  txt('E a number field, g prime: finite g-subgroups of GL_k(E) are trivial when [E:ℚ]·k < g − 1', 712, 752, { size: 17, fam: F.math, c: C.white, a: band * 0.85 });
  leanChip(150, 802, GID.every, clamp((u - phraseAt(S, 1, 'every Dirichlet character')) / 0.6) * (1 - fin), { size: 18, maxW: 1580 });
  /* closing card */
  if (fin > 0.003) {
    const b = DATA.book, cx = W / 2;
    txt(b.code, cx, 238, { size: 24, fam: F.mono, w: 700, align: 'center', c: C.cyan, a: fin, ls: 10 });
    txt(b.title.zh, cx, 318, { size: 58, fam: F.zh, w: 900, align: 'center', c: C.white, a: fin, ab: 3 });
    txt(b.title.en, cx, 372, { size: 28, fam: F.disp, w: 700, align: 'center', c: C.white, a: fin * 0.92, ls: 1 });
    const f2 = clamp((u - tEnd - 0.6) / 0.8);
    txt(`FILM · ${DATA.film.title.toUpperCase()}`, cx, 436, { size: 22, fam: F.mono, w: 700, align: 'center', c: C.mag, a: f2, ls: 3 });
    txt(DATA.film.title_zh, cx, 474, { size: 26, fam: F.zh, w: 700, align: 'center', c: C.white, a: f2 * 0.85 });
    const f3 = clamp((u - tEnd - 1.2) / 0.8);
    const y = leanList(cx, 540, f3, { align: 'center', size: 19, gap: 38 });
    const pin = DATA.pin || {};
    if (pin.commit) txt(`github.com/${pin.repo} @ ${pin.commit.slice(0, 12)}`, cx, y + 14, { size: 18, fam: F.mono, align: 'center', c: C.dim, a: f3, ls: 1 });
  }
};

/* ---------- poster ---------- */
FILM.poster = () => {
  const t = 15.2;
  background(t, TL.scenes[0], 0, 9);
  const G = planeGeo(150, 1010, 360, 900);
  sPlane(G, { a: 1, strip: 1, trivial: 1, first: 1, line: 1, rho: 1, twin: 1, euler: 1, small: true });
  txt(DATA.film.title_zh, W / 2, 196, { size: 104, fam: F.zh, w: 900, align: 'center', c: C.white, ab: 4 });
  txt(DATA.film.title.toUpperCase(), W / 2, 272, { size: 40, fam: F.orb, w: 900, align: 'center', c: C.white, ab: 3, ls: 6 });
  const rx = 1440;
  rich([['ρ  ↦  '], ['1 − '], ['ρ', null, true]], rx, 470, { size: 64, align: 'center', ab: 2 });
  txt('ζ(ρ) = 0  ⇒  Re(ρ) = 1/2', rx, 572, { size: 40, fam: F.math, w: 700, align: 'center', c: C.cyan, ab: 1 });
  bloom(0.55);
  leanChip(rx, 668, GID.rh, 1, { size: 26, align: 'center', maxW: 760 });
  txt(`${DATA.book.code} · FILM`, rx, 790, { size: 22, fam: F.mono, w: 700, align: 'center', c: C.cyan, ls: 8 });
  txt(DATA.book.title.zh, rx, 836, { size: 26, fam: F.zh, w: 700, align: 'center', c: C.white, a: 0.9 });
  hud(t, 456, 0, TL.scenes[0]);
  post(3);
};
