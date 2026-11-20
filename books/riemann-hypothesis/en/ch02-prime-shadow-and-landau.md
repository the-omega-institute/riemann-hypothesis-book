# Chapter 2 The Prime Shadow and Landau's Trap: Turning Zeros into Signs

> Chasing an invisible zero across the infinite complex plane is like trying to catch a mosquito in the dark with a butterfly net. The smarter trick is to set a scale on the real line: if a zero dares step off center, the balance tips visibly to one side.

Directly solving $\zeta(s) = 0$ across the half-plane $\operatorname{Re}(s) > \frac{1}{2}$ is hopeless—the imaginary part $t$ runs off to infinity, and you cannot patrol every height one zero at a time.

Instead, we haul the entire complex problem down onto the **real number line**. Specifically, we watch a single real-valued prime ledger $S_z(x)$ and its fluctuation $G_z(x)$.

## 2.1 Hand-Computing the Prime Shadow $G_z(x)$ {#sec-ch02-prime-shadow}

To keep track of primes, analytic number theorists hire a crisp accountant called the **von Mangoldt function** $\Lambda(n)$:

- if $n = p^k$ is a prime power (such as $2, 3, 4=2^2, 5, 7, 8=2^3, 9=3^2$), it records $\Lambda(n) = \ln p$;
- otherwise (for $6 = 2\cdot 3$, $10 = 2\cdot 5$, and so on), it records $0$.

Why weight prime powers by $\ln p$ instead of just counting $1$? Because primes thin out with density roughly $1/\ln p$. Multiplying by $\ln p$ flattens the average step size to $1$—a mathematical governor that keeps the speed steady.

Even with $\Lambda(n)$, the raw sum $\psi(x) = \sum_{n \le x}\Lambda(n)$ jumps sharply upward at every prime power. To smooth out those jagged steps, [`StatementOC.lean`](lean:Formalism/ZetaNonvanishing/MellinSgen.Formalism.mellinSgen) integrates once (a Cesàro average):

$$
S_z(x) = \sum_{1 \le n \le x} \Lambda(n)\left(\frac{x}{n} - 1\right), \qquad G_z(x) = S_z(x) - x\ln x + (1 + \gamma)\,x,
$$

where $\gamma \approx 0.577216$ is the Euler–Mascheroni constant. Subtracting the smooth main term $x\ln x - (1+\gamma)x$ leaves $G_z(x)$: the pure **oscillating shadow** of the primes.

Let us plug in concrete numbers by hand using $\ln 2 \approx 0.69315$, $\ln 3 \approx 1.09861$, $\ln 5 \approx 1.60944$, and $\ln 7 \approx 1.94591$:

- At $x = 3$: only $n=2$ contributes $\ln 2 \cdot (3/2 - 1) = 0.5\ln 2 \approx 0.34657$ ($n=3$ has factor $3/3-1=0$), so $S_z(3) \approx 0.34657$. Subtracting $3\ln 3 - (1+\gamma)\cdot 3 \approx -1.43581$ gives $G_z(3) \approx +1.78238$.
- At $x = 5$: summing over $n = 2, 3, 4, 5$ gives $S_z(5) \approx 1.94542$ and $G_z(5) \approx +1.78430$.
- At $x = 10$: $S_z(10) \approx 9.11449$, while $10\ln 10 - (1+\gamma)\cdot 10 \approx 7.25369$, leaving $G_z(10) \approx +1.86080$.
- At $x = 100$: $S_z(100) \approx 304.51714$ versus main term $302.79545$, leaving $G_z(100) \approx +1.72169$!

Notice what just happened: even as $x$ grows from $3$ to $1000$ and both terms climb past $5{,}330$, their difference $G_z(x)$ hovers calmly around the constant $\ln(2\pi) \approx 1.83788$ (the $s = 0$ residue contribution $\zeta'(0)/\zeta(0) = \ln(2\pi)$):

| $x$ | $S_z(x)$ | Smooth term $x\ln x - (1+\gamma)x$ | Shadow $G_z(x)$ | $G_z(x) - \ln(2\pi)$ |
| ---: | ---: | ---: | ---: | ---: |
| $3$ | $0.34657$ | $-1.43581$ | $+1.78238$ | $-0.05550$ |
| $10$ | $9.11449$ | $7.25369$ | $+1.86080$ | $+0.02292$ |
| $30$ | $56.49559$ | $54.71945$ | $+1.77614$ | $-0.06174$ |
| $100$ | $304.51714$ | $302.79545$ | $+1.72169$ | $-0.11619$ |
| $1000$ | $5332.16420$ | $5330.63329$ | $+1.53091$ | $-0.30696$ |

::: {.figure src="ch02-prime-shadow"}
**The prime fluctuation shadow vs. an off-line rogue wave.** The cyan curve plots exact computed values of $G_z(x) - \ln(2\pi)$, staying calmly near zero inside the dashed green $\pm 0.05\sqrt{x}$ envelope. By contrast, a hypothetical off-line zero at $\sigma = 0.78$ (magenta `MODEL` wave $-2\operatorname{Re}(x^\rho/(\rho(\rho-1)))$) rapidly bursts right through the $\sqrt{x}$ barrier.
:::

The formalization first establishes that $G_z(x)$ is well-behaved and Lipschitz continuous—it can never spike arbitrarily steeply:

::: {.theorem #thm-gz-lipschitz title="Lipschitz continuity and linear bound for $G_z$" lean="Formalism/ZetaNonvanishing/GzLipschitz.Formalism.zetaPrimeSumErrorLipschitz"}
There exists a constant $K \ge 0$ such that for all real numbers $t, t' \ge \frac{1}{2}$,
$$
|G_z(t)| \le K t \qquad \text{and} \qquad |G_z(t) - G_z(t')| \le K |t - t'|.
$$
:::

::: proof
Starting from $\sum_{n \le k}\ln n = \sum_{n \le k}\Lambda(n)\lfloor k/n\rfloor$ and Chebyshev's upper bound on $\psi(k)$, one obtains Mertens' bound $\sum_{n \le k}\Lambda(n)/n \le \ln k + \ln 4 + 4$. Writing $G_z(x)$ piecewise linearly minus $x\ln x$ bounds every local derivative by $\ln 4 + 7$, yielding a uniform Lipschitz constant on $[1/2, \infty)$. The full proof is checked by the Lean kernel.
:::

## 2.2 The Mellin Transform and Landau's Trap: Why a One-Sided Bound Kills Complex Zeros {#sec-ch02-landau-trap}

Now we wire this real-line prime ledger back to $\zeta(s)$ in the complex plane. The connecting cable is the **Mellin transform**: integrate a function of $x \in (1, \infty)$ against $x^{-s-1}$. For any real sequence $a(n)$ bounded by $K \Lambda(n)$, the smoothed sum $S_a(x) = \sum_{1 \le n \le x} a(n)(x/n - 1)$ transforms into an exact Dirichlet series divided by $s(s-1)$:

::: {.theorem #thm-mellin-sgen title="Mellin transform of generalized von Mangoldt sums" lean="Formalism/ZetaNonvanishing/MellinSgen.Formalism.mellinSgen"}
Suppose $a : \mathbb{N} \to \mathbb{R}$ and $K \in \mathbb{R}$ satisfy $|a(n)| \le K\Lambda(n)$ for all $n$. Then $S_a$ is measurable, $\int_1^\infty |S_a(x)|\,x^{-\sigma-1}\,dx < \infty$ for all $\sigma > 1$, and for all $s \in \mathbb{C}$ with $\operatorname{Re}(s) > 1$,
$$
\int_1^\infty S_a(x)\, x^{-s-1}\, dx = \frac{1}{s(s-1)} \sum_{n=1}^\infty \frac{a(n)}{n^s}.
$$
:::

::: proof
Interchange summation and integration by Fubini/dominated convergence. Each single term $\int_n^\infty (x/n - 1)x^{-s-1}\,dx$ evaluates in closed form to $\frac{n^{-s}}{s(s-1)}$ for $\operatorname{Re}(s) > 1$, and summing over $n$ yields the $L$-series divided by $s(s-1)$. The full proof is checked by the Lean kernel.
:::

For $a(n) = \Lambda(n)$, the series is $-\zeta'(s)/\zeta(s)$. Subtract the Mellin transforms of $x\ln x$ and $-(1+\gamma)x$, and the pole at $s = 1$ cancels clean away! What remains is a meromorphic function whose **only** poles in $\operatorname{Re}(s) > 0$ sit at the zeros of $\zeta(s)$.

Now comes Edmund Landau's masterstroke—the **non-negative integral trap (Landau's Lemma)**.

Picture walking westward along the real axis from $b$ toward $a$, carrying a function $H(x) \ge 0$ whose values are **never negative**. Expand its Mellin integral $\Phi(s) = \int_1^\infty H(x)\,x^{-s-1}\,dx$ in a Taylor series around a real point $s_0 > b$ toward $s_0 - r$:

$$
\Phi(s_0 - r) = \sum_{k=0}^\infty \frac{(-r)^k}{k!} \Phi^{(k)}(s_0) = \sum_{k=0}^\infty \frac{r^k}{k!} \int_1^\infty (\ln x)^k H(x)\, x^{-s_0 - 1}\, dx.
$$

Look at the signs: $(\ln x)^k \ge 0$ and **$H(x) \ge 0$ leaves zero room for cancellation**! Every term in the Taylor series is positive. So as long as $\Phi(s)$ continues analytically along the real interval $(a, b]$, that all-positive series converges—which forces the integral itself to converge everywhere in the half-plane $\operatorname{Re}(s) > a$. And a convergent integral cannot blow up at a complex pole!

> When every entry in the ledger has the same sign, complex zeros lose their camouflage: unable to hide behind cancellation on the real axis, they cannot exist off the real axis either.

Lean proves this analytic backbone cleanly:

::: {.theorem #thm-landau-lemma title="Landau's non-negative integral lemma" lean="Formalism/ZetaNonvanishing/LandauLemma.Formalism.landauLemma_of"}
Given the Mellin differentiation rule `MellinDeriv`: if $a < b$, $H : \mathbb{R} \to \mathbb{R}$ is measurable on $(1, \infty)$ with $H(x) \ge 0$, $\int_1^\infty H(x)x^{-\sigma-1}\,dx < \infty$ for all $\sigma > b$, and an analytic function $\Phi$ agrees with that integral for $\operatorname{Re}(s) > b$ while extending analytically to the real interval $(a, b]$, then for every $\sigma > a$,
$$
\int_1^\infty H(x)\, x^{-\sigma-1}\, dx < \infty.
$$
:::

::: proof
Suppose for contradiction that the abscissa of convergence $\sigma_c$ lies in $(a, b]$. Expanding $\Phi$ at a point slightly right of $\sigma_c$ turns $(-1)^k \Phi^{(k)}$ into the non-negative integral $\int_1^\infty (\ln x)^k H(x) x^{-s_0-1}\,dx$. Swapping summation and non-negative integration pushes integrability past $\sigma_c$ to some $\sigma' < \sigma_c$, contradicting the definition of $\sigma_c$. The full proof is checked by the Lean kernel.
:::

Here is why Landau's lemma is pure magic for $G_z(x)$: we do **not** even need a two-sided bound $|G_z(x)| \le C x^\theta$. A **one-sided bound** alone—either $G_z(x) \ge -C x^\theta$ or $G_z(x) \le C x^\theta$—creates a non-negative function

$$
H(x) = C x^\theta + s_0\, G_z(x) \ge 0 \qquad (s_0 \in \{1, -1\}).
$$

On the real interval $(0, 1)$, it is elementary that $\zeta(\sigma) \neq 0$ (since $(1 - 2^{1-\sigma})\zeta(\sigma) = 1 - 2^{-\sigma} + 3^{-\sigma} - \cdots > 0$ is a decreasing alternating series). So $\Phi$ is analytic along the whole real segment $(\theta, 1]$, Landau's trap snaps shut, and $\zeta(s)$ cannot vanish anywhere in $\operatorname{Re}(s) > \theta$!

::: {.theorem #thm-zeta-landau title="One-sided prime-sum bound implies half-plane nonvanishing" lean="Formalism/ZetaNonvanishing/ZetaLandau.Formalism.zetaLandau"}
Let $s_0 \in \{1, -1\}$ and $0 < \theta < 1$. If there exist constants $C, x_0 \in \mathbb{R}$ such that for all $x \ge x_0$,
$$
s_0\, G_z(x) \le C\, x^\theta,
$$
then $\zeta(s) \neq 0$ for all $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \theta$.
:::

::: proof
Absorb the bounded values of $|G_z(x)|$ on $[1, \max(x_0, 1)]$ into $C$ to obtain a function $H(x) = C' x^\theta - s_0 G_z(x) \ge 0$ for all $x \ge 1$. Using `zetaRealNonvanish` ($\zeta(\sigma) \neq 0$ on $(0, 1)$) together with [@thm-landau-lemma] and the Mellin representation [@thm-mellin-sgen], the integral extends analytically to $\operatorname{Re}(s) > \theta$, precluding any logarithmic pole from a zero of $\zeta(s)$ in that half-plane. The full proof is checked by the Lean kernel.
:::

::: {.corollary #cor-zeta-landau-eps title="Epsilon-tolerant Landau criterion" lean="Formalism/ZetaNonvanishing/ZetaLandau.Formalism.zetaLandauEps"}
Let $s_0 \in \{1, -1\}$ and $0 \le \theta < 1$. If for every $\varepsilon > 0$ there exist $C, x_0$ such that $s_0\, G_z(x) \le C\, x^{\theta + \varepsilon}$ for all $x \ge x_0$, then $\zeta(s) \neq 0$ for every $s \in \mathbb{C}$ with $\operatorname{Re}(s) > \theta$.
:::

::: proof
For any $s$ with $\operatorname{Re}(s) > \theta$, pick $\varepsilon = \min(\operatorname{Re}(s)-\theta, 1-\theta)/2 > 0$ and apply [@thm-zeta-landau] at threshold $\theta + \varepsilon < \operatorname{Re}(s)$. The full proof is checked by the Lean kernel.
:::

And the same mechanism generalizes cleanly to Dirichlet character sums and complex linear combinations (`OCStep`, `FamilyLandauC` in `StatementOC.lean` / `StatementFL.lean`): **whoever pins down the one-sided fluctuation to $x^{1/2 + \varepsilon}$ clears the entire right half-plane.**

::: {.viz src="critical-mirror" preset="landau-trap" height="500"}
**Landau explicit-formula rogue wave:** The cyan curve computes $G_z(x) - \ln(2\pi)$ directly from $\Lambda(n)$ ($G_z(10) \approx 1.86080$, $G_z(100) \approx 1.72169$), remaining inside the dashed $\pm 0.05\sqrt{x}$ envelope, while the magenta `MODEL` wave for $\sigma = 0.78, t = 11.13$ breaks through near $x \approx 66.89$ and swings to $0.672 > 0.548$ by $x = 120$.
:::

## 2.3 Where Classical Weapons Stall: de la Vallée Poussin and Siegel {#sec-ch02-classical-wall}

Before we unveil the genuinely new engines in Chapters 3–6, let us be honest about two classical pillars built more than a century ago. Neither one comes anywhere near $\operatorname{Re}(s) = \frac{1}{2}$ on its own, yet both are formalized in full inside the repository because the later machinery needs them as local scaffolding.

The first is the 1896 Hadamard–de la Vallée Poussin zero-free region, built on the humble trigonometric inequality

$$
3 + 4\cos\theta + \cos 2\theta = 2(1 + \cos\theta)^2 \ge 0.
$$

It pushes zeros away from $\operatorname{Re}(s) = 1$, yet as $|\operatorname{Im}(s)|$ grows the protected strip hugs the wall $\operatorname{Re}(s) = 1$ ever tighter and never approaches $\frac{1}{2}$:

::: {.theorem #thm-classical-zfr title="Classical zero-free region for $\zeta(s)$" lean="Formalism/ZeroFreeRegion/FinalZFR.Formalism.ZF.zeroFreeRegion"}
There exists a constant $c > 0$ such that for all $s \in \mathbb{C}$ with $s \neq 1$ and
$$
\operatorname{Re}(s) \ge 1 - \frac{c}{\ln(|\operatorname{Im}(s)| + 2)},
$$
we have $\zeta(s) \neq 0$.
:::

::: proof
Combines the local logarithmic-derivative expansion `landauLocal` with Mertens' prime estimate, the $3 + 4\cos\theta + \cos 2\theta \ge 0$ positivity inequality, growth bounds in the right half-plane, and an explicit check at bounded heights. The full proof is checked by the Lean kernel.
:::

The second classical pillar is Carl Ludwig Siegel's 1935 lower bound on $L(\chi, 1)$ for real quadratic characters—the shield against possible Landau–Siegel real zeros close to $s = 1$, without which averaging over arithmetic progressions would lose control of bad moduli $q$:

::: {.theorem #thm-siegel-lower title="Siegel's lower bound for $L(1, \chi)$" lean="Formalism/LandauZeroFreeBounds/FinalSiegel.Formalism.ZeroFreeDirichlet.siegelLower"}
For every $\varepsilon > 0$, there exists a constant $c > 0$ such that for every positive modulus $q \ge 1$ and every nontrivial real Dirichlet character $\chi$ modulo $q$ ($\chi^2 = 1$, $\chi \neq 1$),
$$
\|L(\chi, 1)\| \ge c\, q^{-\varepsilon}.
$$
:::

::: proof
Constructs an auxiliary product $L$-function whose coefficients satisfy the key inequality `bqKey`, then splits by whether an exceptional real zero close to $1$ exists. As classically, the constant $c$ is ineffective, which suffices for the Siegel–Walfisz-type prime estimates needed later. The full proof is checked by the Lean kernel.
:::

So the classical toolbox is on the table. Why did trigonometric positivity and single log-derivative bounds get stuck just left of $\sigma = 1$ for over a century?

Because $3 + 4\cos\theta + \cos 2\theta \ge 0$ only uses **first-order positivity**—it sees only single ripples of primes and has no way to enforce **high multiplicity** over the integers.

> Old methods hit a wall not because primes are too wild, but because they try to measure an ocean with a one-inch ruler.

In the next chapter, we look at the finite-field miracle that breaks that wall—Stepanov's high-multiplicity polynomial trick—and see how the proof forces the stubborn integers to submit to differentiation.

::: {.viz src="critical-mirror" height="560"}
**The full mirror and prime-shadow lab:** Switch freely between the complex $s$-plane mirror and the computed $G_z(x) - \ln(2\pi)$ fluctuation view, drag the test zero $\rho = \sigma + it$ across the critical strip, and explore all four presets (`on-line`, `off-line`, `imprimitive`, `landau-trap`).
:::
