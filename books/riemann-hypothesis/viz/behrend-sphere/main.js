/* SPHERE//SHELL · 贝伦德球壳 · Behrend sphere
   The lattice points of the cube {0, …, M − 1}³, sorted by their squared radius R = x² + y² + z² measured from the
   corner (0, 0, 0). Points with the same R lie on one spherical shell. A sphere bulges outward: for two points a ≠ b of
   one shell the midpoint m = (a + b)/2 has ‖m‖² = R − ‖a − b‖²/4 < R, so it sinks inside the ball and no three points of
   a shell form a 3-term progression a, (a + b)/2, b. For M = 5 the 125 points lie on 32 non-empty shells and the fattest,
   R = 17, holds 9 of them (pigeonholes give at least ⌈125/32⌉ = 4). Every count, shell and midpoint is an exact integer
   computation of this file.
   The stage is kit.solid (theme/viz/kit.js): three opaque walls of the cube (x = 0, y = 0, z = 0) with the ball's
   cross-section in pale cyan, the part of the glass shell x² + y² + z² = R inside the cube, the shell's lattice points
   as cyan beads, the chosen pair a, b in amber with their chord and the midpoint m in magenta. The other lattice points
   are small dots on a 2D overlay. The rail is R. Read-only probe for the browser suite: window.SPHERE_DEBUG. */
(() => {
  'use strict';
  const { kit, L } = TRV, { fix } = kit, P = TRV.palette;
  const $ = (id) => document.getElementById(id);
  const HALF_PI = Math.PI / 2;
  /** How far the walls' colour leans from the dark wall towards cyan inside the ball (the ball's cross-section). */
  const INSIDE = 0.14;
  const GHOST = !/noghost/.test(location.search);

  /* ---------- the arithmetic: exact integers ---------- */
  const norm2 = (p) => p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
  const key = (p) => p.join(',');
  const same = (p, q) => !!p && !!q && p[0] === q[0] && p[1] === q[1] && p[2] === q[2];
  /** Pairs {a, b} of one shell (a ≠ b) whose midpoint is a lattice point of that shell: the 3-term progressions a, m, b. */
  function progressions(list) {
    const on = new Set(list.map(key));
    let n = 0;
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], s = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
      if (s.every((v) => v % 2 === 0) && on.has(key(s.map((v) => v / 2)))) n++;
    }
    return n;
  }
  /** Everything about the cube {0, …, M − 1}³: its points, the shells by R, their sizes, the fattest shell. */
  function cube(M) {
    const pts = [], shells = new Map(), Rmax = 3 * (M - 1) ** 2;
    for (let x = 0; x < M; x++) for (let y = 0; y < M; y++) for (let z = 0; z < M; z++) {
      const p = [x, y, z], r = norm2(p);
      pts.push(p);
      if (!shells.has(r)) shells.set(r, []);
      shells.get(r).push(p);
    }
    const counts = new Array(Rmax + 1).fill(0);
    shells.forEach((l, r) => { counts[r] = l.length; });
    const top = Math.max(...counts), peaks = counts.map((n, r) => (n === top ? r : -1)).filter((r) => r >= 0);
    const aps = counts.map((n, r) => (n ? progressions(shells.get(r)) : 0));
    return { M, e: M - 1, pts, shells, Rmax, counts, top, peaks, nonEmpty: shells.size, aps };
  }
  const CUBES = new Map();
  const cubeOf = (M) => CUBES.get(M) || (CUBES.set(M, cube(M)), CUBES.get(M));

  /* ---------- state ---------- */
  const S = { M: 5, R: 17, a: null, b: null, pairIx: -1 };
  let C = cubeOf(S.M);
  const shellNow = () => C.shells.get(S.R) || [];
  /** The chosen pair and its midpoint: m may have half-integer coordinates; ‖m‖² is a multiple of 1/4, exact in doubles. */
  function pairNow() {
    if (!S.a || !S.b) return null;
    const a = S.a, b = S.b, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    return { a, b, m, m2: norm2(m), ab2: norm2(d), lattice: m.every(Number.isInteger) };
  }
  const coord = (p) => `(${p.map((v) => (Number.isInteger(v) ? String(v) : fix(v, 1))).join(', ')})`;
  const num = (v) => String(v);

  /* ---------- world coordinates: the cube drawn with edge 1 around the origin of the scene ---------- */
  const world = (p) => { const c = C.e / 2, s = C.e; return [(p[0] - c) / s, (p[1] - c) / s, (p[2] - c) / s]; };

  /* ---------- the stage ---------- */
  const solidOpts = {
    canvas: $('cv'), radius: 0.36, cx: 0.5, cy: 0.52, yaw: -2.05, pitch: 0.4, wheel: false,
    onChange: () => paint(),
    onPick: (ev, st) => {
      const list = shellNow(), k = st.nearest(ev, list.map(world), 14);
      if (k < 0) return false;
      choose(list[k]); return true;
    }
  };
  const sc = kit.solid($('stage'), solidOpts);
  const overlay = sc.overlay();

  /** Fit the cube between the title and the legend, with room left and right for the labels. The bound depends on the
      pitch only (it holds for every yaw), so turning the camera does not make the cube breathe. */
  function fit() {
    const cv = $('cv'), W = cv.clientWidth || 300, H = cv.clientHeight || 150, box = cv.getBoundingClientRect();
    const rects = (sel) => [...document.querySelectorAll(sel)].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
    const hud = !TRV.thumbMode, title = hud ? rects('#stage > .hud-tl > span') : [], legend = hud ? rects('#stage > .hud-bl > span') : [];
    const top = Math.max(8, ...title.map((r) => r.bottom - box.top)) + 10;
    const bottom = Math.min(H - 8, ...legend.map((r) => r.top - box.top)) - 10;
    const cp = Math.abs(Math.cos(sc.cam.pitch)), sp = Math.abs(Math.sin(sc.cam.pitch));
    const hx = Math.SQRT1_2, hy = 0.5 * (Math.SQRT2 * sp + cp);
    const mx = Math.min(110, Math.max(30, W * 0.13));
    const band = Math.max(40, bottom - top);
    const unit = Math.max(0.16 * Math.min(W, H), Math.min((W - 2 * mx) / (2 * hx), (band - 16) / (2 * hy)));
    solidOpts.radius = unit / Math.min(W, H);
    solidOpts.cx = 0.5;
    solidOpts.cy = (bottom > top + 40 ? (top + bottom) / 2 : H / 2) / H;
    return { W, H, box, obstacles: [...title, ...legend].map((r) => ({ l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top })) };
  }

  /** Points of the glass shell x² + y² + z² = R inside the cube, as f(u, v): v is the azimuth φ ∈ [0, π/2], u runs over
      the polar angles θ at which all three coordinates stay ≤ M − 1 (an interval for each φ; empty where the shell has
      left the cube). The parameters run so that the outer side of the shell is the front face. */
  function shellPatch(R, e) {
    const r = Math.sqrt(R);
    const t0 = Math.acos(Math.min(1, e / r));
    const t1 = (phi) => { const q = e / (r * Math.max(Math.cos(phi), Math.sin(phi))); return q >= 1 ? HALF_PI : Math.asin(q); };
    return (u, v) => { const th = t0 + u * Math.max(0, t1(v) - t0); return [r * Math.sin(th) * Math.cos(v), r * Math.sin(th) * Math.sin(v), r * Math.cos(th)]; };
  }
  /** The point of wall k (the plane where coordinate k is 0) at in-plane coordinates (u, v) along axes k + 1, k + 2. */
  const onWall = (k, u, v) => { const p = [0, 0, 0]; p[(k + 1) % 3] = u; p[(k + 2) % 3] = v; return p; };
  /** The arc where the shell meets wall k, clipped to the square [0, M − 1]². */
  function wallArc(k, R, e) {
    const r = Math.sqrt(R), q = Math.min(1, e / r), f0 = Math.acos(q), f1 = Math.asin(q);
    if (r < 1e-9 || f1 - f0 < 1e-6) return null;
    const out = [];
    for (let i = 0; i <= 40; i++) { const f = f0 + (f1 - f0) * i / 40; out.push(onWall(k, r * Math.cos(f), r * Math.sin(f))); }
    return out;
  }

  let drawnLabels = [];
  function drawStage() {
    const view = fit(), e = C.e, R = S.R, pr = pairNow();
    sc.begin();
    const D = sc.facing(), thumb = !!TRV.thumbMode;
    // the three walls through the centre of the ball: opaque where they lie behind the cube (a cutaway), faint glass
    // where they face the viewer; pale cyan inside the ball, dark outside
    const cells = e * 12;
    for (let k = 0; k < 3; k++) {
      const back = D[k] > 0;
      sc.surface(`wall${k}`, (u, v) => world(onWall(k, u, v)), {
        u: [0, e], v: [0, e], nu: cells, nv: cells, value: (u, v) => (u * u + v * v <= R ? INSIDE : 0), range: [0, 1],
        colors: [P.faint, P.cyan], alpha: back ? 1 : 0.1, pick: back, occlude: back,
        grid: { every: [12, 12], color: P.cyan, alpha: back ? 0.16 : 0.06 }
      });
    }
    // the glass shell: the part of x² + y² + z² = R inside the cube
    if (R > 0) {
      sc.surface('shell', (u, v) => world(shellPatch(R, e)(u, v)), {
        u: [0, 1], v: [0, HALF_PI], nu: 24, nv: 40, color: P.cyan, alpha: 0.07, pick: false, occlude: false,
        grid: { every: [24, 5], color: P.cyan, alpha: 0.4 }
      });
      // the whole ball, centred at the corner (0, 0, 0): a faint glass shell, most of it outside the cube
      if (GHOST) sc.glass('ball', world([0, 0, 0]), Math.sqrt(R) / e, { color: P.cyan, alpha: 0.03, rim: 0.2 });
      for (let k = 0; k < 3; k++) { const arc = wallArc(k, R, e); if (arc) sc.line(arc.map(world), { color: P.cyan, width: thumb ? 2 : 1.6 }); }
    }
    // the edges of the cube
    const E = [];
    for (let k = 0; k < 3; k++) for (const i of [0, e]) for (const j of [0, e]) { const a = [0, 0, 0], b = [0, 0, 0]; a[(k + 1) % 3] = b[(k + 1) % 3] = i; a[(k + 2) % 3] = b[(k + 2) % 3] = j; b[k] = e; E.push([a, b]); }
    for (const [a, b] of E) sc.line([world(a), world(b)], { color: P.dim, width: 1, alpha: 0.7 });
    // the shell's lattice points, then the chosen pair, its chord and the midpoint
    shellNow().forEach((p) => {
      if (same(p, S.a) || same(p, S.b)) return;
      sc.bead(world(p), { color: P.cyan, r: 5.2, glow: 0.65, key: `s${key(p)}` });
    });
    for (const [p, k] of [[S.a, 'a'], [S.b, 'b']]) {
      if (!p) continue;
      const n = norm2(p) > 0 ? p : [1, 1, 1];
      sc.bead(world(p), { color: P.amber, r: 6.6, glow: 0.7, key: k });
      sc.ring(world(p), { color: P.amber, r: 10, normal: n });
    }
    if (pr) {
      const wa = world(pr.a), wb = world(pr.b), wm = world(pr.m);
      sc.line([wa, wb], { color: P.amber, width: thumb ? 3 : 2.4 });
      const k = Math.sqrt(R / pr.m2), foot = world(pr.m.map((v) => v * k));
      sc.line([wm, foot], { color: P.magenta, width: 1.6, dash: [4, 3] });
      sc.bead(wm, { color: P.magenta, r: 6, glow: 0.7, key: 'm' });
    }
    // labels: pushed out of the cube's outline along the line from its centre, with a hairline back to the point
    const narrow = view.W < 520, items = [];
    if (S.a) items.push({ k: 'a', p: S.a, text: 'a', cls: 'num c-am backed' });
    if (S.b) items.push({ k: 'b', p: S.b, text: 'b', cls: 'num c-am backed' });
    if (pr) items.push({ k: 'm', p: pr.m, text: narrow ? 'm' : 'm = (a + b)/2', cls: 'num c-mg backed', across: [pr.a, pr.b] });
    if (R > 0 && !narrow) { const g = glassAnchor(R, e); if (g) items.push({ k: 'shell', p: g, text: `‖x‖² = ${R}`, cls: 'num c-cy backed' }); }
    ['x', 'y', 'z'].forEach((name, k) => { const p = [0, 0, 0]; p[k] = e; items.push({ k: name, p, text: name, cls: 'num backed', axis: true }); });
    drawnLabels = placeLabels(items, view);
    drawnLabels.forEach((t) => sc.tag(t.k, [t.x, t.y], t.text, t.cls, { screen: true }));
    sc.end();
    drawOverlay(view);
  }
  /** A point of the shell to hang its label on: on one of the cyan arcs where the shell meets a wall, the one nearest
      the outline of the cube (away from the arcs' ends, where the shell's lattice points often sit). */
  function glassAnchor(R, e) {
    const c = sc.p([0, 0, 0]);
    let best = null, far = -1;
    for (let k = 0; k < 3; k++) {
      const arc = wallArc(k, R, e);
      if (!arc) continue;
      for (let i = 10; i <= 30; i += 2) { const q = sc.p(world(arc[i])), d = Math.hypot(q[0] - c[0], q[1] - c[1]); if (d > far) { far = d; best = arc[i]; } }
    }
    return best;
  }

  /* ---------- label placement (screen pixels of the stage) ---------- */
  function hull(pts) {
    const s = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const p of s) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of s.reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  /** How far from c the ray in direction (dx, dy) leaves the convex polygon h. */
  function exitAt(h, c, dx, dy) {
    let best = 0;
    for (let i = 0; i < h.length; i++) {
      const a = h[i], b = h[(i + 1) % h.length], ex = b[0] - a[0], ey = b[1] - a[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((a[0] - c[0]) * ey - (a[1] - c[1]) * ex) / den, s = ((a[0] - c[0]) * dy - (a[1] - c[1]) * dx) / den;
      if (t > 0 && s >= -1e-9 && s <= 1 + 1e-9) best = Math.max(best, t);
    }
    return best;
  }
  let measure = null;
  function size(text) {
    if (!measure) measure = document.createElement('canvas').getContext('2d');
    measure.font = `11.5px ${TRV.fonts.data}`;
    return [Math.ceil(measure.measureText(String(text)).width) + 12, 20];
  }
  function placeLabels(items, view) {
    const { W, H } = view, corners = [];
    for (const x of [0, C.e]) for (const y of [0, C.e]) for (const z of [0, C.e]) corners.push(sc.p(world([x, y, z])));
    const h = hull(corners.map((q) => [q[0], q[1]])), c = sc.p([0, 0, 0]);
    const taken = view.obstacles.map((o) => ({ ...o })), out = [];
    const free = (b) => b.l >= 4 && b.t >= 4 && b.r <= W - 4 && b.b <= H - 4 && taken.every((o) => b.r + 3 <= o.l || b.l - 3 >= o.r || b.b + 3 <= o.t || b.t - 3 >= o.b);
    const boxAt = (x, y, w, hh) => ({ l: x - w / 2, t: y - hh / 2, r: x + w / 2, b: y + hh / 2 });
    for (const it of items) {
      const q = sc.p(world(it.p)), [w, hh] = size(it.text);
      let ang = Math.atan2(q[1] - c[1], q[0] - c[0]);
      if (Math.hypot(q[0] - c[0], q[1] - c[1]) < 2) ang = -HALF_PI;
      if (it.across) {   // the midpoint: off to the side of its chord, so that its hairline does not run along it
        const A = sc.p(world(it.across[0])), B = sc.p(world(it.across[1]));
        let nx = A[1] - B[1], ny = B[0] - A[0];
        if (nx * (q[0] - c[0]) + ny * (q[1] - c[1]) < 0) { nx = -nx; ny = -ny; }
        if (Math.hypot(nx, ny) > 1) ang = Math.atan2(ny, nx);
      }
      let spot = null;
      for (let k = 0; k <= 36 && !spot; k++) {
        const a = ang + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 18), dx = Math.cos(a), dy = Math.sin(a);
        const reach = exitAt(h, c, dx, dy) + (it.axis ? 6 : 12) + Math.abs(w / 2 * dx) + Math.abs(hh / 2 * dy);
        const x = c[0] + reach * dx, y = c[1] + reach * dy, b = boxAt(x, y, w, hh);
        if (free(b)) spot = { x, y, b, lead: !it.axis };
      }
      for (let k = 0; k < 24 && !spot; k++) {   // no room outside the outline: next to the point itself
        const a = -HALF_PI + k * Math.PI / 4, d = 14 + 10 * Math.floor(k / 8), x = q[0] + Math.cos(a) * (d + w / 2), y = q[1] + Math.sin(a) * (d + hh / 2), b = boxAt(x, y, w, hh);
        if (free(b)) spot = { x, y, b, lead: false };
      }
      if (!spot) continue;   // rather no label than one on top of another
      taken.push(spot.b);
      out.push({ ...it, x: spot.x, y: spot.y, box: spot.b, q, lead: spot.lead });
    }
    return out;
  }

  /* ---------- the overlay: the other lattice points, and the hairlines from labels to their points ---------- */
  function drawOverlay() {
    const dpr = TRV.fitCanvas(overlay), ctx = overlay.getContext('2d'), thumb = !!TRV.thumbMode, pr = pairNow();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (sc.mode !== 'webgl') return;
    const skip = new Set(shellNow().map(key));
    if (pr && pr.lattice) skip.add(key(pr.m));
    ctx.fillStyle = P.dim;
    for (const p of C.pts) {
      if (skip.has(key(p))) continue;
      const q = sc.p(world(p));
      ctx.globalAlpha = norm2(p) < S.R ? 0.95 : 0.6;
      ctx.beginPath(); ctx.arc(q[0], q[1], thumb ? 3.2 : 2.1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (thumb) return;
    for (const t of drawnLabels) {
      if (!t.lead) continue;
      const bx = Math.max(t.box.l, Math.min(t.q[0], t.box.r)), by = Math.max(t.box.t, Math.min(t.q[1], t.box.b));
      const dx = t.q[0] - bx, dy = t.q[1] - by, d = Math.hypot(dx, dy);
      if (d < 10) continue;
      const color = t.k === 'm' ? P.magenta : t.k === 'shell' ? P.cyan : P.amber;
      ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(t.q[0] - dx / d * 7, t.q[1] - dy / d * 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- strip: the shell sizes, and the squared radius along the chord ---------- */
  let histPlot = null;
  const subDigits = (n) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
  function drawHist() {
    const n = C.Rmax, top = C.top, avg = C.pts.length / C.nonEmpty;
    const g = kit.plot($('hist'), { x: [-0.9, n + 0.9], y: [0, top * 1.3 + 0.4], pad: [28, 10, 8, 20] });
    histPlot = g;
    const step = n <= 12 ? 2 : n <= 27 ? 3 : n <= 48 ? 8 : 15, xt = [];
    for (let r = 0; r <= n; r += step) xt.push(r);
    g.axes({ yTicks: [0, top], xTicks: xt });
    g.hline(avg, P.dim, { dash: [4, 3] });
    g.text(n + 0.6, avg, `${C.pts.length}/${C.nonEmpty} ≈ ${fix(avg, 1)}`, P.dim, { align: 'right', base: 'bottom', dy: -3, size: 10 });
    for (let r = 0; r <= n; r++) {
      const k = C.counts[r], now = r === S.R;
      if (k) g.rect(r - 0.4, 0, r + 0.4, k, now ? P.amber : P.cyan, { alpha: now ? 0.95 : 0.5 });
      else if (now) g.rect(r - 0.4, 0, r + 0.4, top * 0.05, P.amber, { alpha: 0.9 });
    }
    const pk = C.peaks[0];
    g.text(pk, top, String(top), P.ink, { align: 'center', base: 'bottom', dy: -3, size: 10.5 });
    $('histMeta').textContent = L(`|S${subDigits(pk)}| = ${top}：${C.nonEmpty} 层中最多`, `|S${subDigits(pk)}| = ${top}: the most of ${C.nonEmpty} shells`);
  }
  function drawChord() {
    const pr = pairNow(), R = S.R;
    if (!pr) {
      const g = kit.plot($('chord'), { x: [0, 1], y: [0, 1], pad: [34, 10, 8, 20] });
      g.text(0.5, 0.5, L('点两个青色点，选出 a 与 b', 'click two cyan points to choose a and b'), P.dim, { align: 'center', size: 11, face: 'body' });
      $('chordMeta').textContent = '—';
      return;
    }
    const dip = pr.ab2 / 4, lo = R - dip, pad = Math.max(0.3, dip * 0.28);
    const g = kit.plot($('chord'), { x: [-0.04, 1.04], y: [lo - pad, R + pad], pad: [34, 10, 8, 20] });
    g.axes({ yTicks: [[lo, num(lo)], [R, num(R)]], xTicks: [[0, 'a'], [0.5, 'm'], [1, 'b']] });
    g.hline(R, P.cyan, { dash: [5, 3], width: 1.4 });
    const pts = [];
    for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push([t, R - t * (1 - t) * pr.ab2]); }
    g.line(pts, P.amber, { width: 2 });
    g.dot(0, R, P.amber, 4); g.dot(1, R, P.amber, 4); g.dot(0.5, lo, P.magenta, 4.5);
    g.text(0.53, lo, `‖m‖² = ${num(lo)}`, P.magenta, { align: 'left', base: 'top', dy: 3, size: 10.5 });
    $('chordMeta').textContent = `‖m‖² = ${R} − ${pr.ab2}/4 = ${num(lo)}`;
  }

  /* ---------- readouts, title, pills ---------- */
  function drawText() {
    const list = shellNow(), n = list.length, pr = pairNow(), R = S.R, pk = C.peaks;
    const pts = C.pts.length, floor = Math.ceil(pts / C.nonEmpty);
    $('hudBig').textContent = L(`球壳 R = ${R} · ${n} 个格点`, `shell R = ${R} · ${n} lattice point${n === 1 ? '' : 's'}`);
    let sub;
    if (pr) sub = L(`m = ${coord(pr.m)}：‖m‖² = ${num(pr.m2)} < ${R}，陷在球里`, `m = ${coord(pr.m)}: ‖m‖² = ${num(pr.m2)} < ${R}, inside the ball`);
    else if (S.a) sub = L('再点一个青色点作 b', 'click another cyan point for b');
    else if (clock.playing || cards.current === 'pigeonhole-peak') sub = L(`最胖的一层 R = ${pk.join('、')}：${C.top} 个点（${pts} 点分在 ${C.nonEmpty} 层）`, `fattest shell R = ${pk.join(', ')}: ${C.top} points (${pts} points on ${C.nonEmpty} shells)`);
    else if (!n) sub = L('这一层壳上没有格点', 'no lattice point on this shell');
    else if (n === 1) sub = L('这一层只有一个格点', 'this shell holds a single lattice point');
    else sub = L('点两个青色点，看它们的中点落在哪里', 'click two cyan points to see where their midpoint falls');
    $('hudSub').textContent = sub;
    $('pillShell').querySelector('strong').textContent = `R = ${R} · ${n}`;
    $('pillAP').querySelector('strong').textContent = String(C.aps[R]);
    $('roKey').innerHTML = pr ? `‖m‖² = ${num(pr.m2)} &lt; ${R} <span class="nummark">✓</span>` : '—';
    $('roKeySub').textContent = pr ? ` = ${R} − ${pr.ab2}/4` : L(' 先选两个壳上的点', ' choose two points of the shell first');
    $('roCount').textContent = `|S${subDigits(R)}| = ${n}`;
    $('roAP').innerHTML = `${C.aps[R]} <span class="nummark">${C.aps[R] === 0 ? '✓' : ''}</span>`;
    $('roPair').textContent = pr ? `a = ${coord(pr.a)}, b = ${coord(pr.b)}` : S.a ? `a = ${coord(S.a)}` : '—';
    $('roGap').textContent = pr ? `‖a − b‖² = ${pr.ab2}` : '—';
    $('roPeak').textContent = `R = ${pk.join(', ')} · ${C.top} ≥ ⌈${pts}/${C.nonEmpty}⌉ = ${floor}`;
    $('roCube').textContent = L(`${S.M}³ = ${pts} 个点 · ${C.nonEmpty} 层非空球壳`, `${S.M}³ = ${pts} points · ${C.nonEmpty} non-empty shells`);
    $('roNote').textContent = pr
      ? (pr.lattice ? L(`中点 ${coord(pr.m)} 是格点，但它的半径平方是 ${num(pr.m2)}，在另一层壳上。`, `The midpoint ${coord(pr.m)} is a lattice point, but its squared radius is ${num(pr.m2)}: it lies on another shell.`)
        : L(`中点 ${coord(pr.m)} 连格点都不是；它仍比壳低 ${pr.ab2}/4。`, `The midpoint ${coord(pr.m)} is not even a lattice point; it still sits ${pr.ab2}/4 below the shell.`))
      : L('同一层上 ‖a − b‖² = 2R − 2a·b 总是偶数，所以中点至少比壳低 1/2。', 'On one shell ‖a − b‖² = 2R − 2a·b is always even, so a midpoint sits at least 1/2 below the shell.');
  }

  const paint = kit.painter(() => { drawStage(); drawHist(); drawChord(); drawText(); }, [$('stage'), $('hist'), $('chord')]);

  /* ---------- controls ---------- */
  function setCube(M) {
    M = Math.round(kit.clamp(M, 3, 6));
    if (M !== S.M) { S.M = M; C = cubeOf(M); S.a = S.b = null; S.pairIx = -1; }
    fCube.set(M);
    $('shell').max = String(C.Rmax);
    clock.setMax(C.Rmax, true);
    if (S.R > C.Rmax) clock.set(C.Rmax); else onClock(clock.t);
  }
  function onClock(t) {
    const R = Math.round(kit.clamp(t, 0, C.Rmax));
    if (R !== S.R) { S.R = R; S.a = S.b = null; S.pairIx = -1; }
    fShell.set(R);
    paint();
  }
  /** A click on a cyan point: the first is a, the second b; a third starts a new pair. */
  function choose(p) {
    cards.mark(null);
    if (!S.a || (S.a && S.b)) { S.a = p; S.b = null; } else if (same(p, S.a)) S.a = null; else S.b = p;
    S.pairIx = -1;
    paint();
  }
  function setPair(a, b) {
    const on = new Set(shellNow().map(key));
    if (!a || !b || same(a, b) || !on.has(key(a)) || !on.has(key(b))) return false;
    S.a = a.slice(); S.b = b.slice(); paint(); return true;
  }
  function nextPair() {
    const list = shellNow();
    if (list.length < 2) { TRV.toast($('toast'), L('这一层壳上不到两个格点，选不出一对。', 'This shell has fewer than two lattice points: no pair to choose.')); return; }
    const pairs = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) pairs.push([list[i], list[j]]);
    S.pairIx = (S.pairIx + 1) % pairs.length;
    const k = S.pairIx;
    cards.mark(null);
    setPair(pairs[k][0], pairs[k][1]);
    S.pairIx = k;
  }

  const clock = kit.clock({
    range: $('now'), play: $('play'), label: $('tau'), speeds: $('speedChips'), max: 48, t: 17, rate: 6, step: 1, loop: true,
    format: (t, max) => `R = ${Math.round(t)} <small>/ ${Math.round(max)}</small>`,
    onChange: (t) => onClock(t)
  });
  const fCube = kit.field($('cube'), { fmt: (v) => String(v), onInput: (v) => { cards.mark(null); clock.pause(); setCube(v); } });
  const fShell = kit.field($('shell'), { fmt: (v) => String(v), onInput: (v) => { cards.mark(null); clock.pause(); clock.set(v); } });
  $('rew').addEventListener('click', () => { clock.pause(); clock.set(0); });
  $('nextPair').addEventListener('click', nextPair);
  $('clearPair').addEventListener('click', () => { cards.mark(null); S.a = S.b = null; S.pairIx = -1; paint(); });
  $('hist').addEventListener('pointerdown', (ev) => {
    if (!histPlot) return;
    const b = $('hist').getBoundingClientRect(), r = Math.round(histPlot.invX(ev.clientX - b.left));
    if (r < 0 || r > C.Rmax) return;
    cards.mark(null); clock.pause(); clock.set(r);
  });

  /* ---------- experiment cards ---------- */
  const PRESETS = {
    'shell-convex': { M: 5, R: 17, pair: null, view: [-2.3, 0.46] },
    'ap-forbidden': { M: 5, R: 17, pair: [[0, 1, 4], [2, 3, 2]], view: [-2.05, 0.4] },
    'tight-chord': { M: 5, R: 17, pair: [[2, 2, 3], [2, 3, 2]], view: [-2.62, 0.5] },
    'pigeonhole-peak': { M: 5, R: 0, pair: null, play: true, still: 17, view: [-2.3, 0.46] }
  };
  const NOTES = {
    'shell-convex': ['球心在立方体的角上；R = 17 的玻璃球壳穿过 5 × 5 × 5 的格点立方体，恰好串起 9 个青色格点。125 个点分在 32 层壳上，这是最胖的一层。',
      'The ball is centred at a corner of the cube; the glass shell R = 17 passes through the 5 × 5 × 5 cube of lattice points and strings exactly 9 cyan points. Of the 32 shells holding the 125 points, this is the fattest.'],
    'ap-forbidden': ['琥珀色的 a = (0, 1, 4) 与 b = (2, 3, 2) 都在壳上；品红的中点 m = (1, 2, 3) 有 ‖m‖² = 14 < 17，陷在球里，不在壳上：a, m, b 不是这一层的三项等差。',
      'The amber a = (0, 1, 4) and b = (2, 3, 2) both lie on the shell; the magenta midpoint m = (1, 2, 3) has ‖m‖² = 14 < 17: it sinks inside the ball, off the shell, so a, m, b is no 3-term progression of the shell.'],
    'tight-chord': ['壳上挨得最近的一对 (2, 2, 3) 与 (2, 3, 2)：‖a − b‖² = 2，品红的中点 (2, 2.5, 2.5) 仍下沉 2/4，‖m‖² = 16.5 < 17。',
      'A nearest pair of the shell, (2, 2, 3) and (2, 3, 2): ‖a − b‖² = 2, and the magenta midpoint (2, 2.5, 2.5) still sinks by 2/4: ‖m‖² = 16.5 < 17.'],
    'pigeonhole-peak': ['时间轴把 R 从 0 扫到 48：玻璃球壳一层层鼓起，青色格点随之起落。125 个点只落在 32 层上，最胖的一层是 R = 17，有 9 个点。',
      'The rail sweeps R from 0 to 48: the glass shell swells layer by layer and its cyan points come and go. The 125 points lie on only 32 shells; the fattest is R = 17, with 9 points.']
  };
  let booting = true;
  function applyPreset(id) {
    const p = PRESETS[id];
    clock.pause();
    setCube(p.M);
    clock.set(p.R);
    S.a = S.b = null; S.pairIx = -1;
    if (p.pair) setPair(p.pair[0], p.pair[1]);
    if (booting || TRV.still) { sc.cam.yaw = p.view[0]; sc.cam.pitch = p.view[1]; sc.cam.zoom = 1; } else sc.view([p.view[0], p.view[1], 1], 600);
    if (p.play) { if (TRV.still || (booting && !TRV.embed)) clock.set(p.still); else if (booting) kit.autoplay(clock, $('stage')); else clock.play(); }
    paint();
  }
  const cards = kit.cards($('presets'), { presets: PRESETS, notes: NOTES, noteEl: $('presetNote'), tour: $('tour'), onPick: applyPreset,
    idle: ['自由探索：拖动时间轴或滑块换一层壳，改立方体的边长，拖动舞台转动视角，点两个青色点选出 a 与 b。', 'Free play: move the rail or the sliders to change the shell or the cube, drag the stage to turn it, click two cyan points to choose a and b.'] });

  TRV.drawer({ drawer: $('drawer'), open: $('infoBtn'), close: $('drawerClose') });
  TRV.startGlitch(document.querySelector('.brand'));

  /* ---------- probe, cover, start ---------- */
  window.SPHERE_DEBUG = {
    get state() {
      const pr = pairNow(), list = shellNow();
      return {
        preset: cards.current, M: S.M, R: S.R, t: clock.t, max: clock.max, playing: clock.playing, mode: sc.mode,
        points: C.pts.length, nonEmpty: C.nonEmpty, count: list.length, shell: list.map((p) => p.slice()),
        counts: C.counts.slice(), aps: C.aps.slice(), peak: { R: C.peaks.slice(), n: C.top },
        pair: pr && { a: pr.a.slice(), b: pr.b.slice(), m: pr.m.slice(), m2: pr.m2, ab2: pr.ab2 },
        chosen: S.a ? S.a.slice() : null,
        labels: drawnLabels.map((t) => ({ k: t.k, x: t.x, y: t.y, box: { ...t.box }, lead: t.lead })),
        cam: { ...sc.cam }
      };
    },
    /** Set the cube side M and the squared radius R (as a reader moving the sliders). */
    setShell: (M, R) => { cards.mark(null); clock.pause(); setCube(M); clock.set(R); },
    /** Choose a and b (lattice points of the current shell); false when they are not two points of it. */
    pickPair: (a, b) => { cards.mark(null); return setPair(a, b); },
    /** Redraw now. */
    draw: () => { paint.now(); },
    /** Viewport position of the lattice point p as drawn, and whether a wall hides it. */
    bead: (p) => { const q = sc.p(world(p)), b = $('cv').getBoundingClientRect(); return { x: b.left + q[0], y: b.top + q[1], hidden: sc.occluded(world(p), 0.02) }; },
    view: (v) => { sc.cam.yaw = v[0]; sc.cam.pitch = v[1]; sc.cam.zoom = v[2] || 1; paint.now(); },
    /** Viewport position of the middle of the bar of shell r in the strip (null before the strip is drawn). */
    histPoint: (r) => { if (!histPlot) return null; const b = $('hist').getBoundingClientRect(); return { x: b.left + histPlot.X(r), y: b.top + histPlot.Y(Math.max(0.5, C.counts[r] / 2)) }; }
  };
  window.TRV_THUMB = async () => {
    cards.pick('ap-forbidden'); clock.pause();
    sc.cam.yaw = -2.05; sc.cam.pitch = 0.4; sc.cam.zoom = 1;
    await sc.ready; paint.now();
  };
  cards.pick(cards.initial('ap-forbidden'));   // a chapter may cite another card: ::: {.viz src="behrend-sphere" preset="shell-convex"}
  booting = false;
  paint();
})();
