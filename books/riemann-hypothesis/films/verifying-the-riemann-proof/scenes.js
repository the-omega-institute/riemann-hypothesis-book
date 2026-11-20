/* Film · Verifying 17 Million Lines of Lean · 如何验证一千七百万行黎曼猜想证明 (book riemann-hypothesis, chapter 7).
   Scenes for theme/film/engine.js. Every fact on screen is taken from the-omega-institute/riemann-hypothesis at commit
   0bcc9368e418 (README.md, verify, ci/plan.py, ci/parts.py, ci/Audit.lean, comparator.json, src/Challenge.lean,
   verification/NOTES.md) or computed here on load, and FILM.init checks it (a failed check is a page error, which
   stops the render):
     replay     175,187 files, 17,374,215 lines, 818,755 theorem/lemma declarations, no comments (NOTES.md "Size");
                one pixel per file, the libraries as blocks; 17,374,215 s / 86,400 s per day = 201.1 days.
     challenge  src/Challenge.lean verbatim (27 lines, `import Mathlib` only, five theorems `by sorry`); Mathlib v4.33.1
                at 0df444a360ea; a forged statement is rejected before any kernel runs (NOTES.md "Smoke test").
     shards     8,490 shards, 36 levels, 17 foundation keys, 529 jobs right after them (README.md). The key of the
                bottom shard is recomputed here exactly as ci/plan.py does: sha256 over "\0"-joined parts, from the
                git blob ids of lean-toolchain, lake-manifest.json, lakefile.toml, BuildAid/D1…D5.lean and
                Statements.lean; it is d93c757c…, published in the Release lean-parts-v1-d (bucket = first hex digit,
                ci/parts.py) as a 12,432-byte archive with digest sha256:80afd28e….
     four       the four commands and two helpers of README.md "Verify locally"; the steps of ./verify Main.
     fresh      SHA-256 check, restore, `lake env leanchecker --fresh`, then ci/Audit.lean (verbatim) and the rule of
                ci/parts.py audit(): only propext, Quot.sound and Classical.choice. The declaration stream and the
                forged proof are a SCHEMATIC of what the replay does, not a log.
     six        lean4export v4.33.0 (15f6055e), an estimated 70–75 GB export, bubblewrap, Lean v4.36.0 lake comparator
                with its kernel, leanchecker-paranoid, nanoda, con-leche, con-ron; lean4lean built with v4.33.1 on the
                .olean files; rehearsal (smoke test) verdicts and times; the full Comparator run awaits the build.
   Grounds: LEAN ✓ only for the five theorems of film.json "lean" (Main.lean at the pinned source commit); NUM for
   what is computed on screen; the replay stream is labelled SCHEMATIC. Colours: green = Lean theorems and kernel
   acceptance, amber = the active shard or current step, magenta = a rejected forgery or a forbidden axiom, cyan = the
   graph, shard keys and SHA-256 data. No clock, no randomness: every frame is a function of the scene time. */
'use strict';

/* ---------- the Lean citations (film.json "lean"), looked up by the whole GID ---------- */
const GID = {
  rh: 'Main.riemannHypothesis',
  zeta: 'Main.riemannZeta_eq_zero_re',
  half: 'Main.LFunction_ne_zero_of_half_lt_re',
  strip: 'Main.LFunction_eq_zero_re',
  prim: 'Main.LFunction_eq_zero_re_of_isPrimitive'
};
const GID_ORDER = [GID.rh, GID.zeta, GID.half, GID.strip, GID.prim];

/* ---------- facts of the source tree at the commit the film describes ---------- */
const SRC = {
  commit: '0bcc9368e418',
  files: 175187, lines: 17374215, theorems: 818755,
  libs: [
    ['Development', 141928, 12232663], ['Formalism', 18254, 3200748], ['GroundTheory', 8507, 1119138],
    ['ReciprocityTheory', 3845, 563016], ['CompanionTheory', 2027, 194218], ['PositivityTheory', 449, 55130],
    ['Lemmata', 167, 9232], ['Main · Statements · Supplements · BuildAid', 10, 70]
  ],
  mathlib: 'v4.33.1', mathlibCommit: '0df444a360ea', leanBuild: 'v4.33.1', leanJudge: 'v4.36.0',
  shards: 8490, levels: 36, foundations: 17, firstWave: 529
};
const NAMES = ['riemannHypothesis', 'riemannZeta_eq_zero_re', 'LFunction_ne_zero_of_half_lt_re', 'LFunction_eq_zero_re',
  'LFunction_eq_zero_re_of_isPrimitive'];                                    // comparator.json "theorem_names"
const AXIOMS = ['propext', 'Classical.choice', 'Quot.sound'];               // comparator.json "permitted_axioms"

/* src/Challenge.lean and ci/Audit.lean at 0bcc9368e418, verbatim */
const CHALLENGE = [
  'import Mathlib',
  '',
  'def RiemannZetaZerosOnLine : Prop :=',
  '  ∀ s : ℂ, riemannZeta s = 0 → (¬∃ n : ℕ, s = -2 * ((n : ℂ) + 1)) → s ≠ 1 → s.re = 1 / 2',
  '',
  'def DirichletLNonvanishingRightOfHalf : Prop :=',
  '  ∀ (N : ℕ) [NeZero N] (χ : DirichletCharacter ℂ N) (s : ℂ),',
  '    1 / 2 < s.re → (χ ≠ 1 ∨ s ≠ 1) → DirichletCharacter.LFunction χ s ≠ 0',
  '',
  'def DirichletLZerosOnLine : Prop :=',
  '  ∀ (N : ℕ) [NeZero N] (χ : DirichletCharacter ℂ N) (s : ℂ),',
  '    0 < s.re → s.re < 1 → DirichletCharacter.LFunction χ s = 0 → s.re = 1 / 2',
  '',
  'def PrimitiveDirichletLZerosOnLine : Prop :=',
  '  ∀ (N : ℕ) [NeZero N] (χ : DirichletCharacter ℂ N), χ.IsPrimitive →',
  '    ∀ s : ℂ, 0 < s.re → s.re < 1 → DirichletCharacter.LFunction χ s = 0 → s.re = 1 / 2',
  '',
  "/-- The headline claim, stated with Mathlib's definition only. -/",
  'theorem riemannHypothesis : RiemannHypothesis := by sorry',
  '',
  'theorem riemannZeta_eq_zero_re : RiemannZetaZerosOnLine := by sorry',
  '',
  'theorem LFunction_ne_zero_of_half_lt_re : DirichletLNonvanishingRightOfHalf := by sorry',
  '',
  'theorem LFunction_eq_zero_re : DirichletLZerosOnLine := by sorry',
  '',
  'theorem LFunction_eq_zero_re_of_isPrimitive : PrimitiveDirichletLZerosOnLine := by sorry'
];
const AUDIT = [
  'import Main',
  '',
  'example : RiemannHypothesis := riemannHypothesis',
  '#print axioms riemannHypothesis',
  '#print axioms riemannZeta_eq_zero_re',
  '#print axioms LFunction_ne_zero_of_half_lt_re',
  '#print axioms LFunction_eq_zero_re',
  '#print axioms LFunction_eq_zero_re_of_isPrimitive'
];
const THEOREM_LINES = CHALLENGE.map((s, i) => (s.startsWith('theorem ') ? i : -1)).filter(i => i >= 0);

/* ---------- SHA-256 (FIPS 180-4), pure and deterministic ---------- */
const sha256 = (() => {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const H0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  return str => {
    const bytes = new TextEncoder().encode(str), n = bytes.length, len = ((n + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(len); m.set(bytes); m[n] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(len - 8, Math.floor(n / 0x20000000)); dv.setUint32(len - 4, (n * 8) >>> 0);
    const h = H0.slice(), w = new Uint32Array(64);
    for (let o = 0; o < len; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + 4 * i);
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15], y = w[i - 2];
        w[i] = (w[i - 16] + (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) + w[i - 7] + (rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10))) >>> 0;
      }
      let [a, b, c, d, e, f, g, k] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (k + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        k = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, k].forEach((v, i) => { h[i] = (h[i] + v) >>> 0; });
    }
    return h.map(v => v.toString(16).padStart(8, '0')).join('');
  };
})();

/* ---------- the bottom shard's key, as ci/plan.py computes it ---------- */
const KEYS = (() => {
  const digest = parts => sha256(parts.join('\0'));
  const cfg = [['lean-toolchain', 'a8afa7d1b02d96f0671eba854a8dc4b416beb473'],
    ['lake-manifest.json', 'b4d1ec31575a26b2159ec3a262b482bc051f3f6f'],
    ['lakefile.toml', '7fb51422cf263fbaa82975612a975ea6b3bb5261']];
  const arts = 'lake-leanArts/linux-x86_64/v1';
  const mods = [['BuildAid.D1', 'e29bf840ddd71faecd715cde3855fda9452fbde1'], ['BuildAid.D2', '9d8a1bdf290c55ff183dffea35928392294bd07b'],
    ['BuildAid.D3', '66639a03f20fb2ac9d9ffcdc44332fd201c9ed3b'], ['BuildAid.D4', 'b79fc54acac9d3c96706673ba754e8ca084f3d0f'],
    ['BuildAid.D5', '17840bd92e9837dde33a4bf01937c591e670686b'], ['Statements', '1cd1bce93344065936b2b392b23306254e0785ef']];
  const config = digest(cfg.map(c => c[1]).concat([arts]));
  const key = digest([config].concat(mods.map(([mod, blob]) => `${mod}:${blob}`)));
  return {
    cfg, arts, mods, config, key, bucket: 'lean-parts-v1-' + key[0],
    bytes: 12432, digest: '80afd28e0391030d6d657ac485e276769ce654c0304ff477ce7f2452f09a50ab'   // the Release asset
  };
})();
const EXPECT = {
  config: '188c77df28f65067e35023aef212b6fc1b979bb5c0d8b665d663bcb4e36820f8',
  key: 'd93c757cdf2f1a69df1dc48e4398c294fde3df91829f5a2bb5ca79174f55de09'
};

/* ---------- small helpers ---------- */
const group = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const win = (u, s, e, fin = 0.5, fout = 0.5) => clamp((u - s) / fin) * clamp((e - u) / fout);
const HEXD = '0123456789abcdef';
/* a hash settling left to right as p goes 0 → 1 (unsettled digits are deterministic noise) */
function hexReveal(hex, p, seed = 0) {
  let out = '';
  for (let i = 0; i < hex.length; i++) {
    const th = 0.08 + 0.8 * (i / hex.length);
    out += p >= th ? hex[i] : p > th - 0.3 ? HEXD[Math.floor(rnd(i + Math.floor(p * 60), seed) * 16)] : ' ';
  }
  return out;
}
function glow(x1, y1, x2, y2, col, a, w) {
  if (a <= 0.003) return;
  line(x1, y1, x2, y2, col, a * 0.1, w * 7);
  line(x1, y1, x2, y2, col, a * 0.28, w * 2.8);
  line(x1, y1, x2, y2, col, a, w);
}
function disc(x, y, r, col, a) { if (a <= 0.003) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
function xmark(x, y, r, col, a, w = 3) { if (a <= 0.003) return; ctx.save(); ctx.lineCap = 'round'; line(x - r, y - r, x + r, y + r, col, a, w); line(x - r, y + r, x + r, y - r, col, a, w); ctx.restore(); }
function tick(x, y, r, col, a, w = 3) {
  if (a <= 0.003) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.3, y + r * 0.7); ctx.lineTo(x + r, y - r * 0.8); ctx.stroke(); ctx.restore();
}
/* the largest size ≤ size at which s fits in maxW */
function fit(s, size, fam, w, maxW, ls = 0) { let z = size; while (z > 10 && tw(s, z, fam, w, ls) > maxW) z -= 1; return z; }
/* a small framed tag: text in a bracketed box, left-aligned at x; returns its width */
function tag(s, x, y, col, a, size = 16, fill = null) {
  const wd = tw(s, size, F.mono, 700) + 20;
  if (a <= 0.003) return wd;
  box(x, y - size - 4, wd, size + 14, col, a, 1.4, fill || rgba(C.bg, 0.7));
  txt(s, x + 10, y + 2, { size, fam: F.mono, w: 700, c: col, a });
  return wd;
}
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
/*              the mosaic: one pixel for each of the 175,187 files         */
/* ======================================================================= */
const MOS = { w: 640, h: 280, x: 150, y: 250, s: 1.5 };          // drawn 960 × 420
let mosaic = null;
function buildMosaic() {
  const cnv = mk(MOS.w, MOS.h), g = cnv.getContext('2d'), img = g.createImageData(MOS.w, MOS.h), d = img.data;
  const cols = [mix(C.cyan, C.bg, 0.45), mix(C.blue, C.bg, 0.2), mix(C.cyan, C.white, 0.3), mix(C.blue, C.white, 0.3),
    mix(C.cyan, C.blue, 0.5), C.white, mix(C.white, C.dim, 0.4), C.white].map(hexrgb);
  let lit = 0;
  const put = (x, y, k, i) => {
    if (x < 0 || x >= MOS.w || y < 0 || y >= MOS.h) return;
    const r = rnd(i, k + 1), o = 4 * (y * MOS.w + x), v = 0.3 + 0.7 * r * r;   // a speckle: each file its own pixel
    d[o] = cols[k][0] * v; d[o + 1] = cols[k][1] * v; d[o + 2] = cols[k][2] * v; d[o + 3] = 255; lit++;
  };
  const blocks = [];
  /* Development: column by column on the left */
  const dn = SRC.libs[0][1], dw = Math.ceil(dn / MOS.h);
  for (let i = 0; i < dn; i++) put(Math.floor(i / MOS.h), i % MOS.h, 0, i);
  blocks.push({ k: 0, x: 0, y: 0, w: dw, h: MOS.h });
  /* the other libraries: row by row, stacked in the right column */
  const x0 = dw + 2, rw = MOS.w - x0;
  let y = 0;
  for (let k = 1; k < SRC.libs.length; k++) {
    const n = SRC.libs[k][1], rows = Math.ceil(n / rw);
    for (let i = 0; i < n; i++) put(x0 + (i % rw), y + Math.floor(i / rw), k, i);
    blocks.push({ k, x: x0, y, w: rw, h: rows });
    y += rows + 2;
  }
  g.putImageData(img, 0, 0);
  return { cnv, lit, blocks, bottom: y - 2 };
}
const mosX = px => MOS.x + px * MOS.s, mosY = py => MOS.y + py * MOS.s;

/* ======================================================================= */
/*                              checks on load                             */
/* ======================================================================= */
FILM.init.push(() => {
  const E = window.FILM_ERRORS;
  /* SHA-256 against the FIPS 180-4 test vectors, then the bottom shard's key against the Release asset name */
  if (sha256('abc') !== 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' ||
      sha256('') !== 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') E.push('sha256: test vectors fail');
  if (KEYS.config !== EXPECT.config) E.push(`shards: config digest ${KEYS.config} changed`);
  if (KEYS.key !== EXPECT.key || KEYS.bucket !== 'lean-parts-v1-d') E.push(`shards: bottom shard key ${KEYS.key} changed`);
  /* the five citations: exactly film.json "lean", all theorems, named as in comparator.json and Challenge.lean */
  const cited = (DATA.lean || []).map(r => r.gid);
  if (cited.length !== GID_ORDER.length || GID_ORDER.some(g => !cited.includes(g))) E.push('film.json "lean" is not the five Main theorems');
  GID_ORDER.forEach((g, i) => {
    const r = leanCite(g);
    if (!r || r.kind !== 'theorem') E.push(`film.json does not cite the theorem ${g}`);
    else if (r.short !== NAMES[i]) E.push(`${g}: short name ${r.short} is not ${NAMES[i]}`);
  });
  /* Challenge.lean: 27 lines, Mathlib the only import, the five theorems stated with sorry */
  if (CHALLENGE.length !== 27) E.push(`challenge: ${CHALLENGE.length} lines`);
  if (CHALLENGE.filter(s => /^import /.test(s)).join() !== 'import Mathlib') E.push('challenge: imports changed');
  if (THEOREM_LINES.map(i => CHALLENGE[i].split(' ')[1]).join() !== NAMES.join()) E.push('challenge: theorem names changed');
  if (THEOREM_LINES.some(i => !CHALLENGE[i].endsWith(':= by sorry'))) E.push('challenge: a theorem is not stated with sorry');
  if (AUDIT.filter(s => s.startsWith('#print axioms ')).map(s => s.slice(14)).join() !== NAMES.join()) E.push('audit: names changed');
  /* the size table of NOTES.md adds up; the mosaic lights one pixel per file */
  if (SRC.libs.reduce((s, l) => s + l[1], 0) !== SRC.files || SRC.libs.reduce((s, l) => s + l[2], 0) !== SRC.lines) E.push('size table does not add up');
  mosaic = buildMosaic();
  if (mosaic.lit !== SRC.files || mosaic.bottom > MOS.h) E.push(`mosaic: ${mosaic.lit} pixels for ${SRC.files} files`);
  if (Math.abs(SRC.lines / 86400 - 201.0904) > 1e-3) E.push('replay: days changed');
  if (WALL.cols * WALL.rows < SRC.shards || WALL.cols * (WALL.rows - 1) >= SRC.shards) E.push('shards: wall size');
  const pin = (DATA.pin && DATA.pin.commit) || '';
  if (pin && !pin.startsWith(SRC.commit)) console.warn(`film: the facts are from ${SRC.commit}; the lock pins ${pin.slice(0, 12)}: review the narration`);
});
Object.assign(FILM.speed, { replay: 0.012, challenge: 0.014, shards: 0.03, four: 0.016, fresh: 0.02, six: 0.012 });

/* ======================================================================= */
/*                         1 · don't trust, replay                          */
/* ======================================================================= */
/* numbers in Chakra Petch: Orbitron's narrow '.' and '1' would make 201.1 read as 2011 */
function counter(x, y, n, label, a, col = C.white) {
  if (a <= 0.003) return;
  txt(group(n), x, y, { size: 58, fam: F.disp, w: 700, c: col, a, ab: 1 });
  txt(label, x + 2, y + 30, { size: 17, fam: F.mono, w: 700, c: C.dim, a });
}
function drawMosaic(a, rev = 1) {
  if (a <= 0.003 || !mosaic) return;
  const dw = MOS.w * MOS.s, dh = MOS.h * MOS.s;
  box(MOS.x - 8, MOS.y - 8, dw + 16, dh + 16, C.cyan, a * 0.6, 1.2);
  ctx.save(); ctx.beginPath(); ctx.rect(MOS.x, MOS.y, dw * rev, dh); ctx.clip();
  ctx.globalAlpha = a; ctx.imageSmoothingEnabled = true; ctx.drawImage(mosaic.cnv, MOS.x, MOS.y, dw, dh); ctx.restore();
  if (rev < 1) glow(MOS.x + dw * rev, MOS.y, MOS.x + dw * rev, MOS.y + dh, C.cyan, a, 2);
  /* labels of the three large blocks */
  mosaic.blocks.slice(0, 3).forEach(b => {
    const [name, n] = SRC.libs[b.k], x = mosX(b.x) + 10, y = mosY(b.y) + 26;
    const la = a * clamp((rev * dw - (x - MOS.x)) / 120);
    const s1 = `${name}`, s2 = group(n), wd = Math.max(tw(s1, 16, F.mono, 700), tw(s2, 15, F.mono, 400)) + 16;
    fillBox(x - 6, y - 19, wd, 46, C.bg, la * 0.72);
    txt(s1, x, y, { size: 16, fam: F.mono, w: 700, c: C.white, a: la });
    txt(s2, x, y + 20, { size: 15, fam: F.mono, c: C.cyan, a: la });
  });
}
SCENES.replay = S => {
  const u = S.u, L0 = lineAt(S, 0), out = clamp((S.d - u) / 0.6);
  /* opening title during the lead */
  const ta = clamp(u / 0.5) * (1 - clamp((u - L0.s - 0.1) / 0.6));
  if (ta > 0.003) {
    const p = clamp(u / 1.5), T = DATA.film.title.toUpperCase();
    txt(`${DATA.book.code} · FILM`, W / 2, 360, { size: 26, fam: F.mono, w: 700, align: 'center', c: C.cyan, a: ta, ls: 10 });
    txt(DATA.film.title_zh, W / 2, 500, { size: fit(DATA.film.title_zh, 100, F.zh, 900, 1600), fam: F.zh, w: 900, align: 'center', c: C.white, a: ta * clamp(p * 1.6), ab: 4 });
    txt(scramble(T, p, 5), W / 2, 596, { size: fit(T, 50, F.orb, 900, 1600, 8), fam: F.orb, w: 900, align: 'center', c: C.white, a: ta, ls: 8, ab: 2 });
  }
  badgeQ(S, [[0, null, 'computed']]);
  /* the mosaic sweeps in while the sizes are spoken */
  const ma = at(S, 0, 0.6, -0.2) * out, st = Q(S, 3, 'Replay it', 0.45);
  const rev = ease(clamp((u - L0.s + 0.2) / Math.max(1, L0.e - L0.s)));
  drawMosaic(ma * (1 - 0.6 * st), rev);
  txt('one pixel = one .lean file', MOS.x, MOS.y - 24, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: ma });
  txt(`verification/NOTES.md @ ${SRC.commit}`, MOS.x + MOS.w * MOS.s, MOS.y - 24, { size: 15, fam: F.mono, align: 'right', c: C.dim, a: ma });
  const rest = SRC.libs.slice(3).reduce((s, l) => s + l[1], 0);
  txt(`right column, smaller blocks: Reciprocity · Companion · Positivity · Lemmata · Main — ${group(rest)} files`,
    MOS.x, MOS.y + MOS.h * MOS.s + 38, { size: 15, fam: F.mono, c: C.dim, a: ma * rev });
  /* right column: the counters */
  const cx = 1190;
  const c1 = Q(S, 0, 'seventy-five thousand files', 1.2), c2 = Q(S, 0, 'Seventeen million lines', 1.2);
  const c3 = Q(S, 0, 'Seventeen million lines', 1.2, 0.5), c4 = Q(S, 0, 'Not one comment', 0.5);
  counter(cx, 296, Math.round(SRC.files * eo(c1)), '.lean files · 文件', clamp(c1 * 4) * out);
  counter(cx, 384, Math.round(SRC.lines * eo(c2)), 'lines of Lean · 代码行', clamp(c2 * 4) * out);
  counter(cx, 472, Math.round(SRC.theorems * eo(c3)), 'theorems & lemmas · 定理与引理', clamp(c3 * 4) * out);
  counter(cx, 560, 0, 'comments · 注释', c4 * out, C.now);
  /* the referee: 1 line per second */
  const ra = at(S, 1, 0.6, -0.1) * out;
  panel(1170, 628, 570, 184, ra, C.now, 'REFEREE · 人类审稿人');
  txt('1 line per second, nonstop', 1192, 684, { size: 19, fam: F.mono, w: 700, c: C.white, a: ra });
  txt(`${group(SRC.lines)} s ÷ 86,400 s per day`, 1192, 718, { size: 19, fam: F.mono, c: C.white, a: ra * Q(S, 1, 'one line a second', 0.5, 0.4) });
  txt(`= ${(SRC.lines / 86400).toFixed(1)} days`, 1192, 774, { size: 42, fam: F.disp, w: 700, c: C.now, a: ra * Q(S, 1, 'two hundred days', 0.5), ab: 1 });
  txt(`≈ ${Math.round(SRC.lines / SRC.files)} lines per file`, 1718, 772, { size: 15, fam: F.mono, align: 'right', c: C.dim, a: ra * Q(S, 1, 'two hundred days', 0.5, 0.3) });
  /* the referee's reading head: still on the first file */
  const rh = at(S, 1, 0.5) * (1 - at(S, 2, 0.5, 0.6)) * out;
  if (rh > 0.003) {
    ring(MOS.x + 3, MOS.y + 3, 10 + 2.5 * Math.sin(u * 5), C.now, rh, 2.4);
    disc(MOS.x + 3, MOS.y + 3, 3, C.now, rh);
    line(MOS.x + 10, MOS.y + 10, MOS.x + 30, MOS.y + 76, C.now, rh * 0.8, 1.4);
    fillBox(MOS.x + 22, MOS.y + 78, 336, 30, C.bg, rh * 0.8);
    txt(`referee: still on file 1 of ${group(SRC.files)}`, MOS.x + 30, MOS.y + 99, { size: 16, fam: F.mono, w: 700, c: C.now, a: rh });
  }
  /* the kernel: a scan that never skips */
  const kb = Q(S, 2, 'A kernel never skips', 0.4) * out;
  if (kb > 0.003) {
    const dw = MOS.w * MOS.s, dh = MOS.h * MOS.s, ph = ((u - phraseAt(S, 2, 'A kernel never skips')) / 1.25) % 1, bx = MOS.x + ph * dw;
    ctx.save(); ctx.beginPath(); ctx.rect(MOS.x, MOS.y, dw, dh); ctx.clip();
    const gr = ctx.createLinearGradient(bx - 180, 0, bx, 0);
    gr.addColorStop(0, rgba(C.cyan, 0)); gr.addColorStop(1, rgba(C.cyan, 0.34));
    ctx.globalAlpha = kb; ctx.fillStyle = gr; ctx.fillRect(bx - 180, MOS.y, 180, dh); ctx.restore();
    glow(bx, MOS.y - 6, bx, MOS.y + dh + 6, C.cyan, kb, 2.4);
    txt('kernel: every declaration, every step, nothing skipped', MOS.x, MOS.y + dh + 72, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: kb });
  }
  stamp("DON'T TRUST · REPLAY", MOS.x + MOS.w * MOS.s / 2, 470, st, C.now, 50, -0.05);
};

/* ======================================================================= */
/*                          2 · the 27-line challenge                       */
/* ======================================================================= */
const CODE = { x: 130, y: 196, w: 990, h: 624, lh: 21, size: 15, gut: 50 };
const codeY = i => CODE.y + 62 + i * CODE.lh;
const CODE_X = CODE.x + CODE.gut + 8;
SCENES.challenge = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L0 = lineAt(S, 0);
  badge(Q(S, 1, 'five theorems', 0.5) * clamp((S.d - u) / 0.5), 'lean');
  /* left: the file itself, scrolling in */
  const pa = at(S, 0, 0.6, -0.3) * out;
  panel(CODE.x, CODE.y, CODE.w, CODE.h, pa, C.cyan, `SRC/CHALLENGE.LEAN · ${CHALLENGE.length} LINES · @${SRC.commit}`);
  const shown = 2 + (CHALLENGE.length - 2) * ease(clamp((u - L0.s + 0.3) / 2.0));
  CHALLENGE.forEach((s, i) => {
    const a = pa * clamp(shown - i);
    if (a <= 0.003) return;
    txt(String(i + 1), CODE.x + 36, codeY(i), { size: 13, fam: F.mono, align: 'right', c: C.dim, a: a * 0.7 });
    const col = s.startsWith('theorem') || s.startsWith('import') ? C.white : s.startsWith('def') ? C.cyan : s.startsWith('/--') ? C.dim : mix(C.white, C.dim, 0.3);
    txt(s, CODE_X, codeY(i), { size: CODE.size, fam: F.mono, c: col, a });
  });
  /* highlights are placed by measuring the text before them: ∀, ℂ, → may come from a fallback font of another width */
  const pre = s => tw(s, CODE.size, F.mono);
  const mark = (i, sub, a, from = 'first') => {
    const s = CHALLENGE[i], j = from === 'last' ? s.lastIndexOf(sub) : s.indexOf(sub);
    box(CODE_X + pre(s.slice(0, j)) - 5, codeY(i) - 16, pre(sub) + 10, 23, C.now, a, 1.6, rgba(C.now, 0.08));
  };
  /* the only import */
  const qi = Q(S, 0, 'importing only official Mathlib', 0.5) * out;
  mark(0, 'import Mathlib', qi);
  txt('← the only import', CODE_X + pre('import Mathlib') + 22, codeY(0), { size: 15, fam: F.mono, w: 700, c: C.now, a: qi });
  /* the five theorems, each stated `by sorry` */
  THEOREM_LINES.forEach((i, k) => {
    fillBox(CODE.x + 8, codeY(i) - 15, 5, 21, C.now, Q(S, 1, 'five theorems', 0.4, 0.18 * k) * out);
    mark(i, 'by sorry', Q(S, 1, 'proves none', 0.35, 0.08 * k) * out);
  });
  /* the reference statement for the comparison */
  mark(3, 's.re = 1 / 2', Q(S, 2, 'Alter one symbol', 0.4) * out, 'last');

  /* right column */
  const px = 1170, pw = 570;
  const ma = at(S, 0, 0.6, 0.6) * out;
  panel(px, 196, pw, 138, ma, C.cyan, 'MATHLIB ONLY · 只依赖官方 MATHLIB');
  txt('import Mathlib', px + 22, 256, { size: 26, fam: F.mono, w: 700, c: C.white, a: ma });
  txt(`${SRC.mathlib} · ${SRC.mathlibCommit} · official tag`, px + 22, 290, { size: 17, fam: F.mono, w: 700, c: C.cyan, a: ma });
  txt('all 9 package pins: official upstream commits', px + 22, 318, { size: 14, fam: F.mono, c: C.dim, a: ma });
  const ta = Q(S, 1, 'five theorems', 0.6) * out;
  panel(px, 352, pw, 290, ta, C.lean, 'THE FIVE THEOREMS · 五条定理');
  GID_ORDER.forEach((g, k) => leanChip(px + 22, 414 + k * 44, g, Q(S, 1, 'five theorems', 0.4, 0.18 * k) * out, { size: 18, maxW: pw - 44 }));
  txt('RH: Mathlib’s RiemannHypothesis · 4 others: L(χ, s)', px + 22, 632 - 6, { size: 14, fam: F.mono, c: C.dim, a: Q(S, 1, 'four on Dirichlet', 0.5) * out });
  /* the comparison: Challenge against Main, type for type */
  const ca = Q(S, 2, 'Main must prove', 0.6) * out, fa = Q(S, 2, 'Alter one symbol', 0.35) * out;
  panel(px, 662, pw, 150, ca, fa > 0.5 ? C.mag : C.cyan, 'COMPARATOR · 逐字比对');
  txt('challenge', px + 22, 714, { size: 15, fam: F.mono, c: C.dim, a: ca });
  txt('… → s.re = 1 / 2', px + 140, 714, { size: 19, fam: F.mono, w: 700, c: C.white, a: ca });
  txt('solution', px + 22, 748, { size: 15, fam: F.mono, c: C.dim, a: ca });
  const flick = fa > 0 && fa < 1 ? (Math.floor(u * 14) % 2 === 0) : fa >= 1;
  txt(flick ? '… → s.re ≤ 1 / 2' : '… → s.re = 1 / 2', px + 140, 748, { size: 19, fam: F.mono, w: 700, c: flick ? C.mag : C.white, a: ca });
  txt('Main.lean must match this type exactly', px + 22, 790, { size: 15, fam: F.mono, c: C.dim, a: ca * (1 - fa) });
  const ra = Q(S, 2, 'the match fails', 0.4) * out;
  xmark(px + 32, 784, 8, C.mag, ra, 3);
  txt('mismatch: rejected before any kernel runs', px + 52, 790, { size: 16, fam: F.mono, w: 700, c: C.mag, a: ra });
};

/* ======================================================================= */
/*                       3 · 8,490 shards in public CI                      */
/* ======================================================================= */
const WALL = { cols: 125, rows: 68, p: 6.88, cell: 5.4, x: 150, y: 236 };
const wallXY = (i, W0 = WALL) => [W0.x + (i % W0.cols) * W0.p, W0.y + (W0.rows - 1 - Math.floor(i / W0.cols)) * W0.p];
/* state(i): 0 hidden, 1 cut (dim), 2 active (amber), 3 published (cyan, two deterministic tones) */
function drawWall(state, a, W0 = WALL) {
  if (a <= 0.003) return;
  const fills = [null, rgba(C.dim, 0.32), C.now, mix(C.cyan, C.bg, 0.42), mix(C.cyan, C.bg, 0.6)];
  for (let st = 1; st <= 4; st++) {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = fills[st];
    for (let i = 0; i < SRC.shards; i++) {
      const s = state(i);
      if ((s === 3 ? (rnd(i, 41) < 0.3 ? 3 : 4) : s) !== st) continue;
      const [x, y] = wallXY(i, W0);
      ctx.fillRect(x, y, W0.cell, W0.cell);
    }
    ctx.restore();
  }
}
const BUCKET = { x: 1112, y: 712, w: 34, gap: 5.4 };
const bucketX = k => BUCKET.x + k * (BUCKET.w + BUCKET.gap);
SCENES.shards = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L0 = lineAt(S, 0), L2 = lineAt(S, 2);
  badgeQ(S, [[0, null, 'computed']]);
  /* the cut: cells appear as the planner partitions the graph */
  const cutP = ease(clamp((u - phraseAt(S, 0, 'a planner cuts') + 0.2) / Math.max(1.2, L0.e - phraseAt(S, 0, 'a planner cuts'))));
  const nCut = Math.floor(SRC.shards * cutP);
  /* the CI run, from "Seventeen foundations" to the end of the scene (a schematic of the order, not live status) */
  const tF = phraseAt(S, 2, 'Seventeen foundations'), tW = phraseAt(S, 2, 'unlock 529 jobs') + 0.5, tP = phraseAt(S, 2, 'Public CI publishes'), tE = S.d - 1.1;
  const nTop = SRC.foundations + SRC.firstWave;
  const front = u < tP ? nTop : nTop + (SRC.shards - nTop) * ease(clamp((u - tP) / (tE - tP)));
  const state = i => {
    if (i >= nCut) return 0;
    if (i < SRC.foundations) return u < tF ? 1 : u < tF + 0.7 ? 2 : 3;
    if (i < nTop) return u < tW ? 1 : u < tW + 0.9 ? 2 : 3;
    if (i < front) return 3;
    return i < front + 260 && u >= tP ? 2 : 1;
  };
  const wa = at(S, 0, 0.6, -0.3) * out;
  drawWall(state, wa);
  const built = u < tF ? 0 : u < tW ? SRC.foundations : Math.floor(front);
  txt(u < tF ? `shards cut: ${group(nCut)} / ${group(SRC.shards)}` : `shards published: ${group(Math.min(SRC.shards, built))} / ${group(SRC.shards)}`,
    WALL.x, 212, { size: 20, fam: F.mono, w: 700, c: u < tF ? C.white : C.cyan, a: wa });
  txt(`ci/plan.py @ ${SRC.commit}`, WALL.x + WALL.cols * WALL.p, 212, { size: 15, fam: F.mono, align: 'right', c: C.dim, a: wa });
  /* the 36 levels: a gauge beside the wall */
  const gx = WALL.x + WALL.cols * WALL.p + 18, gy0 = WALL.y + WALL.rows * WALL.p, gy1 = WALL.y;
  const la = Q(S, 0, 'thirty-six levels', 0.6) * out;
  line(gx, gy0, gx, gy1, C.cyan, la * 0.7, 1.5);
  for (let l = 0; l < SRC.levels; l++) { const y = lerp(gy0, gy1, l / (SRC.levels - 1)); line(gx - 4, y, gx + 4, y, C.cyan, la * 0.6, 1); }
  txt('L0', gx + 10, gy0 + 5, { size: 14, fam: F.mono, w: 700, c: C.cyan, a: la });
  txt('L35', gx + 10, gy1 + 5, { size: 14, fam: F.mono, w: 700, c: C.cyan, a: la });
  if (u >= tF) { const yl = lerp(gy0, gy1, clamp((front - nTop) / (SRC.shards - nTop)) * 0.97 + (u >= tW ? 0.03 : 0)); disc(gx, yl, 5, C.now, la); }
  /* the levels in words, under the wall */
  const y1 = WALL.y + WALL.rows * WALL.p + 34;
  txt('one cell = one shard · 36 dependency levels · build order schematic', WALL.x, y1, { size: 15, fam: F.mono, c: C.dim, a: wa });
  const fa = Q(S, 2, 'Seventeen foundations', 0.5) * out;
  txt('L0: 17 foundations', WALL.x, y1 + 34, { size: 19, fam: F.mono, w: 700, c: C.now, a: fa });
  txt('→  L1: 529 jobs at once', WALL.x + 236, y1 + 34, { size: 19, fam: F.mono, w: 700, c: C.now, a: Q(S, 2, 'unlock 529 jobs', 0.5) * out });
  txt('→ … →  L35: Main', WALL.x + 548, y1 + 34, { size: 19, fam: F.mono, w: 700, c: C.cyan, a: Q(S, 2, 'Public CI publishes', 0.5) * out });
  /* Main, the top shard, when everything below it is published */
  const done = clamp((u - tE + 0.1) / 0.3) * out, [mx, my] = wallXY(SRC.shards - 1);
  if (done > 0.003) { ring(mx + WALL.cell / 2, my + WALL.cell / 2, 12, C.now, done, 2.4); txt('Main', mx + WALL.cell + 18, my + 10, { size: 16, fam: F.mono, w: 700, c: C.now, a: done }); }

  /* right: the key of the bottom shard, computed here */
  const ka = at(S, 1, 0.6, -0.4) * out, px = 1112, pw = 628;
  panel(px, 196, pw, 486, ka, C.cyan, 'SHARD KEY · SHA-256 · COMPUTED HERE');
  const [c0x, c0y] = wallXY(0);
  if (ka > 0.003) {
    /* the bottom shard, tied to its key by a leader that runs under the wall, not across it */
    const cx0 = c0x + WALL.cell / 2, cy0 = c0y + WALL.cell / 2, ly = WALL.y + WALL.rows * WALL.p + 16, lx = px - 14;
    const lead = ka * (1 - clamp((u - tF) / 0.5));
    ring(cx0, cy0, 11, C.now, ka, 2.4);
    ctx.save(); ctx.setLineDash([5, 6]);
    line(cx0, cy0 + 11, cx0, ly, C.now, lead * 0.6, 1.3); line(cx0, ly, lx, ly, C.now, lead * 0.6, 1.3);
    line(lx, ly, lx, 556, C.now, lead * 0.6, 1.3); line(lx, 556, px, 556, C.now, lead * 0.6, 1.3);
    ctx.restore();
  }
  const m = 17, lh = 25, x0 = px + 22;
  let y = 252;
  /* reveal progress is independent of the fade: a digest must never show a wrong digit */
  const pc = Q(S, 1, 'its toolchain', 1.6), pk = Q(S, 1, 'the shards below', 1.4);
  txt('config = sha256(', x0, y, { size: m, fam: F.mono, w: 700, c: C.white, a: ka });
  KEYS.cfg.forEach(([name, blob], k) => {
    y += lh;
    txt(`  ${blob.slice(0, 8)}`, x0, y, { size: m, fam: F.mono, c: C.cyan, a: ka });
    txt(name, x0 + 130, y, { size: m, fam: F.mono, c: C.dim, a: ka });
  });
  y += lh; txt(`  "${KEYS.arts}" )`, x0, y, { size: m, fam: F.mono, c: C.dim, a: ka });
  y += lh + 6;
  const hc = hexReveal(KEYS.config, clamp(pc), 3);
  txt('= ' + hc.slice(0, 32), x0, y, { size: 19, fam: F.mono, w: 700, c: C.cyan, a: ka * clamp(pc * 4) });
  txt('  ' + hc.slice(32), x0, y + 24, { size: 19, fam: F.mono, w: 700, c: C.cyan, a: ka * clamp(pc * 4) });
  y += 66;
  const sa = Q(S, 1, 'its sources', 0.5) * out;
  txt('key = sha256( config,', x0, y, { size: m, fam: F.mono, w: 700, c: C.white, a: sa });
  y += lh; txt('  BuildAid.D1 … D5, Statements', x0, y, { size: m, fam: F.mono, c: C.white, a: sa });
  txt('6 git blob ids', x0 + pw - 44, y, { size: 14, fam: F.mono, align: 'right', c: C.dim, a: sa });
  y += lh; txt('  no shards below: the bottom shard )', x0, y, { size: m, fam: F.mono, c: C.dim, a: Q(S, 1, 'the shards below', 0.5) * out });
  y += lh + 14;
  const hk = hexReveal(KEYS.key, clamp(pk), 7), kk = ka * clamp(pk * 4);
  txt('= ', x0, y, { size: 24, fam: F.mono, w: 700, c: C.cyan, a: kk });
  const kx = x0 + tw('= ', 24, F.mono, 700);
  txt(hk.slice(0, 1), kx, y, { size: 24, fam: F.mono, w: 700, c: pk >= 1 ? C.now : C.cyan, a: kk, ab: 1 });
  txt(hk.slice(1, 32), kx + tw('d', 24, F.mono, 700), y, { size: 24, fam: F.mono, w: 700, c: C.cyan, a: kk, ab: 1 });
  txt(hk.slice(32), kx, y + 30, { size: 24, fam: F.mono, w: 700, c: C.cyan, a: kk, ab: 1 });
  const ba = clamp((u - phraseAt(S, 1, 'the shards below') - 1.5) / 0.5) * out;
  txt(`first hex digit ${KEYS.key[0]} → ${KEYS.bucket}`, x0, y + 70, { size: 17, fam: F.mono, w: 700, c: C.now, a: ba });
  txt(`${KEYS.key.slice(0, 8)}….tar.zst · ${group(KEYS.bytes)} bytes · published`, x0, y + 98, { size: 15, fam: F.mono, c: C.white, a: ba });
  /* the 16 Release buckets */
  const bra = Math.max(ba, Q(S, 2, 'Public CI publishes', 0.5)) * out;
  txt('RELEASES · lean-parts-v1-0 … lean-parts-v1-f', BUCKET.x, BUCKET.y - 14, { size: 15, fam: F.mono, w: 700, c: C.cyan, a: bra, ls: 1 });
  for (let k = 0; k < 16; k++) {
    const hot = HEXD[k] === KEYS.key[0], x = bucketX(k);
    box(x, BUCKET.y, BUCKET.w, 40, hot ? C.now : C.cyan, bra * (hot ? 1 : 0.55), hot ? 2.2 : 1.2, hot ? rgba(C.now, 0.14 * ba) : rgba(C.bg, 0.6));
    txt(HEXD[k], x + BUCKET.w / 2, BUCKET.y + 27, { size: 18, fam: F.mono, w: 700, align: 'center', c: hot ? C.now : C.cyan, a: bra });
  }
  /* the bottom shard flies into its bucket when the foundations land */
  const fl = clamp((u - tF - 0.2) / 1.1);
  if (fl > 0 && fl < 1) {
    const e = ease(fl), tx = bucketX(13) + BUCKET.w / 2, ty = BUCKET.y + 20;
    const x = lerp(c0x, tx, e), yy = lerp(c0y, ty, e) - Math.sin(Math.PI * e) * 120;
    fillBox(x - 7, yy - 7, 14, 14, C.now, out); glow(x, yy, lerp(c0x, tx, e * 0.9), lerp(c0y, ty, e * 0.9) - Math.sin(Math.PI * e * 0.9) * 120, C.now, out * 0.6, 2);
  }
  txt('public Actions CI · each finished shard is published at once', BUCKET.x, BUCKET.y + 82, { size: 15, fam: F.mono, c: C.dim, a: Q(S, 2, 'Public CI publishes', 0.5) * out });
};

/* ======================================================================= */
/*                          4 · four lines for anyone                       */
/* ======================================================================= */
const CMDS = [
  ['git clone --depth 1 https://github.com/the-omega-institute/riemann-hypothesis.git', 'clone', '# a shallow copy of the public source'],
  ['cd riemann-hypothesis', 'step in', null],
  ['./verify --status Main', 'check the status', '# commit · shards published · MiB — downloads nothing'],
  ['./verify Main', 'verify Main', '# restore → SHA-256 check → fresh replay → axiom audit']
];
const STEPS = [
  ['lake exe cache get', 'official Mathlib build cache'],
  ['curl each shard · SHA-256', 'must equal the Release digest'],
  ['tar --zstd → .lake/build', 'restore the .olean files'],
  ['lake --no-build build', 'nothing compiled behind your back'],
  ['lake env leanchecker --fresh Main', 'replay in an empty kernel'],
  ['lake env lean ci/Audit.lean', 'five theorems, three axioms']
];
SCENES.four = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6);
  badge(Q(S, 2, 'verify BuildAid.D1', 0.5) * clamp((S.d - u) / 0.5), 'computed');
  /* the terminal */
  const ta = at(S, 0, 0.6, -0.3) * out, tx = 140, tw0 = 1050;
  panel(tx, 196, tw0, 340, ta, C.cyan, 'TERMINAL · 四行命令');
  let y = 262;
  CMDS.forEach(([cmd, phrase, note], k) => {
    const t0 = phraseAt(S, 0, phrase), p = clamp((u - t0 + 0.15) / Math.max(0.5, cmd.length * 0.018)), a = ta * clamp((u - t0 + 0.15) / 0.2);
    const active = p > 0 && (k === CMDS.length - 1 || u < phraseAt(S, 0, CMDS[k + 1][1]) - 0.15);
    if (a > 0.003) {
      disc(tx + 34, y - 7, 15, active ? C.now : C.cyan, a * (active ? 0.9 : 0.35));
      txt(String(k + 1), tx + 34, y, { size: 18, fam: F.orb, w: 900, align: 'center', c: C.bg, a });
      const s = '$ ' + typed(cmd, p);
      txt(s, tx + 64, y, { size: 18, fam: F.mono, w: 700, c: active ? C.white : mix(C.white, C.dim, 0.25), a });
      if (p < 1 || (active && Math.floor(u * 2.4) % 2 === 0)) fillBox(tx + 64 + tw(s, 18, F.mono, 700) + 3, y - 16, 10, 20, C.now, a * 0.9);
    }
    if (note) txt(note, tx + 64, y + 26, { size: 15, fam: F.mono, c: C.dim, a: a * clamp(p * 2 - 1) });
    y += note ? 70 : 46;
  });
  /* the two helpers */
  const ha = Q(S, 2, 'verify BuildAid.D1', 0.5) * out;
  panel(tx, 556, tw0, 256, ha, C.now, 'TWO HELPERS · 两个辅助命令');
  const h1 = Q(S, 2, 'verify BuildAid.D1', 0.6), h2 = Q(S, 2, '--build-missing', 0.6);
  txt('$ ' + typed('./verify BuildAid.D1', h1), tx + 30, 620, { size: 20, fam: F.mono, w: 700, c: h2 > 0 ? mix(C.white, C.dim, 0.25) : C.white, a: ha });
  txt(`# a small module in the bottom shard ${KEYS.key.slice(0, 8)}… (${group(KEYS.bytes)} bytes):`, tx + 30, 650, { size: 15, fam: F.mono, c: C.dim, a: ha * clamp(h1 * 2 - 1) });
  txt('# tests the whole download → SHA-256 → fresh replay path right now', tx + 30, 674, { size: 15, fam: F.mono, c: C.dim, a: ha * clamp(h1 * 2 - 1) });
  const hb = Q(S, 2, '--build-missing', 0.4) * out;
  txt('$ ' + typed('./verify --build-missing Main', h2), tx + 30, 730, { size: 20, fam: F.mono, w: 700, c: C.white, a: hb });
  txt('# restore what is published, compile the missing tail on your machine', tx + 30, 760, { size: 15, fam: F.mono, c: C.dim, a: hb * clamp(h2 * 2 - 1) });

  /* right: public Releases and what ./verify Main does */
  const rx = 1240, rw = 500, ra = Q(S, 1, 'public Releases', 0.6) * out;
  panel(rx, 196, rw, 214, ra, C.cyan, 'PUBLIC RELEASES · 公开发布');
  txt('no GitHub account', rx + 22, 262, { size: 30, fam: F.orb, w: 900, c: C.white, a: Q(S, 1, 'no GitHub account', 0.5) * out, ab: 1 });
  txt('needs: x86-64 Linux · Git · Python ≥ 3.12', rx + 22, 304, { size: 15, fam: F.mono, w: 700, c: C.cyan, a: ra });
  txt('curl · zstd · elan (pins Lean v4.33.1)', rx + 22, 330, { size: 15, fam: F.mono, w: 700, c: C.cyan, a: ra });
  txt('--status also runs on macOS', rx + 22, 362, { size: 14, fam: F.mono, c: C.dim, a: ra });
  txt('GH_TOKEN optional: only if rate-limited', rx + 22, 388, { size: 14, fam: F.mono, c: C.dim, a: ra });
  const sa = Q(S, 0, 'verify Main', 0.6) * out, s0 = phraseAt(S, 0, 'verify Main');
  panel(rx, 428, rw, 384, sa, C.cyan, './verify Main · 六步');
  STEPS.forEach(([cmd, note], k) => {
    const ts = s0 + 0.35 + k * 0.5, p = clamp((u - ts) / 0.3), cur = u >= ts && u < ts + 0.5;
    const yy = 482 + k * 55, col = cur ? C.now : p >= 1 ? C.cyan : C.dim;
    disc(rx + 30, yy - 6, 6, col, sa * Math.max(0.35, p));
    if (k < STEPS.length - 1) line(rx + 30, yy + 2, rx + 30, yy + 47, C.dim, sa * 0.5, 1.2);
    txt(cmd, rx + 50, yy, { size: 16, fam: F.mono, w: 700, c: p > 0 ? C.white : C.dim, a: sa * Math.max(0.4, p) });
    txt(note, rx + 50, yy + 21, { size: 13, fam: F.mono, c: C.dim, a: sa * Math.max(0.3, p) });
  });
};

/* ======================================================================= */
/*                        5 · zero-trust fresh replay                       */
/* ======================================================================= */
const PIPE = [['RELEASE', `${KEYS.key.slice(0, 8)}….tar.zst`], ['SHA-256', '= Release digest'], ['RESTORE', '.olean → .lake/build'],
  ['EMPTY KERNEL', 'leanchecker --fresh'], ['AXIOM AUDIT', 'ci/Audit.lean']];
/* a schematic stream: Mathlib first, then the project, then Main; one proof is forged (rhOfAll) */
const DECLS = ['Nat.add_comm', 'Nat.Prime.two_le', 'Complex.exp_add', 'riemannZeta', 'DirichletCharacter.LFunction',
  'Formalism.VW.rh_of_every', 'allChi', 'claimAll', 'critAll', 'rhOfAll', 'riemannHypothesis'];
const FORGED = 9;
SCENES.fresh = S => {
  const u = S.u, out = clamp((S.d - u) / 0.6), L2 = lineAt(S, 2), L3 = lineAt(S, 3), L4 = lineAt(S, 4);
  /* the pipeline: the active stage is amber, the forged stage magenta */
  const pa = at(S, 0, 0.6, -0.3) * out;
  const stage = u < lineAt(S, 1).s ? 0 : u < L2.s ? 1 : u < L4.s ? 3 : 4, bad = u >= phraseAt(S, 3, 'rejects it') && u < L4.s;
  PIPE.forEach(([name, sub], k) => {
    const x = 140 + k * 325, w = 300, cur = k === stage || (stage === 1 && k === 0) || (stage === 3 && k === 2 && u < L2.s + 1.2);
    const col = cur ? (bad && k === 3 ? C.mag : C.now) : k < stage ? C.cyan : C.dim;
    box(x, 196, w, 92, col, pa * (cur ? 1 : 0.7), cur ? 2.4 : 1.3, cur ? rgba(col, 0.1) : rgba(C.bg, 0.6));
    txt(name, x + 18, 234, { size: 20, fam: F.mono, w: 700, c: cur ? col : C.white, a: pa, ls: 1 });
    txt(sub, x + 18, 266, { size: 15, fam: F.mono, c: C.dim, a: pa });
    if (k < PIPE.length - 1) arrow(x + w + 3, 242, x + 322, 242, C.dim, pa * 0.8, 1.6);
  });
  /* left A: what the checksum proves */
  const shaA = win(u, lineAt(S, 0).s - 0.3, L2.s + 0.4, 0.6, 0.5) * out;
  panel(140, 322, 950, 300, shaA, C.cyan, 'SHA-256 CHECK · 完整性校验');
  txt('Release digest', 166, 384, { size: 16, fam: F.mono, c: C.dim, a: shaA });
  txt(`sha256:${KEYS.digest.slice(0, 40)}…`, 360, 384, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: shaA });
  const qd = Q(S, 1, 'SHA-256 check', 0.8);                    // reveal progress, independent of the fade
  txt('your download', 166, 422, { size: 16, fam: F.mono, c: C.dim, a: shaA });
  txt(`sha256:${hexReveal(KEYS.digest, clamp(qd * 1.3), 11).slice(0, 40)}…`, 360, 422, { size: 18, fam: F.mono, w: 700, c: C.cyan, a: shaA * clamp(qd * 3) });
  const eq = Q(S, 1, 'what CI published', 0.5) * shaA;
  tick(1048, 404, 11, C.cyan, eq, 3.2);
  txt('proves: the same bytes CI published', 166, 500, { size: 22, fam: F.mono, w: 700, c: C.cyan, a: eq });
  txt('does not prove: that those bytes are correct', 166, 546, { size: 22, fam: F.mono, w: 700, c: C.now, a: eq * clamp((u - phraseAt(S, 1, 'what CI published') - 0.6) / 0.5) });
  txt(`bottom shard ${KEYS.key.slice(0, 8)}… · ${group(KEYS.bytes)} bytes · digest checked against the Release`, 166, 596, { size: 14, fam: F.mono, c: C.dim, a: shaA });
  /* left B: the empty kernel (a schematic of what leanchecker --fresh does) */
  const ka = clamp((u - L2.s + 0.3) / 0.6) * out * (1 - 0.55 * clamp((u - L4.s) / 0.6));
  if (ka > 0.003) {
    panel(140, 322, 950, 490, ka, bad ? C.mag : C.lean, 'EMPTY KERNEL · leanchecker --fresh · SCHEMATIC 示意');
    txt('starts from nothing: every declaration of Main and its imports, Mathlib included', 166, 382, { size: 16, fam: F.mono, c: C.white, a: ka });
    const t0 = phraseAt(S, 2, 'an empty kernel'), tForge = L3.s + 0.2, step = (tForge - t0) / FORGED;
    const nShown = Math.min(FORGED + 1, Math.floor((u - t0) / step) + 1), first = Math.max(0, nShown - 6);
    for (let i = first; i < nShown; i++) {
      const yy = 430 + (i - first) * 52, at0 = t0 + i * step, a = ka * clamp((u - at0) / 0.25), forged = i === FORGED;
      if (forged) {
        const fa = clamp((u - tForge) / 0.3);
        fillBox(160, yy - 30, 910, 44, C.mag, a * 0.12 * fa);
        xmark(186, yy - 8, 9, C.mag, a * fa, 3.4);
        txt(DECLS[i], 214, yy, { size: 20, fam: F.mono, w: 700, c: C.mag, a });
        txt('forged proof term · type mismatch · replay stops', 1060, yy, { size: 16, fam: F.mono, w: 700, align: 'right', c: C.mag, a: a * fa });
      } else {
        const ok = clamp((u - at0 - 0.2) / 0.2);
        tick(186, yy - 8, 9, C.lean, a * ok, 3);
        txt(DECLS[i], 214, yy, { size: 20, fam: F.mono, w: 700, c: C.white, a });
        txt('type-checked', 1060, yy, { size: 15, fam: F.mono, align: 'right', c: C.lean, a: a * ok });
      }
    }
    stamp('REJECTED', 615, 772, Q(S, 3, 'rejects it', 0.45) * (1 - clamp((u - L4.s) / 0.5)), C.mag, 42, -0.04);
  }
  /* right A: the shard in hand */
  const sh = (1 - clamp((u - L4.s + 0.3) / 0.5)) * pa;
  panel(1130, 322, 610, 300, sh, C.cyan, 'THE SHARD IN HAND · 手里的分片');
  fillBox(1160, 372, 70, 70, C.cyan, sh * 0.18); box(1160, 372, 70, 70, C.cyan, sh, 2);
  txt(KEYS.key.slice(0, 4), 1195, 414, { size: 18, fam: F.mono, w: 700, align: 'center', c: C.cyan, a: sh });
  txt(`${KEYS.key.slice(0, 16)}….tar.zst`, 1252, 396, { size: 17, fam: F.mono, w: 700, c: C.white, a: sh });
  txt(`${KEYS.bucket} · compiled by our CI`, 1252, 424, { size: 15, fam: F.mono, c: C.dim, a: sh });
  const rows = [['trusted because CI built it?', 'no', C.now, 0], ['bytes as published?', 'SHA-256', C.cyan, 1], ['every proof correct?', 'fresh replay', C.lean, 2]];
  rows.forEach(([q, ans, col, k]) => {
    const t = [lineAt(S, 0).s + 0.6, phraseAt(S, 1, 'what CI published'), phraseAt(S, 2, 'leanchecker --fresh')][k];
    const a = sh * clamp((u - t) / 0.4), yy = 488 + k * 40;
    txt(q, 1160, yy, { size: 16, fam: F.mono, c: C.white, a });
    txt(ans, 1716, yy, { size: 17, fam: F.mono, w: 700, align: 'right', c: col, a });
  });
  /* right B: the axiom audit */
  const aa = clamp((u - L4.s + 0.2) / 0.6) * out;
  if (aa > 0.003) {
    panel(1130, 322, 610, 490, aa, C.lean, 'AXIOM AUDIT · ci/Audit.lean');
    AUDIT.forEach((s, i) => txt(s, 1154, 380 + i * 22, { size: 14, fam: F.mono, c: s.startsWith('#print') ? C.white : C.dim, a: aa }));
    const qa = Q(S, 4, 'Only three may appear', 0.5) * out;
    txt('allowed, nothing else:', 1154, 580, { size: 16, fam: F.mono, w: 700, c: C.white, a: qa });
    let x = 1154;
    AXIOMS.forEach(ax => { tick(x + 14, 612, 7, C.lean, qa, 2.6); x += tag(ax, x + 28, 620, C.lean, qa, 15) + 40; });
    const qs = Q(S, 4, 'a sorry would show', 0.4) * out;
    xmark(1168, 676, 8, C.mag, qs, 3);
    tag('sorryAx', 1186, 684, C.mag, qs, 15);
    txt('a hidden sorry appears here → audit fails', 1310, 684, { size: 15, fam: F.mono, w: 700, c: C.mag, a: qs });
    xmark(1168, 724, 8, C.mag, qs, 3);
    txt('any other axiom → audit fails', 1186, 731, { size: 15, fam: F.mono, w: 700, c: C.mag, a: qs });
    txt('report → .lake/parts/axioms.txt', 1154, 784, { size: 14, fam: F.mono, c: C.dim, a: aa });
  }
};

/* ======================================================================= */
/*                          6 · six independent checkers                    */
/* ======================================================================= */
const CHECKERS = [
  ['Lean kernel', 'Lean v4.36.0', 'accepts · 70 s', "Lean's kernel"],
  ['leanchecker-paranoid', 'bundled with Lean v4.36.0', 'accepts · 81 s', 'paranoid checker'],
  ['nanoda', 'nanoda_bin · bundled', 'accepts · 14 s', 'nanoda'],
  ['con-leche', 'bundled with Lean v4.36.0', 'accepts · 15 s', 'con-leche'],
  ['con-ron', 'bundled with Lean v4.36.0', 'accepts · 27 s', 'con-ron']
];
const ATTACKS = [['wrong statement', 'before any kernel ran', 'a wrong statement'], ['sorry', 'before any kernel ran', 'a sorry'],
  ['extra axiom', 'before any kernel ran', 'an extra axiom'], ['swapped proof', 'by every kernel', 'a swapped proof']];
function closing(S, fin, t0) {
  if (fin <= 0.003) return;
  const b = DATA.book, cx = W / 2, u = S.u;
  stamp("DON'T TRUST · REPLAY", cx, 246, clamp((u - t0) / 0.5), C.now, 44, -0.03);
  txt(b.title.zh, cx, 352, { size: fit(b.title.zh, 54, F.zh, 900, 1500), fam: F.zh, w: 900, align: 'center', c: C.white, a: fin, ab: 3 });
  txt(b.title.en, cx, 402, { size: fit(b.title.en, 27, F.disp, 700, 1500, 1), fam: F.disp, w: 700, align: 'center', c: C.white, a: fin * 0.92, ls: 1 });
  const f2 = clamp((u - t0 - 0.5) / 0.8);
  txt(`FILM · ${DATA.film.title.toUpperCase()}`, cx, 456, { size: 20, fam: F.mono, w: 700, align: 'center', c: C.mag, a: f2, ls: 3 });
  txt(DATA.film.title_zh, cx, 492, { size: 24, fam: F.zh, w: 700, align: 'center', c: C.white, a: f2 * 0.85 });
  const f3 = clamp((u - t0 - 1.0) / 0.8);
  const y = leanList(cx, 552, f3, { align: 'center', size: 19, gap: 38 });
  const pin = DATA.pin || {};
  if (pin.commit) txt(`github.com/${pin.repo} @ ${pin.commit.slice(0, 12)}`, cx, y + 8, { size: 17, fam: F.mono, align: 'center', c: C.dim, a: f3, ls: 1 });
  txt('$ ./verify Main', cx, y + 58, { size: 28, fam: F.mono, w: 700, align: 'center', c: C.now, a: clamp((u - t0 - 1.6) / 0.6), ab: 1 });
}
SCENES.six = S => {
  const u = S.u, L2 = lineAt(S, 2), L3 = lineAt(S, 3);
  const tEnd = L3.e + 0.15, fin = clamp((u - tEnd) / 0.8), out = clamp((S.d - u) / 0.6), body = (1 - fin) * out;
  badge(fin * clamp((S.d - u) / 0.5), 'lean');
  /* left: the export chain, then the rehearsal */
  const ea = at(S, 0, 0.6, -0.3) * body * (1 - clamp((u - L2.s + 0.2) / 0.5));
  const chain = [['Main · .olean files', `built with Lean ${SRC.leanBuild}`, Q(S, 0, 'is exported', 0.5)],
    ['lean4export v4.33.0', '15f6055e · built with v4.33.1', Q(S, 0, 'is exported', 0.5, 0.4)],
    ['solution.export', '≈ 70–75 GB · an estimate', Q(S, 0, 'seventy gigabytes', 0.5)]];
  chain.forEach(([t, s, q], k) => {
    const y = 214 + k * 128, a = ea * q, col = k === 2 ? C.now : C.cyan;
    box(140, y, 460, 92, col, a, 1.6, rgba(C.bg, 0.65));
    txt(t, 162, y + 40, { size: 21, fam: F.mono, w: 700, c: C.white, a });
    txt(s, 162, y + 70, { size: 15, fam: F.mono, w: 700, c: col, a });
    if (k < chain.length - 1) arrow(370, y + 96, 370, y + 124, C.dim, a, 2);
  });
  txt('+ challenge.export (Challenge.lean)', 162, 600, { size: 15, fam: F.mono, c: C.dim, a: ea * Q(S, 0, 'seventy gigabytes', 0.5, 0.5) });
  arrow(604, 474, 652, 420, C.cyan, ea * Q(S, 0, 'judged offline', 0.5), 2.2);
  const rh = clamp((u - L2.s + 0.2) / 0.5) * body;
  if (rh > 0.003) {
    panel(140, 214, 500, 400, rh, C.mag, 'REHEARSAL · 演练（小型测试项目）');
    ATTACKS.forEach(([name, when, phrase], k) => {
      const q = Q(S, 2, phrase, 0.4) * rh, y = 290 + k * 76;
      xmark(172, y - 8, 10, C.mag, q, 3.4);
      txt(name, 200, y, { size: 22, fam: F.mono, w: 700, c: C.white, a: q });
      txt(`rejected ${when}`, 200, y + 26, { size: 15, fam: F.mono, w: 700, c: C.mag, a: q });
    });
    txt('rejected: 4 / 4', 166, 594, { size: 17, fam: F.mono, w: 700, c: C.mag, a: Q(S, 2, 'all rejected', 0.5) * rh });
  }
  /* right: the sandbox and its five checkers */
  const sx = 660, sy = 196, sw = 1080, shh = 430, sa = Q(S, 0, 'judged offline', 0.6) * body;
  if (sa > 0.003) {
    ctx.save(); ctx.setLineDash([10, 8]); box(sx, sy, sw, shh, C.cyan, sa * 0.85, 1.6, rgba(C.bg, 0.5)); ctx.restore();
    txt('bubblewrap sandbox · no network', sx + 22, sy + 34, { size: 17, fam: F.mono, w: 700, c: C.cyan, a: sa, ls: 1 });
    txt(`Lean ${SRC.leanJudge} · lake comparator`, sx + sw - 22, sy + 34, { size: 17, fam: F.mono, w: 700, align: 'right', c: C.white, a: sa });
  }
  const card = (x, y, w, name, sub, smoke, q) => {
    const a = q * body, full = Q(S, 3, 'still running', 0.5) * a;
    box(x, y, w, 158, C.cyan, a, 1.6, rgba(C.bg, 0.7));
    txt(name, x + 18, y + 40, { size: fit(name, 23, F.mono, 700, w - 36), fam: F.mono, w: 700, c: C.white, a });
    txt(sub, x + 18, y + 64, { size: 13, fam: F.mono, c: C.dim, a });
    tick(x + 26, y + 92, 7, C.cyan, a, 2.6);
    txt(`rehearsal: ${smoke}`, x + 42, y + 98, { size: 15, fam: F.mono, w: 700, c: C.cyan, a });
    txt('full proof: awaiting build', x + 18, y + 134, { size: 15, fam: F.mono, w: 700, c: C.now, a: full });
  };
  CHECKERS.forEach(([name, sub, smoke, phrase], k) => {
    const row = k < 3 ? 0 : 1, col = k < 3 ? k : k - 3, w = 330;
    const x = sx + 22 + col * (w + 20) + (row ? (w + 20) / 2 : 0), y = sy + 62 + row * 176;
    card(x, y, w, name, sub, smoke, Q(S, 1, phrase, 0.45));
  });
  /* lean4lean: outside the sandbox, on the .olean files */
  const l4 = Q(S, 1, 'lean4lean', 0.45) * body, lx = sx, ly = 646;
  box(lx, ly, sw, 162, C.cyan, l4, 1.6, rgba(C.bg, 0.7));
  txt('lean4lean', lx + 22, ly + 40, { size: 23, fam: F.mono, w: 700, c: C.white, a: l4 });
  txt('master 67f63b0c · built with Lean v4.33.1 · reads the .olean files, not the export', lx + 22, ly + 66, { size: 14, fam: F.mono, c: C.dim, a: l4 });
  txt('$ lake env lean4lean --fresh Main', lx + 22, ly + 100, { size: 17, fam: F.mono, w: 700, c: C.white, a: l4 });
  tick(lx + 30, ly + 128, 7, C.cyan, l4, 2.6);
  txt('rehearsal: accepts all 750,225 declarations · 37 min', lx + 46, ly + 134, { size: 15, fam: F.mono, w: 700, c: C.cyan, a: l4 });
  txt('full proof: awaiting build', lx + sw - 22, ly + 134, { size: 15, fam: F.mono, w: 700, align: 'right', c: C.now, a: Q(S, 3, 'still running', 0.5) * l4 });
  /* the end card */
  closing(S, fin, tEnd);
};

/* ---------- poster ---------- */
FILM.poster = () => {
  const t = 66.0, si = Math.min(2, TL.scenes.length - 1);
  background(t, TL.scenes[si], si, 12);
  const P = Object.assign({}, WALL, { x: 140, y: 372 });
  drawWall(i => (i === SRC.shards - 1 ? 2 : i < SRC.shards - 1300 ? 3 : i < SRC.shards - 900 ? 2 : 1), 1, P);
  const [mx, my] = wallXY(SRC.shards - 1, P);
  ring(mx + P.cell / 2, my + P.cell / 2, 12, C.now, 1, 2.4);
  txt('Main', mx + P.cell + 18, my + 10, { size: 16, fam: F.mono, w: 700, c: C.now });
  txt(`${group(SRC.shards)} shards · 36 levels · SHA-256 keys`, P.x, P.y - 22, { size: 19, fam: F.mono, w: 700, c: C.cyan });
  txt(DATA.film.title_zh, W / 2, 218, { size: fit(DATA.film.title_zh, 84, F.zh, 900, 1440), fam: F.zh, w: 900, align: 'center', c: C.white, ab: 4 });
  const T = DATA.film.title.toUpperCase();
  txt(T, W / 2, 288, { size: fit(T, 38, F.orb, 900, 1360, 6), fam: F.orb, w: 900, align: 'center', c: C.white, ab: 3, ls: 6 });
  const rx = 1080, rw = 660;
  panel(rx, 372, rw, 236, 1, C.cyan, 'FOUR LINES · 四行命令');
  ['git clone --depth 1 …/riemann-hypothesis.git', 'cd riemann-hypothesis', './verify --status Main', './verify Main'].forEach((s, k) => {
    txt('$ ' + s, rx + 24, 436 + k * 44, { size: 21, fam: F.mono, w: 700, c: k === 3 ? C.now : C.white });
  });
  bloom(0.5);
  leanChip(rx + rw / 2, 672, GID.rh, 1, { size: 24, align: 'center', maxW: rw });
  txt('leanchecker --fresh · six checkers · no GitHub account', rx + rw / 2, 726, { size: 17, fam: F.mono, w: 700, align: 'center', c: C.cyan });
  txt(`${DATA.book.code} · FILM`, rx + rw / 2, 790, { size: 20, fam: F.mono, w: 700, align: 'center', c: C.cyan, ls: 8 });
  txt(DATA.book.title.zh, rx + rw / 2, 834, { size: 24, fam: F.zh, w: 700, align: 'center', c: C.white, a: 0.9 });
  hud(t, 1980, si, TL.scenes[si]);
  post(3);
};
