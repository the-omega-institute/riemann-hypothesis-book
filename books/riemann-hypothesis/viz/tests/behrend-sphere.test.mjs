#!/usr/bin/env node
// Browser regression suite for riemann-hypothesis/viz/behrend-sphere (Playwright + Chromium):
//   node books/riemann-hypothesis/viz/tests/behrend-sphere.test.mjs        (or node tools/node/viz-test.mjs riemann-hypothesis)
// stageFirstChecks with { solid: true } adds the checks of a page that draws a lit solid with kit.solid. Then every
// claim of the page is recomputed here by an independent brute-force enumerator: the shells x² + y² + z² = R of the
// cubes {0, …, M − 1}³ for M = 3 … 6 (found by solving z² = R − x² − y², not by grouping points by their norm), their
// sizes and the fattest one, the absence of any 3-term progression a + c = 2b (a ≠ c) inside every shell, and the
// parallelogram law ‖(a + b)/2‖² = R − ‖a − b‖²/4 < R for every pair the page can choose. Then the controls, the
// labels pushed out of the cube's outline, and the stills a chapter cites.
import { session, stageFirstChecks, settle, until, openStill, playsAfter } from '../../../../tools/node/viz-testkit.mjs';

const BOOK = 'riemann-hypothesis', ID = 'behrend-sphere';
const T = await session();
const { check } = T;
await stageFirstChecks(T, BOOK, ID, { solid: true });

/* ---------- the reference: shells by solving z² = R − x² − y² ---------- */
const sq = (p) => p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
const eq = (p, q) => p.length === q.length && p.every((v, i) => v === q[i]);
const sortPts = (l) => l.map((p) => p.slice()).sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);
const samePts = (l1, l2) => l1.length === l2.length && sortPts(l1).every((p, i) => eq(p, sortPts(l2)[i]));
function shellsOf(M) {
  const out = [];
  for (let R = 0; R <= 3 * (M - 1) ** 2; R++) {
    const S = [];
    for (let x = 0; x < M; x++) for (let y = 0; y < M; y++) {
      const r = R - x * x - y * y;
      if (r < 0) continue;
      const z = Math.round(Math.sqrt(r));
      if (z * z === r && z < M) S.push([x, y, z]);
    }
    out.push(S);
  }
  return out;
}
/** Ordered triples (a, b, c) of one shell with a + c = 2b and a ≠ c. */
function triples(S) {
  let n = 0;
  for (const a of S) for (const b of S) for (const c of S) if (!eq(a, c) && a.every((v, i) => v + c[i] === 2 * b[i])) n++;
  return n;
}
const REF = new Map([3, 4, 5, 6].map((M) => [M, shellsOf(M)]));

// the reference on its own: M = 5 has 125 points on 32 shells, the fattest is R = 17 with the nine points of Chapter 6
const S5 = REF.get(5), sizes5 = S5.map((s) => s.length), top5 = Math.max(...sizes5);
check('reference: M = 5 has 125 points on 32 non-empty shells', sizes5.reduce((a, b) => a + b, 0) === 125 && sizes5.filter(Boolean).length === 32);
check('reference: the fattest shell of M = 5 is R = 17 alone, with 9 points', top5 === 9 && sizes5.filter((n) => n === top5).length === 1 && sizes5[17] === 9);
check('reference: S₁₇ is the nine points of Chapter 6', samePts(S5[17], [[0, 1, 4], [0, 4, 1], [1, 0, 4], [1, 4, 0], [2, 2, 3], [2, 3, 2], [3, 2, 2], [4, 0, 1], [4, 1, 0]]));
check('reference: pigeonholes, 9 ≥ ⌈125/32⌉ = 4', top5 >= Math.ceil(125 / 32) && Math.ceil(125 / 32) === 4);
let tri = 0, law = true, parity = true;
for (const [, shells] of REF) shells.forEach((S, R) => {
  tri += triples(S);
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
    const a = S[i], b = S[j], s4 = sq(a.map((v, k) => v + b[k])), d = sq(a.map((v, k) => v - b[k]));
    if (!(s4 === 4 * R - d && s4 < 4 * R)) law = false;          // 4‖m‖² = ‖a + b‖² = 4R − ‖a − b‖² < 4R
    if (d % 2 !== 0 || d < 2) parity = false;                     // ‖a − b‖² = 2R − 2a·b: even, so at least 2
  }
});
check('reference: no shell of M = 3 … 6 holds a 3-term progression a + c = 2b, a ≠ c', tri === 0, `${tri} triples`);
check('reference: every pair of a shell has 4‖m‖² = 4R − ‖a − b‖² < 4R (parallelogram law)', law);
check('reference: on one shell ‖a − b‖² is even and at least 2, so a midpoint sits ≥ 1/2 below the shell', parity);

/* ---------- the page against the reference ---------- */
const page = await T.goto(BOOK, ID, '?lang=zh');
await settle(page, 300);
const state = async (p = page) => { await settle(p); return p.evaluate(() => window.SPHERE_DEBUG.state); };
let s = await state();
check('page carries its id', (await page.evaluate(() => document.body.dataset.vizId)) === ID);
check('opens on MIDPOINT SINKS: M = 5, R = 17, 9 points, on WebGL', s.preset === 'ap-forbidden' && s.M === 5 && s.R === 17 && s.count === 9 && s.mode === 'webgl', JSON.stringify({ p: s.preset, M: s.M, R: s.R, n: s.count, mode: s.mode }));
check('the nine cyan points are S₁₇ of the reference', samePts(s.shell, S5[17]));

for (const M of [3, 4, 5, 6]) {
  const ref = REF.get(M), sizes = ref.map((x) => x.length), top = Math.max(...sizes), peaks = sizes.map((n, R) => (n === top ? R : -1)).filter((R) => R >= 0);
  const got = await page.evaluate((m) => {
    const D = window.SPHERE_DEBUG, out = [];
    D.setShell(m, 0);
    const st = D.state;
    for (let R = 0; R <= st.max; R++) { D.setShell(m, R); out.push(D.state.shell); }
    return { st, shells: out };
  }, M);
  check(`M = ${M}: ${M ** 3} points, ${sizes.filter(Boolean).length} non-empty shells, R up to ${3 * (M - 1) ** 2}`,
    got.st.points === M ** 3 && got.st.nonEmpty === sizes.filter(Boolean).length && got.st.max === 3 * (M - 1) ** 2, JSON.stringify({ points: got.st.points, nonEmpty: got.st.nonEmpty, max: got.st.max }));
  check(`M = ${M}: every shell the page draws is the reference shell`, got.shells.length === ref.length && got.shells.every((x, R) => samePts(x, ref[R])));
  check(`M = ${M}: the shell sizes of the strip are the reference sizes`, eq(got.st.counts, sizes));
  check(`M = ${M}: the fattest shell is R = ${peaks.join(', ')} with ${top} points`, got.st.peak.n === top && eq(got.st.peak.R, peaks), JSON.stringify(got.st.peak));
  check(`M = ${M}: the page counts 0 three-term progressions on every shell, as the reference`, got.st.aps.every((n) => n === 0) && ref.every((x) => triples(x) === 0));
}

// every pair of S₁₇ through the probe: the midpoint the page shows sinks by ‖a − b‖²/4
const pairs = [];
for (let i = 0; i < S5[17].length; i++) for (let j = i + 1; j < S5[17].length; j++) pairs.push([S5[17][i], S5[17][j]]);
const shown = await page.evaluate((list) => { const D = window.SPHERE_DEBUG; D.setShell(5, 17); return list.map(([a, b]) => (D.pickPair(a, b) ? D.state.pair : null)); }, pairs);
const badPair = pairs.findIndex(([a, b], k) => {
  const p = shown[k], m = a.map((v, i) => (v + b[i]) / 2), d = sq(a.map((v, i) => v - b[i]));
  return !p || !eq(p.m, m) || p.m2 !== sq(m) || p.ab2 !== d || !(p.m2 < 17) || p.m2 !== 17 - d / 4;
});
check(`all ${pairs.length} pairs of S₁₇: midpoint (a + b)/2, ‖m‖² = 17 − ‖a − b‖²/4 < 17`, badPair < 0, badPair < 0 ? '' : JSON.stringify([pairs[badPair], shown[badPair]]));
check('a point off the shell cannot be chosen', !(await page.evaluate(() => window.SPHERE_DEBUG.pickPair([1, 2, 3], [0, 1, 4]))));

/* ---------- cards ---------- */
await page.click('[data-preset="ap-forbidden"]'); s = await state();
const apA = [0, 1, 4], apB = [2, 3, 2], apM = [1, 2, 3];
check('MIDPOINT SINKS: a = (0, 1, 4), b = (2, 3, 2), m = (1, 2, 3), ‖m‖² = 14 < 17, ‖a − b‖² = 12',
  s.pair && eq(s.pair.a, apA) && eq(s.pair.b, apB) && eq(s.pair.m, apM) && s.pair.m2 === sq(apM) && sq(apM) === 14 && s.pair.ab2 === 12 && 14 < 17, JSON.stringify(s.pair));
check('MIDPOINT SINKS: m is a lattice point but not on S₁₇', !S5[17].some((p) => eq(p, apM)) && sq(apM) !== 17);
const ro = await page.evaluate(() => ({ key: document.getElementById('roKey').textContent, ap: document.getElementById('roAP').textContent, okOutside: document.querySelectorAll('.okmark:not(.lean .okmark)').length }));
check('the key readout says ‖m‖² = 14 < 17 and the shell holds 0 progressions', /‖m‖² = 14 < 17/.test(ro.key) && /^0/.test(ro.ap.trim()), JSON.stringify(ro));
check('green ticks (.okmark) appear only inside .lean boxes', ro.okOutside === 0);
await page.click('[data-preset="tight-chord"]'); s = await state();
check('TIGHTEST CHORD: (2, 2, 3) and (2, 3, 2), ‖a − b‖² = 2, m = (2, 2.5, 2.5), ‖m‖² = 16.5',
  s.pair && eq(s.pair.a, [2, 2, 3]) && eq(s.pair.b, [2, 3, 2]) && s.pair.ab2 === 2 && eq(s.pair.m, [2, 2.5, 2.5]) && s.pair.m2 === 16.5 && 16.5 === 17 - 2 / 4, JSON.stringify(s.pair));
check('TIGHTEST CHORD: no two points of S₁₇ are closer', Math.min(...pairs.map(([a, b]) => sq(a.map((v, i) => v - b[i])))) === 2);
await page.click('[data-preset="shell-convex"]'); s = await state();
check('SHELL 17: R = 17, 9 cyan points, no pair chosen', s.R === 17 && s.count === 9 && !s.pair && !s.chosen);

// the labels are pushed out of the cube's outline, clear of each other and of the title and legend
await page.click('[data-preset="ap-forbidden"]'); await page.evaluate(() => window.SPHERE_DEBUG.draw()); s = await state();
const geo = await page.evaluate(() => {
  const D = window.SPHERE_DEBUG, st = D.state, e = st.M - 1, cv = document.getElementById('cv').getBoundingClientRect(), corners = [];
  for (const x of [0, e]) for (const y of [0, e]) for (const z of [0, e]) { const b = D.bead([x, y, z]); corners.push([b.x - cv.left, b.y - cv.top]); }
  const hud = [...document.querySelectorAll('#stage > .hud-tl > span, #stage > .hud-bl > span')].map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0).map((r) => ({ l: r.left - cv.left, t: r.top - cv.top, r: r.right - cv.left, b: r.bottom - cv.top }));
  return { corners, hud, labels: st.labels };
});
const hullOf = (pts) => {
  const s2 = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of s2) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of s2.reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
};
const inside = (h, p) => h.every((a, i) => { const b = h[(i + 1) % h.length]; return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0; });
const H = hullOf(geo.corners), meet = (a, b) => Math.min(a.r, b.r) > Math.max(a.l, b.l) && Math.min(a.b, b.b) > Math.max(a.t, b.t);
const byKey = Object.fromEntries(geo.labels.map((l) => [l.k, l]));
check('labels a, b and m = (a + b)/2 are all placed', ['a', 'b', 'm'].every((k) => byKey[k]), JSON.stringify(geo.labels.map((l) => l.k)));
check('the labels with a hairline sit outside the outline of the cube', geo.labels.filter((l) => l.lead).every((l) => !inside(H, [l.x, l.y])) && geo.labels.some((l) => l.lead),
  JSON.stringify(geo.labels.filter((l) => l.lead && inside(H, [l.x, l.y])).map((l) => l.k)));
check('no two labels overlap', geo.labels.every((a, i) => geo.labels.every((b, j) => j <= i || !meet(a.box, b.box))));
check('no label covers the title or the legend', geo.labels.every((l) => geo.hud.every((r) => !meet(l.box, r))));

/* ---------- controls ---------- */
const beads = await page.evaluate(() => { const D = window.SPHERE_DEBUG; D.setShell(5, 17); return D.state.shell.map((p) => ({ p, ...D.bead(p) })); });
const vis = beads.filter((b) => !b.hidden);
const far = vis.map((b, i) => vis.map((c, j) => ({ i, j, d: Math.hypot(b.x - c.x, b.y - c.y) }))).flat().filter((x) => x.i < x.j).sort((x, y) => y.d - x.d)[0];
if (far) {
  const [b1, b2] = [vis[far.i], vis[far.j]];
  await page.mouse.click(b1.x, b1.y); s = await state();
  check('clicking a cyan point makes it a, and leaves the card', s.chosen && eq(s.chosen, b1.p) && !s.pair && s.preset === null, JSON.stringify({ chosen: s.chosen, want: b1.p }));
  await page.mouse.click(b2.x, b2.y); s = await state();
  check('clicking a second cyan point makes it b and shows their midpoint inside', s.pair && eq(s.pair.a, b1.p) && eq(s.pair.b, b2.p) && s.pair.m2 < 17, JSON.stringify(s.pair));
}
await page.click('#clearPair'); s = await state();
check('CLEAR removes the pair', !s.pair && !s.chosen);
await page.click('#nextPair'); s = await state();
check('NEXT PAIR chooses two points of the shell', s.pair && S5[17].some((p) => eq(p, s.pair.a)) && S5[17].some((p) => eq(p, s.pair.b)));
await page.evaluate(() => { const el = document.getElementById('cube'); el.value = '4'; el.dispatchEvent(new Event('input', { bubbles: true })); }); s = await state();
check('the cube slider sets M = 4 (64 points, R up to 27)', s.M === 4 && s.points === 64 && s.max === 27 && s.preset === null && samePts(s.shell, REF.get(4)[s.R]), JSON.stringify({ M: s.M, max: s.max, R: s.R }));
await page.evaluate(() => { const el = document.getElementById('shell'); el.value = '9'; el.dispatchEvent(new Event('input', { bubbles: true })); }); s = await state();
check('the R slider moves the shell and the rail', s.R === 9 && Math.round(s.t) === 9 && samePts(s.shell, REF.get(4)[9]));
await page.evaluate(() => window.SPHERE_DEBUG.setShell(5, 17)); await settle(page);   // the strip is redrawn for M = 5
const bar = await page.evaluate(() => window.SPHERE_DEBUG.histPoint(29));
if (bar) { await page.mouse.click(bar.x, bar.y); s = await state(); check('clicking the bar of R = 29 moves to that shell', s.R === 29 && samePts(s.shell, S5[29]), `R = ${s.R}`); }
await page.focus('#stage').catch(() => {});
await page.evaluate(() => window.SPHERE_DEBUG.setShell(5, 17));
await page.keyboard.press('ArrowRight'); s = await state();
check('→ on the rail steps R to 18', s.R === 18 && samePts(s.shell, S5[18]), `R = ${s.R}`);

// the pigeonhole sweep plays by itself, declares its still at the fattest shell, and Space pauses it
check('PIGEONHOLE plays the sweep of R', await playsAfter(page, () => page.click('[data-preset="pigeonhole-peak"]'), () => window.SPHERE_DEBUG.state));
check('PIGEONHOLE sweeps through the shells', await until(page, () => window.SPHERE_DEBUG.state.R >= 3));
await page.keyboard.press('Space'); s = await state();
check('Space pauses the sweep', !s.playing);
check('PIGEONHOLE declares its still frame: R = 17', (await page.evaluate(() => document.querySelector('[data-preset="pigeonhole-peak"]').dataset.still)) === '17');
await page.click('[data-preset="shell-convex"]'); await settle(page);
await page.keyboard.press('Space');
check('after a card, Space plays the rail', await until(page, () => window.SPHERE_DEBUG.state.playing && window.SPHERE_DEBUG.state.t !== 17));
await page.keyboard.press('Space');

/* ---------- the stills a chapter cites (PDF / EPUB) ---------- */
const STILLS = {
  'shell-convex': (x) => !x.pair,
  'ap-forbidden': (x) => x.pair && eq(x.pair.m, apM) && x.pair.m2 === 14,
  'tight-chord': (x) => x.pair && x.pair.m2 === 16.5,
  'pigeonhole-peak': (x) => !x.pair
};
for (const [card, ok] of Object.entries(STILLS)) for (const lang of ['zh', 'en']) {
  const still = await openStill(T, BOOK, ID, card, lang);
  const x = await still.evaluate(() => window.SPHERE_DEBUG.state);
  check(`still ${card} (${lang}): M = 5, R = 17, the 9 points of S₁₇, at rest`,
    x.preset === card && x.M === 5 && x.R === 17 && samePts(x.shell, S5[17]) && !x.playing && ok(x), JSON.stringify({ p: x.preset, R: x.R, n: x.count, playing: x.playing, pair: x.pair }));
  await still.context().close();
}
check('no page error, console error or failed request (page-specific part)', T.errors.length === 0, T.errors.slice(0, 4).join(' | '));
await T.finish();
