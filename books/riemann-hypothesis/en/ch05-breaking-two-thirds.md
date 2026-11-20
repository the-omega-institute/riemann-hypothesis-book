# Chapter 5 Breaking the $2/3$ Ceiling: Lattice Slopes, Bost's Inequality, and Integral Gluing

> Pay freight separately for each character, and inflation eats your margin at two-thirds; glue an integral structure across the whole family along nearly orthogonal axes, and the last one-sixth cliff collapses down to one-half.

At the end of Chapter 4 we hit an honest mathematical wall: **push a single-character iterated theta-lift chain as hard as you want, and the budget stalls at $\sigma = \frac{2}{3}$.**

If you follow analytic number theory, the number $2/3$ probably rings a familiar bell—time and again across prime gaps, zero-density theorems, and convex bounds, single-variable arguments stall around $2/3$ or $3/4$. Here the reason is pure bookkeeping. Each theta lift buys you one extra layer of divisibility from formal degrees and lattice counts, **but simultaneously raises the level, norm, and covolume cost of the space**. Run the balance sheet for a single Hecke character, and gains minus costs top out right at $\sigma = \frac{2}{3}$.

To crack past $\frac{2}{3}$ down to $\frac{1}{2}$, the proof makes two decisive moves: **first measure every lift's exact cost with lattice slopes, then glue an integral structure across a whole family of Hecke characters so their costs share the load along nearly orthogonal directions.**

## 5.1 The Roof Over a Lattice: Harder–Narasimhan Slopes {#sec-ch05-lattice-slopes}

Do not let terms like "Harder–Narasimhan filtration" and "Bost's slope inequality" push you off balance. Underneath, they are a piece of elementary geometry about roofs and short vectors.

Picture an integer lattice $L$ inside a Euclidean space $E$ as a warehouse full of grid points:

- its dimension is the **rank** $\operatorname{rk}(L)$;
- the volume of one fundamental box is its **covolume** $\operatorname{covol}(L)$: packed lattices have tiny covolumes, sparse lattices have huge ones.

To turn multiplication of volumes into addition, define the **degree** and **slope** of any nonzero sublattice $N \le L$ by

$$
\deg(N) = -\ln \operatorname{covol}(N), \qquad \mu(N) = \frac{\deg(N)}{\operatorname{rk}(N)}.
$$

Hold onto one crystal-clear picture: **a sublattice with densely packed points has tiny covolume, large degree, and a steep positive slope $\mu(N)$.** The supremum of slopes over all nonzero sublattices $N \le L$ is the maximal slope $\mu_{\max}(L)$.

Try a four-step example with real numbers! Take a rank-$7$ lattice $L$ containing a nested chain of saturated sublattices $0 = L_0 \subset L_1 \subset L_2 \subset L_3 \subset L_4 = L$ at $(\operatorname{rk}, \deg)$ coordinates:

- $(0, 0) \to (1, 1.8)$: segment slope $\mu_1 = 1.8 / 1 = 1.8$ (one tight short vector!);
- $(1, 1.8) \to (3, 4.4)$: segment slope $(4.4 - 1.8) / (3 - 1) = 1.3$;
- $(3, 4.4) \to (5, 5.4)$: segment slope $(5.4 - 4.4) / (5 - 3) = 0.5$;
- $(5, 5.4) \to (7, 5.0)$: segment slope $(5.0 - 5.4) / (7 - 5) = -0.2$.

Plot those five points in order and look at the polygon: the slopes $1.8 > 1.3 > 0.5 > -0.2$ step strictly downward, **forming an arched concave roof!** Even though the whole lattice has average slope $5.0/7 \approx 0.714$, its steepest first rafter pushes $\mu_{\max}(L) = 1.8$—and that steep slope forces a short nonzero lattice vector to exist!

::: {.figure src="ch05-slope-barrier"}
**Left: single-character stalling at $2/3$ vs. glued-family descent to $1/2$ (`MODEL`); Right: exact Harder–Narasimhan concave slope polygon.** On the left, the magenta curve shows naive single-character lifting flattening against the $\sigma = 2/3$ ceiling, while the cyan glued curve breaks through toward the green $\sigma = 1/2$ line. On the right, exact computed points $(0,0), (1,1.8), (3,4.4), (5,5.4), (7,5.0)$ trace the concave roof, with the steepest first segment $\mu_{\max} = 1.8$ highlighted in amber against the dashed average slope $5.0/7 \approx 0.714$.
:::

All four pillars of this lattice-slope geometry are proved from scratch inside [`ExistsSaturatedSlopeEqMuMax.lean`](lean:Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.slopesBdd):

::: {.theorem #thm-slopes-bdd title="Boundedness of slopes and upper bound by $\mu_{\max}$" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.slopesBdd Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.slopeLeMuMax"}
For any discrete submodule (lattice) $L \le E$ in a finite-dimensional real inner product space $E$, the set of slopes $\operatorname{slopes}(L)$ is bounded above, and every nonzero sublattice $N \le L$ satisfies
$$
\mu(N) \le \mu_{\max}(L).
$$
:::

::: proof
Using the Gram-determinant projection bound `gramDetLe`, every nonzero sublattice $N \le L$ has covolume bounded uniformly away from zero by the minimal norm in $L$, bounding $-\ln\operatorname{covol}(N)/\operatorname{rk}(N)$ from above; the supremum inequality follows directly. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-short-vector title="Minkowski short-vector theorem" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.shortVector"}
For every nonzero discrete lattice $L \le E$ in a finite-dimensional real inner product space, there exists a nonzero vector $v \in L$ satisfying
$$
\|v\| \le \sqrt{\operatorname{rk}(L)}\; \operatorname{covol}(L)^{1/\operatorname{rk}(L)}.
$$
:::

::: proof
Identifies `covol(L)` with Mathlib's measure-theoretic `ZLattice.covolume` (`covolEqCovolume`) and applies Minkowski's convex-body theorem on a cube scaled to radius $\operatorname{covol}(L)^{1/\operatorname{rk}(L)}$, converting $\ell^\infty$ norm to Euclidean norm via the factor $\sqrt{\operatorname{rk}(L)}$. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-deg-quot-add title="Additivity of rank and degree for saturated sublattices" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.deg_eq_deg_add_deg_quot"}
Let $L \le E$ be a discrete lattice and $N \le L$ a saturated sublattice ($N = L \cap \operatorname{span}_{\mathbb{R}}(N)$), with orthogonal quotient lattice $\operatorname{quot}(L, N)$ projected onto $N^\perp$. Then $\operatorname{quot}(L, N)$ is discrete, and
$$
\operatorname{rk}(L) = \operatorname{rk}(N) + \operatorname{rk}\bigl(\operatorname{quot}(L, N)\bigr),
\qquad
\deg(L) = \deg(N) + \deg\bigl(\operatorname{quot}(L, N)\bigr).
$$
:::

::: proof
Extending a $\mathbb{Z}$-basis of the saturated sublattice $N$ to a $\mathbb{Z}$-basis of $L$ puts the Gram matrix in block-triangular orthogonal form, giving $\operatorname{covol}(L) = \operatorname{covol}(N)\cdot \operatorname{covol}(\operatorname{quot}(L, N))$; taking negative logarithms yields degree additivity. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-mumax-le-min title="Minimal nonzero vector bounds the maximal slope" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.muMaxLeMin"}
Let $L \le E$ be a nonzero discrete lattice. If every nonzero vector $x \in L$ satisfies $\|x\| \ge r > 0$, then
$$
\mu_{\max}(L) \le -\ln r + \frac{1}{2}\ln\bigl(\operatorname{rk}(L)\bigr).
$$
:::

::: proof
Apply [@thm-short-vector] to any nonzero sublattice $N \le L$ to obtain $r \le \|v\| \le \sqrt{\operatorname{rk}(N)}\,\operatorname{covol}(N)^{1/\operatorname{rk}(N)}$; taking logarithms and the supremum over $N \le L$ with $\operatorname{rk}(N) \le \operatorname{rk}(L)$ yields the bound. The full proof is checked by the Lean kernel.
:::

See the two-way duality between slopes and vectors? Bost's slope inequality (`SlopeInequality` in `LatticeSlopes/Statement.lean`) applies the exact same roof picture across any injective integer-linear map $\varphi : L \to M$ with operator norm bound $C$:

$$
\mu(L) \le \mu_{\max}(M) + \ln C.
$$

If your integral structure has no hidden ultra-steep sublattice spikes, the arithmetic height along the entire lift chain stays strictly under control!

::: {.viz src="theta-chain-budget" preset="hn-polygon" height="500"}
**Interactive Harder–Narasimhan concave roof:** Upper concave hull through $(0,0), (1, 1.8), (3, 4.4), (5, 5.4), (7, 5.0)$ comparing the steepest first rafter $\mu_{\max} = 1.8$ (amber) against the dashed mean slope $5/7 \approx 0.714$. In the full lab, dragging $(1, h_1)$ below $4.4/3$ snaps the first roof chord cleanly to $(3, 4.4)$.
:::

## 5.2 Vaulting $2/3$: Gluing an Integral Structure Across Hecke Characters {#sec-ch05-integral-gluing}

Now return to the crucial question: **if one Hecke character alone stalls at $2/3$, what cost does "gluing across Hecke characters" save?**

Think of shipping groceries from $K$ stalls at a market. If each stall forces you to rent a separate shipping crate, freight costs scale by $K$ and choke your budget right at $2/3$. But if you find a **common integral gcd lattice** holding all $K$ deliveries inside a single compact matrix—and check that the columns corresponding to different characters are **almost orthogonal**—then there is no collinear collapse, the Gram determinant stays cleanly near the product of column lengths, and the shared structure spreads the cost across the entire family!

In the architecture of the proof (Steps 15–16 of the author's summary), that gluing works as a two-punch combination:

1. **Assemble a shared integral structure across Hecke characters** (an extra averaging / "gcd" over characters), backed by a relative trace formula via automorphy on a sixfold cover of $\mathrm{GL}_5$ and Cauchy–Schwarz against the norm of a projected Poincaré series.
2. **Prove approximate orthogonality of the columns** of that glued integral matrix. With no collapsed directions, the maximal slope $\mu_{\max}$ stays tame, driving the threshold abscissa cleanly past $\frac{2}{3}$ all the way down into $\frac{1}{2} + \varepsilon$!

> One thin stick snaps two-thirds of the way across the river; weave nearly orthogonal vectors into a single integral lattice, and the bridge holds all the way to one-half.

Yet two final pockets of resistance still lurk along the road to every Dirichlet character: accidental arithmetic-progression resonances inside the Iwasawa tower levels, and stubborn Galois cohomology classes that refuse to vanish by twisting alone.

In the next chapter, we bring in Behrend's high-dimensional integer sphere shell and a strong weakening of Vandiver's conjecture to close the net once and for all.

::: {.viz src="theta-chain-budget" height="560"}
**The full theta-chain and lattice-slope lab:** Switch between the mirror-chain budget and the interactive Harder–Narasimhan roof, adjust depth ratio $m/\sqrt{X}$, character gluing, and first-rafter degree $h_1$, and verify how orthogonal gluing pulls the threshold below $2/3$.
:::
