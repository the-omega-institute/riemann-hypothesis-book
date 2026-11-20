# Chapter 7 Anatomy of 17 Million Lines: Independent Kernel Replay and Mathematical Honesty

> Anyone who hands you a 175,187-file, 17.37-million-line manuscript with zero comments and says "trust me" might as well be selling indulgences. Fortunately, formal verification lives by a colder, cleaner rule: **do not trust the author's word—replay the compiled output inside an empty kernel.**

If this proof were a ten-thousand-page PDF, a human referee board might need twenty years just to turn every page—and still could not swear that page 4,812 did not hide a dropped inequality or an unstated exception.

Before Lean 4's kernel, massive length buys zero immunity. Every single line must elaborate through the same rigid type checker. Even one hidden `sorry`, one custom `axiom`, or one sneaky rewrite of `RiemannHypothesis` would be caught instantly by a thirty-line challenge file.

## 7.1 The 35-Line Challenge Contract: How Verification Prevents Cheating {#sec-ch07-challenge-contract}

Inside the verification repository [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis), independent auditors placed an intentionally minimal challenge contract, `src/Challenge.lean`, importing **only** official Mathlib `v4.33.1` (pinned directly to commit `0df444a360ea`).

That contract does not care whether the proof inside uses unitary groups, CM elliptic curves, or moonbeams. It asks five blunt questions:

1. Does the type of `Main.riemannHypothesis` match Mathlib's native `RiemannHypothesis` **definitionally and verbatim**?
2. Do the other four headline theorems in `Main.lean` match the short Mathlib-only definitions copied into `Statements.lean`?
3. Across all 175,187 `.lean` files, is there zero occurrence of `sorry`, `admit`, `axiom`, `native_decide`, `unsafe`, `implemented_by`, `opaque`, `debug.*`, or `skipKernelTC`?
4. Do all nine dependencies in `lake-manifest.json` (`mathlib`, `batteries`, `aesop`, `Qq`, and their companions) point to untouched official upstream commits?
5. Inside an offline, read-only, networkless sandbox, do Lean's own kernel and independent standalone checkers (`leanchecker-paranoid`, `nanoda`, `con-leche`, `con-ron`, and `lean4lean`) replay the export from scratch and confirm that the axiom closure uses nothing outside `{propext, Classical.choice, Quot.sound}`?

> You may build a labyrinth seventeen million lines deep, yet the gatekeeper asks only two questions: did you solve the exact problem everyone agreed on, and did you stand on anything beyond standard axioms?

Here are the four headline assembly theorems collected in `Supplements/Kernels/MainTheorems.lean`, which feed straight into `Main.lean`:

::: {.theorem #thm-kernels-all-chi title="Kernel bundle: nonvanishing for every Dirichlet character" lean="Supplements/Kernels/MainTheorems.allChi"}
`UpperTheory.EveryCharacter` holds: for every modulus $N \ge 1$, every Dirichlet character $\chi$ modulo $N$, and every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \frac{1}{2}$ ($\chi \neq 1$ or $s \neq 1$), $L(\chi, s) \neq 0$.
:::

::: proof
In [`MainTheorems.lean`](lean:Supplements/Kernels/MainTheorems.allChi), directly invokes [@thm-every-character]. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-kernels-rh title="Kernel bundle: the Riemann Hypothesis" lean="Supplements/Kernels/MainTheorems.rhOfAll"}
Mathlib's `RiemannHypothesis` holds.
:::

::: proof
Feeds [@thm-kernels-all-chi] into [@thm-rh-of-right] via `Formalism.VW.rh_of_every`. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-kernels-crit title="Kernel bundle: critical line for primitive characters" lean="Supplements/Kernels/MainTheorems.critAll"}
For every modulus $N \ge 1$, every primitive Dirichlet character $\chi$ modulo $N$, and every $s \in \mathbb{C}$ with $0 < \operatorname{Re}(s) < 1$ and $L(\chi, s) = 0$, $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
Feeds [@thm-kernels-all-chi] into the primitive reflection theorem [@thm-crit-line]. The full proof is checked by the Lean kernel.
:::

::: {.theorem #thm-kernels-claim-all title="Kernel bundle: half-plane, strip, and zeta conjunction" lean="Supplements/Kernels/MainTheorems.claimAll"}
The conjunction `Claim.HalfPlane ∧ Claim.Strip ∧ Claim.Zeta` holds: every Dirichlet $L$-function is zero-free on $\operatorname{Re}(s) > \frac{1}{2}$ (away from $\chi=1, s=1$), every critical-strip zero of every Dirichlet $L$-function has $\operatorname{Re}(s) = \frac{1}{2}$, and every nontrivial zero of $\zeta(s)$ has $\operatorname{Re}(s) = \frac{1}{2}$.
:::

::: proof
Feeds [@thm-kernels-all-chi] into [@thm-claim-strip] and its specialization `Claim.zeta` to form the three-way conjunction. The full proof is checked by the Lean kernel.
:::

## 7.2 8,490 Shards and Honest Verification Boundaries {#sec-ch07-shards-and-honesty}

Compiling the entire `Main` import closure on a single machine demands massive RAM and many hours. To make verification reproducible by anyone, the mirror repository partitions the true import graph into **8,490 content-addressed shards** across 36 dependency levels and distributes compiled pieces through GitHub Releases with SHA-256 verification and fresh `leanchecker` replay.

| Library Layer | Files | Lines of Lean | Architectural Role |
| :--- | ---: | ---: | :--- |
| `Development` | 141,928 | 12,232,663 | Automorphic arithmetic, abelian varieties, character boxes, final assembly |
| `Formalism` | 18,254 | 3,200,748 | Landau reduction, lattice slopes, Fock/Weyl, theta lifts, Behrend tools |
| `GroundTheory` | 8,507 | 1,119,138 | Arithmetic geometry, local/global fields, $p$-adic Hodge and cohomology base |
| `ReciprocityTheory` | 3,845 | 563,016 | Chebotarev, class field theory, adele approximation, local characters |
| `CompanionTheory` | 2,027 | 194,218 | Real discrete series, Harish-Chandra modules, spectral geometry |
| `PositivityTheory` | 449 | 55,130 | Automorphic positivity and published theorem interfaces |
| `Lemmata` | 167 | 9,232 | Determinant monotonicity, norm bounds, auxiliary algebraic lemmas |
| Top entry & supplements | 10 | 70 | `Main.lean`, `Statements.lean`, kernel summary bundles |

Finally, by the standards of strict scientific honesty recorded in `verification/NOTES.md`, keep four objective boundaries in full view:

1. **Full multi-checker Comparator runs take hours at multi-terabyte scale**: the repository's static scan (zero `sorry`/`axiom`/`unsafe`/`opaque`), official Mathlib `v4.33.1` pin check, and Mathlib-scale Comparator smoke test all passed, while full 8,490-shard CI compilation and multi-checker replay run as long-horizon build pipelines. Every theorem link in this book points to the exact immutable source commit.
2. **Scope of this book's lightweight source lock**: in `lean-source` mode, `./tbook check` verifies exact file paths, line numbers, signature digests, and direct freedom from `sorry`/`admit` in each cited declaration; checking the entire transitive import closure and axiom footprint requires Lean compilation and kernel replay (`./verify` / `./tbook lean-project`).
3. **Shared trust base**: even after six independent checkers accept an export, formal verification still trusts the soundness of the Lean type theory and kernel, the fidelity of Mathlib's `RiemannHypothesis` and `DirichletCharacter.LFunction` definitions to classical mathematics, and the hardware and sandbox integrity of the build machine.

> A machine cannot hand you understanding on a silver platter—but it can guarantee that not half a lie hides anywhere inside seventeen million lines. True beauty never minds facing the cold iron of the checker.

In the [Coda](coda.md), let us step outside the finished cathedral and look toward the peaks that still stand unconquered beyond it.
