# Chapter 4 A Chain of $\sqrt{X}$ Mirrors: Iterated Theta Lifts and the Seesaw Law

> One mirror reflects you once; line up $\sqrt{X}$ mirrors in a corridor, and every bounce hands you one more order of differentiation—then a quick flip of the seesaw at the far end unties the whole bundle of characters at once.

Arguably the single most electric line in the author's announcement note asks one simple design question: given a von Mangoldt prime sum of length $X$, how many theta lifts should you chain together so that each link simulates one more derivative inside the automorphic world?

The answer:

$$
m \sim \sqrt{X}.
$$

Step back for a second and ask *why* $\sqrt{X}$ is the magic scale.

Inside a prime sum of length $X$, $X$ integers are pushing against your bound. A tiny fixed multiplicity like $m = 2$, $m = 3$, or even $\ln X$ has nowhere near enough leverage to pin the ripples down to $\sigma = \frac{1}{2}$—it is like trying to hold back a tide with a coffee spoon. Go too far the other way, say $m \sim X$, and the cumulative height, level, and covolume cost of the lifts blows up your budget long before you finish! Only right along the knife-edge **$m \sim \sqrt{X}$** do the gains of multiplicity and the cost of lifting balance into a straight shot toward $\frac{1}{2}$.

## 4.1 What Is a Theta-Lift Chain? Each Reflection Buys One More Derivative {#sec-ch04-theta-chain}

First let us strip the scary phrase "iterated theta lifts between totally definite unitary groups" down to plain sight.

Paradoxically, "totally definite" is the **friendliest, tightest** kind of unitary group you could ask for. Unlike noncompact hyperbolic groups that shoot off to infinite cusps, a totally definite unitary group is compact at every infinite place—like a smooth closed sphere. Automorphic forms on it are literally just functions evaluated on finitely many equivalence classes of Hermitian lattices!

What does a single theta lift $U(X_j) \to U(X_{j+1})$ actually do? Think of it as a two-sided projection machine: on the left sits a function $f$ living on the lattices of $U(X_j)$; in the middle sits a theta kernel matrix $K_j(i, y)$; summing across the finite set of lattice class representatives sends $f$ to

$$
(\text{lifted function})(y) = \sum_{i} w_i\, f(i)\, K_j(i, y).
$$

In representation-theoretic terms, each step replaces $\pi$ by $\pi \boxplus \mu_j[t]$, appending one more layer of multiplicity tied to a Hecke character $\mu_j$. Chain $m$ of these kernels end to end:

$$
U(X_0) \longrightarrow U(X_1) \longrightarrow U(X_2) \longrightarrow \cdots \longrightarrow U(X_m),
$$

and you manufacture **automorphic multiplicity of order $m$** without ever begging the integers for a calculus derivative they cannot give!

::: {.figure src="ch04-theta-chain"}
**Left: the $\sqrt{X}$-step iterated theta-lift chain; Right: the Seesaw diamond converting lifted periods to Hecke-independent Bessel periods.** On the left, each green theta kernel adds one step of multiplicity along the cyan chain of definite unitary groups (amber marks the active transfer link) until reaching $U(X_m)$. On the right, the Seesaw identity flips the left-leg lifted period—which still drags along the Hecke characters—into an equal right-leg Bessel period free of those characters.
:::

Inside `Formalism/ThetaLiftIndependence`, [`ChainScalar.lean`](lean:Formalism/ThetaLiftIndependence/ThetaOrbitSums/ChainScalar.Formalism.ThetaLiftIndependence.ChainScalarLemmas.mem), [`LatLiftIndep.lean`](lean:Formalism/ThetaLiftIndependence/ThetaOrbitSums/LatLiftIndep.Formalism.ThetaLiftIndependence.latLiftIndep), and [`FinalThetaLiftAMFKIndep.lean`](lean:Formalism/ThetaLiftIndependence/FinalThetaLiftAMFKIndep.Formalism.ThetaLiftIndependence.final_gaussOp) weld three critical invariants of this chain in crisp finite-dimensional linear algebra:

1. **The chain stays inside integral/lattice submodules** all the way to step $m$;
2. **The lift sum is completely independent of which lattice class representatives you pick**;
3. **Finite-field Gauss operators invert cleanly** up to the field cardinality $|\mathbb{F}|$.

::: {.lemma #lem-chain-scalar-mem title="Adjoint stability along an $m$-step iterated chain" lean="Formalism/ThetaLiftIndependence/ThetaOrbitSums/ChainScalar.Formalism.ThetaLiftIndependence.ChainScalarLemmas.mem"}
Let $T_j : E_{j+1} \to E_j$ be a family of linear maps between finite-dimensional inner product spaces, and let $S_j \le E_j$ be submodules. If every single step satisfies $T_j^*(x) \in S_{j+1}$ for all $x \in S_j$, then for every chain length $m \in \mathbb{N}$ and every $x \in S_0$,
$$
(\mathrm{downChain}_T(m))^*(x) \in S_m.
$$
:::

::: proof
By induction on $m$: at $m = 0$ the adjoint of the identity keeps $x \in S_0$; for $m + 1$, the rule $(A \circ B)^* = B^* \circ A^*$ splits the step into the length-$m$ adjoint followed by $T_m^*$, preserving membership in $S_{m+1}$. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-lat-lift-indep title="Lattice-lift sums do not depend on class representatives" lean="Formalism/ThetaLiftIndependence/ThetaOrbitSums/LatLiftIndep.Formalism.ThetaLiftIndependence.latLiftIndep"}
Let $K$ be a number field, $V$ a $K$-vector space, and $h$ a Hermitian form on $V$. Whenever $f$ and $\Theta$ are invariant under the isometry group $\operatorname{Isom}(h)$, any two valid sets of class representatives $s, s'$ for a lattice $L$ yield the exact same lift sum:
$$
\operatorname{latLift}(h, s, f, \Theta) = \operatorname{latLift}(h, s', f, \Theta).
$$
:::

::: proof
Any two systems of class representatives $s$ and $s'$ stand in explicit bijection via elements of $\operatorname{Isom}(h)$ (uniqueness of paired representatives uses invariance of stabilizers under conjugation); since weights, $f$, and $\Theta$ are isometry-invariant, both sums match term by term. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-final-gauss-op title="Duality and inversion of finite-field Gauss operators" lean="Formalism/ThetaLiftIndependence/FinalThetaLiftAMFKIndep.Formalism.ThetaLiftIndependence.final_gaussOp"}
Let $\mathbb{F}$ be a finite field, $\psi$ a nontrivial additive character of $\mathbb{F}$, and $\rho : \mathbb{F}^\times \to \operatorname{End}_{\mathbb{C}}(V)$ a representation. For every vector $v \in V$ satisfying $\sum_{c \in \mathbb{F}^\times} \rho(c) v = 0$, the Gauss operator and its dual recover $v$ scaled by $|\mathbb{F}|$:
$$
\operatorname{gaussOp}(\psi, \rho)\bigl(\operatorname{gaussOpDual}(\psi, \rho)(v)\bigr) = |\mathbb{F}| \cdot v,
\qquad
\operatorname{gaussOpDual}(\psi, \rho)\bigl(\operatorname{gaussOp}(\psi, \rho)(v)\bigr) = |\mathbb{F}| \cdot v.
$$
:::

::: proof
Expanding the double sum and applying additive character orthogonality produces $|\mathbb{F}| - 1$ on the diagonal $a = 1$ plus $-1$ times $\sum_{c \neq 0, c \neq 1} \rho(c)v$; using $\sum_{c \in \mathbb{F}^\times} \rho(c)v = 0$ turns that sum into $+1 \cdot v$, yielding $|\mathbb{F}| \cdot v$. The full proof is checked by the Lean kernel.
:::

## 4.2 The Seesaw Law, Big-Cell Minors, and Formal Degrees {#sec-ch04-seesaw-bessel}

Suppose you have built all $m \sim \sqrt{X}$ links of the chain up to $U(X_m)$. An immediate headache remains: **the period integral on $U(X_m)$ is still tangled up with the sequence of auxiliary Hecke characters $\mu_1, \dots, \mu_m$!** As $m$ grows, tracking character twists inside the integral looks fatal.

How do you snap off those clinging Hecke characters in one motion?

With the **Seesaw law** (Rallis inner product identity).

Think of a literal playground seesaw: if a heavy kid sits on the left end and a lighter kid balances on the right end, you do not have to wedge a bathroom scale under the heavy kid—you can measure the counterweight sitting on the opposite leg! In a diamond of dual reductive pairs:

- the **left leg** measures the period of the $m$-fold iterated lift, which explicitly carries the Hecke characters;
- the **right leg** swaps the pairing across the diamond and reads the exact same number as a **Bessel period** on a companion group—which turns out to be **completely independent of the Hecke characters**!

To make that seesaw balance quantitatively—so lower bounds on norm and divisibility propagate cleanly back down the chain—two exact structural calculations do the heavy lifting: the principal minors on the big cell (`bigCellMinors`) and the Harish-Chandra formal degree (`fdegDimV`), both verified in `Formalism/FormalDegreeBessel`:

::: {.theorem #thm-big-cell-minors title="Leading principal minors on the big cell" lean="Formalism/FormalDegreeBessel/FinalBF.Formalism.QuantumDeterminants.bigCellMinors"}
For $k, r \in \mathbb{N}$, vectors $z, z' \in \mathbb{C}^{2r+k+1}$ satisfying the isotropic frame hypothesis `inWb`, diagonal parameters $c \in \mathbb{C}^r$, and unitary block $\mu \in M_{k+1}(\mathbb{C})$, the big-cell matrix `bigCell k r c μ` satisfies
$$
D_l\bigl(\operatorname{bigCell}(k, r, c, \mu)\bigr) = \prod_{a < l} c_a \qquad (0 \le l \le r),
$$
with ratio minors recovering $c_a$ when every $c_a \neq 0$, and the pairing zeta function reducing to the canonical Hermitian form.
:::

::: proof
Under the `inWb` isotropic basis splitting, `bigCell` factors cleanly into upper/lower block triangular components and the central unitary block $\mu$, making every $l$-th leading principal determinant an immediate product of the first $l$ entries $c_a$. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-fdeg-dim-v title="Harish-Chandra formal degree formula" lean="Formalism/FormalDegreeBessel/FdegFactorial.Formalism.QuantumDeterminants.fdegDimV"}
For every $n \in \mathbb{N}$ and every strictly decreasing Harish-Chandra parameter $\lambda_0 > \lambda_1 > \dots > \lambda_{n-1}$, the formal degree equals the Vandermonde product divided by consecutive factorials:
$$
\operatorname{fdeg}(\lambda) = \frac{\displaystyle\prod_{0 \le a < b < n} (\lambda_a - \lambda_b)}{\displaystyle\prod_{i=0}^{n-1} i!}.
$$
:::

::: proof
Strict monotonicity turns every $|\lambda_a - \lambda_b|$ into $\lambda_a - \lambda_b$, and reordering the product $\prod_{0 \le a < b < n}(b - a)$ yields $\prod_{i=0}^{n-1} i!$ (`formal_degree_factorial_holds`). The full proof is checked by the Lean kernel.
:::

Now we have a $\sqrt{X}$-step mirror chain and a seesaw that sheds the Hecke characters at the top. Surely the road to $\sigma = \frac{1}{2}$ is open?

Not yet. When you actually tally up the covolume and height cost of every lift step along a single character, you hit a brutal surprise—**the single-character budget stalls dead at $\sigma = \frac{2}{3}$!**

> Every single-handed strategy eventually hits an honest fractional ceiling. Two-thirds is not bad luck; it is the exact price limit of standing alone.

In the next chapter, we use lattice slopes and Bost's inequality to put that $2/3$ ceiling under a microscope—and then smash right through it by gluing integral structures across an entire family of Hecke characters.

::: {.viz src="theta-chain-budget" preset="root-x-glued" height="500"}
**The $\sqrt{X}$ mirror chain vs. the $2/3$ ceiling:** The zigzag mirror corridor $U(X_0) \to \dots \to U(X_m)$ and violet seesaw rhombus trade a character-tangled lifted period for a clean Bessel period, while the `MODEL` threshold plot shows the glued-family curve crossing below $2/3$ down to $\sigma = 0.5002$ at $b = m/\sqrt{X} = 3.5$ as single-character lifting stalls at $2/3$.
:::
