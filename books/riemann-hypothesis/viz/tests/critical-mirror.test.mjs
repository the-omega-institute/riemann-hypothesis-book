#!/usr/bin/env node
// Browser regression suite for ZETA//MIRROR (books/riemann-hypothesis/viz/critical-mirror/):
//   node books/riemann-hypothesis/viz/tests/critical-mirror.test.mjs      (or: node tools/node/viz-test.mjs riemann-hypothesis)
// It first runs the quality gates every stage-first page must pass, then reads the page through the read-only probe
// window.MIRROR_DEBUG and checks every claim against an independent implementation written here: Λ(n) from a sieve of
// Eratosthenes and the prime powers p^k ≤ 120, Sz(x) summed over prime powers instead of over n, the mirror 1 − conj(ρ)
// in complex arithmetic, the wave −2 Re(x^ρ/(ρ(ρ − 1))) through complex exp and division, its first exit from ±0.05√x
// on a finer grid, and the zeros of the Euler factors 1 − p^(−s) by solving p^(−s) = 1 directly.
import { session, stageFirstChecks, settle, until, playsAfter, openStill } from '../../../../tools/node/viz-testkit.mjs';

const BOOK = 'riemann-hypothesis', ID = 'critical-mirror';

/* ---------- independent implementation ---------- */
const GAMMA = 0.5772156649015329, LN2PI = Math.log(2 * Math.PI), BAR = 0.05;
const N = 120, prime = new Uint8Array(N + 1).fill(1);
prime[0] = prime[1] = 0;
for (let i = 2; i * i <= N; i++) if (prime[i]) for (let j = i * i; j <= N; j += i) prime[j] = 0;
const vonMangoldt = new Array(N + 1).fill(0), powers = [];   // powers: [p^k, ln p]
for (let p = 2; p <= N; p++) if (prime[p]) for (let q = p; q <= N; q *= p) { vonMangoldt[q] = Math.log(p); powers.push([q, Math.log(p)]); }
/** Sz(x) = Σ over prime powers q ≤ x of ln p · (x/q − 1). */
const sz = (x) => powers.reduce((s, [q, l]) => (q <= x ? s + l * (x / q - 1) : s), 0);
const gz = (x) => sz(x) - x * Math.log(x) + (1 + GAMMA) * x;
/* complex numbers */
const C = (re, im = 0) => ({ re, im });
const add = (a, b) => C(a.re + b.re, a.im + b.im), sub = (a, b) => C(a.re - b.re, a.im - b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const exp = (z) => C(Math.exp(z.re) * Math.cos(z.im), Math.exp(z.re) * Math.sin(z.im));
const conj = (z) => C(z.re, -z.im), abs = (z) => Math.hypot(z.re, z.im);
/** The mirror image of a zero: 1 − ρ̄. */
const reflect = (rho) => sub(C(1), conj(rho));
/** The term −x^ρ/(ρ(ρ − 1)) − x^ρ̄/(ρ̄(ρ̄ − 1)) of one pair ρ, ρ̄ (computed as a sum of two complex terms, not as −2 Re). */
const pairTerm = (rho) => (x) => {
  const term = (r) => div(exp(mul(C(Math.log(x)), r)), mul(r, sub(r, C(1))));
  const s = add(term(rho), term(conj(rho)));
  return -s.re;
};
/** The right-hand member of a zero and its mirror image. */
const rightOf = (sigma, t) => { const r = C(sigma, t), m = reflect(r); return m.re > r.re ? m : r; };
function firstExit(w, step = 0.002) {
  const f = (x) => Math.abs(w(x)) - BAR * Math.sqrt(x);
  if (f(2) > 0) return 2;
  for (let x = 2; x < 120; x += step) {
    const y = Math.min(120, x + step);
    if (f(y) > 0) { let lo = x, hi = y; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return hi; }
  }
  return null;
}
function largest(w, step = 0.002) { let m = Math.abs(w(120)); for (let x = 2; x < 120; x += step) m = Math.max(m, Math.abs(w(x))); return m; }
/** Zeros of 1 − p^(−s) with Im(s) in [−3, 18]: p^(−s) = 1 ⇔ s ln p ∈ 2πiℤ ⇔ s = 2πik / ln p. */
function eulerZeros() {
  const out = [];
  for (const p of [2, 3, 5]) for (let k = -20; k <= 20; k++) { const im = 2 * Math.PI * k / Math.log(p); if (im >= -3 && im <= 18) out.push({ p, k, im }); }
  return out;
}
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol;
const J = (x) => JSON.stringify(x);

const T = await session();
const { check } = T;

/* ---------- the quality gates of every stage-first page ---------- */
await stageFirstChecks(T, BOOK, ID);

const page = await T.goto(BOOK, ID, '?lang=zh');
await page.evaluate(() => document.fonts && document.fonts.ready); await settle(page);
const D = (fn, arg) => page.evaluate(fn, arg);
const state = async () => { await settle(page); return D(() => window.MIRROR_DEBUG.state); };
const setParams = async (p) => { await D((q) => window.MIRROR_DEBUG.setParams(q), p); return state(); };
const pick = async (id) => { await page.click(`[data-preset="${id}"]`); await settle(page); };
const slide = async (sel, v) => { await page.$eval(sel, (el, val) => { el.value = String(val); el.dispatchEvent(new Event('input', { bubbles: true })); }, v); return state(); };
const text = (sel) => page.textContent(sel);

/* ---------- opening view ---------- */
let st = await state();
check('opens on the card OFF-LINE: ρ = 0.76 + 10i in the mirror scene, the scan finished, the clock paused',
  st.preset === 'off-line' && st.scene === 'mirror' && near(st.sigma, 0.76) && near(st.t, 10) && near(st.rail, st.max) && !st.playing && st.fly === 1, J([st.preset, st.scene, st.sigma, st.t, st.rail, st.max, st.playing, st.fly]));
let m = reflect(C(0.76, 10));
check('the twin of 0.76 + 10i is 1 − conj(ρ) = 0.24 + 10i, and the page draws it there', near(st.mirror[0], m.re, 1e-12) && near(st.mirror[1], m.im, 1e-12) && near(st.twin[0], 0.24, 1e-12) && near(m.re, 0.24, 1e-12), J([st.mirror, st.twin]));
check('page carries its id and the runtime language', (await D(() => document.body.dataset.vizId)) === ID && (await D(() => TRV.lang())) === 'zh');

/* ---------- the prime shadow: Λ(n), Sz(x), Gz(x) ---------- */
check('Λ(n) for n ≤ 120 equals ln p on the prime powers p^k and 0 elsewhere (sieve of Eratosthenes)', st.vonMangoldt.length === 121 && st.vonMangoldt.every((v, n) => near(v, vonMangoldt[n], 1e-12)));
check('Sz(10) ≈ 9.11449 and Sz(100) ≈ 304.51714, on the page and summed over prime powers here',
  near(st.shadow.sz[10], sz(10), 1e-9) && near(sz(10), 9.11449, 5e-6) && near(st.shadow.sz[100], sz(100), 1e-9) && near(sz(100), 304.51714, 5e-6), J(st.shadow.sz));
check('Gz(10) ≈ 1.86080 on the page and here', near(st.shadow.gz[10], gz(10), 1e-9) && near(gz(10), 1.86080, 5e-6), `${st.shadow.gz[10]} vs ${gz(10)}`);
check('Gz(100) ≈ 1.72169 on the page and here', near(st.shadow.gz[100], gz(100), 1e-9) && near(gz(100), 1.72169, 5e-6), `${st.shadow.gz[100]} vs ${gz(100)}`);
check('Gz at 2, 3, 5, 30 and 120 agree, and the chapter values Gz(3) ≈ 1.78238, Gz(30) ≈ 1.77614 hold',
  [2, 3, 5, 30, 120].every((x) => near(st.shadow.gz[x], gz(x), 1e-9)) && near(gz(3), 1.78238, 5e-6) && near(gz(30), 1.77614, 5e-6));
check('the page uses γ = 0.5772156649015329 and ln 2π', st.shadow.gamma === GAMMA && near(st.shadow.ln2pi, LN2PI, 1e-15));
check('Gz(x) − ln 2π at every integer 2 … 120 agrees with the independent sum', st.shadow.integers.length === 119 && st.shadow.integers.every(([x, v]) => near(v, gz(x) - LN2PI, 1e-9)));
let worst = 0, worstAt = 2;
for (let i = 0; i <= 118 * 500; i++) { const x = 2 + i / 500, r = Math.abs(gz(x) - LN2PI) / (BAR * Math.sqrt(x)); if (r > worst) { worst = r; worstAt = x; } }
check('|Gz(x) − ln 2π| ≤ 0.05√x for 2 ≤ x ≤ 120 (checked here every 1/500), as the page says', worst <= 1 && st.shadow.inside && st.shadow.worst <= 1 && near(st.shadow.worst, worst, 0.01), J({ worst, worstAt, page: st.shadow.worst }));
check('the readout of the barrier says 0.548 and that the cyan shadow stays inside', /0\.548/.test(await text('#roEnv')) && /✓/.test(await text('#roEnv')) && near(st.rogue.barrier120, BAR * Math.sqrt(120), 1e-12));

/* ---------- the mirror: 1 − conj(ρ) for many zeros ---------- */
let mirrorOK = true, mirrorBad = '';
for (const [s, t] of [[0.05, 2], [0.24, 10], [0.5, 14.13], [0.62, 7.5], [0.76, 10], [0.98, 17], [0.33, 16.4]]) {
  const q = await setParams({ scene: 'mirror', sigma: s, t, rail: 21 }), r = reflect(C(s, t));
  const ok = near(q.mirror[0], r.re, 1e-12) && near(q.mirror[1], r.im, 1e-12) && near(q.twin[0], r.re, 1e-12) && near(q.sigma + q.mirror[0], 1, 1e-12)
    && q.onLine === (s === 0.5) && near(q.distance, Math.abs(s - 0.5), 1e-12);
  if (!ok && mirrorOK) mirrorBad = J([s, t, q.mirror, q.twin, q.onLine]);
  mirrorOK = mirrorOK && ok;
}
check('for seven zeros the page puts the twin at 1 − conj(ρ): same height, real parts adding up to 1; only σ = 1/2 is on the line', mirrorOK, mirrorBad);
st = await setParams({ scene: 'mirror', sigma: 0.5, t: 14.13, rail: 21 });
check('on the line the twin coincides with ρ (the mirror leaves σ = 1/2 fixed)', st.onLine && near(st.twin[0], 0.5, 1e-12) && near(st.mirror[0], st.sigma, 1e-12));
// the scan line: the twin leaves ρ when the scan reaches the height of ρ
st = await setParams({ scene: 'mirror', sigma: 0.76, t: 10, h: 5 });
check('below ρ the scan line has not sent the twin anywhere yet, and the HUD says so', st.fly === 0 && near(st.twin[0], 0.76, 1e-12) && /还没碰到 ρ/.test(st.readouts.hud), J([st.h, st.fly, st.readouts.hud]));
st = await setParams({ h: 10.45 });
check('half-way past ρ the twin is in flight across the line', st.fly > 0 && st.fly < 1 && st.twin[0] < 0.76 && st.twin[0] > 0.24, J([st.h, st.fly, st.twin]));
st = await setParams({ h: 18 });
check('at the top of the rail the twin has landed on 1 − conj(ρ)', st.fly === 1 && near(st.twin[0], 0.24, 1e-12));

/* ---------- the wave of one pair of would-be zeros ---------- */
let waveOK = true, waveBad = '';
for (const [s, t] of [[0.78, 11.13], [0.5, 14.13], [0.76, 10], [0.24, 10], [0.98, 17], [0.5, 2], [0.62, 6.3]]) {
  const q = await setParams({ scene: 'landau', sigma: s, t, rail: 118 }), rho = rightOf(s, t), w = pairTerm(rho);
  const same = q.wave.every(([x, v]) => near(v, w(x), 1e-9)), b = firstExit(w), big = largest(w);
  const okBurst = b == null ? q.rogue.burst == null : q.rogue.burst != null && near(q.rogue.burst, b, 0.01);
  const ok = same && near(q.rogue.re, rho.re, 1e-12) && okBurst && near(q.rogue.max, big, 2e-3) && near(q.rogue.at120, w(120), 1e-9);
  if (!ok && waveOK) waveBad = J({ s, t, same, page: q.rogue, here: { burst: b, max: big, at120: w(120) } });
  waveOK = waveOK && ok;
}
check('for seven zeros the page draws the pair term of the right-hand one of ρ and 1 − conj(ρ), finds its largest swing and its first exit from ±0.05√x', waveOK, waveBad);
st = await setParams({ scene: 'landau', sigma: 0.78, t: 11.13, rail: 118 });
const trap = pairTerm(C(0.78, 11.13)), trapExit = firstExit(trap);
check('σ = 0.78, t = 11.13: the wave first leaves ±0.05√x near x ≈ 66.89 and swings to 0.672 > 0.548 at x = 120',
  trapExit > 66.8 && trapExit < 67 && near(st.rogue.burst, trapExit, 0.01) && Math.abs(trap(120)) > BAR * Math.sqrt(120) && near(Math.abs(trap(120)), 0.672, 1e-3) && near(st.rogue.max, 0.672, 2e-3),
  J({ exit: trapExit, page: st.rogue }));
check('the readout names x ≈ 66.89', /66\.89/.test(await text('#roBurst')), await text('#roBurst'));
st = await setParams({ scene: 'landau', sigma: 0.5, t: 14.13, rail: 118 });
check('σ = 1/2, t = 14.13: the wave never leaves ±0.05√x and stays near a fifth of it', st.rogue.burst == null && firstExit(pairTerm(C(0.5, 14.13))) == null && st.rogue.ratio < 0.25, J(st.rogue));
const left = await setParams({ sigma: 0.24, t: 10 }), right = await setParams({ sigma: 0.76, t: 10 });
check('a zero at 0.24 + 10i stirs the same wave as its twin at 0.76 + 10i (the right-hand one of the pair)', left.wave.every(([x, v], i) => near(v, right.wave[i][1], 1e-12)) && near(left.rogue.burst, right.rogue.burst, 1e-9));

/* ---------- the Euler-factor zeros ---------- */
const ez = eulerZeros();
check('the 11 zeros of 1 − p^(−s) (p = 2, 3, 5, Im(s) ∈ [−3, 18]) are the ones the page draws, all on Re(s) = 0',
  st.impostors.length === 11 && ez.length === 11 && ez.every((z) => st.impostors.some((q) => q.p === z.p && q.k === z.k && near(q.im, z.im, 1e-9) && q.re === 0)), J(st.impostors.map((q) => [q.p, q.k])));
check('at each of them p^(−s) = 1, computed here as exp(−s ln p)', ez.every((z) => abs(sub(C(1), exp(mul(C(0, -z.im), C(Math.log(z.p)))))) < 1e-12) && st.impostorsOk);
let least = Infinity;
for (const p of [2, 3, 5]) for (let a = 0.01; a < 1; a += 0.01) for (let b = -3; b <= 18; b += 0.05) least = Math.min(least, abs(sub(C(1), exp(mul(C(-a, -b), C(Math.log(p)))))));
check('inside the strip 0 < Re(s) < 1 the factors 1 − p^(−s) stay away from 0, and the page counts no zero there', least > 0.006 && st.inStrip === 0 && /0/.test(await text('#roImp')), `${least}`);

/* ---------- the controls ---------- */
await setParams({ scene: 'mirror', sigma: 0.76, t: 10, rail: 21 });
st = await slide('#sigma', 0.62);
check('the σ slider moves ρ and its twin, and leaves the card', near(st.sigma, 0.62) && near(st.mirror[0], 0.38, 1e-12) && st.preset === null && (await text('#oSigma')) === '0.62', J([st.sigma, st.mirror, st.preset]));
st = await slide('#height', 12.5);
check('the t slider moves ρ and its twin up together', near(st.t, 12.5) && near(st.mirror[1], 12.5) && (await text('#oT')) === '12.50');
await page.click('#snap'); st = await state();
check('“back to the line” puts ρ on σ = 1/2, where it is its own image', near(st.sigma, 0.5) && st.onLine && near(st.twin[0], 0.5));
await slide('#sigma', 0.7); await D(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('h'); st = await state();
check('the key H also puts ρ back on the line', near(st.sigma, 0.5) && st.onLine);
await page.click('#sceneChips [data-scene="landau"]'); st = await state();
check('the scene button PRIME SHADOW puts the shadow on the stage, with x running over 2 … 120', st.scene === 'landau' && near(st.max, 118) && near(st.x, 120), J([st.scene, st.max, st.x]));
await page.click('#sceneChips [data-scene="mirror"]'); st = await state();
check('the scene button MIRROR brings the plane back, with the scan line over −3 … 18', st.scene === 'mirror' && near(st.max, 21) && near(st.h, 18));
await page.click('#plot'); st = await state();
check('clicking the small plot under the stage puts that scene on the stage', st.scene === 'landau');
await page.click('#plot'); st = await state();
check('and clicking it again brings the mirror back', st.scene === 'mirror');

/* ---------- direct manipulation ---------- */
// the plane is drawn to scale right of its axis break (view.warp.at) and view.warp.factor times as wide left of it
const warp = (v, re) => (!v.warp || re >= v.warp.at ? re : v.warp.at + (re - v.warp.at) * v.warp.factor);
const unwarp = (v, w) => (!v.warp || w >= v.warp.at ? w : v.warp.at + (w - v.warp.at) / v.warp.factor);
const pixel = (v, re, im) => [v.box[0] + (warp(v, re) - v.re[0]) / (v.re[1] - v.re[0]) * v.box[2], v.box[1] + v.box[3] - (im - v.im[0]) / (v.im[1] - v.im[0]) * v.box[3]];
const dataAt = (v, [px, py]) => [unwarp(v, v.re[0] + (px - v.box[0]) / v.box[2] * (v.re[1] - v.re[0])), v.im[0] + (v.box[1] + v.box[3] - py) / v.box[3] * (v.im[1] - v.im[0])];
async function drag(from, to) {
  await page.mouse.move(from[0], from[1]); await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps: 8 }); await page.mouse.up(); return state();
}
st = await setParams({ scene: 'mirror', sigma: 0.76, t: 10, rail: 21 });
let v = st.view;
check('the plane spans Re(s) from −4.5 to 1.4 and Im(s) from −3 to 18, to scale right of the break at Re(s) = −1/2',
  v.warp && near(unwarp(v, v.re[0]), -4.5, 1e-9) && near(v.re[1], 1.4, 1e-9) && near(v.im[0], -3) && near(v.im[1], 18) && v.warp.at === -0.5, J(v));
let target = pixel(v, 0.3, 6), want = dataAt(v, target);
st = await drag(pixel(v, 0.76, 10), target);
check('dragging ρ on the stage moves it to the pointer (σ, t rounded to 0.01), and its twin follows across the line',
  near(st.sigma, Math.round(want[0] * 100) / 100, 0.011) && near(st.t, Math.round(want[1] * 100) / 100, 0.011) && near(st.mirror[0], 1 - st.sigma, 1e-12) && st.preset === null, J([st.sigma, st.t, want]));
st = await setParams({ sigma: 0.76, t: 10, rail: 21 });
v = st.view; target = pixel(v, 0.2, 8); want = dataAt(v, target);
st = await drag(pixel(v, 0.24, 10), target);
check('dragging the magenta twin moves ρ on the other side of the mirror', near(1 - st.sigma, want[0], 0.011) && near(st.t, want[1], 0.011) && st.sigma > 0.5, J([st.sigma, st.t, want]));
st = await setParams({ sigma: 0.76, t: 10, rail: 21 });
v = st.view; target = pixel(v, 0.508, 9); want = dataAt(v, target);
st = await drag(pixel(v, 0.76, 10), target);
check('a drag that ends within 0.015 of the line snaps ρ onto it', st.onLine && near(st.sigma, 0.5), J([st.sigma, want]));
st = await setParams({ scene: 'landau', sigma: 0.78, t: 11.13, rail: 0 });
v = st.view;
const at60 = [v.box[0] + (60 - v.re[0]) / (v.re[1] - v.re[0]) * v.box[2], v.box[1] + v.box[3] * 0.5];
await page.mouse.click(at60[0], at60[1]); st = await state();
check('clicking the prime shadow moves the current x there', st.scene === 'landau' && near(st.x, 60, 0.6) && !st.playing, J([st.x, st.playing]));

/* ---------- the cards ---------- */
const expect = {
  'on-line': { scene: 'mirror', sigma: 0.5, t: 14.13 }, 'off-line': { scene: 'mirror', sigma: 0.76, t: 10 },
  imprimitive: { scene: 'mirror', sigma: 0.5, t: 14.13 }, 'landau-trap': { scene: 'landau', sigma: 0.78, t: 11.13 }
};
for (const [id, e] of Object.entries(expect)) {
  check(`card ${id} plays its rail when clicked`, await playsAfter(page, () => page.click(`[data-preset="${id}"]`)));
  await settle(page); st = await state();
  check(`card ${id}: ${e.scene} scene, ρ = ${e.sigma} + ${e.t}i, the card pressed`, st.preset === id && st.scene === e.scene && near(st.sigma, e.sigma, 1e-9) && near(st.t, e.t, 1e-9) && st.focus === (id === 'imprimitive'), J([st.preset, st.scene, st.sigma, st.t, st.focus]));
  await page.keyboard.press('End'); st = await state();
  check(`card ${id}: End finishes its rail and the card stays`, near(st.rail, st.max) && !st.playing && st.preset === id, J([st.rail, st.max, st.playing, st.preset]));
  if (id === 'off-line') check('OFF-LINE finished: the twin stands at 0.24 + 10i', st.fly === 1 && near(st.twin[0], 0.24, 1e-12));
  if (id === 'on-line') check('ON-LINE finished: ρ is on the line and is its own image', st.onLine && near(st.twin[0], 0.5));
  if (id === 'imprimitive') check('IMPRIMITIVE: the HUD counts 11 Euler-factor zeros on Re(s) = 0 and none inside the strip', /11/.test(st.readouts.hud) && /Re\(s\) = 0/.test(st.readouts.hud), st.readouts.hud);
  if (id === 'landau-trap') check('LANDAU TRAP finished: x = 120, the wave left ±0.05√x near x ≈ 66.89', near(st.x, 120) && near(st.rogue.burst, trapExit, 0.01) && /66\.89/.test(st.readouts.hud), st.readouts.hud);
}
await page.click('[data-preset="off-line"]'); await settle(page);
await page.keyboard.press('Home'); st = await state();
check('Home takes the scan line back to Im(s) = −3, where the twin has not left ρ', near(st.h, -3) && st.fly === 0 && near(st.twin[0], 0.76, 1e-9), J([st.h, st.fly, st.twin]));
await page.keyboard.press(' ');
check('Space plays the scan line from there', await until(page, () => window.MIRROR_DEBUG.state.rail > 0));
await page.keyboard.press(' ');

/* ---------- the stills that PDF and EPUB print ---------- */
for (const lang of ['zh', 'en']) {
  let still = await openStill(T, BOOK, ID, 'off-line', lang);
  let s = await still.evaluate(() => window.MIRROR_DEBUG.state);
  check(`still off-line (${lang}): the finished mirror, the twin at 0.24 + 10i`, s.preset === 'off-line' && s.scene === 'mirror' && near(s.rail, s.max) && !s.playing && s.fly === 1 && near(s.twin[0], 0.24, 1e-12) && near(s.twin[1], 10), J([s.preset, s.rail, s.max, s.fly, s.twin]));
  await still.context().close();
  still = await openStill(T, BOOK, ID, 'landau-trap', lang);
  s = await still.evaluate(() => window.MIRROR_DEBUG.state);
  check(`still landau-trap (${lang}): x = 120 with the burst visible (the wave past ±0.05√x since x ≈ 66.89)`,
    s.preset === 'landau-trap' && s.scene === 'landau' && near(s.x, 120) && !s.playing && near(s.rogue.burst, trapExit, 0.01) && Math.abs(s.rogue.at120) > s.rogue.barrier120, J([s.preset, s.scene, s.x, s.rogue]));
  await still.context().close();
}

check('no page error, console error or failed request in the page checks', T.errors.length === 0, T.errors.slice(0, 4).join(' | '));
await T.finish();
