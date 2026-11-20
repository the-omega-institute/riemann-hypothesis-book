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
