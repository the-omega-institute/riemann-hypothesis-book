# Chapter 7 Anatomy of 17 Million Lines: Independent Kernel Replay and Mathematical Honesty

> Anyone who hands you a 175,187-file, 17.37-million-line manuscript with zero comments and says "trust me" might as well be selling indulgences. Fortunately, formal verification lives by a colder, cleaner rule: **do not trust the author's word—replay the compiled output inside an empty kernel.**

If this proof were a ten-thousand-page PDF, a human referee board might need twenty years just to turn every page—and still could not swear that page 4,812 did not hide a dropped inequality or an unstated exception.

Before Lean 4's kernel, massive length buys zero immunity. Every single line must elaborate through the same rigid type checker. Even one hidden `sorry`, one custom `axiom`, or one sneaky rewrite of `RiemannHypothesis` would be caught instantly by a 27-line challenge file.

## 7.1 The 27-Line Challenge Contract: How Verification Prevents Cheating {#sec-ch07-challenge-contract}

Before opening [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis), let us keep its provenance crystal clear: the 17.37-million-line Lean 4 proof source for RH and Dirichlet GRH was authored and released by **Levent Alpöge** ([`alpo.ge/remark.pdf`](https://alpo.ge/remark.pdf)); **Deicyde** then created the upstream verification mirror [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis), adding a 27-line Mathlib-only challenge contract `src/Challenge.lean` (importing **only** official Mathlib `v4.33.1` at commit `0df444a360ea`) and Comparator harness around the unmodified source; and [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) is The Omega Institute's **fork** of `Deicyde/riemann-hypothesis`, keeping every proof file untouched while adding the 8,490-shard public CI builder and `./verify` local replay script.

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

## 7.2 8,490 Content-Addressed Shards and Public CI {#sec-ch07-shards-and-honesty}

Here is the practical bottleneck: if someone announces a formal proof of the Riemann Hypothesis, yet sets the price of admission at "rent a 503 GB server and burn ten uninterrupted hours," independent checking stays locked behind a few private doors.

That single-machine cost is real. Compiling the full `Main` import closure from scratch on a 48-core, 503 GB Linux workstation takes roughly 7 to 10 hours, and Lake writes about 6 MB of intermediate `.setup.json` metadata per module—meaning nearly **1 TB** of transient files across 175,187 modules. Here is how those files break down:

| Library Layer | Files | Lines of Lean | Architectural Role |
| :--- | ---: | ---: | :--- |
| `Development` | 141,928 | 12,232,663 | Automorphic arithmetic, abelian varieties, character boxes, final assembly |
| `Formalism` | 18,254 | 3,200,748 | Landau reduction, lattice slopes, Fock/Weyl, theta lifts, Behrend tools |
| `GroundTheory` | 8,507 | 1,119,138 | Arithmetic geometry, local/global fields, $p$-adic Hodge and cohomology base |
| `ReciprocityTheory` | 3,845 | 563,016 | Chebotarev, class field theory, adele approximation, local characters |
| `CompanionTheory` | 2,027 | 194,218 | Real discrete series, Harish-Chandra modules, spectral geometry |
| `PositivityTheory` | 449 | 55,130 | Automorphic positivity and published theorem interfaces |
| `Lemmata` | 167 | 9,232 | Determinant monotonicity, norm bounds, auxiliary algebraic lemmas |
| Top entry & supplements | 10 | 70 | `Main.lean`, `Statements.lean`, `BuildAid`, kernel summary bundles |

To turn "only a cluster can build this" into "anyone can watch CI compile it piece by piece and replay the result on an ordinary PC," `ci/plan.py` in [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) slices the true `import` DAG of `Main` into **8,490 bounded shards**:

- **Hard size caps and massive fan-out**: Each shard holds at most **400 modules** and at most **2.5 MB** of Lean source across **36 dependency levels**. Once the **17 foundation shards** (`Statements`, `BuildAid`, and the base packages) land, they immediately unlock **529 independent jobs** that run in parallel.
- **Content-addressed keys (no wasted rebuilds)**: Every shard key is a SHA-256 hash of four ingredients—the toolchain and manifest config (`lean-toolchain`, `lake-manifest.json`, `lakefile.toml`), the exact Git blob hashes of the shard's modules, and the sorted keys of its prerequisite shards. Edit one leaf file, and only its ancestor cone to `Main` changes key; every untouched branch keeps its cache hit.
- **Critical-path CI scheduling into 16 public Releases**: The public GitHub Actions workflow (`lean-parts.yml`) checks ready work every minute, prioritizes the shards on the longest remaining paths to `Main`, and publishes `zstd`-compressed archives with SHA-256 checksums across 16 hexadecimal Pre-release buckets (`lean-parts-v1-0` through `lean-parts-v1-f`, with Actions-artifact fallback). Public CI has already built and published the vast majority of the shards and is actively pushing the final layers toward `Main` and the final `build-<commit>` release.

The interactive diagram below lays out how those 8,490 content-addressed shards unlock level by level toward `Main.lean`:

::: {.viz src="proof-replay" preset="dag-shards" height="500"}
**8,490 content-addressed shards across 36 levels.** Scrub the CI wave slider or click any shard node to see how the 17 foundation shards on the left fan out into 529 parallel jobs, how content keys isolate edits, and how the frontier climbs toward `Main`.
:::

## 7.3 Anyone Can Verify It: Four Commands and Zero-Trust Replay {#sec-ch07-verify-yourself}

To build and verify the five terminal theorems with Lean 4.35.0, start with the [compact edition of grh-lean](https://github.com/lsernau/grh-lean/tree/72fead102f663d5c7a407964a13dc0cf9d977207/grh-compact). The shard commands below replay Alpöge’s original release.

> "Wait—if you download pre-compiled binaries from public CI, aren't you just trusting the CI runners?" Quite the opposite: buying bricks off someone else's kiln does not mean trusting their sales pitch, as long as you put every brick through your own press when it arrives.

That distinction is the secret weapon of the verification workflow: it cleanly separates *saving compilation hours* from *granting trust*. You need **no GitHub account**, and you do not have to burn ten hours on 48 cores. On any x86-64 Linux machine with `git`, Python `3.12+`, `curl`, `zstd`, and `elan` (which picks up the pinned Lean `v4.33.1`), four commands run the check locally (even on macOS, `--status` immediately inspects live Release coverage):

```sh
git clone --depth 1 https://github.com/the-omega-institute/riemann-hypothesis.git
cd riemann-hypothesis
./verify --status Main
./verify Main
```

Two helper commands let you test the pipeline right now or finish any straggling tail yourself:

```sh
./verify BuildAid.D1           # Test the full download -> SHA-256 -> fresh replay path in seconds
./verify --build-missing Main  # Restore published CI shards, then compile any unpublished tail locally
```

Why is downloading `.olean` shards zero-trust? Open up [`./verify`](https://github.com/the-omega-institute/riemann-hypothesis/blob/main/verify) and trace what happens after download:

1. **SHA-256 manifest verification**: Every downloaded shard archive is checked against its GitHub Release digest and the source tree's exact shard key before unpacking.
2. **Fresh empty-kernel replay**: The script does **not** rubber-stamp `.olean` headers. It runs `lake env leanchecker --fresh --verbose Main`. That `--fresh` flag spins up a **completely empty Lean 4 kernel** and re-type-checks every single declaration across the import closure from scratch on your CPU. Swap one proof term, forge one binary byte, or hide a single `sorry`, and the fresh kernel refuses that declaration on the spot.
3. **Definition & axiom audit via `Audit.lean`**: Once `leanchecker --fresh` accepts `Main`, [`ci/Audit.lean`](https://github.com/the-omega-institute/riemann-hypothesis/blob/main/ci/Audit.lean) verifies definitionally that `riemannHypothesis` matches Mathlib's native `RiemannHypothesis`, audits `#print axioms` on all five headline theorems against `{propext, Classical.choice, Quot.sound}`, and writes the report to `.lake/parts/axioms.txt`.

Use the fault-injector experiment below to play attacker: flip between a clean build, a forged shard, a smuggled axiom, and a mutated theorem statement to watch which gate catches each lie red-handed:

::: {.viz src="proof-replay" preset="tamper-caught" height="500"}
**Zero-trust replay: try to cheat.** Switch among clean replay, a forged `.olean` shard, a hidden `sorry`/axiom, and an altered target statement to see why downloading CI artifacts never asks for blind trust.
:::

Beyond the four-line `./verify` workflow, independent auditors also configured the full **six-checker Comparator pipeline** documented in the repository [`README.md`](https://github.com/the-omega-institute/riemann-hypothesis/blob/main/README.md) and `verification/NOTES.md`: inside an offline `podman` build and `bubblewrap` sandbox, `lean4export` writes plain S-expression exports for `Challenge` and `Main` (~70–75 GB projected for `Main`), which Lean `v4.36.0` `lake comparator` then judges with five independent checkers (**Lean 4.36 kernel**, **`leanchecker-paranoid`**, Rust **`nanoda`**, **`con-leche`**, and **`con-ron`** configured via `comparator.json`). Because Lean `4.36` changed `Decidable` in core, the sixth checker—**`lean4lean`**—is built directly against pinned Lean `v4.33.1` and run separately as `lake env lean4lean --fresh Main`.

Step into the full verification lab below to scrub the 36-level CI frontier, inspect content-addressed invalidation cones, test the fault injector, and cross-check all five locked `Main` theorem signatures:

::: {.viz src="proof-replay" height="560"}
**Full Verification Lab · From 8,490 public CI shards to four-command `./verify` and six independent checkers.** Click shard nodes in Scene 1 to inspect ancestor invalidation; switch to Scene 2 to test every tamper vector.
:::

For a two-minute guided walkthrough of the whole verification pipeline—from the 27-line challenge contract to public CI shards and zero-trust local replay—watch the short film below.

::: {.film src="verifying-the-riemann-proof"}
**Verifying 17 Million Lines of Lean.** A two-minute tour of how public CI shards the proof into 8,490 content-addressed pieces, how anyone can verify `Main` with four commands and zero trust via `leanchecker --fresh`, and why six independent checkers close off cheating.
:::

## 7.4 Honest Verification Boundaries {#sec-ch07-honest-boundaries}

By the standards of strict scientific honesty recorded in `verification/NOTES.md`, keep three objective boundaries in full view:

1. **Multi-terabyte full Comparator replay is a long-horizon run**: the static source scan (zero `sorry`/`axiom`/`native_decide`/`unsafe`/`opaque`), the nine official upstream package pins including Mathlib `v4.33.1`, and the Mathlib-scale five-checker Comparator smoke test (54,461 declarations) all passed; public CI is steadily compiling the 8,490 shards toward `Main`, while the full 70+ GB multi-checker Comparator run executes as a standalone multi-hour offline pipeline.
2. **Scope of this book's lightweight source lock**: in `lean-source` mode, `./tbook check` verifies exact file paths, line numbers, signature digests, and direct freedom from `sorry`/`admit` in every cited theorem; replaying the full transitive import closure and axiom footprint requires Lean compilation and kernel replay (`./verify Main` or Comparator) on Linux.
3. **Shared trust base**: even when every independent checker agrees, human and machine verification alike still rest on three foundational assumptions—the soundness of Lean's type theory and kernel, the fidelity of Mathlib `v4.33.1`'s definitions of `RiemannHypothesis` and `DirichletCharacter.LFunction`, and the uncompromised hardware and sandbox executing the replay.

> A machine cannot hand you understanding on a silver platter—but it can guarantee that not half a lie hides anywhere inside seventeen million lines. True beauty never minds facing the cold iron of the checker.

In the [Coda](coda.md), let us step outside the finished cathedral and look toward the peaks that still stand unconquered beyond it.
