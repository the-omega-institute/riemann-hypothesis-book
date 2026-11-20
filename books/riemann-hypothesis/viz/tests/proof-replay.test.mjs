#!/usr/bin/env node
// Browser regression suite for PROOF//REPLAY (books/riemann-hypothesis/viz/proof-replay/):
//   node books/riemann-hypothesis/viz/tests/proof-replay.test.mjs      (or: node tools/node/viz-test.mjs riemann-hypothesis)
// It first runs the quality gates every stage-first page must pass, then reads the page through the read-only probe
// window.REPLAY_DEBUG and checks every claim against an implementation written here: the model wavefront re-derived from
// the formula the MODEL box prints; levels as longest import chains, reachability of Main and the critical path by its
// own graph search; every content key recomputed with node:crypto's SHA-256 from the key format the MODEL box prints, so
// that "the keys that change after an edit are exactly the invalidation cone" is checked by hashing, not by asking the
// page; the gate that stops each injected lie from the rules the drawer states. Then the controls, the stills the
// chapters cite, English, and the canvas labels in short labs, cited frames and phones: inside the stage, never on top
// of one another.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { session, stageFirstChecks, settle, until, cjkLeftovers, playsAfter, openStill } from '../../../../tools/node/viz-testkit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const BOOK = 'riemann-hypothesis', ID = 'proof-replay';
const GIDS = ['Main.riemannHypothesis', 'Main.riemannZeta_eq_zero_re', 'Main.LFunction_ne_zero_of_half_lt_re', 'Main.LFunction_eq_zero_re', 'Main.LFunction_eq_zero_re_of_isPrimitive'];
const AXIOMS = ['propext', 'Classical.choice', 'Quot.sound'];

/* ---------- independent implementation ---------- */
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const sorted = (xs) => [...xs].sort((a, b) => a - b);
/** The 36-level wavefront as the MODEL box states it: 17, 529, …, 1, the 7,943 in between ∝ √u·e^(−u/6), u = k − 1. */
function wavefront() {
  const n = new Array(36).fill(0), rest = 8490 - 17 - 529 - 1, parts = [];
  n[0] = 17; n[1] = 529; n[35] = 1;
  for (let k = 2; k <= 34; k++) parts.push({ k, w: Math.sqrt(k - 1) * Math.exp(-(k - 1) / 6) });
  const total = parts.reduce((s, p) => s + p.w, 0);
  for (const p of parts) { p.q = (p.w * rest) / total; p.n = Math.floor(p.q); }
  const left = rest - parts.reduce((s, p) => s + p.n, 0);
  [...parts].sort((a, b) => b.q - b.n - (a.q - a.n) || a.k - b.k).slice(0, left).forEach((p) => { p.n += 1; });
  for (const p of parts) n[p.k] = p.n;
  return n;
}
/** Longest import chain of every shard (its level), who imports whom, and the longest path from each shard to Main. */
function analyse(g) {
  const n = g.deps.length, users = Array.from({ length: n }, () => []), depth = new Array(n).fill(-1);
  g.deps.forEach((ds, i) => ds.forEach((d) => users[d].push(i)));
  const dep = (i) => (depth[i] >= 0 ? depth[i] : (depth[i] = g.deps[i].length ? 1 + Math.max(...g.deps[i].map(dep)) : 0));
  for (let i = 0; i < n; i++) dep(i);
  const toMain = new Array(n).fill(0);
  [...Array(n).keys()].sort((a, b) => depth[b] - depth[a]).forEach((i) => { if (i !== g.main) toMain[i] = 1 + Math.max(...users[i].map((u) => toMain[u])); });
  return { users, depth, toMain };
}
const reach = (start, next) => { const seen = new Set([start]), q = [start]; while (q.length) { const i = q.shift(); for (const j of next(i)) if (!seen.has(j)) { seen.add(j); q.push(j); } } return seen; };
/** Content keys by the printed format, in an order where every import comes first; shard `edited` at revision 1. */
function keysWith(g, depth, edited) {
  const key = [];
  [...Array(g.deps.length).keys()].sort((a, b) => depth[a] - depth[b] || a - b).forEach((i) => {
    key[i] = sha(`lean-parts-v1|lean v4.33.1|mathlib 0df444a360ea|shard ${i}|rev ${i === edited ? 1 : 0}|deps ${sorted(g.deps[i]).map((d) => key[d]).join(',')}`);
  });
  return key;
}
/** The gate that stops each lie, as the drawer states the rules; null for a valid proof. */
const catcher = (fault, forgeSum) => (fault === 'forged-olean' ? (forgeSum ? 'kernel' : 'sha') : fault === 'extra-axiom' ? 'axioms' : fault === 'wrong-stmt' ? 'challenge' : null);

const T = await session();
const { check } = T;

/* ---------- the quality gates of every stage-first page ---------- */
await stageFirstChecks(T, BOOK, ID);

const page = await T.goto(BOOK, ID, '?lang=zh');
await page.evaluate(() => document.fonts && document.fonts.ready); await settle(page, 300);
const D = (fn, arg) => page.evaluate(fn, arg);
const state = async () => { await settle(page); return D(() => window.REPLAY_DEBUG.state); };
const pick = async (id) => { await page.click(`[data-preset="${id}"]`); await settle(page, 60); };
const scene = async (id) => { await page.click(`#sceneChips [data-scene="${id}"]`); await settle(page, 60); };
const set = async (o) => { await D((v) => window.REPLAY_DEBUG.set(v), o); return state(); };
const seek = async (t) => { await D((x) => window.REPLAY_DEBUG.seek(x), t); return state(); };
const text = (sel) => page.textContent(sel);

/* ---------- the facts and the model wavefront ---------- */
const facts = await D(() => window.REPLAY_DEBUG.facts());
check('NUM facts: 175,187 files, 17,374,215 lines, 8,490 shards, 36 levels, 17 foundations, 529 eligible, ≤ 400 modules, ≤ 2,500,000 bytes, 16 Releases',
  facts.files === 175187 && facts.lines === 17374215 && facts.shards === 8490 && facts.levels === 36 && facts.foundations === 17 && facts.eligible === 529
  && facts.maxModules === 400 && facts.maxBytes === 2500000 && facts.releases === 16, JSON.stringify(facts));
check('NUM facts: the contract is 27 + 8 = 35 lines on Mathlib v4.33.1 (0df444a360ea); permitted axioms propext, Classical.choice, Quot.sound',
  facts.challengeLines + facts.auditLines === 35 && facts.mathlib === 'v4.33.1' && facts.mathlibCommit === '0df444a360ea' && same(facts.axioms, AXIOMS));
const G = await D(() => window.REPLAY_DEBUG.graph()), W = wavefront();
check('model wavefront: 36 levels, 17 → 529 → … → 1, summing to 8,490, as the MODEL box formula gives', same(G.counts, W) && W.reduce((s, x) => s + x, 0) === 8490 && G.counts.every((c) => c >= 1), JSON.stringify(G.counts));
const peak = G.counts.indexOf(Math.max(...G.counts));
check('model wavefront: an early fan-out, then a taper toward Main', peak >= 2 && peak <= 6 && G.counts.slice(peak).every((c, i, a) => i === 0 || c <= a[i - 1]), `peak at L${peak}`);

/* ---------- the illustrative graph: levels, closure of Main, columns, content keys ---------- */
const A = analyse(G), N = G.deps.length;
check('graph: every dot sits at the level of its longest import chain, levels 0 … 35', A.depth.every((d, i) => d === G.levels[i]) && new Set(G.levels).size === 36 && Math.max(...G.levels) === 35);
check('graph: Main is the one dot of level 35 and the last one', G.levels.filter((l) => l === 35).length === 1 && G.levels[G.main] === 35 && G.main === N - 1);
check('graph: every dot is in the import closure of Main', reach(G.main, (i) => G.deps[i]).size === N, `${reach(G.main, (i) => G.deps[i]).size} of ${N}`);
check('graph: a level has about √(its shards)/1.6 dots', G.cols.every((c, k) => c === G.levels.filter((l) => l === k).length && c === (k === 35 ? 1 : Math.max(1, Math.round(Math.sqrt(W[k]) / 1.6)))), JSON.stringify(G.cols));
const K0 = keysWith(G, A.depth, -1);
check(`graph: all ${N} content keys are SHA-256 of the printed format (recomputed with node:crypto)`, same(G.keys, K0), `first difference at ${G.keys.findIndex((k, i) => k !== K0[i])}`);

/* ---------- opening view and the four cards ---------- */
let st = await state();
check('opens on DAG SHARDS: CI level 1.5, at rest, no edit', st.preset === 'dag-shards' && st.scene === 'dag' && st.t === 1.5 && !st.playing && st.edit === null, JSON.stringify([st.preset, st.t, st.playing]));
check('DAG SHARDS: 17 foundations compiled, 529 jobs compiling in level 1, the rest waiting', st.level === 1 && st.built === 17 && st.running === 529
  && st.status.every((s, i) => s === (G.levels[i] < 1 ? 'done' : G.levels[i] === 1 ? 'running' : 'pending')) && /17/.test(await text('#hudSub')) && /529/.test(await text('#hudSub')), await text('#hudSub'));
check('page carries its id and the runtime language', (await D(() => document.body.dataset.vizId)) === ID && (await D(() => TRV.lang())) === 'zh');

await page.click('[data-speed="2.5"]'); await settle(page);
check('CI WAVE plays the rebuild wave', await playsAfter(page, () => pick('ci-wave'), () => window.REPLAY_DEBUG.state));
check('CI WAVE stops by itself at L24', await until(page, () => { const s = window.REPLAY_DEBUG.state; return !s.playing && s.t === 24; }, null, 90000));
st = await state();
const E = st.editNode, cone = reach(E, (i) => A.users[i]), K1 = keysWith(G, A.depth, E), changed = [...Array(N).keys()].filter((i) => K1[i] !== K0[i]);
check('CI WAVE edits one shard of L12', st.edit === E && G.levels[E] === 12, JSON.stringify([st.edit, G.levels[E]]));
check('CI WAVE: the invalidation cone is the shard and all that import it, transitively, up to Main (own search)', same(st.cone, sorted(cone)) && cone.has(G.main), `${st.cone.length} vs ${cone.size}`);
check('CI WAVE: rehashing here, the keys that change are exactly the cone; the page agrees', same(changed, sorted(cone)) && same(st.changed, changed) && same(st.keys, K1), `${changed.length} changed, cone ${cone.size}`);
check('CI WAVE: the dependency cone is everything the shard imports (own search)', same(st.up, sorted([...reach(E, (i) => G.deps[i])].filter((i) => i !== E))));
check('CI WAVE: at L24 the cone below is rebuilt, L24 compiles, the cone above waits, everything else is reused', st.status.every((s, i) => s === (!cone.has(i) ? 'reused' : G.levels[i] < 24 ? 'done' : G.levels[i] === 24 ? 'running' : 'stale')));
check('CI WAVE: the critical path is a longest import chain from the edit to Main', st.critical[0] === E && st.critical[st.critical.length - 1] === G.main && st.critical.length - 1 === A.toMain[E] && st.rem === A.toMain[E]
  && st.critical.every((v, i) => i === 0 || G.deps[v].includes(st.critical[i - 1])), `${st.critical.length - 1} vs ${A.toMain[E]}`);
check('CI WAVE: the title gives the cone and the share reused', (await text('#hudSub')).includes(`${cone.size} / ${N}`) && (await text('#hudSub')).includes(`${Math.round(100 * (1 - cone.size / N))}%`), await text('#hudSub'));

check('FRESH REPLAY plays the replay', await playsAfter(page, () => pick('fresh-replay'), () => window.REPLAY_DEBUG.state));
check('FRESH REPLAY runs to the end by itself', await until(page, () => { const s = window.REPLAY_DEBUG.state; return !s.playing && s.t === 8; }, null, 90000));
st = await state();
check('FRESH REPLAY: all four gates pass, six checkers accept, Main accepted, standard axioms only', st.scene === 'replay' && st.fault === 'clean' && st.verdict === 'accepted' && st.caught === null
  && Object.values(st.gates).every((g) => g === 'pass') && st.checkers === 'accept' && same(st.axioms, AXIOMS) && st.statement && st.mismatch.length === 0, JSON.stringify(st.gates));

check('TAMPER CAUGHT plays the replay', await playsAfter(page, () => pick('tamper-caught'), () => window.REPLAY_DEBUG.state));
check('TAMPER CAUGHT stops by itself just past the gate that catches the lie', await until(page, () => { const s = window.REPLAY_DEBUG.state; return !s.playing && s.verdict === 'caught'; }, null, 90000));
st = await state();
check('TAMPER CAUGHT: a forged .olean with a forged checksum passes SHA-256 and is stopped by the fresh kernel', st.fault === 'forged-olean' && st.forgeSum && st.caught === 'kernel'
  && st.gates.sha === 'pass' && st.gates.kernel === 'fail' && st.gates.axioms === 'unreached' && st.gates.challenge === 'unreached' && st.t < 8 && st.t >= 4, JSON.stringify([st.gates, st.t]));
await page.click('[data-speed="1"]');

/* ---------- the fault injector: clean → forged-olean → extra-axiom → wrong-stmt ---------- */
await page.click('[data-speed="2.5"]'); await settle(page);
for (const fault of ['clean', 'forged-olean', 'extra-axiom', 'wrong-stmt']) {
  await set({ forgeSum: false, scene: 'dag' });
  check(`fault ${fault}: the chip switches to the replay and plays it from the clone`, await playsAfter(page, () => page.click(`#faultChips [data-fault="${fault}"]`), () => window.REPLAY_DEBUG.state));
  const want = catcher(fault, false);
  check(`fault ${fault}: the replay stops by itself, ${want ? `at ${want}` : 'accepted'}`, await until(page, (w) => { const s = window.REPLAY_DEBUG.state; return !s.playing && (w ? s.verdict === 'caught' : s.verdict === 'accepted'); }, want, 90000));
  st = await state();
  const order = ['sha', 'kernel', 'axioms', 'challenge'], at = order.indexOf(want);
  const gatesOK = order.every((g, i) => st.gates[g] === (want === null || i < at ? 'pass' : i === at ? 'fail' : 'unreached'));
  check(`fault ${fault}: the gates before the catch pass, the catching gate fails, the rest is never reached`, st.scene === 'replay' && st.fault === fault && st.caught === want && gatesOK
    && (await D(() => document.querySelector('#faultChips [aria-pressed="true"]').dataset.fault)) === fault, JSON.stringify(st.gates));
}
await page.click('[data-speed="1"]');
const hex = (await state()).published.map((_, b) => b.toString(16));
for (const [fault, forgeSum] of [['clean', false], ['forged-olean', false], ['forged-olean', true], ['extra-axiom', false], ['wrong-stmt', false]]) {
  st = await set({ fault, forgeSum, scene: 'replay', t: 8 });
  const honest = hex.map((h) => sha(`lean-parts-v1-${h}|olean|honest`)), got = hex.map((h, b) => (fault === 'forged-olean' && b === 10 ? sha(`lean-parts-v1-${h}|olean|swapped-proof`) : honest[b]));
  const pub = honest.map((p, b) => (fault === 'forged-olean' && forgeSum && b === 10 ? got[b] : p)), mism = pub.map((p, b) => (p === got[b] ? -1 : b)).filter((b) => b >= 0);
  const name = `${fault}${forgeSum ? ' + forged checksum' : ''}`;
  check(`${name}: the 16 Release checksums and downloads are SHA-256 of their bytes (recomputed), mismatching in bucket a only when forged in transit`,
    same(st.published, pub) && same(st.downloaded, got) && same(st.mismatch, mism) && (fault === 'forged-olean' && !forgeSum ? same(mism, [10]) : mism.length === 0), JSON.stringify(st.mismatch));
  check(`${name}: caught by ${catcher(fault, forgeSum) || 'nobody'}; axioms ${fault === 'extra-axiom' ? 'add sorryAx' : 'are the standard three'}; statement ${fault === 'wrong-stmt' ? '≠' : '≡'} Challenge`,
    st.caught === catcher(fault, forgeSum) && same(st.axioms, fault === 'extra-axiom' ? [...AXIOMS, 'sorryAx'] : AXIOMS) && st.statement === (fault !== 'wrong-stmt')
    && st.comparator === (fault === 'clean' ? 'accept' : fault === 'forged-olean' ? 'reject-all' : 'pre-kernel'), JSON.stringify([st.caught, st.axioms]));
  const pillars = fault === 'clean' ? ['pass', 'pass', 'pass', 'pass'] : fault === 'forged-olean' ? ['through', forgeSum ? 'through' : 'catch', 'catch', 'catch'] : fault === 'extra-axiom' ? ['catch', 'through', 'catch', 'catch'] : ['through', 'through', 'through', 'catch'];
  check(`${name}: the four pillars (source, CI shards, empty kernel + axioms, multi-checker) are ${pillars.join(' / ')}; every lie is stopped by at least one`,
    same(st.pillars, pillars) && (fault === 'clean' || st.pillars.includes('catch')));
}
st = await set({ fault: 'forged-olean', forgeSum: false, scene: 'replay', t: 8 });
check('the forged bucket shows in the readout: Release ≠ download in bucket a', (await text('#roV3')).includes(st.published[10].slice(0, 8)) && (await text('#roV3')).includes(st.downloaded[10].slice(0, 8)), await text('#roV3'));
st = await set({ fault: 'extra-axiom', forgeSum: false, scene: 'replay', t: 8 });
check('the smuggled sorry shows in the axiom closure, in magenta', /sorryAx/.test(await text('#roV5')) && (await D(() => !!document.querySelector('#roV5 .c-mg'))));
st = await set({ fault: 'clean', forgeSum: false, scene: 'replay', t: 3.5 });
check('mid-replay the verdict is open and the step is the SHA-256 gate', st.verdict === 'running' && st.step === 3 && st.gates.sha === 'pass' && st.gates.kernel === 'pending');

/* ---------- controls: forged checksum, gates on the stage, F, scenes, rail, CI slider, shards on the stage, undo ---------- */
await set({ fault: 'forged-olean', forgeSum: false, scene: 'replay', t: 0 });
await page.locator('#forgeSum').evaluate((b) => b.click()); await D(() => window.REPLAY_DEBUG.seek(8)); st = await state();
check('the forged-checksum toggle moves the catch from SHA-256 to the fresh kernel', st.forgeSum && st.caught === 'kernel' && (await D(() => document.getElementById('forgeSum').getAttribute('aria-pressed'))) === 'true');
await page.locator('#forgeSum').evaluate((b) => b.click()); await D(() => window.REPLAY_DEBUG.seek(8)); st = await state();
check('… and back', !st.forgeSum && st.caught === 'sha');
for (const [gate, fault, forgeSum] of [['axioms', 'extra-axiom', false], ['challenge', 'wrong-stmt', false], ['kernel', 'forged-olean', true], ['sha', 'forged-olean', false], ['main', 'clean', false]]) {
  await set({ scene: 'replay', t: 8 });
  const p = await D((g) => window.REPLAY_DEBUG.point.gate(g), gate);
  await page.mouse.click(p.x, p.y); st = await state();
  check(`clicking the ${gate} gate plants the lie it stops (${fault}${forgeSum ? ', forged checksum' : ''}) and replays`, st.fault === fault && st.forgeSum === forgeSum && st.t < 8, JSON.stringify([st.fault, st.forgeSum, st.t]));
}
await set({ fault: 'clean', forgeSum: false, scene: 'replay', t: 8 });
await page.click('body', { position: { x: 5, y: 5 } });
await page.keyboard.press('f'); st = await state();
check('F plants the next lie', st.fault === 'forged-olean' && st.scene === 'replay');
await page.keyboard.press('f'); await page.keyboard.press('f'); await page.keyboard.press('f'); st = await state();
check('F cycles back to the valid proof', st.fault === 'clean');
await D(() => window.REPLAY_DEBUG.seek(5));
await page.keyboard.press('1'); st = await state();
check('key 1 switches to the shard DAG, whose rail runs 0 … 36', st.scene === 'dag' && st.max === 36 && (await D(() => document.getElementById('now').max)) === '36');
await page.keyboard.press('2'); st = await state();
check('key 2 switches back to the replay, whose rail runs 0 … 8 and kept its step', st.scene === 'replay' && st.max === 8 && st.t === 5, JSON.stringify([st.max, st.t]));
await set({ edit: null });
await scene('dag'); check('the scene chips switch scenes', (await state()).scene === 'dag' && (await D(() => document.querySelector('#sceneChips [data-scene="dag"]').getAttribute('aria-pressed'))) === 'true');
await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); st = await state();
check('→ advances the CI wave by one level', st.t === 2 && st.level === 2 && st.built === 17 + 529, JSON.stringify([st.t, st.built]));
await page.keyboard.press('End'); st = await state();
check('End: all 36 levels compiled, 8,490 shards built', st.t === 36 && st.built === 8490 && st.status.every((s) => s === 'done'));
await D(() => { const el = document.getElementById('ciLevel'); el.value = '7.5'; el.dispatchEvent(new Event('input', { bubbles: true })); }); st = await state();
check('the CI slider sets the level and leaves the card: free play', st.t === 7.5 && st.level === 7 && st.preset === null && /自由探索/.test(await text('#presetNote')), JSON.stringify([st.t, st.preset]));
await set({ scene: 'replay', t: 2 });
await D(() => { const el = document.getElementById('ciLevel'); el.value = '3'; el.dispatchEvent(new Event('input', { bubbles: true })); }); st = await state();
check('the CI slider brings the shard DAG back on stage', st.scene === 'dag' && st.t === 3);
await set({ edit: null, scene: 'dag', t: 36 });
const target = G.levels.findIndex((l) => l === 20);
const pn = await D((i) => window.REPLAY_DEBUG.point.node(i), target);
await page.mouse.click(pn.x, pn.y); st = await state();
const cone2 = reach(target, (i) => A.users[i]), K2 = keysWith(G, A.depth, target);
check('clicking a shard edits it and starts the rebuild wave at its level', st.edit === target && st.t >= 20 && st.t < 36.0001, JSON.stringify([st.edit, st.t]));
check('… its cone is what imports it, and exactly those keys change (rehashed here)', same(st.cone, sorted(cone2)) && same(st.changed, [...Array(N).keys()].filter((i) => K2[i] !== K0[i])) && same(st.changed, sorted(cone2)));
check('… and Undo is enabled', !(await D(() => document.getElementById('clearEdit').disabled)));
await page.locator('#clearEdit').evaluate((b) => b.click()); st = await state();
check('Undo the edit: no edit, every key back to the original', st.edit === null && same(st.keys, K0) && (await D(() => document.getElementById('clearEdit').disabled)));
await page.keyboard.press('Home'); await page.keyboard.press('Space');
check('Space plays the rail', await until(page, () => { const s = window.REPLAY_DEBUG.state; return s.playing && s.t > 0; }));
await page.keyboard.press('Space'); check('Space pauses', !(await state()).playing);
await page.click('#rew'); check('⏮ returns to the start', (await state()).t === 0);

/* ---------- evidence: five Lean theorems, NUM and MODEL boxes, honest ticks ---------- */
const links = await D(() => [...new Set([...document.querySelectorAll('a[data-lean-gid]')].map((x) => x.dataset.leanGid))]);
check('the page cites exactly the five Main theorems', links.length === 5 && GIDS.every((g) => links.includes(g)), JSON.stringify(links));
check('each of the five is linked from the readouts as a lean-ref', (await D((gs) => gs.every((g) => !!document.querySelector(`#readouts .lean a.lean-ref[data-lean-gid="${g}"]`)), GIDS)));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'books', BOOK, 'viz', 'visualizations.json'), 'utf8')).visualizations.find((v) => v.id === ID);
check('the registry lists exactly the theorems the page cites', !!registry && JSON.stringify([...links].sort()) === JSON.stringify(registry.lean.map((l) => l.gid).sort()));
check('the registry is live and points at chapter 7', registry.status === 'live' && registry.code === 'PROOF//REPLAY' && registry.theory.every((t) => /ch07-anatomy-of-17-million-lines\.html#sec-ch07-/.test(t.href) && /\/en\//.test(t.href_en)));
const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'trureturing.lock.json'), 'utf8')).declarations;
check('every cited GID is a theorem of Main in the lock file', GIDS.every((g) => lock[g] && lock[g].kind === 'theorem' && lock[g].module === 'Main'));
check('green boxes are only the ones with a Lean link', await D(() => [...document.querySelectorAll('.lean:not(.num):not(.model):not(.argued):not(.open):not(.frozen)')].every((b) => b.querySelector('a[data-lean-gid]'))));
check('the shard layout and the gates are labelled MODEL, the repository figures NUM, neither with a Lean link', await D(() => {
  const m = document.querySelector('#evidence .lean.model'), n = document.querySelector('#evidence .lean.num');
  return !!m && !!n && !m.querySelector('a[data-lean-gid]') && !n.querySelector('a[data-lean-gid]') && /299/.test(m.textContent) && /√u/.test(m.textContent)
    && /175,187/.test(n.textContent) && /8,490/.test(n.textContent) && /529/.test(n.textContent) && /35/.test(n.textContent);
}));
check('green ✓ (.okmark) only inside Lean boxes', await D(() => [...document.querySelectorAll('.okmark')].every((e) => e.closest('.lean:not(.num):not(.model)'))));
await page.click('#infoBtn');
check('the drawer says in both languages that the page is not a proof', /不是证明/.test(await text('#drawer div.zh')) && /not a proof/.test(await text('#drawer div.en')));
check('the drawer carries one LEAN ✓ box for each of the five theorems', (await D(() => document.querySelectorAll('#drawer .lean a[data-lean-gid]').length)) === 5);
await page.keyboard.press('Escape');
check('Esc closes the drawer', await D(() => document.getElementById('drawer').hidden));

/* ---------- the stills a chapter can cite: the frame each caption describes ---------- */
check('every card that plays declares its still frame', JSON.stringify(await D(() => [...document.querySelectorAll('[data-preset]')].filter((b) => b.dataset.still != null).map((b) => `${b.dataset.preset}:${b.dataset.still}`)))
  === JSON.stringify(['ci-wave:24', 'fresh-replay:end', 'tamper-caught:end']));
for (const lang of ['zh', 'en']) {
  const a = await openStill(T, BOOK, ID, 'dag-shards', lang), s1 = await a.evaluate(() => window.REPLAY_DEBUG.state), h1 = await a.textContent('#hudSub');
  check(`still DAG SHARDS (${lang}): level 1 at rest, 17 built and 529 in parallel under the title`, s1.scene === 'dag' && s1.t === 1.5 && !s1.playing && s1.built === 17 && s1.running === 529 && h1.includes('17') && h1.includes('529'), h1);
  await a.context().close();
  const b = await openStill(T, BOOK, ID, 'ci-wave', lang), s2 = await b.evaluate(() => window.REPLAY_DEBUG.state), h2 = await b.textContent('#hudSub');
  check(`still CI WAVE (${lang}): the edit at L12, the wave at L24, the cone size under the title`, s2.scene === 'dag' && s2.t === 24 && !s2.playing && s2.edit === E && h2.includes(`${cone.size} / ${N}`), h2);
  await b.context().close();
  const c = await openStill(T, BOOK, ID, 'fresh-replay', lang), s3 = await c.evaluate(() => window.REPLAY_DEBUG.state), h3 = await c.textContent('#hudSub');
  check(`still FRESH REPLAY (${lang}): accepted at the end, the three axioms under the title`, s3.scene === 'replay' && s3.t === 8 && s3.verdict === 'accepted' && AXIOMS.every((x) => h3.includes(x)), h3);
  await c.context().close();
  const d = await openStill(T, BOOK, ID, 'tamper-caught', lang), s4 = await d.evaluate(() => window.REPLAY_DEBUG.state), h4 = await d.textContent('#hudSub');
  check(`still TAMPER CAUGHT (${lang}): the forged .olean stopped by the fresh kernel, named under the title`, s4.scene === 'replay' && s4.verdict === 'caught' && s4.caught === 'kernel' && s4.gates.sha === 'pass'
    && (lang === 'zh' ? h4.includes('空白内核') : h4.includes('fresh kernel')), h4);
  await d.context().close();
}

/* ---------- English ---------- */
await page.click('[data-lang-set="en"]'); await settle(page, 150);
check('English title', (await D(() => document.title)).startsWith('PROOF//REPLAY · Proof replay'));
for (const [name, o] of [['dag', { scene: 'dag', edit: null, t: 1.5 }], ['dag edit', { scene: 'dag', edit: E, t: 24 }], ['replay', { scene: 'replay', fault: 'clean', forgeSum: false, t: 8 }], ['replay caught', { scene: 'replay', fault: 'wrong-stmt', t: 8 }]]) {
  await set(o); const left = await cjkLeftovers(page); check(`English: no Chinese left (${name})`, left.length === 0, left.slice(0, 4).join(' | '));
}
check('the crumb leads back to the visualization index', (await D(() => document.querySelector('.crumb').getAttribute('href'))) === '../');
await D(() => localStorage.removeItem('tr-lang'));

/* ---------- canvas labels: inside the stage between title and legend, apart, in every scene and state; none on the cover ---------- */
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
const inkReport = (p) => p.evaluate(() => {
  const cv = document.querySelector('#cv'), frame = cv.getBoundingClientRect(), hud = document.querySelector('.hud-tl').getBoundingClientRect(), legend = document.querySelector('#legend').getBoundingClientRect();
  const top = hud.bottom - frame.top, bottom = legend.top - frame.top, ink = window.canvasInk;
  const outside = ink.filter((r) => r.l < -0.5 || r.r > frame.width + 0.5 || r.t < top - 0.5 || r.b > bottom + 0.5).map((r) => r.s), clash = [];
  for (let i = 0; i < ink.length; i++) for (let j = i + 1; j < ink.length; j++) {
    const p = ink[i], q = ink[j], w = Math.min(p.r, q.r) - Math.max(p.l, q.l), h = Math.min(p.b, q.b) - Math.max(p.t, q.t);
    if (w > 1.5 && h > 1.5) clash.push(`${p.s} × ${q.s}`);
  }
  return { outside, clash, n: ink.length };
});
const STATES = [
  ['dag cold', { scene: 'dag', edit: null, t: 1.5 }], ['dag mid-wave', { scene: 'dag', edit: null, t: 9.5 }], ['dag built', { scene: 'dag', edit: null, t: 36 }],
  ['dag edit L12', { scene: 'dag', edit: E, t: 24 }], ['dag edit foundation', { scene: 'dag', edit: 0, t: 4 }], ['dag edit near Main', { scene: 'dag', edit: G.main - 1, t: 34.5 }],
  ['replay mid', { scene: 'replay', fault: 'clean', forgeSum: false, t: 2.5 }], ['replay checkers', { scene: 'replay', fault: 'clean', forgeSum: false, t: 7.5 }],
  ['replay clean', { scene: 'replay', fault: 'clean', forgeSum: false, t: 8 }], ['forged, SHA-256', { scene: 'replay', fault: 'forged-olean', forgeSum: false, t: 8 }],
  ['forged, kernel', { scene: 'replay', fault: 'forged-olean', forgeSum: true, t: 8 }], ['sorry', { scene: 'replay', fault: 'extra-axiom', forgeSum: false, t: 8 }],
  ['tweaked statement', { scene: 'replay', fault: 'wrong-stmt', forgeSum: false, t: 8 }]
];
const STILL_OF = { 'dag-shards': 1.5, 'ci-wave': 24, 'fresh-replay': 8, 'tamper-caught': 8 };
for (const lang of ['zh', 'en']) {
  for (const [width, height, card] of [[1440, 900, null], [1440, 500, null], [1081, 500, null], [390, 844, null], [740, 500, 'dag-shards'], [740, 500, 'tamper-caught'], [740, 500, 'ci-wave'], [740, 500, 'fresh-replay'],
    [334, 500, 'dag-shards'], [334, 500, 'tamper-caught'], [334, 500, 'ci-wave'], [334, 500, 'fresh-replay']]) {
    await canvasPage.setViewportSize({ width, height });
    await T.goto(BOOK, ID, `?lang=${lang}${card ? `&embed=1&preset=${card}` : ''}`, canvasPage);
    await canvasPage.evaluate(() => document.fonts.ready);
    for (const [name, o] of card ? [[card, null]] : STATES) {
      if (o) await canvasPage.evaluate((v) => window.REPLAY_DEBUG.set(v), o);
      else {   // a card that plays starts once it is in view: let it start, then hold it at its still
        if (card !== 'dag-shards') await until(canvasPage, () => window.REPLAY_DEBUG.state.playing, null, 10000);
        await canvasPage.evaluate((t) => window.REPLAY_DEBUG.seek(t), STILL_OF[card]);
      }
      await settle(canvasPage);
      const ink = await inkReport(canvasPage), tag = `canvas (${lang}, ${width} × ${height}, ${name})`;
      check(`${tag}: every canvas label lies inside the stage, between the title and the legend`, ink.n > 5 && ink.outside.length === 0, `${ink.n} labels; ${JSON.stringify(ink.outside)}`);
      check(`${tag}: no two canvas labels sit on top of each other`, ink.clash.length === 0, ink.clash.slice(0, 4).join(' | '));
    }
  }
}
await canvasPage.setViewportSize({ width: 1280, height: 720 });
await T.goto(BOOK, ID, '?thumb=1', canvasPage);
await canvasPage.evaluate(() => { if (window.TRV_THUMB) window.TRV_THUMB(); });
await settle(canvasPage);
const cover = await canvasPage.evaluate(() => {
  const cv = document.querySelector('#cv'), c = cv.getContext('2d'), data = c.getImageData(0, 0, cv.width, cv.height).data;
  let drawn = 0, total = 0;
  for (let i = 3; i < data.length; i += 4 * 7) { total++; if (data[i] > 8) drawn++; }
  return { words: window.canvasInk.length, ink: drawn / total, state: window.REPLAY_DEBUG.state };
});
check('cover: the wordless graph mid-rebuild, without a single canvas label', cover.words === 0 && cover.ink > 0.05 && cover.state.edit === E && cover.state.t === 24, JSON.stringify([cover.words, cover.ink]));
await canvasPage.close();

check('no page error, console error or failed request (page-specific part)', T.errors.length === 0, T.errors.slice(0, 4).join(' | '));
await T.finish();
