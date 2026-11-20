# Chapter 3 Differentiating the Integers: Stepanov's Determinant and the Dream of Multiplicity

> Give a mathematician polynomials, and derivatives come free with roots to count; hand them whole numbers, and the stone refuses to bend—until you embed the integers inside geometry, where even stones grow tangent lines.

Why was the Riemann Hypothesis over finite-field curves solved decades ago while the integers held out for 160 years?

Replace $\mathbb{Z}$ with a curve over a finite field $\mathbb{F}_q$ (such as $y^2 = x^3 + x$). There, the analogue of RH fell first to André Weil, later to Pierre Deligne, and—in 1969—to a shockingly short, elementary proof by Sergei Stepanov that needed barely a handful of pages of high-school-level algebra.

Stepanov's whole magic trick comes down to a single word: **multiplicity**.

## 3.1 Stepanov's Trick: Why High-Order Zeros Beat Point Counting {#sec-ch03-stepanov}

Here is the core idea in thirty seconds. Suppose you want to bound how many rational points lie on a curve. If you build an auxiliary polynomial $P(x)$ that simply equals $0$ at each point (multiplicity $m = 1$), each point uses up $1$ unit of your degree budget $\deg P$, leaving you with only the trivial bound.

Now suppose you force $P(x)$ at every rational point to vanish not only at $P(x_0) = 0$, **but also at $P'(x_0) = P''(x_0) = \dots = P^{(m-1)}(x_0) = 0$**!

Suddenly every single point counts $m$ times against the degree of $P$. As long as $P$ is not identically zero, one line closes the trap:

$$
m \times (\text{number of points}) \le \deg P.
$$

Make $m$ large, and the upper bound drops by a factor of $1/m$. Imagine a banquet table 100 inches long: if every guest takes 1 inch, you can seat 100 guests; if you require every guest to occupy 10 inches side by side, at most 10 guests can fit in the room.

> Simple zeros police the doorway; only high multiplicity clears the room. Yet outside polynomial rings, who lets you differentiate a whole number?

Here sits the **discrete wall** that blocked analytic number theory for a century and a half. In polynomials over a field, differentiation $d/dx$ is free. Over the integers $\mathbb{Z}$, $n$ and $n+1$ sit one stubborn unit apart: you cannot let $h \to 0$, so ordinary calculus falls through the floor.

## 3.2 Manufacturing Derivatives Out of Integers: Quadrics, CM Curves, and Graded Weyl Divisibility {#sec-ch03-differentiating-integers}

To force whole numbers to yield multiplicity $m$, the proof engineers two complementary mechanisms that secretly speak the same geometric language:

1. **The geometric disguise: path quadrics and CM curves.** Sums over Dirichlet characters are converted, via repeated Parseval identities and "path quadrics" $x_1 x_2 + x_2 x_3 + \cdots + x_{k-1}x_k$, into bilinear pairings; and on elliptic curves with complex multiplication (CM), the invariant derivation $D$ satisfies $D^p \equiv 0 \pmod{p}$ at inert primes, acting as a built-in algebraic differentiation switch that forces divisibility by prime powers.
2. **The algebraic backbone: divided powers and Fock positivity.** Whenever you build an object with "multiplicity $m$" over integers rather than complex numbers, ordinary derivatives $\frac{d^k}{dx^k}$ spit out nasty factorials $k!$ that tangle denominators. You have to replace derivatives with **divided-power operators** (`rowDiv`) $\frac{1}{k!}D^k$ and prove that the integral Weyl module stays locked tightly to its symmetric dual equations!

::: {.figure src="ch03-stepanov-grid"}
**Left: simple crossing vs. multiplicity-$5$ tangency; Right: graded Weyl weights and the Fock staircase.** On the left, the cyan quintic $(x-x_0)^5$ hugs the axis flat so one root consumes five units of degree. On the right, starting from the amber highest-weight corner, divided-power row operators `rowDiv` step cleanly down the grid while staying inside the green Weyl boundary under the cyan Fock inner product.
:::

Let us look right inside this algebraic gearbox (`GradedWeylDivisibility`) with bare hands. Picture an $r \times n$ matrix of variables $X = (x_{a,j})$ where columns carry weight $\nu$ and rows carry symmetry. How do you guarantee that the span generated from the highest-weight vector by divided-power row operators (`weyl`) matches the kernel of column-symmetry equations (`dualWeyl`)—not only over $\mathbb{Q}$, but up to controlled integer multipliers over $\mathbb{Z}$?

Enter an old friend from quantum mechanics: the **Fock (Fischer) inner product**! Given two rational polynomials $f, g \in \mathbb{Q}[X]$, define

$$
\langle f, g \rangle_{\mathrm{Fock}} = \sum_{m} f_m\, g_m \prod_{k} (m_k!),
$$

summing over monomials $m$ weighted by the product of factorials of their exponents! Just like creation and annihilation operators on a harmonic oscillator, multiplication by $x_k$ and differentiation $\partial/\partial x_k$—and more generally opposite divided-power row operators `rowDiv a b k` and `rowDiv b a k`—are **exact adjoints** of each other under this positive-definite pairing!

Five crisp theorems verified in [`FinalB.lean`](lean:Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.fockQPos) lock this gearbox shut:

::: {.lemma #lem-fock-pos title="Symmetry and strict positivity of the rational Fock pairing" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.fockQPos"}
For any index type $\sigma$ and any multivariate polynomials $f, g \in \mathbb{Q}[X_\sigma]$, the rational Fock pairing is symmetric, $\langle f, g \rangle_{\mathrm{Fock}} = \langle g, f \rangle_{\mathrm{Fock}}$, and whenever $f \neq 0$,
$$
\langle f, f \rangle_{\mathrm{Fock}} > 0.
$$
:::

::: proof
In $\sum_m f_m^2 \prod_k m_k!$, every factorial product is strictly positive over $\mathbb{Q}$; if $f \neq 0$, at least one monomial coefficient $f_m$ is nonzero, making the sum strictly positive. The full proof is checked by the Lean kernel.
:::

::: {.lemma #lem-fock-adj title="Fock adjointness of divided-power row operators" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.fockQRowDivAdj"}
For all $r, n \in \mathbb{N}$, all row indices $a, b \in \operatorname{Fin} r$, all $k \in \mathbb{N}$, and all $f, g \in \mathbb{Q}[X_{r\times n}]$,
$$
\langle \operatorname{rowDiv}_{a,b}^{(k)}(f),\, g \rangle_{\mathrm{Fock}} = \langle f,\, \operatorname{rowDiv}_{b,a}^{(k)}(g) \rangle_{\mathrm{Fock}}.
$$
:::

::: proof
Verified directly on monomial bases by matching the binomial factors produced when transferring $k$ powers from row $b$ to row $a$ against those from row $a$ to row $b$ weighted by exponent factorials. The full proof is checked by the Lean kernel.
:::

::: {.lemma #lem-rowdiv-graded title="Divided-power closed subspaces are row-weight graded" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.rowDivClosedGraded"}
Let $M \subseteq \mathbb{Q}[X_{r\times n}]$ be a $\mathbb{Q}$-submodule closed under all divided-power row operators $\operatorname{rowDiv}_{a,b}^{(k)}$. Then for every $f \in M$ and every row weight $\mu : \operatorname{Fin} r \to \mathbb{N}$, the $\mu$-homogeneous component of $f$ also belongs to $M$.
:::

::: proof
Scaling individual rows over the infinite field $\mathbb{Q}$ separates row-weight components via Vandermonde interpolation, and invariance under diagonal scaling is preserved by divided-power closure. The full proof is checked by the Lean kernel.
:::

Put those three pieces together and any mismatch between `weyl` and `dualWeyl` vanishes on the spot: if `weyl` were strictly smaller than `dualWeyl`, its Fock-orthogonal complement would be non-empty; by positivity and adjointness, climbing by raising operators inside that complement would produce a second independent highest-weight line—contradicting the uniqueness of the highest-weight line!

::: {.theorem #thm-weyl-eq-nabla title="Coincidence of rational Weyl and dual Weyl modules" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.weylEqNablaQ"}
For all natural numbers $n \le r$ and every antitone weight $\nu : \operatorname{Fin} n \to \mathbb{N}$, the rational Weyl and dual Weyl modules coincide:
$$
\operatorname{weyl}_{\mathbb{Q}}(r, n, \nu) = \operatorname{dualWeyl}_{\mathbb{Q}}(r, n, \nu).
$$
:::

::: proof
Under the positive-definite Fock pairing ([@lem-fock-pos]), `weyl` is the smallest divided-power closed submodule containing the highest-weight vector. By adjointness ([@lem-fock-adj]) and grading ([@lem-rowdiv-graded]), any nonzero element in its orthogonal complement inside `dualWeyl` raises to a nonzero highest-weight vector orthogonal to `hw`, contradicting highest-weight uniqueness (`hwLine`). The full proof is checked by the Lean kernel.
:::

::: {.corollary #cor-weyl-rational title="Integral clearing of denominators for dual Weyl elements" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.weylRational"}
For all $n \le r$, every antitone weight $\nu$, and every integral element $f \in \operatorname{dualWeyl}_{\mathbb{Z}}(r, n, \nu)$, there exists a nonzero integer $c \neq 0$ such that
$$
c \cdot f \in \operatorname{weyl}_{\mathbb{Z}}(r, n, \nu).
$$
:::

::: proof
Embed $f$ into the rational module $\operatorname{dualWeyl}_{\mathbb{Q}}$, express it in the rational Weyl basis via [@thm-weyl-eq-nabla], and clear a common integer denominator $c \neq 0$ back into $\operatorname{weyl}_{\mathbb{Z}}$. The full proof is checked by the Lean kernel.
:::

See what this machine guarantees? **No matter how high you stack algebraic multiplicity over $\mathbb{Z}$, your integral structures never spring a rational-denominator leak.**

Yet having a leak-proof algebraic container still leaves the central creative mystery unanswered: when staring at a von Mangoldt prime sum of length $X$, where do we find a machine that actually manufactures $m \sim \sqrt{X}$ layers of multiplicity natively in the automorphic world?

> When a single space cannot bear the multiplicity you need, do not force one ruler harder—chain a sequence of mirrors so each reflection buys one more order of vanishing.

In the next chapter, we meet the signature leap of the entire proof: chaining $\sqrt{X}$ unitary theta lifts end to end.
