/* PROOF//REPLAY · model: the repository facts, the illustrative shard DAG, its content keys and the verification gates,
   without the DOM (a classic script loaded before main.js; a film may list it in its scripts).

   Facts (NUM, from the-omega-institute/riemann-hypothesis: README, ci/plan.py, ci/parts.py, src/Challenge.lean,
   ci/Audit.lean, verification/NOTES.md): 175,187 files and 17,374,215 lines; CI partitions the import closure of Main
   into 8,490 shards of at most 400 modules and 2,500,000 bytes, over 36 dependency levels; after the first 17
   compilation keys, 529 jobs are eligible at once; a shard is published in the Release lean-parts-v1-<first hex digit
   of its key>, so there are 16 such Releases; the challenge contract is 35 lines (src/Challenge.lean 27 + ci/Audit.lean
   8) on Mathlib v4.33.1 (commit 0df444a360ea); the permitted axioms are propext, Classical.choice and Quot.sound.

   Illustrative MODEL (the page says so in its MODEL box):
     wavefront   level 0 holds the 17 foundations, level 1 the 529 eligible jobs, level 35 the shard of Main; the other
                 7,943 shards are shared by levels 2 … 34 in proportion to √u·e^(−u/6), u = k − 1, rounded by largest
                 remainder.
     DAG         one dot per column for every (√n_k)/1.6 shards of level k, edges drawn from a fixed seed; every dot
                 imports a dot of the level before it (so its level is its longest import chain) and every dot is
                 imported by some dot of a later level (so the whole picture is the import closure of Main).
     keys        key(i) = SHA-256("lean-parts-v1|lean v4.33.1|mathlib 0df444a360ea|shard i|rev r|deps k₁,k₂,…"), where
                 k₁, k₂, … are the keys of the shards i imports (ascending i) and r counts edits of shard i. Editing one
                 shard therefore changes exactly its key and the keys of everything that imports it, transitively.
     gates       the replay route of scene 2 and the verdict of each gate on each injected lie, as the README and the
                 notes describe the route; not a log of a run. */
(function (root) {
  'use strict';

  const FACTS = Object.freeze({
    files: 175187, lines: 17374215, shards: 8490, levels: 36, foundations: 17, eligible: 529,
    maxModules: 400, maxBytes: 2500000, releases: 16, challengeLines: 27, auditLines: 8,
    toolchain: 'v4.33.1', mathlib: 'v4.33.1', mathlibCommit: '0df444a360ea', judge: 'v4.36.0',
    axioms: Object.freeze(['propext', 'Classical.choice', 'Quot.sound'])
  });
  const LEVELS = FACTS.levels, MAIN_LEVEL = LEVELS - 1;

  /* ---------- SHA-256 (FIPS 180-4) of an ASCII string, as lowercase hex ---------- */
  const K = [], H0 = [];
  for (let n = 2; K.length < 64; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (!prime) continue;
    if (H0.length < 8) H0.push((Math.sqrt(n) % 1) * 4294967296 | 0);   // first 32 bits of the fractional parts
    K.push((Math.cbrt(n) % 1) * 4294967296 | 0);
  }
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  function sha256(str) {
    const msg = [];
    for (let i = 0; i < str.length; i++) msg.push(str.charCodeAt(i) & 0xff);
    const bits = msg.length * 8;
    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);
    for (const w of [Math.floor(bits / 4294967296), bits >>> 0]) msg.push((w >>> 24) & 255, (w >>> 16) & 255, (w >>> 8) & 255, w & 255);
    const h = H0.slice(), W = new Array(64);
    for (let o = 0; o < msg.length; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = (msg[o + 4 * i] << 24) | (msg[o + 4 * i + 1] << 16) | (msg[o + 4 * i + 2] << 8) | msg[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) {
        const a = W[i - 15], b = W[i - 2];
        W[i] = (W[i - 16] + (rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) + W[i - 7] + (rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10))) | 0;
      }
      let [a, b, c, d, e, f, g, k] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (k + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        k = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + k) | 0;
    }
    return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }

  /* ---------- the 36-level wavefront (MODEL between the real ends) ---------- */
  function wavefront() {
    const n = new Array(LEVELS).fill(0);
    n[0] = FACTS.foundations; n[1] = FACTS.eligible; n[MAIN_LEVEL] = 1;
    const rest = FACTS.shards - n[0] - n[1] - n[MAIN_LEVEL], ks = [];
    for (let k = 2; k < MAIN_LEVEL; k++) ks.push(k);
    const w = ks.map((k) => Math.sqrt(k - 1) * Math.exp(-(k - 1) / 6)), sum = w.reduce((s, x) => s + x, 0);
    const raw = w.map((x) => (x * rest) / sum), whole = raw.map(Math.floor);
    const left = rest - whole.reduce((s, x) => s + x, 0);
    raw.map((x, i) => [x - whole[i], i]).sort((p, q) => q[0] - p[0] || p[1] - q[1]).slice(0, left).forEach(([, i]) => { whole[i] += 1; });
    ks.forEach((k, i) => { n[k] = whole[i]; });
    return n;
  }

  /* ---------- the illustrative DAG ---------- */
  function mulberry32(a) {
    return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function buildDag(counts) {
    const rnd = mulberry32(0x5eed2611);
    const cols = counts.map((c, k) => (k === MAIN_LEVEL ? 1 : Math.max(1, Math.round(Math.sqrt(c) / 1.6))));
    const nodes = [], byLevel = cols.map(() => []);
    cols.forEach((c, k) => { for (let j = 0; j < c; j++) { byLevel[k].push(nodes.length); nodes.push({ id: nodes.length, level: k, row: j, deps: [] }); } });
    const fracOf = (nd) => (cols[nd.level] > 1 ? nd.row / (cols[nd.level] - 1) : 0.5);
    const near = (k, f) => { const row = byLevel[k]; return row[Math.min(row.length - 1, Math.max(0, Math.round(f * (row.length - 1))))]; };
    const any = (k) => byLevel[k][Math.floor(rnd() * byLevel[k].length)];
    for (const nd of nodes) {
      const k = nd.level;
      if (!k) continue;
      const deps = new Set();
      if (k === MAIN_LEVEL) {
        byLevel[k - 1].forEach((d) => deps.add(d));
        for (let x = 0; x < 3; x++) deps.add(any(k - 2 - Math.floor(rnd() * 8)));
      } else {
        deps.add(near(k - 1, Math.min(1, Math.max(0, fracOf(nd) + (rnd() - 0.5) * 0.35))));
        const extra = rnd() < 0.3 ? 0 : rnd() < 0.6 ? 1 : 2;
        for (let x = 0; x < extra; x++) deps.add(any(Math.max(0, k - 1 - Math.floor(rnd() * Math.min(k, 5)))));
      }
      nd.deps = [...deps].sort((a, b) => a - b);
    }
    // the picture is the import closure of Main: a shard nobody imports is imported by its neighbour one level up
    const used = new Set();
    nodes.forEach((nd) => nd.deps.forEach((d) => used.add(d)));
    for (const nd of nodes) {
      if (nd.level === MAIN_LEVEL || used.has(nd.id)) continue;
      const up = nodes[near(nd.level + 1, fracOf(nd))];
      up.deps = [...up.deps, nd.id].sort((a, b) => a - b);
      used.add(nd.id);
    }
    const users = nodes.map(() => []);
    nodes.forEach((nd) => nd.deps.forEach((d) => users[d].push(nd.id)));
    const main = nodes.length - 1, rem = new Array(nodes.length).fill(0);
    for (let i = main - 1; i >= 0; i--) rem[i] = 1 + Math.max(...users[i].map((u) => rem[u]));
    return { cols, nodes, byLevel, users, rem, main };
  }
  const closure = (start, next) => {
    const seen = new Set([start]), stack = [start];
    while (stack.length) for (const j of next(stack.pop())) if (!seen.has(j)) { seen.add(j); stack.push(j); }
    seen.delete(start);
    return seen;
  };
  /** What shard i imports, transitively (its dependency cone). */
  const ancestors = (dag, i) => closure(i, (j) => dag.nodes[j].deps);
  /** What imports shard i, transitively, up to Main (its invalidation cone without i). */
  const dependents = (dag, i) => closure(i, (j) => dag.users[j]);
  /** The longest chain of imports from shard i up to Main: at each step the importer with the longest remaining path. */
  function criticalPath(dag, i) {
    const path = [i];
    while (i !== dag.main) {
      let best = dag.users[i][0];
      for (const u of dag.users[i]) if (dag.rem[u] > dag.rem[best] || (dag.rem[u] === dag.rem[best] && u < best)) best = u;
      path.push(best); i = best;
    }
    return path;
  }
  const keyText = (dag, i, rev, keys) => `lean-parts-v1|lean ${FACTS.toolchain}|mathlib ${FACTS.mathlibCommit}|shard ${i}|rev ${rev}|deps ${dag.nodes[i].deps.map((d) => keys[d]).join(',')}`;
  /** Content keys of every shard, with shard `edited` (or none) at revision 1. */
  function keysOf(dag, edited) {
    const keys = [];
    for (const nd of dag.nodes) keys[nd.id] = sha256(keyText(dag, nd.id, nd.id === edited ? 1 : 0, keys));
    return keys;
  }
  /** The status of a shard at CI level `cur` (levels below it are done): with an edit, outside the cone means reused. */
  function status(level, cur, inCone, editing) {
    if (editing && !inCone) return 'reused';
    if (level < cur) return 'done';
    if (level === cur) return 'running';
    return editing ? 'stale' : 'pending';
  }

  /* ---------- scene 2: the replay route, the injected lies and the gates ---------- */
  const FAULTS = ['clean', 'forged-olean', 'extra-axiom', 'wrong-stmt'];
  // 0 git clone · 1 --status · 2 fetch · 3 SHA-256 · 4 fresh kernel · 5 axiom audit · 6 Challenge ≡ · 7 six checkers · 8 Main
  const GATES = [{ id: 'sha', at: 3 }, { id: 'kernel', at: 4 }, { id: 'axioms', at: 5 }, { id: 'challenge', at: 6 }];
  const STEPS = 8, TAMPERED = 10;   // the forged .olean sits in bucket a (lean-parts-v1-a)
  const CHECKERS = ['Lean 4.36', 'paranoid', 'nanoda', 'con-leche', 'con-ron', 'lean4lean'];
  function replay(fault, forgeSum) {
    const forged = fault === 'forged-olean', published = [], downloaded = [];
    for (let b = 0; b < FACTS.releases; b++) {
      const hex = b.toString(16), honest = sha256(`lean-parts-v1-${hex}|olean|honest`);
      const got = forged && b === TAMPERED ? sha256(`lean-parts-v1-${hex}|olean|swapped-proof`) : honest;
      downloaded.push(got);
      published.push(forged && forgeSum && b === TAMPERED ? got : honest);   // a forger who also controls the Release
    }
    const mismatch = published.map((p, b) => (p === downloaded[b] ? -1 : b)).filter((b) => b >= 0);
    const checks = { sha: mismatch.length === 0, kernel: !forged, axioms: fault !== 'extra-axiom', challenge: fault !== 'wrong-stmt' };
    const gate = GATES.find((g) => !checks[g.id]) || null;
    return {
      fault, forgeSum: !!forgeSum, published, downloaded, mismatch, checks,
      caught: gate ? gate.id : null, at: gate ? gate.at : null,
      axioms: fault === 'extra-axiom' ? [...FACTS.axioms, 'sorryAx'] : FACTS.axioms.slice(),
      statement: fault !== 'wrong-stmt',
      checkers: fault === 'clean' ? 'accept' : forged ? 'reject-all' : 'pre-kernel'
    };
  }
  /** The four pillars against one lie: 'pass' (honest proof goes through), 'catch' (this pillar stops the lie),
      'through' (the lie gets past this pillar). */
  const PILLARS = ['source', 'shards', 'kernel', 'comparator'];
  function pillars(fault, forgeSum) {
    if (fault === 'clean') return ['pass', 'pass', 'pass', 'pass'];
    if (fault === 'forged-olean') return ['through', forgeSum ? 'through' : 'catch', 'catch', 'catch'];
    if (fault === 'extra-axiom') return ['catch', 'through', 'catch', 'catch'];
    return ['through', 'through', 'through', 'catch'];
  }

  root.PROOF_REPLAY_MODEL = Object.freeze({
    FACTS, LEVELS, MAIN_LEVEL, FAULTS, GATES, STEPS, TAMPERED, CHECKERS, PILLARS,
    sha256, wavefront, buildDag, ancestors, dependents, criticalPath, keysOf, status, replay, pillars
  });
})(typeof window !== 'undefined' ? window : globalThis);
