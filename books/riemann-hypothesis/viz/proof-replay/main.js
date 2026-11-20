/* PROOF//REPLAY · 证明重放: how a proof of seventeen million lines is checked without trusting anyone, in two scenes.
     dag     the shard graph of Main, level 0 … 35 from left to right (model.js: an illustration of 299 dots standing for
             the 8,490 real shards). The rail is the CI level: levels below it are compiled (green), it is compiling
             (amber), the rest wait (cyan). Clicking a dot edits it: its content key changes, so do the keys of all that
             import it up to Main (magenta, rebuilt as the rail passes), while every other key, and so every other
             compiled shard, is reused (green). Cyan rings mark what the edited shard imports.
     replay  the route on a reader's machine: git clone · ./verify --status Main · fetch lean-parts-v1-0…f · SHA-256 ·
             leanchecker --fresh · axiom audit · Challenge ≡ · six checkers · Main. The rail is the step. The fault
             injector plants a lie and the route stops at the first gate that sees through it.
   The strip: the 36-level wavefront under the CI cursor, and the four pillars against the three lies.
   Colours: cyan shards, keys and the route; green compiled, reused or passed; amber the running level, the selected shard
   and the current step; magenta invalidated shards and caught lies. Read-only probe for the browser suite: REPLAY_DEBUG. */
(() => {
  'use strict';
  const { kit, L } = TRV, { fix, clamp } = kit, P = TRV.palette, M = window.PROOF_REPLAY_MODEL;
  const $ = (id) => document.getElementById(id);
  const F = M.FACTS, LEVELS = M.LEVELS, STEPS = M.STEPS, COUNTS = M.wavefront(), DAG = M.buildDag(COUNTS), MAIN = DAG.main, N = DAG.nodes.length;
  const KEYS0 = M.keysOf(DAG, -1);
  const EDIT_NODE = DAG.byLevel[12][Math.floor(DAG.byLevel[12].length / 2)];   // the shard the card CI WAVE edits
  const int = (n) => Number(n).toLocaleString('en-US');
  const kc = (s) => `<span class="keepcase">${s}</span>`;

  const FAULT_NAME = { clean: ['诚实的证明', 'a valid proof'], 'forged-olean': ['伪造的 .olean', 'a forged .olean'], 'extra-axiom': ['偷塞的 sorry', 'a smuggled sorry'], 'wrong-stmt': ['改写的陈述', 'a tweaked statement'] };
  const FAULT_SHORT = { clean: ['诚实', 'clean'], 'forged-olean': ['伪造', 'forged'], 'extra-axiom': ['sorry', 'sorry'], 'wrong-stmt': ['改陈述', 'stmt'] };
  const CATCH = {
    sha: { by: ['被 SHA-256 当场拦下', 'stopped cold by SHA-256'], at: ['拦在 SHA-256', 'at SHA-256'] },
    kernel: { by: ['被空白内核当场拦下', 'stopped cold by the fresh kernel'], at: ['拦在空白内核', 'at the fresh kernel'] },
    axioms: { by: ['被公理审计当场拦下', 'stopped cold by the axiom audit'], at: ['拦在公理审计', 'at the axiom audit'] },
    challenge: { by: ['被 Challenge 陈述比对当场拦下', 'stopped cold by the Challenge statements'], at: ['拦在 Challenge 陈述比对', 'at the Challenge statements'] }
  };
  const STATION = [
    { cmd: 'git clone', what: () => L(`${int(F.files)} 个文件`, `${int(F.files)} files`) },
    { cmd: '--status Main', what: () => L('数可用分片', 'count shards') },
    { cmd: 'lean-parts-v1-0…f', what: () => L('16 个 Release', '16 Releases') },
    { gate: 'sha', name: () => 'SHA-256', what: () => L('字节 = 校验和', 'bytes = checksum') },
    { gate: 'kernel', name: () => L('空白内核', 'fresh kernel'), what: () => 'leanchecker --fresh' },
    { gate: 'axioms', name: () => L('公理审计', 'axiom audit'), what: () => L('⊆ 三条标准公理', '⊆ 3 standard axioms') },
    { gate: 'challenge', name: () => 'Challenge ≡', what: () => `Mathlib ${F.mathlib}` }
  ];
  const stationName = (i) => (i <= 2 ? STATION[i].cmd : i <= 6 ? STATION[i].name() : i === 7 ? L('六个校验器', 'six checkers') : 'Main');
  const PILLAR_NAME = [['源码与依赖', 'source & deps'], ['CI 分片 · SHA', 'CI shards · SHA'], ['空白内核 + 公理', 'empty kernel + axioms'], ['多校验器', 'multi-checker']];

  /* ---------- state: the clock is the CI level (scene dag) or the replay step (scene replay) ---------- */
  const S = { scene: 'dag', edit: null, fault: 'clean', forgeSum: false, tDag: 1.5, tReplay: 0 };
  const CAUGHT_PAUSE = 0.6;   // a replay that meets its lie stops this far past the gate
  let geo = {}, stopAt = null, morph = null, booting = true;
  const edits = new Map(), replays = new Map();
  /** Everything an edit of shard e changes: its new keys, the keys that differ, its two cones, its critical path. */
  function editInfo(e) {
    if (e == null) return null;
    if (!edits.has(e)) {
      const keys = M.keysOf(DAG, e), down = M.dependents(DAG, e);
      edits.set(e, { e, keys, up: M.ancestors(DAG, e), down, cone: new Set([e, ...down]), crit: M.criticalPath(DAG, e),
        changed: DAG.nodes.filter((n) => keys[n.id] !== KEYS0[n.id]).map((n) => n.id) });
    }
    return edits.get(e);
  }
  const replayOf = (f, s) => { const k = `${f}|${s ? 1 : 0}`; if (!replays.has(k)) replays.set(k, M.replay(f, !!s)); return replays.get(k); };
  function derive() {
    const tDag = S.scene === 'dag' ? clock.t : S.tDag, tRep = S.scene === 'replay' ? clock.t : S.tReplay;
    const cur = Math.min(LEVELS, Math.floor(tDag + 1e-9)), ed = editInfo(S.edit);
    const status = DAG.nodes.map((n) => M.status(n.level, cur, !!ed && ed.cone.has(n.id), !!ed));
    let built = 0;
    for (let k = 0; k < cur; k++) built += COUNTS[k];
    const R = replayOf(S.fault, S.forgeSum), stop = R.at == null ? STEPS : R.at, caught = R.at != null && tRep >= R.at - 1e-9;
    const gates = {};
    // once a lie is caught, the gates after it are never reached; before that a gate waits for the bundle
    M.GATES.forEach((g) => { gates[g.id] = caught && g.at > R.at ? 'unreached' : tRep < g.at - 1e-9 ? 'pending' : R.checks[g.id] ? 'pass' : 'fail'; });
    return {
      tDag, cur, ed, status, built, running: cur < LEVELS ? COUNTS[cur] : 0,
      tRep, R, stop, caught, gates, step: Math.min(Math.floor(tRep + 1e-9), stop),
      checkers: R.at != null ? (caught ? 'unreached' : 'pending') : tRep >= 7 - 1e-9 ? 'accept' : 'pending',
      verdict: caught ? 'caught' : R.at == null && tRep >= STEPS - 1e-9 ? 'accepted' : 'running',
      pillars: M.pillars(S.fault, S.forgeSum)
    };
  }

  /* ---------- canvas text: every label is measured from its own plain text, placed where it is free, or left out ---------- */
  const face = (f) => (f === 'body' ? TRV.fonts.body : f === 'display' ? TRV.fonts.display : TRV.fonts.data);
  const fontOf = (o) => `${o.weight ? o.weight + ' ' : ''}${o.size || 10.5}px ${face(o.face)}`;
  function text(ctx, str, x, y, color, o) {
    o = o || {};
    ctx.font = fontOf(o); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    if (o.plate) {
      const w = ctx.measureText(str).width + 8, h = (o.size || 10.5) + 6, px = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w + 4 : x - 4;
      ctx.fillStyle = TRV.alpha(P.stage, 0.9); ctx.fillRect(px, y - h / 2, w, h);
      ctx.strokeStyle = TRV.alpha(color, 0.5); ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
    }
    ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.globalAlpha = 1;
  }
  /** A label placer for one box: put(str, [[x, y, align], …], colour, opts) draws at the first candidate whose box lies
      inside the stage box and clear of every label placed before; it returns that box, or null (the label is left out
      rather than drawn over another one). reserve(box) keeps a region free. */
  function labels(ctx, box) {
    const placed = [];
    const inside = (r) => r.l >= box.x - 0.5 && r.r <= box.x + box.w + 0.5 && r.t >= box.y - 0.5 && r.b <= box.y + box.h + 0.5;
    const clear = (r) => placed.every((q) => Math.min(r.r, q.r) - Math.max(r.l, q.l) <= 0 || Math.min(r.b, q.b) - Math.max(r.t, q.t) <= 0);
    return {
      put(str, cands, color, o) {
        o = o || {};
        ctx.font = fontOf(o); ctx.textBaseline = 'middle';
        const m = ctx.measureText(str), w = m.width, up = m.actualBoundingBoxAscent, dn = m.actualBoundingBoxDescent;
        const px = o.plate ? 5 : 2, py = o.plate ? Math.max(3, ((o.size || 10.5) + 6) / 2 - up) : 1.5;
        for (const [x0, y, align] of cands) {
          // o.slide: a centred label near the edge of the box slides inward instead of being left out
          const x = o.slide && align === 'center' ? clamp(x0, box.x + w / 2 + px, box.x + box.w - w / 2 - px) : x0;
          const l = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
          const r = { l: l - px, r: l + w + px, t: y - up - py, b: y + dn + py };
          if (inside(r) && clear(r)) { placed.push(r); text(ctx, str, x, y, color, { ...o, align }); return r; }
        }
        return null;
      },
      reserve(r) { placed.push(r); }
    };
  }
  const dot = (ctx, x, y, r, color, o) => {
    o = o || {}; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, kit.TAU);
    if (o.ring) { ctx.strokeStyle = color; ctx.lineWidth = o.width || 1.5; ctx.stroke(); }
    else { if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; } ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0; }
    ctx.globalAlpha = 1;
  };
  const seg = (ctx, a, b, color, width, o) => {
    o = o || {}; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(o.dash || []); ctx.lineCap = 'round';
    if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; }
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.shadowBlur = 0; ctx.setLineDash([]); ctx.globalAlpha = 1;
  };
  function hexagon(ctx, x, y, r, stroke, fill, o) {
    o = o || {};
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; if (i) ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); else ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
    ctx.closePath();
    if (fill) { ctx.globalAlpha = o.fillAlpha == null ? 1 : o.fillAlpha; ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.strokeStyle = stroke; ctx.lineWidth = o.width || 1.6; if (o.glow) { ctx.shadowColor = stroke; ctx.shadowBlur = o.glow; } ctx.stroke(); ctx.shadowBlur = 0; }
    ctx.globalAlpha = 1;
  }
  /** A tick ✓ or a cross ✗ drawn as strokes (marks are shapes, not canvas text). */
  function mark(ctx, kind, x, y, s, color, w) {
    ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    if (kind === 'tick') { ctx.moveTo(x - s, y); ctx.lineTo(x - s * 0.3, y + s * 0.7); ctx.lineTo(x + s, y - s * 0.75); }
    else { ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); }
    ctx.stroke();
  }

  /* ---------- scene dag: 36 columns of shards, the CI wave, an edit and its two cones ---------- */
  function dagGeometry(bx, words) {
    const bucketH = words ? clamp(bx.h * 0.11, 18, 28) : 0, topRoom = words ? 20 : 2, gap = words ? 18 : 2;
    const band = { y: bx.y + topRoom, h: Math.max(40, bx.h - topRoom - bucketH - gap) };
    const padL = words ? 14 : 8, padR = words ? 22 : 14, colW = (bx.w - padL - padR) / (LEVELS - 1);
    const sp = Math.min(24, band.h / Math.max(...DAG.cols)), yc = band.y + band.h / 2;
    const X = (k) => bx.x + padL + k * colW;
    return { band, bucketH, colW, sp, X, yc, pos: DAG.nodes.map((n) => [X(n.level), yc + (n.row - (DAG.cols[n.level] - 1) / 2) * sp]) };
  }
  const SHADE = { done: 'ok', reused: 'ok', running: 'amber', pending: 'cyan', stale: 'magenta' };
  function drawDag(ctx, bx, D, o) {
    o = o || {};
    const words = !o.bare, lw = o.lw || 1, G = dagGeometry(bx, words), pos = G.pos, ed = D.ed;
    const r = clamp(Math.min(G.colW * 0.3, G.sp * 0.3), 1.7, 4.4) * lw, rm = r * 2;
    geo.nodes = pos; geo.hit = Math.max(9, Math.min(16, G.colW * 0.55, G.sp * 0.8)); geo.dag = G;
    if (D.cur < LEVELS) {   // the level compiling now: a faint amber band behind its column
      ctx.fillStyle = TRV.alpha(P.amber, 0.08); ctx.fillRect(G.X(D.cur) - G.colW * 0.5, G.band.y - 2, G.colW, G.band.h + 4);
    }
    for (const n of DAG.nodes) for (const d of n.deps) {
      let color = P.lineHot, alpha = 0.3, width = 0.8;
      if (ed && ed.cone.has(n.id) && ed.cone.has(d)) { color = D.status[n.id] === 'done' ? P.ok : P.magenta; alpha = 0.5; width = 1.1; }
      else if (ed && ed.up.has(d) && (ed.up.has(n.id) || n.id === ed.e)) { color = P.cyan; alpha = 0.5; width = 1; }
      seg(ctx, pos[d], pos[n.id], color, width * lw, { alpha });
    }
    if (ed) for (let i = 1; i < ed.crit.length; i++) {
      const s = D.status[ed.crit[i]];
      seg(ctx, pos[ed.crit[i - 1]], pos[ed.crit[i]], s === 'done' ? P.ok : s === 'running' ? P.amber : P.magenta, 2.4 * lw, { glow: 6 });
    }
    for (const n of DAG.nodes) {
      const [x, y] = pos[n.id], s = D.status[n.id], main = n.id === MAIN;
      dot(ctx, x, y, main ? rm : r, P[SHADE[s]], { alpha: s === 'pending' ? 0.62 : s === 'reused' ? 0.42 : 1, glow: s === 'running' || main ? 8 : 0 });
      if (ed && ed.up.has(n.id)) dot(ctx, x, y, r + 2.4 * lw, P.cyan, { ring: true, width: 1.2, alpha: 0.95 });
      else if (ed && ed.cone.has(n.id) && s !== 'stale') dot(ctx, x, y, (main ? rm : r) + 2.2 * lw, P.magenta, { ring: true, width: 1.2, alpha: 0.85 });   // rebuilt: still marked as the cone
    }
    dot(ctx, pos[MAIN][0], pos[MAIN][1], rm + 3, P.ink, { ring: true, width: 1, alpha: 0.6 });
    if (ed) dot(ctx, pos[ed.e][0], pos[ed.e][1], r + 5 * lw, P.amber, { ring: true, width: 2 * lw });
    if (!words) return;
    const lab = labels(ctx, bx), topY = G.band.y - 10, lowY = G.band.y + G.band.h + 9;
    const [mx, my] = pos[MAIN];
    lab.put('Main', [[mx, my - rm - 10, 'center'], [mx, my + rm + 11, 'center'], [mx - rm - 6, my - rm - 6, 'right']], D.status[MAIN] === 'done' ? P.ok : P.ink, { size: 11, weight: 600 });
    if (ed) {
      const [x, y] = pos[ed.e], k = DAG.nodes[ed.e].level, rr = r + 5 * lw;
      lab.put(`L${k} · ${L('改动', 'edited')}`, [[x, y - rr - 11, 'center'], [x, y + rr + 11, 'center'], [x + rr + 6, y, 'left'], [x - rr - 6, y, 'right']], P.amber, { size: 10.5, weight: 600, face: 'body', plate: true });
    }
    lab.put(L(`${F.eligible} 个任务同时开工`, `${F.eligible} jobs at once`), [[G.X(1) - 4, topY, 'left']], D.cur > 1 || ed ? P.ok : D.cur === 1 ? P.amber : P.cyan, { size: 10, face: 'body' });
    lab.put(L(`${F.foundations} 个基础分片`, `${F.foundations} foundations`), [[G.X(0) - 4, lowY, 'left']], D.cur > 0 || ed ? P.ok : P.amber, { size: 10, face: 'body' });
    if (D.cur > 1 && D.cur < LEVELS) lab.put(`L${D.cur}`, [[G.X(D.cur), topY, 'center'], [G.X(D.cur), lowY, 'center']], P.amber, { size: 10.5, weight: 600 });
    if (ed) {
      const mid = ed.crit[Math.floor(ed.crit.length / 2)], [cx] = pos[mid], s = D.status[mid];
      lab.put(L(`最长剩余路径 ${DAG.rem[ed.e]} 层`, `longest path to Main: ${DAG.rem[ed.e]} levels`), [[cx, lowY, 'center'], [cx, topY, 'center']], s === 'done' ? P.ok : P.magenta, { size: 10, face: 'body' });
    }
    drawBuckets(ctx, bx, G, D, lab);
  }
  /** The 16 Releases lean-parts-v1-0 … f: a shard goes to the bucket of the first hex digit of its key. Each cell fills
      green with the share of its shards that is compiled or reused; amber outlines the bucket of the edited shard. */
  function drawBuckets(ctx, bx, G, D, lab) {
    const keys = D.ed ? D.ed.keys : KEYS0, y = bx.y + bx.h - G.bucketH / 2, ch = Math.min(14, G.bucketH - 6);
    const head = lab.put('lean-parts-v1-', [[bx.x + 4, y, 'left']], P.cyan, { size: 9.5 });
    const x0 = head ? head.r + 5 : bx.x + 4, cw = Math.min(22, (bx.x + bx.w - 4 - x0) / 16);
    geo.buckets = { x0, cw, y };
    if (cw < 6) return;
    const tot = new Array(16).fill(0), ok = new Array(16).fill(0);
    DAG.nodes.forEach((n) => { const b = parseInt(keys[n.id][0], 16); tot[b] += 1; if (D.status[n.id] === 'done' || D.status[n.id] === 'reused') ok[b] += 1; });
    const sel = D.ed ? parseInt(keys[D.ed.e][0], 16) : -1;
    for (let b = 0; b < 16; b++) {
      const x = x0 + b * cw, w = cw - 2, share = tot[b] ? ok[b] / tot[b] : 0;
      ctx.fillStyle = TRV.alpha(P.cyan, 0.16); ctx.fillRect(x, y - ch / 2, w, ch);
      ctx.fillStyle = TRV.alpha(P.ok, 0.55); ctx.fillRect(x, y + ch / 2 - ch * share, w, ch * share);
      ctx.strokeStyle = b === sel ? P.amber : TRV.alpha(P.cyan, 0.5); ctx.lineWidth = b === sel ? 2 : 1; ctx.strokeRect(x + 0.5, y - ch / 2 + 0.5, w - 1, ch - 1);
      if (cw >= 11) lab.put(b.toString(16), [[x + w / 2, y, 'center']], b === sel ? P.amber : P.ink, { size: 8.5 });
    }
  }

  /* ---------- scene replay: the route on the reader's machine, the gates, the six checkers ---------- */
  /** Wide: the route runs left to right, the six checkers fan out below it and meet again at Main. Narrow: the route runs
      down the left edge, straight through the box of the six checkers, to Main. Sizes follow the room. */
  function replayGeometry(bx) {
    const wide = bx.w >= 600;
    if (wide) {
      const R = clamp(bx.h * 0.034, 11, 15), xs = (i) => bx.x + 36 + (i * (bx.w - 72)) / 8, yT = bx.y + clamp(bx.h * 0.32, 58, 180);
      const yF = Math.min(bx.y + bx.h - 46, yT + clamp(bx.h * 0.4, 100, 240)), fanR = R * 0.68;
      return { wide, R, dotR: R * 0.55, mainR: R * 1.15, fanR, cs: R * 0.36, yT, yF, st: STATION.map((_, i) => [xs(i), yT]), main: [xs(8), yT],
        fan: M.CHECKERS.map((_, j) => [xs(4.5) + (j * (xs(7.7) - xs(4.5))) / 5 + (j === 5 ? 18 : 0), yF]) };
    }
    const top = bx.y + 9, dy = Math.min(40, (bx.h - 18) / 10.4), x0 = bx.x + 12, R = clamp(dy * 0.36, 6.5, 10);
    const st = STATION.map((_, i) => [x0, top + i * dy]), boxTop = top + 6.75 * dy, colW = (bx.w - 44) / 3;
    const fan = M.CHECKERS.map((_, j) => [bx.x + 38 + (j % 3) * colW, boxTop + (1.05 + Math.floor(j / 3) * 1.05) * dy]);
    return { wide, R, dotR: R * 0.6, mainR: R * 1.1, fanR: R * 0.7, cs: R * 0.34, dy, st, fan, boxTop, boxBottom: boxTop + 2.6 * dy, main: [x0, top + 10 * dy] };
  }
  /** The point of the route at step t (0 … 8): along the stations; then, wide, down a branch to a checker and up to Main,
      narrow, straight down the trunk through the checkers to Main. */
  function routeAt(Gm, t, branch) {
    const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    if (t <= 6) { const i = Math.min(5, Math.floor(t)); return lerp(Gm.st[i], Gm.st[i + 1], t - i); }
    if (!Gm.wide) return lerp(Gm.st[6], Gm.main, Math.min(1, (t - 6) / 2));
    if (t <= 7) return lerp(Gm.st[6], Gm.fan[branch || 0], t - 6);
    return lerp(Gm.fan[branch || 0], Gm.main, Math.min(1, t - 7));
  }
  /** The bundle of shards: 16 squares, one per Release; the tampered one (bucket a) is magenta when a .olean is forged. */
  function packet(ctx, x, y, cs, D, alpha) {
    const forged = D.R.fault === 'forged-olean', n = 4, side = n * cs + (n - 1);
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = TRV.alpha(P.stage, 0.85); ctx.fillRect(x - side / 2 - 2, y - side / 2 - 2, side + 4, side + 4);
    for (let b = 0; b < 16; b++) {
      const px = x - side / 2 + (b % n) * (cs + 1), py = y - side / 2 + Math.floor(b / n) * (cs + 1);
      ctx.fillStyle = forged && b === M.TAMPERED ? P.magenta : P.cyan; ctx.fillRect(px, py, cs, cs);
    }
    ctx.globalAlpha = 1;
  }
  function drawReplay(ctx, bx, D) {
    const Gm = replayGeometry(bx), wide = Gm.wide, lab = labels(ctx, bx), t = D.tRep, stop = D.stop, R = Gm.R, rF = Gm.fanR;
    geo.route = Gm;
    const reach = Math.min(t, stop), on = D.R.at == null, live = (i) => on || i <= D.R.at;
    // the route: travelled in cyan, ahead faint, beyond a catch fainter still
    for (let i = 0; i < 6; i++) {
      const a = Gm.st[i], b = Gm.st[i + 1];
      if (reach >= i + 1) seg(ctx, a, b, P.cyan, 2, { alpha: 0.9 });
      else if (reach > i) { const m = routeAt(Gm, reach); seg(ctx, a, m, P.cyan, 2, { alpha: 0.9 }); seg(ctx, m, b, P.faint, 1.2, { dash: [3, 4], alpha: live(i + 1) ? 0.9 : 0.4 }); }
      else seg(ctx, a, b, P.faint, 1.2, { dash: [3, 4], alpha: live(i + 1) ? 0.9 : 0.4 });
    }
    // after the Challenge: wide, a branch to every checker and on to Main; narrow, one trunk through the checkers to Main
    if (wide) Gm.fan.forEach((f) => {
      const u1 = on && t >= 7 - 1e-9, u2 = on && t >= STEPS - 1e-9;
      seg(ctx, Gm.st[6], f, u1 ? P.cyan : P.faint, u1 ? 1.4 : 1, { dash: u1 ? [] : [3, 4], alpha: on ? 0.8 : 0.35 });
      seg(ctx, f, Gm.main, u2 ? P.ok : P.faint, u2 ? 1.4 : 1, { dash: u2 ? [] : [3, 4], alpha: on ? 0.8 : 0.35 });
    });
    else {
      const done = on && t >= STEPS - 1e-9, m = on && t > 6 ? routeAt(Gm, t) : Gm.st[6];
      if (on && t > 6) seg(ctx, Gm.st[6], m, done ? P.ok : P.cyan, 2, { alpha: 0.9 });
      if (!done) seg(ctx, m, Gm.main, P.faint, 1.2, { dash: [3, 4], alpha: on ? 0.9 : 0.4 });
    }
    // the six checkers: the first five in Comparator's bubblewrap sandbox without network, lean4lean run separately
    const fanCol = D.checkers === 'accept' ? P.ok : D.checkers === 'unreached' ? P.faint : P.cyan;
    const f0 = Gm.fan[0], f4 = Gm.fan[4];
    const sand = wide ? { x: f0[0] - rF - 30, y: f0[1] - rF - 10, w: f4[0] - f0[0] + 2 * rF + 60, h: 2 * rF + 40 } : { x: bx.x + 4, y: Gm.boxTop, w: bx.w - 8, h: Gm.boxBottom - Gm.boxTop };
    ctx.setLineDash([5, 4]); ctx.strokeStyle = TRV.alpha(P.cyan, D.checkers === 'unreached' ? 0.3 : 0.6); ctx.lineWidth = 1; ctx.strokeRect(sand.x + 0.5, sand.y + 0.5, sand.w, sand.h); ctx.setLineDash([]);
    Gm.fan.forEach((f) => {
      dot(ctx, f[0], f[1], rF, fanCol, { alpha: D.checkers === 'pending' ? 0.35 : D.checkers === 'unreached' ? 0.45 : 0.95, glow: D.checkers === 'accept' ? 8 : 0 });
      if (D.checkers === 'accept') mark(ctx, 'tick', f[0], f[1], rF * 0.5, P.stage, 1.6);
    });
    // stations and gates
    STATION.forEach((s, i) => {
      const [x, y] = Gm.st[i];
      if (!s.gate) { dot(ctx, x, y, Gm.dotR, reach >= i ? P.cyan : P.faint, { alpha: reach >= i ? 1 : 0.7 }); return; }
      const g = D.gates[s.gate];
      if (g === 'pass') { hexagon(ctx, x, y, R, P.ok, P.ok, { fillAlpha: 0.22, glow: 6 }); mark(ctx, 'tick', x, y, R * 0.42, P.ok, 2); }
      else if (g === 'fail') { hexagon(ctx, x, y, R + 1, P.magenta, P.magenta, { fillAlpha: 0.3, glow: 14, width: 2.2 }); mark(ctx, 'cross', x, y, R * 0.42, P.magenta, 2.4); }
      else hexagon(ctx, x, y, R, P.cyan, null, { alpha: g === 'unreached' ? 0.3 : 0.75 });
    });
    // Main: green once all gates and the checkers let the proof through
    const [mx, my] = Gm.main, mr = Gm.mainR;
    if (D.verdict === 'accepted') { dot(ctx, mx, my, mr, P.ok, { glow: 14 }); mark(ctx, 'tick', mx, my, mr * 0.5, P.stage, 2.2); }
    else dot(ctx, mx, my, mr, on ? P.cyan : P.faint, { ring: true, width: 1.6, alpha: on ? 0.8 : 0.5 });
    // the step in progress (amber), and the bundle travelling: one bundle up to the Challenge, then one per checker (wide)
    if (D.verdict === 'running') {
      if (t < 6) { const p = Gm.st[Math.min(D.step, 6)]; dot(ctx, p[0], p[1], R + 5, P.amber, { ring: true, width: 1.8 }); }
      else if (t < 7) Gm.fan.forEach((f) => dot(ctx, f[0], f[1], rF + 4, P.amber, { ring: true, width: 1.4 }));
    }
    if (t < 6 || !on || !wide) {
      let p = routeAt(Gm, reach);
      if (D.caught) { const g = Gm.st[D.R.at], b = Gm.st[D.R.at - 1]; p = [g[0] + (b[0] - g[0]) * 0.45, g[1] + (b[1] - g[1]) * 0.45]; }
      if (!(on && t >= STEPS - 1e-9)) packet(ctx, p[0], p[1], Gm.cs, D);
    } else if (t < STEPS) Gm.fan.forEach((_, j) => { const p = routeAt(Gm, t, j); packet(ctx, p[0], p[1], Gm.cs * 0.6, D, 0.9); });
    // the words: gates first, then the catch, Main, the checkers, the commands, what each gate checks
    const nameCand = (x, y) => (wide ? [[x, y - R - 12, 'center'], [x, y - R - 28, 'center']] : [[x + R + 9, y, 'left']]);
    const whatCand = (x, y, r) => (wide ? [[x, y + R + 14, 'center'], [x, y + R + 34, 'center']] : r ? [[r.r + 7, y, 'left']] : []);
    const named = [];
    STATION.forEach((s, i) => { if (s.gate) { const [x, y] = Gm.st[i]; named[i] = lab.put(s.name(), nameCand(x, y), D.gates[s.gate] === 'fail' ? P.magenta : D.gates[s.gate] === 'pass' ? P.ok : P.ink, { size: wide ? 12.5 : 10, weight: 600, face: 'body' }); } });
    if (D.caught) {
      const [x, y] = Gm.st[D.R.at];
      lab.put(L('当场拦下！', 'caught!'), wide ? [[x, y + R + 15, 'center'], [x, y + R + 34, 'center']] : [[(named[D.R.at] ? named[D.R.at].r : x + R + 9) + 8, y, 'left']], P.magenta, { size: wide ? 12 : 10, weight: 600, face: 'body', plate: true });
    }
    lab.put('Main', wide ? [[mx, my - mr - 12, 'center'], [mx, my + mr + 13, 'center']] : [[mx + mr + 6, my, 'left']], D.verdict === 'accepted' ? P.ok : P.ink, { size: wide ? 12 : 11, weight: 600 });
    if (D.verdict === 'accepted') lab.put(L('五条定理', 'five theorems'), wide ? [[mx, my + mr + 13, 'center'], [bx.x + bx.w - 2, my + mr + 13, 'right'], [bx.x + bx.w - 2, my - mr - 28, 'right']] : [[mx + mr + 44, my, 'left']], P.ok, { size: wide ? 11 : 10, face: 'body' });
    Gm.fan.forEach((f, j) => lab.put(M.CHECKERS[j], wide ? [[f[0], f[1] + rF + 12, 'center'], [f[0], f[1] + rF + 26, 'center']] : [[f[0] + rF + 5, f[1], 'left']], fanCol === P.faint ? P.dim : fanCol, { size: wide ? 11 : 9.5 }));
    lab.put(`bubblewrap · ${L('断网', 'no network')}`, wide ? [[sand.x, sand.y - 11, 'left']] : [[Gm.st[0][0] + R + 8, sand.y + Math.min(10, Gm.dy * 0.42), 'left']], P.dim, { size: wide ? 10.5 : 9.5, face: 'body' });
    STATION.forEach((s, i) => {
      const [x, y] = Gm.st[i];
      if (!s.gate) { const r0 = lab.put(s.cmd, nameCand(x, y), reach >= i ? P.cyan : P.dim, { size: wide ? 11.5 : 9.5, slide: true }); if (wide || r0) lab.put(s.what(), whatCand(x, y, r0), P.dim, { size: wide ? 10.5 : 9.5, face: 'body', slide: true }); }
    });
    STATION.forEach((s, i) => { if (s.gate && !(D.caught && i === D.R.at && !wide)) { const [x, y] = Gm.st[i]; lab.put(s.what(), whatCand(x, y, named[i]), P.dim, { size: wide ? 10.5 : 9.5, face: 'body', plate: wide }); } });
    geo.gates = {};
    M.GATES.forEach((g) => { geo.gates[g.id] = Gm.st[g.at]; });
    geo.gates.main = Gm.main;
  }

  /* ---------- the stage ---------- */
  function drawStage() {
    const base = kit.plot($('cv'), { x: [0, 1], y: [0, 1], pad: [0, 0, 0, 0] }), ctx = base.ctx, W = base.W, H = base.H, D = derive();
    geo = {};
    if (TRV.thumbMode) {   // the cover is wordless: the graph mid-rebuild after an edit, thick enough for a card
      const glow = ctx.createRadialGradient(W * 0.62, H * 0.5, 0, W * 0.62, H * 0.5, W * 0.55);
      glow.addColorStop(0, TRV.alpha(P.cyan, 0.08)); glow.addColorStop(1, TRV.alpha(P.cyan, 0)); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      drawDag(ctx, { x: W * 0.05, y: H * 0.1, w: W * 0.9, h: H * 0.8 }, D, { bare: true, lw: 1.9 });
      return;
    }
    const st = $('stage').getBoundingClientRect(), below = (el) => (el ? el.getBoundingClientRect().bottom - st.top : 0);
    TRV.hudFit();
    const top = Math.max(42, below($('hudBig').parentElement), below($('sceneChips'))) + 8, bottom = Math.max(18, $('legend').offsetHeight + 18);
    const bx = { x: 14, y: top, w: W - 28, h: Math.max(80, H - top - bottom) };
    geo.box = bx;
    if (S.scene === 'dag') drawDag(ctx, bx, D); else drawReplay(ctx, bx, D);
  }

  /* ---------- the strip: the wavefront and the four pillars ---------- */
  function drawWave(D) {
    const g = kit.plot($('plotWave'), { x: [-0.8, 35.8], y: [0, 760], pad: [40, 10, 12, 20] }), cur = S.scene === 'dag' ? D.cur : LEVELS;
    g.axes({ yTicks: [0, 250, 500, 750], xTicks: [[0, 'L0'], [10, 'L10'], [20, 'L20'], [35, 'L35']] });
    for (let k = 0; k < LEVELS; k++) {
      const col = k < cur ? P.ok : k === cur ? P.amber : P.cyan;
      g.rect(k - 0.36, 0, k + 0.36, Math.max(COUNTS[k], 9), col, { alpha: k < cur ? 0.7 : k === cur ? 0.95 : 0.35 });
    }
    g.text(0, COUNTS[0], '17', cur > 0 ? P.ok : P.amber, { align: 'center', dy: -9, size: 10 });
    g.text(1, COUNTS[1], '529', cur > 1 ? P.ok : cur === 1 ? P.amber : P.cyan, { align: 'left', dx: 5, dy: -6, size: 10 });
    g.text(35, 9, 'Main', cur >= LEVELS ? P.ok : P.dim, { align: 'right', dx: 6, dy: -12, size: 10 });
  }
  function drawMatrix(D) {
    const g = kit.plot($('plotGates'), { x: [0, 1], y: [0, 1], pad: [0, 0, 0, 0] }), ctx = g.ctx, W = g.W, H = g.H;
    const left = clamp(W * 0.36, 92, 168), top = 24, cw = (W - left - 8) / 4, rh = (H - top - 6) / 4;
    M.FAULTS.forEach((f, c) => {
      const x = left + (c + 0.5) * cw, on = f === S.fault;
      if (on) { ctx.strokeStyle = P.amber; ctx.lineWidth = 1.5; ctx.strokeRect(left + c * cw + 2.5, 2.5, cw - 5, H - 5); }
      text(ctx, L(...FAULT_SHORT[f]), x, 12, on ? P.amber : P.dim, { align: 'center', size: 10, face: 'body' });
      const col = M.pillars(f, S.forgeSum);
      col.forEach((v, rr) => {
        const y = top + (rr + 0.5) * rh, s = Math.min(6, rh * 0.28);
        if (v === 'pass') dot(ctx, x, y, s, P.ok, { alpha: 0.9 });
        else if (v === 'catch') mark(ctx, 'cross', x, y, s * 0.85, P.magenta, 2.2);
        else dot(ctx, x, y, s * 0.7, P.faint, { ring: true, width: 1.2 });
      });
    });
    PILLAR_NAME.forEach((p, rr) => text(ctx, L(...p), left - 8, top + (rr + 0.5) * rh, P.ink, { align: 'right', size: 10, face: 'body' }));
  }
  function drawStrip() {
    if (TRV.still || TRV.figure) return;
    const D = derive();
    drawWave(D); drawMatrix(D);
    $('waveTitle').textContent = L('每一层能同时编译多少', 'How many shards compile at once');
    $('waveMeta').textContent = L(`17 → 529 → … → Main · 共 ${int(F.shards)}`, `17 → 529 → … → Main · ${int(F.shards)} in all`);
    $('gateTitle').textContent = L('四根支柱，各拦哪种谎言', 'Four pillars: which lie each one stops');
    const caughtBy = D.pillars.map((v, i) => (v === 'catch' ? i : -1)).filter((i) => i >= 0).length;
    $('gateMeta').textContent = S.fault === 'clean' ? L('诚实的证明：四根都放行', 'a valid proof: all four let it through') : L(`${caughtBy} / 4 根拦下`, `${caughtBy} of 4 stop it`);
  }

  /* ---------- words: HUD, legend, readouts, pills, inputs ---------- */
  const LEGEND = {
    dag: [['cy', '待编译分片（SHA-256 键）', 'keyed shard, waiting'], ['ok', '已编译 · 已复用', 'compiled · reused'], ['am', '当前层 · 选中的分片', 'running level · selected shard'], ['mg', '失效锥：要重建', 'invalidated cone: rebuild']],
    replay: [['cy', '分片包与路线', 'shard bundle and route'], ['ok', '关口放行', 'gate passes'], ['mg', '谎言被拦下', 'lie caught'], ['am', '当前一步', 'current step']]
  };
  const setHTML = (id, html) => { const el = $(id); if (el._h !== html) { el.innerHTML = html; el._h = html; } };
  function drawText() {
    const D = derive();
    let big, sub, note;
    if (S.scene === 'dag') {
      big = L('分片 DAG · CI 波', 'Shard DAG · CI wave');
      if (D.ed) {
        const k = DAG.nodes[D.ed.e].level, reuse = fix(100 * (1 - D.ed.cone.size / N), 0);
        sub = L(`改动 L${k} 的一个分片 · 失效锥 ${D.ed.cone.size} / ${N} 个点重建 · 其余 ${reuse}% 凭内容键复用`, `Edit one shard at L${k} · a cone of ${D.ed.cone.size} / ${N} dots rebuilds · ${reuse}% reused by key`);
        note = L(`改动的分片在 L${k}。键里含着它的键的分片恰好是品红的失效锥：${D.ed.cone.size} 个点，一直连到 Main；其余 ${N - D.ed.cone.size} 个点的键一个字节都没变，Release 里的产物原样复用。青色圈出它导入的 ${D.ed.up.size} 个点：它们不受影响。`,
          `The edited shard is at L${k}. The shards whose keys contain its key are exactly the magenta invalidation cone: ${D.ed.cone.size} dots, all the way to Main; the keys of the other ${N - D.ed.cone.size} dots do not change by a single byte, and their outputs in the Releases are reused. Cyan rings mark the ${D.ed.up.size} dots it imports: they are untouched.`);
      } else if (D.cur >= LEVELS) {
        sub = L(`36 层全部编译完 · ${int(F.shards)} 个分片已发布到 16 个 Release`, `All 36 levels compiled · ${int(F.shards)} shards in 16 Releases`);
        note = L('整张图编译完：每个分片的产物按内容键发布，Main 在最后一层。点任意一个分片，模拟改动它。', 'The whole graph is compiled: each shard is published under its content key, with Main in the last level. Click any shard to simulate an edit.');
      } else {
        sub = L(`L${D.cur} 编译中（共 36 层）· 已建 ${int(D.built)} · 本层 ${int(D.running)} 个并行`, `L${D.cur} compiling (36 levels) · ${int(D.built)} built · ${int(D.running)} in parallel`);
        note = D.cur <= 1
          ? L(`先编译 ${F.foundations} 个基础分片；它们一完成，就有 ${F.eligible} 个任务可以同时开工（琥珀色那一列）。图上的每个点代表一小群真实分片。`, `First the ${F.foundations} foundation shards; once they are done, ${F.eligible} jobs can start at once (the amber column). Each dot stands for a small group of real shards.`)
          : L(`波前已推进到 L${D.cur}：左边全部编译完（绿），这一层正在编译（琥珀），右边还在等前置分片（青）。剩余路径更长的任务先派发。`, `The wave has reached L${D.cur}: everything to the left is compiled (green), this level is compiling (amber), and the right waits for its prerequisites (cyan). Jobs with longer remaining paths go first.`);
      }
    } else {
      big = `${L('零信任重放', 'Zero-trust replay')} · ${kc('./verify Main')}`;
      const fname = L(...FAULT_NAME[S.fault]);
      if (D.verdict === 'accepted') {
        sub = L('四道关全部放行 · 六个校验器一致 · 公理只有 propext、Classical.choice、Quot.sound', 'All four gates pass · six checkers agree · axioms: propext, Classical.choice, Quot.sound only');
        note = L('诚实的证明：下载的字节与 Release 的校验和一致；空白内核重放每一条声明；公理闭包只有三条标准公理；类型与 Challenge.lean 的陈述一致；六个校验器都接受（示意）。', 'A valid proof: the downloaded bytes match the Release checksums; the empty kernel replays every declaration; the axiom closure has the three standard axioms only; the types are the statements of Challenge.lean; all six checkers accept (illustration).');
      } else if (D.verdict === 'caught') {
        sub = `${L(fname, fname[0].toUpperCase() + fname.slice(1))} → ${L(...CATCH[D.R.caught].by)}`;
        note = {
          sha: L(`Release 公布的校验和与下载的字节对不上（桶 ${M.TAMPERED.toString(16)}）：调包的 .olean 在进内核之前就被拒。`, `The checksum the Release publishes does not match the downloaded bytes (bucket ${M.TAMPERED.toString(16)}): the swapped .olean is refused before it reaches a kernel.`),
          kernel: L('伪造者连 Release 的校验和也一起改了，所以 SHA-256 放行；但空白内核把调包的证明重新检查一遍，类型对不上，当场拒绝。下载 CI 的分片不需要信任 CI。', 'The forger also rewrote the Release checksum, so SHA-256 lets it through; but the empty kernel checks the swapped proof again, its type does not match, and it is refused on the spot. Downloading CI’s shards needs no trust in CI.'),
          axioms: L('内核接受公理声明，所以空白内核放行；公理审计在闭包里看到 sorryAx，不在三条标准公理之内，拒绝。', 'A kernel accepts axiom declarations, so the empty kernel lets it through; the axiom audit finds sorryAx in the closure, outside the three standard axioms, and refuses.'),
          challenge: L('证明本身是对的，内核与公理审计都放行；但它证的不是那道题：类型与 Challenge.lean 的陈述不一致，拒绝。', 'The proof itself is fine, so the kernel and the axiom audit let it through; but it proves a different theorem: its type is not the statement of Challenge.lean, and it is refused.')
        }[D.R.caught];
      } else {
        sub = L(`注入：${fname} · 第 ${D.step} / 8 步：${stationName(D.step)}`, `Injected: ${fname} · step ${D.step} / 8: ${stationName(D.step)}`);
        note = L('分片包沿路线前进：每一道关只查一件事，谁也不替谁担保。', 'The shard bundle moves along the route: each gate checks one thing, and no gate vouches for another.');
      }
    }
    setHTML('hudBig', big); setHTML('hudSub', sub); setHTML('roNote', note);
    setHTML('legend', LEGEND[S.scene].map(([cl, zh, en]) => `<span><i class="sw ${cl}"></i>${L(zh, en)}</span>`).join(''));
    const rows = S.scene === 'dag' ? dagRows(D) : replayRows(D);
    setHTML('roKeyLabel', rows.keyLabel); setHTML('roKey', rows.key); setHTML('roKeySub', rows.keySub);
    rows.rows.forEach(([l, v], i) => { setHTML(`roL${i + 1}`, l); setHTML(`roV${i + 1}`, v); });
    $('pillLevel').querySelector('strong').textContent = D.cur >= LEVELS ? 'L35 ✓' : `L${D.cur}`;
    $('pillGate').querySelector('strong').textContent = D.verdict === 'accepted' ? L('放行', 'accepted') : D.verdict === 'caught' ? L('拦下', 'caught') : '…';
    syncInputs();
  }
  function dagRows(D) {
    const ed = D.ed, keys = ed ? ed.keys : KEYS0, focus = ed ? ed.e : MAIN, key = keys[focus];
    const head = ed
      ? { keyLabel: L('重建 · 复用（图上的点）', 'Rebuild · reuse (dots on the picture)'), key: `<span class="c-mg">${ed.cone.size}</span> · <span class="c-ok">${N - ed.cone.size}</span>`,
        keySub: L(`键变了的点 ${ed.changed.length} 个，正好是失效锥 <span class="nummark">${ed.changed.length === ed.cone.size ? '✓' : '✗'}</span>`, `${ed.changed.length} keys changed, exactly the cone <span class="nummark">${ed.changed.length === ed.cone.size ? '✓' : '✗'}</span>`) }
      : { keyLabel: L('已编译分片（示意波前）', 'Shards compiled (model wavefront)'), key: `${int(D.built)} / ${int(F.shards)}`,
        keySub: D.cur < LEVELS ? L(`本层 ${int(D.running)} 个任务并行`, `${int(D.running)} jobs in parallel now`) : L('Main 已编译', 'Main is compiled') };
    return { ...head, rows: [
      [L('CI 层', 'CI level'), `${fix(D.tDag, 2)} / 36`],
      [L('本层任务（示意）', 'Jobs in this level (model)'), D.cur < LEVELS ? int(D.running) : '—'],
      [L('选中的分片', 'Selected shard'), ed ? L(`L${DAG.nodes[ed.e].level} · 导入 ${ed.up.size} · 失效锥 ${ed.cone.size}`, `L${DAG.nodes[ed.e].level} · imports ${ed.up.size} · cone ${ed.cone.size}`) : L('点舞台上的一个分片', 'click a shard on the stage')],
      [L('到 Main 的最长路径', 'Longest path to Main'), ed ? L(`${DAG.rem[ed.e]} 层`, `${DAG.rem[ed.e]} levels`) : L('35 层（从基础分片）', '35 levels (from a foundation)')],
      [ed ? L('改动后的内容键 → Release', 'Content key after the edit → Release') : L('Main 的内容键 → Release', 'Content key of Main → Release'), `<code>${key.slice(0, 12)}…</code> → <code>lean-parts-v1-${key[0]}</code>`]
    ] };
  }
  function replayRows(D) {
    const R = D.R, chk = R.checkers === 'accept' ? L('六个校验器：6 / 6 接受（示意）', 'six checkers: 6 / 6 accept (model)') : R.checkers === 'pre-kernel' ? L('多校验器路线：任何内核运行前即被拒', 'multi-checker route: rejected before any kernel runs') : L('多校验器路线：每个内核都拒绝', 'multi-checker route: every kernel rejects');
    const hex = M.TAMPERED.toString(16);
    const sha = R.mismatch.length
      ? L(`桶 ${hex}：Release <code>${R.published[M.TAMPERED].slice(0, 8)}</code> ≠ 下载 <code>${R.downloaded[M.TAMPERED].slice(0, 8)}</code>`, `bucket ${hex}: Release <code>${R.published[M.TAMPERED].slice(0, 8)}</code> ≠ download <code>${R.downloaded[M.TAMPERED].slice(0, 8)}</code>`)
      : R.fault === 'forged-olean' ? L('16 / 16 相符（校验和也是伪造的）', '16 / 16 match (the checksum is forged too)') : L('16 / 16 个桶相符', '16 / 16 buckets match');
    const verdict = D.verdict === 'accepted' ? `<span class="c-ok">${L('放行', 'accepted')}</span>` : D.verdict === 'caught' ? `<span class="c-mg">${L('拦下', 'caught')}</span>` : L('重放中', 'replaying');
    return {
      keyLabel: L('判决', 'Verdict'), key: verdict,
      keySub: D.verdict === 'caught' ? `${L(...CATCH[R.caught].at)} · ${chk}` : D.verdict === 'accepted' ? `${L('Main · 五条定理', 'Main · five theorems')} · ${chk}` : L(`第 ${D.step} / 8 步`, `step ${D.step} / 8`),
      rows: [
        [L('重放步骤', 'Replay step'), `${D.step} / 8 · ${stationName(D.step)}`],
        [L('注入的谎言', 'Injected lie'), L(...FAULT_NAME[R.fault]) + (R.fault === 'forged-olean' && R.forgeSum ? L(' · 连校验和一起改', ' · checksum rewritten too') : '')],
        ['SHA-256', sha],
        [L('陈述', 'Statement'), `${R.statement ? '≡' : '<span class="c-mg">≠</span>'} Challenge.lean`],
        [L('公理闭包', 'Axiom closure'), `{${R.axioms.map((a) => (F.axioms.includes(a) ? a : `<span class="c-mg">${a}</span>`)).join(', ')}}`]
      ]
    };
  }

  const fLevel = kit.field($('ciLevel'), { fmt: (v) => fix(v, 2), onInput: (v) => { leave(); if (S.scene !== 'dag') setScene('dag'); clock.pause(); clock.set(v); } });
  function syncInputs() {
    const tDag = S.scene === 'dag' ? clock.t : S.tDag;
    if (document.activeElement !== $('ciLevel')) fLevel.set(Math.round(tDag * 100) / 100); else fLevel.show();
    $('clearEdit').disabled = S.edit == null;
    $('forgeSum').setAttribute('aria-pressed', String(S.forgeSum));
  }

  const paint = kit.painter(() => { drawText(); drawStage(); drawStrip(); }, [$('stage'), $('plotWave'), $('plotGates')]);

  /* ---------- the rail: the CI level 0 … 36, or the replay step 0 … 8 ---------- */
  const clock = kit.clock({
    range: $('now'), play: $('play'), label: $('tau'), speeds: $('speedChips'), max: LEVELS, rate: 4, step: 1, t: S.tDag,
    // (the label is drawn while the clock is being built: it reads t, max and the page state only, never the clock)
    format: (t, max) => {
      if (S.scene === 'dag') return `CI L ${fix(t, 2)} <small>/ ${max}</small>`;
      const R = replayOf(S.fault, S.forgeSum), k = Math.min(Math.floor(t + 1e-9), R.at == null ? STEPS : R.at);
      return `${L('步骤', 'step')} ${fix(t, 2)} <small>/ ${max} · ${stationName(k)}</small>`;
    },
    onChange: (t, c) => {
      if (!c.playing) stopAt = null;                       // a card that plays stops at its own frame
      else if (stopAt != null && t >= stopAt - 1e-9) { const s = stopAt; stopAt = null; c.pause(); c.set(s); return; }
      else if (S.scene === 'replay') {                      // a lie stops the replay cold, a little after its gate
        const R = replayOf(S.fault, S.forgeSum);
        if (R.at != null && t >= R.at + CAUGHT_PAUSE - 1e-9) { stopAt = null; c.pause(); c.set(R.at + CAUGHT_PAUSE); return; }
      }
      paint();
    }
  });
  const sceneChips = kit.chips($('sceneChips'), 'scene', (v) => { leave(); setScene(v); });
  function setScene(sc) {
    if (S.scene !== sc) { if (S.scene === 'dag') S.tDag = clock.t; else S.tReplay = clock.t; }
    S.scene = sc; sceneChips.set(sc, true);
    clock.pause();
    clock.rate = sc === 'dag' ? 4 : 1.4;
    clock.setMax(sc === 'dag' ? LEVELS : STEPS, true);
    clock.set(sc === 'dag' ? S.tDag : S.tReplay, true);
    paint();
  }
  const faultChips = kit.chips($('faultChips'), 'fault', (v) => { leave(); S.fault = v; replayFromStart(); });
  function setForgeSum(on) { S.forgeSum = !!on; $('forgeSum').setAttribute('aria-pressed', String(S.forgeSum)); }
  /** Switch to the replay and run it from the clone, so the reader sees the bundle meet the gate that stops the lie. */
  function replayFromStart() {
    setScene('replay');
    if (TRV.still) { clock.set(STEPS); return; }
    clock.set(0); clock.play();
  }
  $('forgeSum').addEventListener('click', () => { leave(); setForgeSum(!S.forgeSum); if (S.fault === 'forged-olean') replayFromStart(); else paint(); });
  $('clearEdit').addEventListener('click', () => { leave(); S.edit = null; paint(); });
  function leave() { if (morph) { morph.cancel(); morph = null; } stopAt = null; cards.mark(null); }
  /** Edit shard i: its cone turns magenta, and the rebuild wave runs from its level to Main. */
  function editShard(i) {
    S.edit = i; setScene('dag');
    clock.set(DAG.nodes[i].level);
    if (!TRV.still) clock.play();
  }
  const GATE_LIE = { sha: ['forged-olean', false], kernel: ['forged-olean', true], axioms: ['extra-axiom', false], challenge: ['wrong-stmt', false], main: ['clean', false] };
  function lieFor(gate) { const [f, s] = GATE_LIE[gate]; S.fault = f; faultChips.set(f, true); setForgeSum(s); replayFromStart(); }
  function cycleFault() { const i = M.FAULTS.indexOf(S.fault), f = M.FAULTS[(i + 1) % M.FAULTS.length]; S.fault = f; faultChips.set(f, true); replayFromStart(); }
  $('rew').addEventListener('click', () => { clock.pause(); clock.set(0); });
  kit.keys({ 1: () => { leave(); setScene('dag'); }, 2: () => { leave(); setScene('replay'); }, f: () => { leave(); cycleFault(); } });

  /* ---------- direct manipulation: click a shard to edit it, click a gate to see the lie it stops ---------- */
  const cv = $('cv');
  const local = (ev) => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  function target(x, y) {
    if (S.scene === 'dag' && geo.nodes) {
      let best = -1, bd = geo.hit * geo.hit;
      geo.nodes.forEach((p, i) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = i; } });
      return best >= 0 ? { kind: 'node', id: best } : null;
    }
    if (S.scene === 'replay' && geo.gates) {
      for (const [id, p] of Object.entries(geo.gates)) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 <= 18 * 18) return { kind: 'gate', id };
    }
    return null;
  }
  const act = (t) => { leave(); if (t.kind === 'node') editShard(t.id); else lieFor(t.id); };
  let press = null;
  cv.addEventListener('pointerdown', (ev) => {
    const [x, y] = local(ev), t = target(x, y);
    if (!t) return;
    if (ev.pointerType === 'mouse') act(t); else press = { t, x0: ev.clientX, y0: ev.clientY };
  });
  cv.addEventListener('pointerup', (ev) => {
    if (press && Math.hypot(ev.clientX - press.x0, ev.clientY - press.y0) < 8) act(press.t);   // a tap, not a scroll
    press = null;
  });
  cv.addEventListener('pointercancel', () => { press = null; });
  cv.addEventListener('pointermove', (ev) => { const [x, y] = local(ev); cv.style.cursor = target(x, y) ? 'pointer' : 'default'; });

  /* ---------- experiment cards ---------- */
  // a card that plays declares its still: the frame of the cover and of the figure a chapter cites
  const PRESETS = {
    'dag-shards': { scene: 'dag', t: 1.5, edit: null },
    'ci-wave': { scene: 'dag', t: 24, from: DAG.nodes[EDIT_NODE].level, edit: EDIT_NODE, play: true, still: 24 },
    'fresh-replay': { scene: 'replay', t: STEPS, fault: 'clean', forgeSum: false, play: true, still: 'end' },
    'tamper-caught': { scene: 'replay', t: STEPS, fault: 'forged-olean', forgeSum: true, play: true, still: 'end' }
  };
  const NOTES = {
    'dag-shards': [`CI 把 Main 的真实导入闭包切成 ${int(F.shards)} 个分片、36 层。最左边是 ${F.foundations} 个基础分片（已编译，绿）；它们一完成，${F.eligible} 个任务同时开工（琥珀色那一列）；其余分片还在等前置分片（青）。点任意一个分片，看它的依赖锥。`,
      `CI cuts the real import closure of Main into ${int(F.shards)} shards over 36 levels. On the far left are the ${F.foundations} foundation shards (compiled, green); once they are done, ${F.eligible} jobs start at once (the amber column); the other shards wait for their prerequisites (cyan). Click any shard to see its dependency cone.`],
    'ci-wave': ['改动 L12 的一个分片：它的键变了，一路导入它的分片（品红的失效锥）键也跟着变，必须重建；锥外的分片键不变，直接复用（绿）。重建波沿最长剩余路径推向 Main，停在 L24：一半已重建，一半还在等。',
      'Edit one shard at L12: its key changes, so do the keys of every shard that imports it (the magenta invalidation cone), which must be rebuilt; outside the cone the keys stay the same and the shards are reused (green). The rebuild wave runs along the longest remaining path toward Main and stops at L24: half rebuilt, half waiting.'],
    'fresh-replay': ['任何人都能在自己的机器上重放：git clone、./verify --status Main、./verify Main。分片包依次通过 SHA-256、空白内核、公理审计与 Challenge 陈述比对，再交给六个校验器；Main 亮绿，五条定理放行。',
      'Anyone can replay it on their own machine: git clone, ./verify --status Main, ./verify Main. The shard bundle passes SHA-256, the empty kernel, the axiom audit and the comparison with the Challenge statements, then the six checkers; Main turns green and the five theorems go through.'],
    'tamper-caught': ['CI 本身撒谎：它调包了一个 .olean，还把 Release 的校验和一起改掉，所以 SHA-256 放行。可空白内核把每条证明重新检查一遍：调包的证明通不过，在第二道关当场被拦下。',
      'CI itself lies: it swaps a .olean and rewrites the Release checksum too, so SHA-256 lets it through. But the empty kernel checks every proof again: the swapped proof fails, and it is stopped cold at the second gate.']
  };
  // A cited figure keeps one sentence next to ◀ ▶; the full lab keeps the explanations above.
  const FIGURE_NOTES = {
    'dag-shards': ['17 个基础分片之后，529 个任务同时开工。', 'After 17 foundations, 529 jobs start at once.'],
    'ci-wave': ['改一个分片：只有品红的锥要重建，其余复用。', 'Edit one shard: only the magenta cone is rebuilt.'],
    'fresh-replay': ['四道关全部放行，Main 亮绿。', 'All four gates pass and Main turns green.'],
    'tamper-caught': ['校验和也被伪造，空白内核仍当场拒绝。', 'Even with a forged checksum, the kernel refuses.']
  };
  function applyPreset(id) {
    const p = PRESETS[id];
    if (morph) { morph.cancel(); morph = null; }
    stopAt = null; clock.pause();
    if (p.fault) { S.fault = p.fault; faultChips.set(p.fault, true); }
    if (p.forgeSum != null) setForgeSum(p.forgeSum);
    if ('edit' in p) S.edit = p.edit;
    const same = S.scene === p.scene;
    setScene(p.scene);
    const end = p.still === 'end' ? clock.max : p.t;
    // a still (cover, cited figure for PDF/EPUB) and the opening view of the full page show the telling frame;
    // inside a chapter the card plays once the reader has scrolled it into view; a click plays at once
    const plays = !!p.play && !TRV.still && !(booting && !TRV.embed);
    if (plays) {
      clock.set(p.from || 0);
      stopAt = end >= clock.max ? null : end;
      if (booting) kit.autoplay(clock, $('stage')); else clock.play();
      return;
    }
    const goal = TRV.still && p.still != null ? (p.still === 'end' ? clock.max : p.still) : end;
    if (booting || TRV.still || !same) { clock.set(goal); return; }
    const t0 = clock.t;   // a card on the same scene glides there instead of cutting
    morph = kit.tween(480, (e) => { clock.set(t0 + (goal - t0) * e, true); paint(); }, () => { morph = null; clock.set(goal); });
  }
  const cards = kit.cards($('presets'), { presets: PRESETS, notes: TRV.figure ? FIGURE_NOTES : NOTES, noteEl: $('presetNote'), tour: $('tour'), onPick: applyPreset,
    idle: ['自由探索：拖时间轴、点一个分片模拟改动、在“试着作弊”里换一种谎言。随时可以再选一张卡。', 'Free play: scrub the rail, click a shard to simulate an edit, plant another lie under “Try to cheat”. Pick a card again at any time.'] });

  TRV.drawer({ drawer: $('drawer'), open: $('infoBtn'), close: $('drawerClose') });
  TRV.startGlitch(document.querySelector('.brand'));

  /* ---------- probe for the browser suite, cover, start ---------- */
  const at = (p) => { if (!p) return null; const r = cv.getBoundingClientRect(); return { x: r.left + p[0], y: r.top + p[1] }; };
  window.REPLAY_DEBUG = {
    get state() {
      const D = derive(), ed = D.ed;
      return {
        scene: S.scene, preset: cards.current, t: clock.t, max: clock.max, playing: clock.playing, tDag: D.tDag, tReplay: D.tRep,
        level: D.cur, built: D.built, running: D.running, edit: S.edit, editNode: EDIT_NODE, status: D.status.slice(),
        cone: ed ? [...ed.cone].sort((a, b) => a - b) : [], up: ed ? [...ed.up].sort((a, b) => a - b) : [], changed: ed ? ed.changed.slice() : [],
        critical: ed ? ed.crit.slice() : [], rem: ed ? DAG.rem[ed.e] : null, keys: (ed ? ed.keys : KEYS0).slice(),
        fault: S.fault, forgeSum: S.forgeSum, caught: D.R.caught, caughtAt: D.R.at, gates: { ...D.gates }, checkers: D.checkers, comparator: D.R.checkers,
        verdict: D.verdict, step: D.step, axioms: D.R.axioms.slice(), statement: D.R.statement, mismatch: D.R.mismatch.slice(),
        published: D.R.published.slice(), downloaded: D.R.downloaded.slice(), pillars: D.pillars.slice()
      };
    },
    /** The illustrative graph as drawn: per-level counts of the model wavefront, dots per column, levels, imports. */
    graph: () => ({ counts: COUNTS.slice(), cols: DAG.cols.slice(), levels: DAG.nodes.map((n) => n.level), deps: DAG.nodes.map((n) => n.deps.slice()), main: MAIN, keys: KEYS0.slice() }),
    facts: () => ({ ...F, axioms: F.axioms.slice() }),
    seek: (t) => { clock.pause(); clock.set(t); },
    set: (o) => {
      if ('edit' in o) S.edit = o.edit;
      if (o.fault) { S.fault = o.fault; faultChips.set(o.fault, true); }
      if (o.forgeSum != null) setForgeSum(o.forgeSum);
      if (o.scene) setScene(o.scene);
      if (o.t != null) { clock.pause(); clock.set(o.t); }
      paint();
    },
    scene: (sc) => setScene(sc),
    /** Viewport coordinates for pointer tests: a dot of the graph, a gate of the route (sha, kernel, axioms, challenge, main). */
    point: { node: (i) => at(geo.nodes && geo.nodes[i]), gate: (id) => at(geo.gates && geo.gates[id]) }
  };
  /** Cover: the graph of CI WAVE, mid-rebuild after an edit. */
  window.TRV_THUMB = () => { S.edit = EDIT_NODE; setScene('dag'); clock.set(24, true); paint.now(); };
  cards.pick(cards.initial('dag-shards'));   // a chapter may cite another card: ::: {.viz src="proof-replay" preset="tamper-caught"}
  booting = false;
  paint();
})();
