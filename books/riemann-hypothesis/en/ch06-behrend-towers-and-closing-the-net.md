# Chapter 6 Behrend Towers and Closing the Net: Taming Obstructions Across All Characters

> Place integers on a high-dimensional sphere shell: because a sphere curves strictly outward, no three distinct points on the shell can ever form an evenly spaced straight line—yet the heaviest shell still captures a remarkably dense crowd of numbers. Combine that resonance-free selection with local-global Galois control, and the net tightens over every Dirichlet character at once.

By the end of Chapter 5, we had the engine to shatter the $2/3$ ceiling: a $\sqrt{X}$-step theta-lift chain glued across families of Hecke characters. Yet turning that engine loose on **every modulus $N$ and every Dirichlet character $\chi$** still faces two last pockets of resistance:

1. **Arithmetic-progression resonances inside tower levels**: when choosing Iwasawa tower levels or parameter shifts, accidental three-term arithmetic progressions $s_2 - s_1 = s_3 - s_2$ (or linear relations $\alpha s_1 + \beta s_2 + \gamma s_3 = 0$) let error waves line up in phase and reinforce one another.
2. **Stubborn Galois cohomology classes**: classes in $H^1(\mathfrak{o}_E[1/\ell], \mathbb{Q}_\ell/\mathbb{Z}_\ell(-e))$ that refuse to vanish under character twisting—requiring a substantial weakening of Vandiver's conjecture and sharp local-global Langlands compatibility to keep under polynomial control.

## 6.1 Why an Integer Sphere Shell Never Holds a 3-Term Arithmetic Progression {#sec-ch06-behrend-sphere}

Start with a pocket-sized gem discovered by Felix Behrend in 1946: **how to pack a dense crowd of integers while forbidding any three-term arithmetic progression $a, b, c$ ($b = \frac{a+c}{2}$).**

Picture the $5 \times 5 \times 5$ integer cube $\{0, 1, 2, 3, 4\}^3$ containing $125$ lattice points. Group those points by squared radius $R = x_1^2 + x_2^2 + x_3^2$. Since $0 \le R \le 3 \cdot 4^2 = 48$ and not every integer is a sum of three squares, the $125$ points land on only $32$ distinct spherical shells!

By the plain pigeonhole principle, some shell must hold at least $\lceil 125 / 32 \rceil = 4$ points. In fact, computing all shells reveals a champion shell at $R = 17$ carrying **9 points**:

$$
(0, 1, 4),\; (0, 4, 1),\; (1, 0, 4),\; (1, 4, 0),\; (2, 2, 3),\; (2, 3, 2),\; (3, 2, 2),\; (4, 0, 1),\; (4, 1, 0).
$$

Now check by pure geometry: **can any three points $A, B, C$ on that shell satisfy $B = \frac{A+C}{2}$?**

Impossible! A sphere is **strictly convex**. Take any two distinct points $A \neq C$ of squared length $R$. Their midpoint $B = \frac{A+C}{2}$ sits **strictly inside** the sphere:

$$
\|B\|^2 = \frac{\|A\|^2 + \|C\|^2}{2} - \frac{\|A-C\|^2}{4} = R - \frac{\|A-C\|^2}{4} < R.
$$

So $B$ can never touch the shell of radius $\sqrt{R}$! Encode each 3D vector $(x_1, x_2, x_3)$ in base $B > 8$ as a single integer $x_1 + x_2 B + x_3 B^2$ (no carries mix between digits), and the sphere shell instantly becomes an **integer set with zero 3-term arithmetic progressions**—and in high dimension $d$, its size hits the astonishing density $N \exp(-C\sqrt{\ln N})$, dodging resonances while barely sacrificing capacity!

::: {.viz src="behrend-sphere" preset="ap-forbidden" height="500"}
**The 3D Behrend sphere excludes 3-term arithmetic progressions:** On the translucent glass sphere $R = 17$ inside $\{0, \dots, 4\}^3$ sit exactly 9 lattice beads (cyan). Picking amber endpoints $a = (0,1,4)$ and $b = (2,3,2)$ sends their chord midpoint $m = (1,2,3)$ (magenta) strictly inside the sphere at $\|m\|^2 = 14 < 17$—guaranteeing zero 3-term arithmetic progressions.
:::

Using such thick Behrend sets together with probabilistic derandomization (`select`) and Galois stabilizer rigidity (`trivStab`), the proof selects clean levels while keeping finite stabilizers trivial:

::: {.theorem #thm-behrend-select title="Deterministic subset selection under binomial variance" lean="Formalism/BehrendSets/TranslateMean.Formalism.BehrendSets.Final.select"}
Let $X$ be a finite set, $\delta \in [0, 1]$, $Y : \mathcal{P}(X) \to \mathbb{R}_{\ge 0}$ a non-negative cost functional, and $\lambda > 0$ a margin satisfying $2 |X| \delta(1 - \delta) < \lambda^2$. Then there exists a subset $T \subseteq X$ simultaneously satisfying
$$
\bigl|\lvert T\rvert - \delta \lvert X\rvert\bigr| \le \lambda
\qquad \text{and} \qquad
Y(T) \le 2\,\mathbb{E}_{X,\delta}[Y].
$$
:::

::: proof
Equip $\mathcal{P}(X)$ with the $\delta$-weighted Bernoulli product measure. By Chebyshev's inequality the probability of $|T|$ deviating by more than $\lambda$ from $\delta|X|$ is strictly less than $1/2$, while by Markov's inequality the probability that $Y(T) > 2\,\mathbb{E}[Y]$ is at most $1/2$. Their sum is strictly under $1$, forcing a surviving subset $T$ satisfying both bounds. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-triv-stab title="Triviality of large prime-power subgroups in $\mathrm{GL}_k(E)$" lean="Formalism/BehrendSets/FinalE.Formalism.BehrendSets.FinalE.trivStab"}
Let $E$ be a number field, $k \in \mathbb{N}$, and $g$ a prime such that $[E:\mathbb{Q}]\cdot k < g - 1$. Then every finite $g$-subgroup $\Gamma \le \mathrm{GL}_k(E)$ is trivial:
$$
\Gamma = \{1\}.
$$
:::

::: proof
If $\Gamma$ were nontrivial, it would contain an element $\gamma$ of exact prime order $g$, forcing a primitive $g$-th root of unity into an extension of $E$ of degree at most $k$. Comparing against $[\mathbb{Q}(\zeta_g) : \mathbb{Q}] = g - 1$ contradicts $[E:\mathbb{Q}]\cdot k < g - 1$. The full proof is checked by the Lean kernel.
:::

## 6.2 From Local Langlands to Closing the Net {#sec-ch06-closing-the-net}

Now watch the final steel girders lock into place at the top of `src/Development/AutomorphicArithmetic/`:

::: {.figure src="ch06-proof-spine"}
**Top-level dependency spine of the proof.** Behrend selection and stabilizer rigidity (`trivStab`), local Langlands central-unit compatibility (`recTExists`), and local-global Galois integral structures (`galoisLocalGlobalStrong_recParameter`) feed the small-class-number Selmer bound (`corGK`) and dense threshold window engine (`zeroFreeAll_of_topG`), converging through `plugAll` and `everyCharacter` to right-half-plane nonvanishing and the Riemann Hypothesis.
:::

Six tightly interlocked Lean theorems seal the entire chain:

1. **Local Langlands and tame type laws**: [`RecTExists.lean`](lean:Development/AutomorphicArithmetic/Foundations/LocalLanglands/LocalCentralUnits/RecTExists.UpperTheory.Zero.LLC.recTExists) constructs the local Langlands map `rc` at every finite place, matching dimension, parabolic segments, supercuspidals, central characters, duality, and tame type polynomials.

::: {.theorem #thm-rec-t-exists title="Existence of local Langlands correspondence with type law" lean="Development/AutomorphicArithmetic/Foundations/LocalLanglands/LocalCentralUnits/RecTExists.UpperTheory.Zero.LLC.recTExists"}
The full local Langlands and tame-type package `UpperTheory.Zero.LLC.RecTExists` holds, furnishing a correspondence `rc` preserving dimension, one-dimensional characters, segment decompositions, cuspidal irreducibility, duality, injectivity, depth, and `TypeLaw`.
:::

::: proof
Starts from local Artin reciprocity and cuspidal correspondence, extends to general irreducible representations via `exists_isLExt`, and verifies central character norms, twists, depth preservation, and inertial characteristic polynomials. The full proof is checked by the Lean kernel.
:::

2. **Local-global Galois integral bridge**: [`RowSrc.lean`](lean:Development/AutomorphicArithmetic/Foundations/GaloisRepresentations/IntegralStructures/RowSrc.UpperTheory.Gal.Int.galoisLocalGlobalStrong_recParameter) feeds the theta-lift arithmetic parameters into the global integral structure axiom `Row0b`.

::: {.theorem #thm-row-src title="Strong local-global Galois integral structure from theta lifts" lean="Development/AutomorphicArithmetic/Foundations/GaloisRepresentations/IntegralStructures/RowSrc.UpperTheory.Gal.Int.galoisLocalGlobalStrong_recParameter"}
The strong local-global integral structure predicate `UpperTheory.GalStar.Row0b recT` holds.
:::

::: proof
Applies `galoisRepresentations_of_thetaLift` directly to the theta-lift construction `tLiftK`. The full proof is checked by the Lean kernel.
:::

3. **Small class numbers and the weakened Vandiver bound**: [`CorGKOf.lean`](lean:Development/AutomorphicArithmetic/AutomorphicVarieties/SmallClassNumbers/CorGKOf.UpperTheory.V.SmallClassNumbers.corGK) proves `CorGK`—controlling total log-weighted Bloch–Kato Selmer lengths across all primes $l$ by a polynomial bound $2 c_5 \varphi(H.\mathrm{index})(N(e+1))^A (\ln p + \ln p')$, so residual cohomology classes cannot derail the gluing budget.

::: {.theorem #thm-cor-gk title="Global Selmer-length bound across primes" lean="Development/AutomorphicArithmetic/AutomorphicVarieties/SmallClassNumbers/CorGKOf.UpperTheory.V.SmallClassNumbers.corGK"}
The global Selmer-length bound `UpperTheory.V.U3.CorGK` holds across number fields, level subgroups $H$, and finite prime sets $L_s$, bounding $\sum_{l \in L_s} \ln l \sum_\psi V_n$ by $2 c_5 \varphi(H.\mathrm{index})(N(e+1))^A(\ln p + \ln p')$.
:::

::: proof
Combines patched local-global cohomology inputs (`litN`) with Kato's Euler-system bounds, adjoint lifting, and admissible type-I reductions to deduce `PropGK`, then pairs two auxiliary good primes $p \neq p'$ to eliminate the single-prime exclusion. The full proof is checked by the Lean kernel.
:::

4. **Dense threshold windows across every primitive and imprimitive character**: [`ZeroFreeAllOfTopG.lean`](lean:Development/AutomorphicArithmetic/CharacterBoxes/ZeroFreeAllOfTopG.UpperTheory.Top.zeroFreeAll_of_topG) and [`EveryCharacter.lean`](lean:Development/AutomorphicArithmetic/CharacterBoxes/EveryCharacter.UpperTheory.Top.plugAll) assemble Behrend-filtered family windows, slope bounds, and local-global coherence first into `ZeroFreeAll` (all primitive characters) and then into `EveryCharacter` (all moduli and characters, imprimitive included).

::: {.theorem #thm-zero-free-topg title="Dense threshold connectivity implies primitive right-half-plane nonvanishing" lean="Development/AutomorphicArithmetic/CharacterBoxes/ZeroFreeAllOfTopG.UpperTheory.Top.zeroFreeAll_of_topG"}
For any step ratio $\lambda > 1$, the dense threshold connectivity property `TopG` together with host window existence `HostExW la (GChi ψ).req` for every primitive character $\psi$ implies `ZeroFreeAll`.
:::

::: proof
Extracts Landau-threshold lower bounds (`eFamC_of_cls`) and height bounds (`hypV_of_cls`) along connected family classes and applies `zeroFreeOn_of_tiedWin_cyc` across comparison scales. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-plug-all title="Assembly of right-half-plane nonvanishing for all Dirichlet characters" lean="Development/AutomorphicArithmetic/CharacterBoxes/EveryCharacter.UpperTheory.Top.plugAll"}
Given Green-type bounds `hG`, weakened Vandiver window control `hV : VWin`, and closed link design existence `h`, `UpperTheory.EveryCharacter` holds: $L(\chi, s) \neq 0$ for every modulus $N$, every character $\chi$, and every $\operatorname{Re}(s) > \frac{1}{2}$ ($\chi \neq 1$ or $s \neq 1$).
:::

::: proof
Combines [@thm-zero-free-topg] with `shapeWin` and `supplyChi` to establish `ZeroFreeAll` (`plugWin`), then applies `imprimitive` using the fact from Chapter 1 that extra Euler factors cannot vanish on $\operatorname{Re}(s) > 0$. The full proof is checked by the Lean kernel.
:::

5. **Unconditional finale**: [`MainConclusion.lean`](lean:Development/AutomorphicArithmetic/CharacterBoxes/MainConclusion.UpperTheory.FinalTheorems.everyCharacter) discharges every hypothesis unconditionally:

::: {.theorem #thm-every-character title="Unconditional right-half-plane nonvanishing for all Dirichlet $L$-functions" lean="Development/AutomorphicArithmetic/CharacterBoxes/MainConclusion.UpperTheory.FinalTheorems.everyCharacter"}
Unconditionally, for every $N \ge 1$, every Dirichlet character $\chi$ modulo $N$, and every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \frac{1}{2}$ and ($\chi \neq 1$ or $s \neq 1$), $L(\chi, s) \neq 0$.
:::

::: proof
Feeds the unconditional theorems [@thm-row-src] and [@thm-rec-t-exists] into `every_character_of_literature_of_vWin`, discharging `UpperTheory.EveryCharacter` with zero unproved assumptions. The full proof is checked by the Lean kernel.
:::

From the functional-equation mirror at $\operatorname{Re}(s) = \frac{1}{2}$, down into Landau's one-sided prime ledger, across Stepanov's Fock/Weyl multiplicity, along the $\sqrt{X}$ unitary theta chain and Seesaw flip, through Harder–Narasimhan slopes and glued Hecke structures past $2/3$, and finally through Behrend's sphere shell and global Selmer bounds—the proof's spine stands end to end.

Now ask the toughest engineering and scientific question left: **how can any mathematician trust a 17-million-line uncommented Lean repository without taking anyone's word for it?**

Chapter 7 opens the audit bay.

::: {.viz src="behrend-sphere" height="560"}
**The full Behrend sphere lab:** Rotate the 3D glass sphere and lattice cube $\{0, \dots, M-1\}^3$, vary the cube edge $M \in [3, 6]$ and squared-radius shell $R$, pick any two shell beads to inspect their interior midpoint drop, and explore the pigeonhole shell histogram below ($|S_{17}| = 9$ at $M = 5$).
:::
