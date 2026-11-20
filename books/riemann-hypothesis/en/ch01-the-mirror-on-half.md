# Chapter 1 The Mirror at One-Half: Why Clearing the Right Half-Plane Suffices

> Never wrestle two shadows at once. Polish the mirror, clear the right-hand room, and the ghosts on the left vanish on their own.

Ask a friend who took calculus what the Riemann Hypothesis says, and they will usually sketch the complex plane, draw a vertical line at $\operatorname{Re}(s) = \frac{1}{2}$, and say: "Every nontrivial zero of $\zeta(s)$ sits right on that line."

That makes it sound like a razor-thin equality problem—as if you must somehow pinch every zero from the right *and* from the left at the same time.

You don't. **You only ever have to clear one half of the strip; the other half comes for free.**

The reason is a sharp two-way mirror built into $\zeta(s)$ and every primitive Dirichlet $L$-function: the **functional equation**. Whenever you swap $s$ for $1 - s$, the real part $\sigma$ flips to $1 - \sigma$:

- a point on the right at $\sigma = 0.76$ mirrors to the left at $1 - 0.76 = 0.24$;
- a point on the left at $\sigma = 0.24$ bounces right back to $0.76$;
- the only points left motionless in the glass satisfy $\sigma = 1 - \sigma$, which is $\sigma = \frac{1}{2}$.

That is the **first great lever** of the proof: it turns a delicate equality claim ($\operatorname{Re}(s) = \frac{1}{2}$) into a clean exclusion claim—prove that the right half-plane $\operatorname{Re}(s) > \frac{1}{2}$ contains **not a single zero**.

::: {.figure src="ch01-critical-mirror"}
**The symmetry mirror in the complex plane.** The pale cyan band is the critical strip $0 < \operatorname{Re}(s) < 1$, bisected by the green critical line $\operatorname{Re}(s) = 1/2$. A hypothetical amber zero $\rho$ at $\operatorname{Re}(\rho) = 0.76$ immediately casts a magenta reflection $1 - \bar\rho$ at $\operatorname{Re} = 0.24$. Trivial zeros at $-2, -4$ come from the Gamma factor, while the extra Euler factors of an imprimitive character vanish only on the violet boundary $\operatorname{Re}(s) = 0$, never entering the strip.
:::

## 1.1 What the Five Headline Theorems Actually Claim {#sec-ch01-five-headlines}

Open the entry file [`Main.lean`](lean:Main.riemannHypothesis) of the formalization, and all 17.37 million lines funnel into five crystal-clear headline theorems. Let us place all five on the table with complete precision—no hype, no hidden footnotes.

::: {.theorem #thm-main-rh title="The Riemann Hypothesis" lean="Main.riemannHypothesis"}
Mathlib's standard statement `RiemannHypothesis` holds: for every complex number $s \in \mathbb{C}$, if $\zeta(s) = 0$, $s$ is not a negative even integer $-2(n+1)$ ($n \in \mathbb{N}$), and $s \neq 1$, then
$$
\operatorname{Re}(s) = \frac{1}{2}.
$$
:::

::: proof
In the formalization, [`Main.riemannHypothesis`](lean:Main.riemannHypothesis) follows directly from the stronger right-half-plane nonvanishing theorem for all Dirichlet $L$-functions ([@thm-main-l-right]) via [@thm-rh-of-right]. The full proof is checked by the Lean kernel.
:::

The second headline theorem writes out Mathlib's definition explicitly so every excluded point—the negative even trivial zeros and the pole at $s = 1$—is visible in plain sight:

::: {.theorem #thm-main-zeta-line title="Nontrivial zeros of $\zeta$ lie on the critical line" lean="Main.riemannZeta_eq_zero_re"}
For every $s \in \mathbb{C}$, if $\zeta(s) = 0$, there is no $n \in \mathbb{N}$ with $s = -2(n+1)$, and $s \neq 1$, then $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
Equivalent to [@thm-main-rh], deduced directly from right-half-plane nonvanishing for every Dirichlet character. The full proof is checked by the Lean kernel.
:::

The true workhorse is the third theorem: instead of tackling $\zeta(s)$ alone, it sweeps the right half-plane clean for **every modulus $N \ge 1$ and every Dirichlet character $\chi$**:

::: {.theorem #thm-main-l-right title="Right-half-plane nonvanishing for all Dirichlet $L$-functions" lean="Main.LFunction_ne_zero_of_half_lt_re"}
For every positive integer $N \ge 1$, every Dirichlet character $\chi$ modulo $N$, and every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \frac{1}{2}$ and ($\chi \neq 1$ or $s \neq 1$),
$$
L(\chi, s) \neq 0.
$$
:::

::: proof
This is the grand confluence of the entire formalization (whose machinery Chapters 2–6 trace step by step). Specializing to $N = 1$ and the trivial character $\chi = 1$ recovers $\zeta(s) \neq 0$ for $\operatorname{Re}(s) > \frac{1}{2}$, $s \neq 1$. The full proof is checked by the Lean kernel.
:::

Once [@thm-main-l-right] is in hand, the mirror locks the critical-strip zeros of every Dirichlet $L$-function—imprimitive and primitive alike—onto $\operatorname{Re}(s) = \frac{1}{2}$:

::: {.theorem #thm-main-l-strip title="Generalized Riemann Hypothesis for all Dirichlet $L$-functions" lean="Main.LFunction_eq_zero_re"}
For every positive integer $N \ge 1$, every Dirichlet character $\chi$ modulo $N$, and every $s \in \mathbb{C}$ with $0 < \operatorname{Re}(s) < 1$, if $L(\chi, s) = 0$, then $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
Follows from [@thm-main-l-right] and [@thm-claim-strip]: reduce any imprimitive character to its underlying primitive character, then reflect zeros in $0 < \operatorname{Re}(s) < \frac{1}{2}$ to $\operatorname{Re}(1-s) > \frac{1}{2}$. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-main-l-prim title="Critical line theorem for primitive Dirichlet $L$-functions" lean="Main.LFunction_eq_zero_re_of_isPrimitive"}
For every positive integer $N \ge 1$, every primitive Dirichlet character $\chi$ modulo $N$, and every $s \in \mathbb{C}$ with $0 < \operatorname{Re}(s) < 1$, if $L(\chi, s) = 0$, then $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
Immediate from [@thm-main-l-right] via the primitive functional-equation reflection [@thm-crit-line]. The full proof is checked by the Lean kernel.
:::

::: remark
Keep the scope honest: "GRH" here covers **Dirichlet $L$-functions** for every modulus and every character. It does not automatically prove the Extended Riemann Hypothesis for general Dedekind zeta functions or higher-rank automorphic $L$-functions, which remain marked open in the [Coda](coda.md).
:::

## 1.2 How the Mirror Works: From Half-Plane to Critical Line {#sec-ch01-how-mirror-works}

Do not rush past this reduction—it is one of the cleanest arguments in all of analysis, and you can verify every moving part on a napkin.

Suppose you already know that $\zeta(s)$ never vanishes for $\operatorname{Re}(s) > \frac{1}{2}$ ($s \neq 1$). Now pick any nontrivial zero $s$ of $\zeta$ ($s \neq 1$, $s \neq -2, -4, \dots$). Its real part $\operatorname{Re}(s)$ has only three possibilities:

1. **$\operatorname{Re}(s) > \frac{1}{2}$**: immediately ruled out.
2. **$\operatorname{Re}(s) = \frac{1}{2}$**: done!
3. **$\operatorname{Re}(s) < \frac{1}{2}$**: look across the mirror at $1 - s$. Its real part is $1 - \operatorname{Re}(s) > \frac{1}{2}$, landing square inside the cleared right half-plane.

Now ask the sharp question most popular accounts gloss over: **does $\zeta(s) = 0$ actually force $\zeta(1-s) = 0$?**

Check the functional equation carefully:

$$
\zeta(s) = 2^s \pi^{s-1} \sin\!\left(\frac{\pi s}{2}\right) \Gamma(1-s)\, \zeta(1-s).
$$

Four factors multiply on the right. When the left side is zero, *some* factor on the right must vanish—not necessarily $\zeta(1-s)$, unless we rule out the other three! Let us check them one by one:

- $2^s \pi^{s-1}$ is an exponential, so it is never zero.
- Since $\operatorname{Re}(s) < \frac{1}{2}$, we have $\operatorname{Re}(1-s) > \frac{1}{2} > 0$, where the Gamma function $\Gamma(1-s)$ has neither poles nor zeros.
- The only factor that can sneakily vanish is $\sin(\frac{\pi s}{2})$, which hits zero precisely at the even integers $s = 0, -2, -4, -6, \dots$
  - At $s = 0$, $\zeta(0) = -\frac{1}{2} \neq 0$, so $0$ is not a zero.
  - At $s = -2, -4, -6, \dots$, those are precisely the **trivial zeros** excluded by the definition of the Riemann Hypothesis!

With every imposter factor proved nonzero, $\zeta(s) = 0$ drags $\zeta(1-s) = 0$ down with it—contradicting right-half-plane nonvanishing. Two Lean theorems capture this exact mechanism:

::: {.theorem #thm-rh-of-right title="Clearing the right half-plane implies the Riemann Hypothesis" lean="Formalism/GammaFactorNonvanishing/RhOfRight.Formalism.VW.rh_of_right"}
If $\zeta(s) \neq 0$ for every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \frac{1}{2}$ and $s \neq 1$, then the Riemann Hypothesis holds.
:::

::: proof
For any nontrivial zero $s$ ($s \neq 1$, $s \neq -2(n+1)$), compare $\operatorname{Re}(s)$ with $\frac{1}{2}$. The case $\operatorname{Re}(s) > \frac{1}{2}$ contradicts the hypothesis. If $\operatorname{Re}(s) < \frac{1}{2}$, first exclude $s = 0$ since $\zeta(0) = -1/2 \neq 0$; then apply `riemannZeta_one_sub` at $1 - s$. Because $\operatorname{Re}(1-s) > \frac{1}{2}$, the factors $2(2\pi)^{-(1-s)}$, $\Gamma(1-s)$, and $\cos(\pi(1-s)/2)$ are all nonzero (vanishing of the cosine corresponds precisely to $s = 0$ or a negative even integer), forcing $\zeta(1-s) = 0$, a contradiction. The full proof is checked by the Lean kernel.
:::

A companion module [`RHofHalfPlane.lean`](lean:Formalism/ZetaNonvanishing/RHofHalfPlane.Formalism.riemannHypothesis_of_zero_free_halfPlane) explicitly verifies $\zeta(-(2m+1)) \neq 0$ at negative odd integers to give the equivalent reduction:

::: {.proposition #prop-rh-halfplane title="Half-plane reduction with explicit negative-integer check" lean="Formalism/ZetaNonvanishing/RHofHalfPlane.Formalism.riemannHypothesis_of_zero_free_halfPlane"}
If $\zeta(s) \neq 0$ for every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \frac{1}{2}$, then the Riemann Hypothesis holds.
:::

::: proof
When $\operatorname{Re}(s) < \frac{1}{2}$, negative even integers are excluded by hypothesis, $s = 0$ by $\zeta(0) \neq 0$, and negative odd integers by reflecting to positive even integers where $\zeta \neq 0$; every remaining point reflects across $s \mapsto 1 - s$ into $\operatorname{Re} > \frac{1}{2}$. The full proof is checked by the Lean kernel.
:::

::: {.viz src="critical-mirror" preset="off-line" height="500"}
**Interactive critical-line mirror:** The green critical line $\operatorname{Re}(s) = \frac{1}{2}$ holds the first nontrivial zero $\frac{1}{2} + 14.1347i$, while the amber test point $\rho = 0.76 + 10i$ spawns its reflected twin $1 - \bar{\rho} = 0.24 + 10i$ (magenta) across $\frac{1}{2}$. Drag $\rho$ directly on the complex plane or switch cards to watch how clearing the right half locks the mirror.
:::

## 1.3 What Happens When a Character Is Imprimitive? {#sec-ch01-imprimitive}

For $\zeta(s)$, the mirror works cleanly right out of the box. What about a general Dirichlet character $\chi$ modulo $N$?

Here sits a subtle obstacle. Not every Dirichlet character obeys a clean functional equation: only **primitive** characters satisfy the completed symmetry $\Lambda(\chi, s) = \varepsilon(\chi)\,\Lambda(\chi^{-1}, 1-s)$.

What does "imprimitive" mean in plain English? Think of a character modulo $12$ that really only cares about remainders modulo $4$, except it arbitrarily zeroes out multiples of $3$. In terms of $L$-functions, that modulo-$12$ function is just its underlying primitive modulo-$4$ function multiplied by a finite product of extra **Euler factors**:

$$
L(\chi, s) = L(\chi^{\mathrm{prim}}, s) \prod_{p \mid N} \bigl(1 - \chi^{\mathrm{prim}}(p)\, p^{-s}\bigr).
$$

Immediately a cautious reader asks: what if one of those extra factors $1 - \chi^{\mathrm{prim}}(p)\, p^{-s}$ vanishes somewhere inside the critical strip $0 < \operatorname{Re}(s) < 1$, creating a rogue zero that the primitive mirror cannot touch?

Check the size of the second term in two seconds! For any prime $p \ge 2$ and any $s$ with $\operatorname{Re}(s) > 0$, we have $|\chi^{\mathrm{prim}}(p)| \le 1$ and

$$
|p^{-s}| = p^{-\operatorname{Re}(s)} < p^0 = 1.
$$

So $|\chi^{\mathrm{prim}}(p)\, p^{-s}| < 1$ strictly—it can **never** equal $1$! Every zero of an extra Euler factor is welded to the vertical edge $\operatorname{Re}(s) = 0$ and can never step inside $0 < \operatorname{Re}(s) < 1$.

> Half the monsters in mathematics dissolve the instant you measure their modulus: they cannot even cross the threshold.

Three short Lean results seal the entire reduction from right half-plane to critical line for every Dirichlet character:

::: {.lemma #lem-euler-factor-ne-zero title="Extra Euler factors never vanish for $\operatorname{Re}(s) > 0$" lean="Development/AutomorphicArithmetic/CharacterBoxes/ClaimStrip.Claim.factor_ne_zero"}
For any modulus $M$, any Dirichlet character $\psi$ modulo $M$, any prime $p$, and any $s \in \mathbb{C}$ with $\operatorname{Re}(s) > 0$,
$$
1 - \psi(p)\, p^{-s} \neq 0.
$$
:::

::: proof
Since $|\psi(p)| \le 1$ and $\operatorname{Re}(s) > 0$, we have $|p^{-s}| = p^{-\operatorname{Re}(s)} < 1$, hence $|\psi(p) p^{-s}| < 1$ and $1 - \psi(p)p^{-s}$ cannot vanish. The full proof is checked by the Lean kernel.
:::

::: {.lemma #lem-prim-reflect title="Critical-strip reflection for primitive characters" lean="Development/AutomorphicArithmetic/CharacterBoxes/ClaimStrip.Claim.prim_reflect"}
Let $\psi$ be a primitive Dirichlet character modulo $M \ge 1$. If $0 < \operatorname{Re}(s) < 1$ and $L(\psi, s) = 0$, then
$$
L(\psi^{-1}, 1 - s) = 0.
$$
:::

::: proof
Because $\operatorname{Re}(s) > 0$, the Gamma factor of $\psi$ is nonzero, so $L(\psi, s) = 0$ forces the completed $L$-function $\Lambda(\psi, s) = 0$. The primitive functional equation gives $\Lambda(\psi^{-1}, 1 - s) = 0$, and dividing back by the nonzero Gamma factor at $\operatorname{Re}(1-s) > 0$ yields $L(\psi^{-1}, 1 - s) = 0$. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-crit-line title="Half-plane to critical line for primitive characters" lean="Formalism/GammaFactorNonvanishing/CritLine.Formalism.VW.critLine"}
If $L(\chi, s) \neq 0$ for every modulus $N \ge 1$, every Dirichlet character $\chi$, and every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \frac{1}{2}$ (excluding $\chi = 1, s = 1$), then every zero of every primitive Dirichlet $L$-function in $0 < \operatorname{Re}(s) < 1$ satisfies $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
Assume for contradiction that a zero $s$ in the strip has $\operatorname{Re}(s) \neq \frac{1}{2}$. The case $\operatorname{Re}(s) > \frac{1}{2}$ directly violates the hypothesis; if $\operatorname{Re}(s) < \frac{1}{2}$, reflecting via the completed $L$-function produces a zero of $L(\chi^{-1}, \cdot)$ at $1 - s$ with $\operatorname{Re}(1 - s) > \frac{1}{2}$ and $1 - s \neq 1$, again a contradiction. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-claim-strip title="Critical-strip reduction for all Dirichlet characters" lean="Development/AutomorphicArithmetic/CharacterBoxes/ClaimStrip.Claim.strip"}
If every Dirichlet $L$-function is nonzero on $\operatorname{Re}(s) > \frac{1}{2}$ (excluding $\chi = 1, s = 1$), then for every modulus $N \ge 1$ and every Dirichlet character $\chi$ (primitive or imprimitive), every zero of $L(\chi, s)$ with $0 < \operatorname{Re}(s) < 1$ satisfies $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
By [@lem-euler-factor-ne-zero], any zero of $L(\chi, s)$ in $0 < \operatorname{Re}(s) < 1$ must be a zero of its underlying primitive character $L(\chi^{\mathrm{prim}}, s)$; [@lem-prim-reflect] then reflects any zero with $\operatorname{Re}(s) < \frac{1}{2}$ into the cleared right half-plane. The full proof is checked by the Lean kernel.
:::

Now the battlefield is completely clear. We no longer have to pin anything down to an exact equality. One single target remains:

**How do you prove that no Dirichlet $L$-function can touch zero anywhere in $\operatorname{Re}(s) > \frac{1}{2}$?**

In the next chapter, Edmund Landau pulls those elusive complex zeros right down onto the real number line—into an explicit prime ledger with a sign trap.
