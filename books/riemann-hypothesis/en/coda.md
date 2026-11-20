# Coda The Mountains Beyond Riemann

> The first ascent of a great conjecture is rarely a paved highway; it looks more like an expedition loaded with ropes, crampons, and sixteen overlapping maps. Once the flag reaches the summit, the thrill of the next generation is watching mathematicians carve a thirty-mile ridge climb into a crystal-clear afternoon walk.

When the last checker flashes green, the world does not grind to a halt. On the contrary, the best part of the adventure begins right then.

As the author remarked candidly in the announcement note, seventeen million lines of first-generation Lean proof almost certainly hide bulky scaffolding built under night-shift pressure—detours through high $K$-groups or specific tower choices that later mathematicians will likely distill down to dozens of gleaming pages. We have seen that story play out in every era of mathematics: the first proofs by Abel, Galois, or Wiles felt vast and intricate, until twenty years later graduate textbooks turned their core ideas into three clean chapters.

Just as importantly, honesty demands drawing a bright red border around what this proof **does not** settle. Proving the Riemann Hypothesis and GRH for Dirichlet $L$-functions does not clear every problem bearing Riemann's name. Four great peaks still stand unconquered on the horizon, marked cleanly below as open conjectures and problems:

::: {.conjecture #conj-erh-dedekind title="Extended Riemann Hypothesis (ERH) for general Dedekind zeta functions"}
For every algebraic number field $K$, all nontrivial zeros of its Dedekind zeta function $\zeta_K(s)$ in the critical strip $0 < \operatorname{Re}(s) < 1$ satisfy $\operatorname{Re}(s) = \frac{1}{2}$.
:::

As documented in `verification/NOTES.md`, the formalization proves RH for $\zeta(s)$ and GRH for all Dirichlet $L$-functions over $\mathbb{Q}$; general Dedekind zeta functions and Artin $L$-functions remain outside its proved scope.

::: {.conjecture #conj-grh-automorphic title="Grand Riemann Hypothesis for general automorphic $L$-functions"}
For every cuspidal automorphic representation $\pi$ on $\mathrm{GL}_n$ over a global field (including elliptic-curve Hasse–Weil $L$-functions), every nontrivial zero of $L(s, \pi)$ in the strip $0 < \operatorname{Re}(s) < 1$ lies on the critical line $\operatorname{Re}(s) = \frac{1}{2}$.
:::

Lifting the $\mathrm{GL}_1$ Dirichlet machinery to higher-rank automorphic $L$-functions remains one of the towering challenges of twenty-first-century number theory.

::: {.conjecture #conj-simple-zeros title="Simplicity of zeta zeros"}
Every nontrivial zero $\rho$ of $\zeta(s)$ in $0 < \operatorname{Re}(\rho) < 1$ is simple: $\zeta'(\rho) \neq 0$.
:::

::: {.problem #prob-montgomery-gue title="Montgomery's pair correlation and GUE spectral statistics"}
Prove that as height $T \to \infty$, the normalized spacings and pair correlations of the critical-line zeros $\frac{1}{2} + i\gamma$ converge rigorously to those of eigenvalues in the Gaussian Unitary Ensemble (GUE), and clarify whether a genuine Hilbert–Pólya self-adjoint operator underlies them.
:::

Solving a 160-year-old conjecture does not close mathematics—it turns an ancient cliff into solid ground to build upon. Standing at last on the firm bedrock of $\operatorname{Re}(s) = \frac{1}{2}$, what shines sharpest across the sea are the peaks still waiting for light.

> Never mourn the solving of a sacred riddle; every old mystery that yields its key unlocks ten wilder frontiers beyond the ridge.

## Copyright & Acknowledgments {#sec-coda-copyright-acknowledgments}

In keeping with strict mathematical honesty and clear provenance, the ownership, fork lineage, licensing boundaries, and acknowledgments behind this book are recorded in full below:

- **Original proof author and formal source copyright**: The Lean 4 formalization of the Riemann Hypothesis and GRH for Dirichlet $L$-functions analyzed in this book was authored by **Levent Alpöge** and announced on November 20, 2026 ([`alpo.ge/remark.pdf`](https://alpo.ge/remark.pdf)). That formal source belongs to its author and was released without an open-source license (all rights reserved); this book repository neither redistributes nor re-licenses the Lean proof source, citing only theorem signatures and permalinks into the public archive.
- **Upstream verification project and fork lineage**: We gratefully acknowledge **Deicyde**'s upstream verification repository [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis), which archived the published tarball unmodified and created the 27-line `src/Challenge.lean` contract, `comparator.json` harness, and [`verification/NOTES.md`](https://github.com/Deicyde/riemann-hypothesis/blob/main/verification/NOTES.md). The formalization repository pinned by this book, [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis), is a **fork** by The Omega Institute from [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis): every proof file remains untouched, while the fork adds the 8,490-shard content-addressed public CI build pipeline, public Release storage, and `./verify` zero-trust local replay tool.
- **Book and toolchain licenses**: The bilingual monograph prose, static figure scripts, interactive visualizations, and explainer film scripts are authored by The Omega Institute and licensed under **`CC-BY-4.0`** (Creative Commons Attribution 4.0 International; see [`book.toml`](https://github.com/the-omega-institute/riemann-hypothesis-book/blob/main/books/riemann-hypothesis/book.toml)). The publishing framework and verification CLI are derived from [`the-omega-institute/trureturing-books-template`](https://github.com/the-omega-institute/trureturing-books-template) and licensed under **`Apache-2.0`**.
- **Open-source ecosystem acknowledgments**: Warm thanks to the **Lean 4** developers, **Mathlib 4** (`v4.33.1`) contributors, the **Comparator** and **`lean4export`** authors, and the creators of the independent checkers **`leanchecker`**, **`nanoda`**, **`con-leche`**, **`con-ron`**, and **`lean4lean`** (Mario Carneiro), as well as the open-source teams behind **`mdBook`**, **`Typst`**, **`Pandoc`**, **`KaTeX`**, and **`Kokoro-82M`**.
