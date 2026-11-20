#!/usr/bin/env node
// Browser regression suite for THETA//SLOPE (books/riemann-hypothesis/viz/theta-chain-budget/):
//   node books/riemann-hypothesis/viz/tests/theta-chain-budget.test.mjs      (or: node tools/node/viz-test.mjs riemann-hypothesis)
// It first runs the quality gates every stage-first page must pass, then reads the page through the read-only probe
// window.THETA_DEBUG and checks every claim against an implementation written here: its own monotone-chain upper hull
// of the (rk, deg) points, cross-checked by the steepest chord from the origin; the budget model re-derived from the
// formulas the page prints in its MODEL box; and the Gauss operators on 𝔽₅ summed from their definitions, with the
// multiplicative character built from powers of the generator 2.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { session, stageFirstChecks, settle, until, cjkLeftovers, playsAfter, openStill } from '../../../../tools/node/viz-testkit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const BOOK = 'riemann-hypothesis', ID = 'theta-chain-budget';
const GIDS = [
  'Formalism/ThetaLiftIndependence/FinalThetaLiftAMFKIndep.Formalism.ThetaLiftIndependence.final_gaussOp',
  'Formalism/FormalDegreeBessel/FinalBF.Formalism.QuantumDeterminants.bigCellMinors',
  'Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.shortVector',
  'Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.muMaxLeMin'
];

/* ---------- independent implementation ---------- */
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol;
const eqPts = (a, b, tol = 1e-9) => a.length === b.length && a.every((p, i) => near(p[0], b[i][0], tol) && near(p[1], b[i][1], tol));
// the budget model as the MODEL box states it: σ₁ = 2/3 + ⅓e^(−b/0.45); σ_g = σ₁ − e/6, e = Γ(1 − e^(−b/0.45)), Γ = g if g ≥ 0.6 else 0
const MODEL = {
  single: (b) => 2 / 3 + Math.exp(-b / 0.45) / 3,
  share: (b, g) => (g >= 0.6 ? g : 0) * (1 - Math.exp(-b / 0.45)),
  glued: (b, g) => MODEL.single(b) - MODEL.share(b, g) / 6
};
/** The chapter's filtration with the first rafter at h₁, each degree pulled toward 5/7·rk by the share e. */
const points = (h1, e) => [[0, 0], [1, h1], [3, 4.4], [5, 5.4], [7, 5.0]].map(([r, d]) => [r, d - e * (d - (5 / 7) * r)]);
/** Upper concave hull, monotone chain over the points sorted by rk; a point on or under a chord is dropped. */
function upperHull(pts) {
  const sorted = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]), hull = [];
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  for (const p of sorted) {
    while (hull.length >= 2 && turn(hull[hull.length - 2], hull[hull.length - 1], p) >= 0) hull.pop();
    hull.push(p);
  }
  return hull;
}
const slopesOf = (hull) => hull.slice(1).map((p, i) => (p[1] - hull[i][1]) / (p[0] - hull[i][0]));
/** μ_max another way: the steepest chord from the origin to any other filtration point. */
const steepest = (pts) => Math.max(...pts.slice(1).map(([r, d]) => d / r));
/** gaussOp ∘ gaussOpDual on 𝔽₅ with V = ℂ: ρ(c) = χ(c), χ(2^k) = i^k (2 generates 𝔽₅ˣ), ψ(x) = e^(2πix/5). */
function gauss5() {
  const p = 5, chi = new Map(), mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  let ik = [1, 0], g = 1;
  for (let k = 0; k < p - 1; k++) { chi.set(g, ik); ik = mul(ik, [0, 1]); g = (g * 2) % p; }
  const psi = (x) => [Math.cos(2 * Math.PI * x / p), Math.sin(2 * Math.PI * x / p)];
  const inv = (c) => [...chi.keys()].find((d) => (c * d) % p === 1);
  let op = [0, 0], dual = [0, 0], hyp = [0, 0];
  for (const c of chi.keys()) {
    const a = mul(psi(c), chi.get(c)), b = mul(psi(p - c), chi.get(inv(c)));
    op = [op[0] + a[0], op[1] + a[1]]; dual = [dual[0] + b[0], dual[1] + b[1]]; hyp = [hyp[0] + chi.get(c)[0], hyp[1] + chi.get(c)[1]];
  }
  return { op, dual, hyp, there: mul(op, dual), back: mul(dual, op) };
}

const T = await session();
const { check } = T;

/* ---------- the quality gates of every stage-first page ---------- */
await stageFirstChecks(T, BOOK, ID);

const page = await T.goto(BOOK, ID, '?lang=zh');
await page.evaluate(() => document.fonts && document.fonts.ready); await settle(page, 300);
const D = (fn, arg) => page.evaluate(fn, arg);
const state = async () => { await settle(page); return D(() => window.THETA_DEBUG.state); };
const pick = async (id) => { await page.click(`[data-preset="${id}"]`); await settle(page, 60); };
const scene = async (id) => { await page.click(`#sceneChips [data-scene="${id}"]`); await settle(page, 60); };
const set = async (o) => { await D((v) => window.THETA_DEBUG.set(v), o); return state(); };
const text = (sel) => page.textContent(sel);
const slide = async (id, v) => { await D(([i, x]) => { const el = document.getElementById(i); el.value = String(x); el.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]); return state(); };

/* ---------- opening view and the four cards ---------- */
let st = await state();
check('opens on √X GLUED: the chain at m/√X = 3.5 with g = 1, at rest', st.preset === 'root-x-glued' && st.scene === 'chain' && near(st.b, 3.5) && st.g === 1 && !st.playing, JSON.stringify([st.preset, st.b, st.g, st.playing]));
check('page carries its id and the runtime language', (await D(() => document.body.dataset.vizId)) === ID && (await D(() => TRV.lang())) === 'zh');
check('√X = 5 and X = 25, so m = 5·(m/√X)', st.rootX === 5 && st.X === 25 && near(st.m, 17.5));

await pick('stepanov-m1'); st = await state();
check('STEPANOV m = 1: m/√X = 0.2, one lift, one character', near(st.b, 0.2) && near(st.m, 1) && st.g === 0 && !st.gate && !st.playing, JSON.stringify([st.b, st.m, st.g]));
check('STEPANOV m = 1: σ is still high, about 0.88, as the model gives', near(st.sigmaSingle, MODEL.single(0.2)) && Math.abs(st.sigmaSingle - 0.88) < 0.002 && near(st.sigmaGlued, st.sigmaSingle), String(st.sigmaSingle));

await page.click('[data-speed="2.5"]'); await settle(page);
check('2/3 WALL plays the budget upward', await playsAfter(page, () => pick('two-thirds-wall'), () => window.THETA_DEBUG.state));
check('2/3 WALL stops by itself at m/√X = 3 (fifteen mirrors)', await until(page, () => { const s = window.THETA_DEBUG.state; return !s.playing && s.t === 3; }, null, 90000));
st = await state();
check('2/3 WALL: one character (g = 0), σ₁ = 0.6671, above the wall by less than 0.001', st.g === 0 && !st.gate && st.sigmaSingle > 2 / 3 && st.sigmaSingle - 2 / 3 < 0.001
  && near(st.sigmaSingle, MODEL.single(3)) && (await text('#hudSub')).includes('0.6671'), JSON.stringify([st.sigmaSingle, await text('#hudSub')]));
check('2/3 WALL: without gluing the glued curve is the single one', near(st.sigmaGlued, st.sigmaSingle) && st.cross === null && near(st.e, 0));

check('√X GLUED plays the budget upward', await playsAfter(page, () => pick('root-x-glued'), () => window.THETA_DEBUG.state));
check('√X GLUED stops by itself at m/√X = 3.5', await until(page, () => { const s = window.THETA_DEBUG.state; return !s.playing && s.t === 3.5; }, null, 90000));
st = await state();
check('√X GLUED: g = 1, the glued edge is below 2/3 and within 0.001 of 1/2', st.g === 1 && st.gate && st.sigmaGlued < 2 / 3 && st.sigmaGlued > 1 / 2 && st.sigmaGlued - 1 / 2 < 0.001
  && near(st.sigmaGlued, MODEL.glued(3.5, 1)), String(st.sigmaGlued));
check('√X GLUED: the cyan curve passes the wall at 0.45·ln 3 ≈ 0.494', near(st.cross, 0.45 * Math.log(3)) && near(MODEL.glued(st.cross, 1), 2 / 3, 1e-12), String(st.cross));
await page.click('[data-speed="1"]');

await pick('hn-polygon'); st = await state();
const chapter = points(1.8, 0), chapterHull = upperHull(chapter);
check('HN POLYGON: the scene switches to the roof (0, 0) → (1, 1.8) → (3, 4.4) → (5, 5.4) → (7, 5.0), unflattened', st.scene === 'hn' && st.h1 === 1.8 && st.g === 0 && near(st.e, 0)
  && eqPts(st.points, chapter) && eqPts(st.hull, chapterHull) && chapterHull.length === 5, JSON.stringify(st.hull));
check('HN POLYGON: slopes 1.8 > 1.3 > 0.5 > −0.2, μ_max = 1.8, mean slope 5/7', slopesOf(chapterHull).every((s, i) => near(s, [1.8, 1.3, 0.5, -0.2][i]))
  && st.slopes.every((s, i) => near(s, [1.8, 1.3, 0.5, -0.2][i])) && near(st.muMax, 1.8) && near(st.muMean, 5 / 7), JSON.stringify(st.slopes));
check('HN POLYGON: the radii √7·e^(−1.8) ≈ 0.437 (muMaxLeMin) and √7·e^(−5/7) ≈ 1.295 (shortVector)', near(st.rMuMax, Math.sqrt(7) * Math.exp(-1.8)) && near(st.rShort, Math.sqrt(7) * Math.exp(-5 / 7))
  && (await text('#leanMuMax')).includes('0.437') && (await text('#leanShort')).includes('1.295'), JSON.stringify([st.rMuMax, st.rShort]));
check('HN POLYGON: the Lean boxes of the roof are shown, those of the chain hidden', await D(() => [...document.querySelectorAll('#readouts .lean[data-scenes]')].every((b) => b.hidden === (b.dataset.scenes !== 'hn'))));

/* ---------- the hull, μ_max and the mean slope across the h₁ slider, flat and flattened ---------- */
let hullOK = true, hullBad = '';
for (const [h1, g, b] of [[0.5, 0, 3], [1, 0, 3], [1.4, 0, 3], [1.46, 0, 3], [1.47, 0, 3], [1.8, 0, 3], [2.2, 0, 3], [2.8, 0, 3], [1.2, 1, 0.6], [2.5, 0.8, 1.5], [1.8, 0.6, 4]]) {
  await slide('h1', h1); await slide('gluing', g); const s = await set({ b });
  const e = MODEL.share(b, g), pts = points(h1, e), hull = upperHull(pts), sl = slopesOf(hull);
  const ok = near(s.h1, h1) && near(s.g, g) && near(s.e, e) && eqPts(s.points, pts) && eqPts(s.hull, hull)
    && near(s.muMax, sl[0]) && near(s.muMax, steepest(pts)) && near(s.muMean, 5 / 7) && near(hull[hull.length - 1][1] / 7, 5 / 7)
    && sl.every((x, i) => i === 0 || x < sl[i - 1]) && s.onHull[1] === hull.some((p) => p[0] === 1) && (s.onHull[1] === (h1 >= 4.4 / 3))
    && near(s.rMuMax, Math.sqrt(7) * Math.exp(-sl[0])) && near(s.rShort, Math.sqrt(7) * Math.exp(-5 / 7)) && s.rMuMax <= s.rShort + 1e-12;
  if (!ok) { hullOK = false; hullBad = `h₁ ${h1}, g ${g}, b ${b}: page ${JSON.stringify([s.hull, s.muMax])} mine ${JSON.stringify([hull, sl[0]])}`; break; }
}
check('11 settings of h₁, g and m/√X: the page hull, μ_max = steepest chord, mean slope 5/7, both radii agree with the monotone chain here', hullOK, hullBad);
st = await set({ h1: 1.2, g: 0, b: 3 });
check('h₁ below 4.4/3: (1, h₁) falls under the roof and the first rafter is (0, 0) → (3, 4.4) of slope 4.4/3', !st.onHull[1] && eqPts(st.hull, [[0, 0], [3, 4.4], [5, 5.4], [7, 5]]) && near(st.muMax, 4.4 / 3)
  && /1\.467/.test(await text('#roNote')), JSON.stringify(st.hull));
st = await set({ h1: 1.8, g: 1, b: 4 });
check('a glued family at full budget pulls μ_max down toward 5/7 (the shear keeps the roof concave)', st.muMax < 0.72 && st.muMax > 5 / 7 && st.spike < 0.01 && near(st.muMax, (1 - st.e) * 1.8 + st.e * 5 / 7), String(st.muMax));

/* ---------- the budget model: one character never below 2/3, a glued family below it once g ≥ 0.6 ---------- */
let curveOK = true, curveBad = '';
for (const g of [0, 0.3, 0.59, 0.6, 0.75, 1]) {
  const c = await D((x) => window.THETA_DEBUG.curves(800, x), g);
  const single = c.map((r) => r[1]), glued = c.map((r) => r[2]);
  const modelOK = c.every(([b, s1, sg]) => near(s1, MODEL.single(b), 1e-12) && near(sg, MODEL.glued(b, g), 1e-12));
  const wall = single.every((s) => s > 2 / 3) && single.every((s, i) => i === 0 || s <= single[i - 1]) && near(single[0], 1);
  const floor = glued.every((s) => s > 1 / 2);
  const breaks = Math.min(...glued) < 2 / 3, first = c.find((r) => r[2] < 2 / 3);
  const crossOK = g < 0.6 ? !breaks && glued.every((s, i) => near(s, single[i], 1e-15)) : breaks && first && Math.abs(first[0] - 0.45 * Math.log((2 + g) / g)) <= 4 / 800 + 1e-12;
  if (!(modelOK && wall && floor && crossOK)) { curveOK = false; curveBad = `g = ${g}: ${JSON.stringify({ modelOK, wall, floor, crossOK })}`; break; }
}
check('801 samples × 6 gluings: σ₁ stays above 2/3 and falls from 1; σ_g stays above 1/2, breaks 2/3 exactly when g ≥ 0.6, where 0.45·ln((2 + g)/g) says', curveOK, curveBad);

/* ---------- one mirror undone: gaussOp ∘ gaussOpDual = |𝔽₅| on 𝔽₅ ---------- */
const G = gauss5(); st = await state();
check('𝔽₅, χ of order 4: Σχ(c) = 0, |G|² = 5, and gaussOp ∘ gaussOpDual = gaussOpDual ∘ gaussOp = 5, here and on the page',
  near(Math.hypot(...G.hyp), 0, 1e-12) && near(G.there[0], 5, 1e-12) && near(G.there[1], 0, 1e-12) && near(G.back[0], 5, 1e-12) && near(Math.hypot(...G.op) ** 2, 5, 1e-12)
  && near(st.gauss.op[0], G.op[0]) && near(st.gauss.op[1], G.op[1]) && near(st.gauss.dual[0], G.dual[0]) && near(st.gauss.dual[1], G.dual[1]) && near(st.gauss.there[0], 5) && near(st.gauss.back[0], 5)
  && /5\.000/.test(await text('#roGauss')), JSON.stringify(st.gauss));

/* ---------- controls: sliders, rail, keys, scene chips, pointer ---------- */
await pick('root-x-glued'); await D(() => window.THETA_DEBUG.seek(3.5));
st = await slide('chainBudget', 1.4);
check('the budget slider moves the rail and leaves the card: free play', near(st.t, 1.4) && st.preset === null && /自由探索/.test(await text('#presetNote')), JSON.stringify([st.t, st.preset]));
st = await slide('gluing', 0.55);
check('the gluing slider sets g; below 0.6 the gate is closed', near(st.g, 0.55) && !st.gate && (await text('#roGluing')).includes('0.55'));
st = await slide('gluing', 0.6);
check('at g = 0.6 the gate opens and the glued edge drops below the single one', st.gate && st.sigmaGlued < st.sigmaSingle);
await page.click('body', { position: { x: 5, y: 5 } });
await page.keyboard.press('ArrowRight'); st = await state();
check('→ adds one mirror: m/√X steps by 1/√X = 0.2', near(st.t, 1.6) && near(st.m, 8), String(st.t));
await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); st = await state();
check('← takes mirrors away', near(st.t, 1.2), String(st.t));
await page.keyboard.press('End'); check('End goes to the full budget m/√X = 4', near((await state()).t, 4));
await page.keyboard.press('Home'); await page.keyboard.press('Space');
check('Space plays the rail', await until(page, () => { const s = window.THETA_DEBUG.state; return s.playing && s.t > 0; }));
await page.keyboard.press('Space'); check('Space pauses', !(await state()).playing);
await page.click('#rew'); check('⏮ returns to the start', (await state()).t === 0);
await page.keyboard.press('2'); check('key 2 switches to the HN roof', (await state()).scene === 'hn');
await page.keyboard.press('1'); check('key 1 switches back to the chain', (await state()).scene === 'chain');
await scene('hn'); check('the scene chips switch scenes', (await state()).scene === 'hn' && (await D(() => document.querySelector('#sceneChips [data-scene="hn"]').getAttribute('aria-pressed'))) === 'true');

// drag the amber point (1, h₁) to the height deg = 2.5 with the mouse; unflattened, so h₁ follows the pointer
await set({ h1: 1.8, g: 0, b: 2 });
let a = await D(() => window.THETA_DEBUG.point.handle()), z = await D(() => window.THETA_DEBUG.point.handleAt(2.5));
await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(z.x, z.y, { steps: 4 }); await page.mouse.up(); st = await state();
check('dragging the amber point of the roof sets h₁ (here to 2.5)', Math.abs(st.h1 - 2.5) < 0.03 && near(st.muMax, st.h1), JSON.stringify([st.h1, st.muMax]));
a = await D(() => window.THETA_DEBUG.point.handle()); z = await D(() => window.THETA_DEBUG.point.handleAt(-0.6));
await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(z.x, z.y, { steps: 4 }); await page.mouse.up(); st = await state();
check('dragged to the floor of the plot, h₁ stops at the end of its slider range, 0.5', st.h1 === 0.5 && (await D(() => document.getElementById('h1').value)) === '0.5', String(st.h1));
await scene('chain');
const pb = await D(() => window.THETA_DEBUG.point.budget(2));
await page.mouse.click(pb.x, pb.y); st = await state();
check('clicking the budget axis sets m/√X there', Math.abs(st.t - 2) < 0.02, String(st.t));
const pn = await D(() => window.THETA_DEBUG.point.node(7));
await page.mouse.click(pn.x, pn.y); st = await state();
check('clicking the seventh mirror sets m = 7 (m/√X = 1.4)', near(st.t, 1.4) && near(st.m, 7), String(st.t));

/* ---------- evidence: four Lean theorems, NUM and MODEL boxes, honest ticks ---------- */
const links = await D(() => [...new Set([...document.querySelectorAll('a[data-lean-gid]')].map((x) => x.dataset.leanGid))]);
check('the page cites exactly the four Lean theorems of chapters 4 and 5', links.length === 4 && GIDS.every((g) => links.includes(g)), JSON.stringify(links));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'books', BOOK, 'viz', 'visualizations.json'), 'utf8')).visualizations.find((v) => v.id === ID);
check('the registry lists exactly the theorems the page cites', !!registry && JSON.stringify([...links].sort()) === JSON.stringify(registry.lean.map((l) => l.gid).sort()));
check('green boxes are only the ones with a Lean link', await D(() => [...document.querySelectorAll('.lean:not(.num):not(.model):not(.argued):not(.open):not(.frozen)')].every((b) => b.querySelector('a[data-lean-gid]'))));
check('the budget curves are labelled MODEL and the hull NUM, neither with a Lean link', await D(() => {
  const m = document.querySelector('#evidence .lean.model'), n = document.querySelector('#evidence .lean.num');
  return !!m && !!n && !m.querySelector('a[data-lean-gid]') && !n.querySelector('a[data-lean-gid]') && /σ\(m\/√X\)/.test(m.textContent) && /2\/3/.test(m.textContent) && /凸包|hull/.test(n.textContent);
}));
check('green ✓ (.okmark) only inside Lean boxes; the page’s own checks use .nummark', await D(() => [...document.querySelectorAll('.okmark')].every((e) => e.closest('.lean:not(.num):not(.model)')) && document.querySelectorAll('#readouts .nummark').length >= 2));
await page.click('#infoBtn');
check('the drawer says in both languages that the page is not a proof', /不是证明/.test(await text('#drawer div.zh')) && /not a proof/.test(await text('#drawer div.en')));
await page.keyboard.press('Escape');
check('Esc closes the drawer', await D(() => document.getElementById('drawer').hidden));

/* ---------- the stills a chapter can cite: the frame each caption describes ---------- */
check('every card that plays declares its still frame', JSON.stringify(await D(() => [...document.querySelectorAll('[data-preset]')].filter((b) => b.dataset.still != null).map((b) => `${b.dataset.preset}:${b.dataset.still}`)))
  === JSON.stringify(['two-thirds-wall:3', 'root-x-glued:3.5']));
for (const lang of ['zh', 'en']) {
  const w = await openStill(T, BOOK, ID, 'two-thirds-wall', lang), s1 = await w.evaluate(() => window.THETA_DEBUG.state), h1 = await w.textContent('#hudSub');
  check(`still 2/3 WALL (${lang}): m/√X = 3 at rest, one character above the wall, σ₁ = 0.6671 under the title`, s1.scene === 'chain' && near(s1.t, 3) && !s1.playing && s1.g === 0 && s1.sigmaSingle > 2 / 3 && h1.includes('0.6671'), `${JSON.stringify([s1.t, s1.g])} ${h1}`);
  await w.context().close();
  const r = await openStill(T, BOOK, ID, 'root-x-glued', lang), s2 = await r.evaluate(() => window.THETA_DEBUG.state), h2 = await r.textContent('#hudSub');
  check(`still √X GLUED (${lang}): m/√X = 3.5 at rest, g = 1, σ_g = 0.5002 < 2/3 under the title`, s2.scene === 'chain' && near(s2.t, 3.5) && !s2.playing && s2.g === 1 && s2.sigmaGlued < 2 / 3 && h2.includes('0.5002'), `${JSON.stringify([s2.t, s2.g])} ${h2}`);
  await r.context().close();
  const h = await openStill(T, BOOK, ID, 'hn-polygon', lang), s3 = await h.evaluate(() => window.THETA_DEBUG.state), h3 = await h.textContent('#hudSub');
  check(`still HN POLYGON (${lang}): the roof in the stage, μ_max = 1.80 against 5/7 ≈ 0.714 under the title`, s3.scene === 'hn' && near(s3.muMax, 1.8) && near(s3.e, 0) && !s3.playing
    && h3.includes('1.80') && h3.includes('0.714'), `${JSON.stringify([s3.scene, s3.muMax])} ${h3}`);
  await h.context().close();
}

/* ---------- English ---------- */
await page.click('[data-lang-set="en"]'); await settle(page, 150);
check('English title', (await D(() => document.title)).startsWith('THETA//SLOPE · Theta chain budget'));
for (const sc of ['chain', 'hn']) { await scene(sc); const left = await cjkLeftovers(page); check(`English: no Chinese left in the scene ${sc} after free play`, left.length === 0, left.slice(0, 4).join(' | ')); }
check('the crumb leads back to the visualization index', (await D(() => document.querySelector('.crumb').getAttribute('href'))) === '../');
await D(() => localStorage.removeItem('tr-lang'));

/* ---------- canvas labels in short labs and cited frames: inside the stage, between title and legend, apart ---------- */
const canvasPage = await T.newPage();
await canvasPage.addInitScript(() => {
  const proto = CanvasRenderingContext2D.prototype, clear = proto.clearRect, fill = proto.fillText;
  window.canvasInk = [];
  proto.clearRect = function (...a) { if (this.canvas.id === 'cv') window.canvasInk = []; return clear.apply(this, a); };
  proto.fillText = function (s, x, y, ...rest) {
    if (this.canvas.id === 'cv' && String(s).trim()) {
      const m = this.measureText(s), t = this.getTransform(), k = t.a || 1;
      const px = (x * t.a + t.e) / k, py = (y * t.d + t.f) / k;
      window.canvasInk.push({ s: String(s), l: px - m.actualBoundingBoxLeft, r: px + m.actualBoundingBoxRight, t: py - m.actualBoundingBoxAscent, b: py + m.actualBoundingBoxDescent });
    }
    return fill.call(this, s, x, y, ...rest);
  };
});
for (const lang of ['zh', 'en']) {
  for (const [width, height, card] of [[1440, 500, null], [1081, 500, null], [334, 500, 'two-thirds-wall'], [334, 500, 'root-x-glued'], [334, 500, 'hn-polygon'], [740, 500, 'hn-polygon'], [740, 500, 'root-x-glued']]) {
    await canvasPage.setViewportSize({ width, height });
    await T.goto(BOOK, ID, `?lang=${lang}${card ? `&embed=1&preset=${card}` : ''}`, canvasPage);
    await canvasPage.evaluate(() => document.fonts.ready);
    for (const sc of card ? [null] : ['chain', 'hn']) {
      if (sc) await canvasPage.evaluate((x) => window.THETA_DEBUG.scene(x), sc);
      if (card) await canvasPage.evaluate((x) => { if (window.THETA_DEBUG.state.playing) document.getElementById('play').click(); window.THETA_DEBUG.seek(x === 'two-thirds-wall' ? 3 : x === 'root-x-glued' ? 3.5 : 3); }, card);
      await settle(canvasPage);
      const ink = await canvasPage.evaluate(() => {
        const cv = document.querySelector('#cv'), frame = cv.getBoundingClientRect(), hud = document.querySelector('.hud-tl').getBoundingClientRect(), legend = document.querySelector('#legend').getBoundingClientRect();
        const top = hud.bottom - frame.top, bottom = legend.top - frame.top, text = window.canvasInk;
        const outside = text.filter((r) => r.l < -0.5 || r.r > frame.width + 0.5 || r.t < top - 0.5 || r.b > bottom + 0.5).map((r) => r.s);
        const clash = [];
        for (let i = 0; i < text.length; i++) for (let j = i + 1; j < text.length; j++) {
          const p = text[i], q = text[j], w = Math.min(p.r, q.r) - Math.max(p.l, q.l), h = Math.min(p.b, q.b) - Math.max(p.t, q.t);
          if (w > 1.5 && h > 1.5) clash.push(`${p.s} × ${q.s}`);
        }
        return { outside, clash, n: text.length };
      });
      const tag = `canvas (${lang}, ${width} × ${height}, ${card || sc})`;
      check(`${tag}: every canvas label lies inside the stage, between the title and the legend`, ink.n > 5 && ink.outside.length === 0, JSON.stringify(ink.outside));
      check(`${tag}: no two canvas labels sit on top of each other`, ink.clash.length === 0, ink.clash.slice(0, 4).join(' | '));
    }
  }
}
await canvasPage.close();

check('no page error, console error or failed request (page-specific part)', T.errors.length === 0, T.errors.slice(0, 4).join(' | '));
await T.finish();
