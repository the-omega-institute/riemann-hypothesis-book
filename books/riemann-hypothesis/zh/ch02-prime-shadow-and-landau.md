# 第二章 素数的影子与朗道陷阱：把零点变成符号问题

> 盯着复平面上一个看不见的零点，就像在黑夜里用网兜去扑一只蚊子。聪明人的做法是干脆在实数线上架一杆秤：零点只要敢偏离中线，秤砣就会往一边死沉地压下来。

要清空右半平面 $\operatorname{Re}(s) > \frac{1}{2}$，直接去解方程 $\zeta(s) = 0$ 几乎是不可能的。复平面那么大，虚部 $t$ 可以一直冲向正无穷，难道我们要沿着 $t = 10^{1000}$ 一个一个去数零点吗？

当然不。我们要把复平面上的零点问题，整体**搬运**到实数轴上——具体来说，变成一条和素数有关的实函数 $G_z(x)$ 的增长界问题。而在整个形式化架构里，担任这个搬运工的核心桥梁是一份看似不起眼的账本：$S_z(x)$ 与 $G_z(x)$。

## 2.1 手算素数的平滑影子 $G_z(x)$ {#sec-ch02-prime-shadow}

数素数时，数学家最喜欢的记账员叫**冯·曼戈尔特函数（von Mangoldt function）** $\Lambda(n)$。它的规矩特别干脆：

- 如果 $n = p^k$ 是素数的幂（比如 $2, 3, 4=2^2, 5, 7, 8=2^3, 9=3^2$），它就记一笔 $\Lambda(n) = \ln p$；
- 否则（比如 $6 = 2\times 3$、$10 = 2\times 5$），一律记成 $0$。

为什么不直接数 $1, 2, 3, \dots$ 而要给每个素数幂加权 $\ln p$？因为素数越往后越稀，密度大约是 $1/\ln p$；乘上 $\ln p$ 恰好把“平均步长”拉平到 $1$，就像给变速齿轮装上调速器！

可就算用了 $\Lambda(n)$，普通的加和 $\psi(x) = \sum_{n \le x} \Lambda(n)$ 还是每经过一个素数就“啪”地向上跳一格，锯齿太锋利。为了磨平这把锯齿，[`StatementOC.lean`](lean:Formalism/ZetaNonvanishing/MellinSgen.Formalism.mellinSgen) 取的是它的一次平滑积分（Cesàro 平均）：

$$
S_z(x) = \sum_{1 \le n \le x} \Lambda(n)\left(\frac{x}{n} - 1\right), \qquad G_z(x) = S_z(x) - x\ln x + (1 + \gamma)\,x,
$$

其中 $\gamma \approx 0.577216$ 是欧拉–马斯刻若尼常数。减掉光滑主项 $x\ln x - (1 + \gamma)x$ 之后剩下的 $G_z(x)$，就是素数分布真正的**波动影子**。

不要光看符号，拿起笔算几个具体的数字！用 $\ln 2 \approx 0.69315$、$\ln 3 \approx 1.09861$、$\ln 5 \approx 1.60944$、$\ln 7 \approx 1.94591$：

- 在 $x = 3$ 处：$n=2$ 贡献 $\ln 2 \cdot (3/2 - 1) = 0.5\ln 2 \approx 0.34657$，$n=3$ 贡献 $0$，所以 $S_z(3) \approx 0.34657$。减掉 $3\ln 3 - (1+\gamma)\cdot 3 \approx -1.43581$，得 $G_z(3) \approx +1.78238$。
- 在 $x = 5$ 处：累加 $n = 2, 3, 4, 5$ 得到 $S_z(5) \approx 1.94542$，算下来 $G_z(5) \approx +1.78430$。
- 在 $x = 10$ 处：$S_z(10) \approx 9.11449$，$10\ln 10 - (1+\gamma)\cdot 10 \approx 7.25369$，所以 $G_z(10) \approx +1.86080$。
- 在 $x = 100$ 处：$S_z(100) \approx 304.51714$，光滑主项是 $302.79545$，差值依然稳稳停在 $G_z(100) \approx +1.72169$！

注意到没有？哪怕 $x$ 从 $3$ 膨胀到 $1000$、$2000$，两个各自飙升到几千的数相减，余下的波动影子 $G_z(x)$ 几乎死死贴着常数 $\ln(2\pi) \approx 1.83788$（这来自 $s = 0$ 处的留数贡献 $\zeta'(0)/\zeta(0) = \ln(2\pi)$）上下轻轻呼吸！

| $x$ | $S_z(x)$ | 光滑主项 $x\ln x - (1+\gamma)x$ | 波动影子 $G_z(x)$ | $G_z(x) - \ln(2\pi)$ |
| ---: | ---: | ---: | ---: | ---: |
| $3$ | $0.34657$ | $-1.43581$ | $+1.78238$ | $-0.05550$ |
| $10$ | $9.11449$ | $7.25369$ | $+1.86080$ | $+0.02292$ |
| $30$ | $56.49559$ | $54.71945$ | $+1.77614$ | $-0.06174$ |
| $100$ | $304.51714$ | $302.79545$ | $+1.72169$ | $-0.11619$ |
| $1000$ | $5332.16420$ | $5330.63329$ | $+1.53091$ | $-0.30696$ |

::: {.figure src="ch02-prime-shadow"}
**素数的波动影子与假想偏离零点的“失控巨浪”。** 青色实线是按实际素数幂算出的 $G_z(x) - \ln(2\pi)$，它乖乖贴在水平基线附近；上下两条绿色虚线是 $\pm 0.05\sqrt{x}$ 的包络窗；而一旦存在一个实部为 $\sigma = 0.78$ 的假想零点（品红虚线 `MODEL` 示意），它激发的振荡项 $-2\operatorname{Re}\bigl(x^{\rho}/(\rho(\rho-1))\bigr)$ 很快就会刺穿绿色包络。
:::

形式化源码首先验证了 $G_z(x)$ 本身是一条温和的利普希茨（Lipschitz）连续曲线——在任何区间上都不会瞬间暴跳：

::: {.theorem #thm-gz-lipschitz title="$G_z$ 的利普希茨连续性与线性界" lean="Formalism/ZetaNonvanishing/GzLipschitz.Formalism.zetaPrimeSumErrorLipschitz"}
存在常数 $K \ge 0$，使得对一切满足 $t, t' \ge \frac{1}{2}$ 的实数，均有
$$
|G_z(t)| \le K t \qquad \text{且} \qquad |G_z(t) - G_z(t')| \le K |t - t'|.
$$
:::

::: proof
证明先借助算术恒等式 $\sum_{n \le k} \ln n = \sum_{n \le k} \Lambda(n)\lfloor k/n \rfloor$ 与切比雪夫上界推导出梅尔滕斯和 $\sum_{n \le k} \Lambda(n)/n \le \ln k + \ln 4 + 4$。把 $G_z(x)$ 写成关于 $x$ 的分段线性函数减去 $x\ln x$ 后，每一段斜率的绝对值均被 $\ln 4 + 7$ 控制，由此得到对 $t, t' \ge 1/2$ 一致的利普希茨常数。完整证明由 Lean 内核检查。
:::

## 2.2 梅林变换与朗道陷阱：为什么单侧界就能封死复平面 {#sec-ch02-landau-trap}

现在，把这套实数线上的素数和与复平面上的 $\zeta(s)$ 接上头。接头的电线叫**梅林变换（Mellin transform）**：把时间变量 $x$ 从 $1$ 到 $\infty$ 乘上 $x^{-s-1}$ 积分起来。对于任意被 $K \Lambda(n)$ 控制的实数列 $a(n)$，对应的平滑和 $S_a(x) = \sum_{1 \le n \le x} a(n)(x/n - 1)$ 的梅林变换极其漂亮：

::: {.theorem #thm-mellin-sgen title="一般冯·曼戈尔特和的梅林变换公式" lean="Formalism/ZetaNonvanishing/MellinSgen.Formalism.mellinSgen"}
设实数列 $a : \mathbb{N} \to \mathbb{R}$ 与常数 $K$ 对一切 $n \in \mathbb{N}$ 满足 $|a(n)| \le K \Lambda(n)$。则 $S_a$ 可测，对一切 $\sigma > 1$ 有 $\int_1^\infty |S_a(x)|\,x^{-\sigma-1}\,dx < \infty$，且对一切 $\operatorname{Re}(s) > 1$ 成立
$$
\int_1^\infty S_a(x)\, x^{-s-1}\, dx = \frac{1}{s(s-1)} \sum_{n=1}^\infty \frac{a(n)}{n^s}.
$$
:::

::: proof
利用富比尼定理与控制收敛，把逐项积分的级数和积分次序对调。每一单项 $\int_n^\infty (x/n - 1) x^{-s-1}\,dx$ 在 $\operatorname{Re}(s) > 1$ 时恰好等于 $\frac{n^{-s}}{s(s-1)}$，逐项相加即得 $L$-级数除以 $s(s-1)$。完整证明由 Lean 内核检查。
:::

特别地，当 $a(n) = \Lambda(n)$ 时，$\sum \Lambda(n) n^{-s} = -\zeta'(s)/\zeta(s)$。再把光滑主项 $x\ln x - (1+\gamma)x$ 的梅林变换 $\frac{1}{(s-1)^2} - \frac{1+\gamma}{s-1}$ 减掉，你会惊喜地发现：右边恰好补出 $-\frac{1}{s-1}$ 的极点抵消项！也就是说，**$G_z(x)$ 的梅林变换在 $s = 1$ 处居然连极点都没有，只在 $\zeta(s)$ 真的等于零的地方冒出极点！**

这下轮到朗道（Edmund Landau）的绝招登场了——**非负积分陷阱（Landau's Lemma）**。

打个极其通俗的比方：想象你在一条山谷里沿直线往西走（实轴 $s = \sigma$ 从 $b$ 往左减到 $a$）。假设你背的包里全是**非负的重量** $H(x) \ge 0$。当积分 $\int_1^\infty H(x) x^{-s-1}\,dx$ 在 $\operatorname{Re}(s) > b$ 解析时，把它在实轴上展开成泰勒级数：

$$
\Phi(s_0 - r) = \sum_{k=0}^\infty \frac{(-r)^k}{k!} \Phi^{(k)}(s_0) = \sum_{k=0}^\infty \frac{r^k}{k!} \int_1^\infty (\ln x)^k H(x)\, x^{-s_0 - 1}\, dx.
$$

看每一项前面的符号！积分里 $(\ln x)^k \ge 0$，**而 $H(x) \ge 0$ 没有正负相消的余地**！所以只要 $\Phi(s)$ 在实轴上顺顺当当解析地延拓到 $a$，这串全正的级数在实轴上就必须收敛——可一旦级数在实数点 $\sigma > a$ 收敛，它在整个半平面 $\operatorname{Re}(s) > \sigma$ 也就跟着绝对收敛，里面**绝对不可能藏着任何复极点**（比如 $\zeta(s)$ 的零点）！

> 只要账本里每一笔都是正数，虚空中的复零点就失去了互相抵消的掩护；它在实轴上迈不出第一步，在复平面上就寸步难行。

Lean 把这份“非负函数实轴延拓必保积分收敛”的硬核分析定理一字不差地证明了出来：

::: {.theorem #thm-landau-lemma title="朗道非负积分引理" lean="Formalism/ZetaNonvanishing/LandauLemma.Formalism.landauLemma_of"}
给定对指数核幂次求导的微分法则 `MellinDeriv`：若 $a < b$，$H : \mathbb{R} \to \mathbb{R}$ 在 $(1, \infty)$ 上可测且 $H(x) \ge 0$，对所有 $\sigma > b$ 有 $\int_1^\infty H(x) x^{-\sigma-1}\,dx < \infty$，且解析函数 $\Phi$ 在 $\operatorname{Re}(s) > b$ 上等于该积分并能解析延拓到整个实线段 $(a, b]$，则对一切 $\sigma > a$ 仍有
$$
\int_1^\infty H(x)\, x^{-\sigma-1}\, dx < \infty.
$$
:::

::: proof
反证假设收敛横坐标 $\sigma_c \ge a$ 落在 $(a, b]$ 之间。围绕 $\sigma_c$ 右侧一点展开 $\Phi$ 的泰勒级数；由于 $H(x) \ge 0$，每一阶导数对 $(-1)^k$ 都恰为非负积分 $\int_1^\infty (\ln x)^k H(x) x^{-s_0-1}\,dx$。由富比尼/单调收敛把积分和求和交换，迫使积分越过 $\sigma_c$ 向左推进到某个 $\sigma' < \sigma_c$，与 $\sigma_c$ 为下确界矛盾。完整证明由 Lean 内核检查。
:::

现在看看朗道是怎么把 $G_z(x)$ 塞进这个陷阱的！哪怕我们**不知道** $|G_z(x)| \le C x^\theta$（双侧界），只要知道**单侧界**——比如 $G_z(x) \ge -C x^\theta$（或上界 $G_z(x) \le C x^\theta$）——就能立刻构造出非负函数

$$
H(x) = C x^\theta + s_0\, G_z(x) \ge 0 \qquad (s_0 \in \{1, -1\}).
$$

只要 $H(x) \ge 0$，它的梅林变换在实轴上只在 $s = \theta$（来自 $C x^\theta$ 的 $\frac{C}{s-\theta}$）和已知无实零点的区间外才可能有奇点。而人们早就用手算和级数证明了**实轴区间 $(0, 1)$ 上 $\zeta(\sigma) \neq 0$**（因为 $(1 - 2^{1-\sigma})\zeta(\sigma) = 1 - 2^{-\sigma} + 3^{-\sigma} - \cdots > 0$ 是交错递减正项级数！）。于是 $\Phi$ 在实轴 $(\theta, 1]$ 上处处光滑无阻，朗道陷阱瞬间合拢：$\zeta(s)$ 在整个右半平面 $\operatorname{Re}(s) > \theta$ 一个零点都不许有！

::: {.theorem #thm-zeta-landau title="单侧素数和界推出半平面无零点" lean="Formalism/ZetaNonvanishing/ZetaLandau.Formalism.zetaLandau"}
设 $s_0 \in \{1, -1\}$，$0 < \theta < 1$。若存在常数 $C, x_0 \in \mathbb{R}$ 使得对一切 $x \ge x_0$ 均有
$$
s_0\, G_z(x) \le C\, x^\theta,
$$
则对一切 $\operatorname{Re}(s) > \theta$ 的复数 $s$，均有 $\zeta(s) \neq 0$。
:::

::: proof
将区间 $[1, \max(x_0, 1)]$ 上有界的 $|G_z(x)|$ 并入常数 $C$，构造对一切 $x \ge 1$ 非负的函数 $H(x) = C'\,x^\theta - s_0\,G_z(x) \ge 0$（注意形式化记号里取 $-s_0$ 对应符号）。借助实轴非零性定理 `zetaRealNonvanish` 与 [@thm-landau-lemma]，其梅林积分收敛至 $\sigma > \theta$。再利用乘积函数 $(s-1)\zeta(s)\zeta(s)\dots$ 或对数导数在解析区域内的局部展开，若存在零点 $\rho$ 满足 $\operatorname{Re}(\rho) > \theta$，则会导致与积分收敛性矛盾的对数极点。完整证明由 Lean 内核检查。
:::

::: {.corollary #cor-zeta-landau-eps title="带任意小 $\varepsilon$ 损失的朗道判据" lean="Formalism/ZetaNonvanishing/ZetaLandau.Formalism.zetaLandauEps"}
设 $s_0 \in \{1, -1\}$，$0 \le \theta < 1$。若对任意 $\varepsilon > 0$ 均存在 $C, x_0$ 使得对一切 $x \ge x_0$ 有 $s_0\, G_z(x) \le C\, x^{\theta + \varepsilon}$，则对一切 $\operatorname{Re}(s) > \theta$ 均有 $\zeta(s) \neq 0$。
:::

::: proof
对任意 $\operatorname{Re}(s) > \theta$，取足够小的 $\varepsilon < \min(\operatorname{Re}(s) - \theta, 1 - \theta)/2$，对 $\theta + \varepsilon$ 直接应用 [@thm-zeta-landau]。完整证明由 Lean 内核检查。
:::

把视角拉高一点：对一般实特征甚至复特征组合，`StatementOC.lean` 与 `StatementFL.lean` 同样建立了对应的 `OCStep` 与 `FamilyLandauC`——**谁能把 $G_\chi(x)$ 的单侧误差压进 $x^{1/2 + \varepsilon}$ 里面，谁就拿下了全部零点！**

::: {.viz src="critical-mirror" preset="landau-trap" height="500"}
**朗道显式公式与偏离巨浪实验：** 青色曲线由 $\Lambda(n)$ 实算 $G_z(x) - \ln(2\pi)$（如 $G_z(10) \approx 1.86080$、$G_z(100) \approx 1.72169$），始终稳居虚线 $\pm 0.05\sqrt{x}$ 包络内；而品红 `MODEL` 波取 $\sigma = 0.78, t = 11.13$ 时，会在 $x \approx 66.89$ 处率先冲出包络，并在 $x = 120$ 摆至 $0.672 > 0.548$。
:::

## 2.3 百年经典防线在哪里停步：德拉瓦莱–普桑与西格尔定理 {#sec-ch02-classical-wall}

在离开经典解析数论进入后面真正的新引擎之前，必须诚实交代两件“一百年前就已经做到、但始终过不了 $\frac{1}{2}$”的经典武器——新证明不但没有绕开它们，反而在底层把它们全套形式化了，作为后续步步推进的弹药。

第一道武器是 1896 年德拉瓦莱–普桑（de la Vallée Poussin）与哈达玛（Hadamard）利用经典三角不等式

$$
3 + 4\cos\theta + \cos 2\theta = 2(1 + \cos\theta)^2 \ge 0
$$

打出的**经典无零点区域**。它把零点推离了竖线 $\operatorname{Re}(s) = 1$，但随着虚部 $|t|$ 升高，这条边界只能像贴着墙角的小尾巴一样无限逼近 $1$，永远进不到 $\frac{1}{2}$：

::: {.theorem #thm-classical-zfr title="$\zeta$ 函数的经典无零点区域" lean="Formalism/ZeroFreeRegion/FinalZFR.Formalism.ZF.zeroFreeRegion"}
存在常数 $c > 0$，使得对一切满足 $s \neq 1$ 且
$$
\operatorname{Re}(s) \ge 1 - \frac{c}{\ln(|\operatorname{Im}(s)| + 2)}
$$
的复数 $s \in \mathbb{C}$，均有 $\zeta(s) \neq 0$。
:::

::: proof
形式化首先证明对数导数局部展开引理 `landauLocal`，随后结合梅尔滕斯不等式、$3 + 4\cos\theta + \cos 2\theta \ge 0$、右半平面增长界与有界高度无零点检验，得到标准的对数型无零点区域。完整证明由 Lean 内核检查。
:::

第二道武器是 1935 年西格尔（Carl Ludwig Siegel）针对实狄利克雷特征在 $s = 1$ 附近可能存在的“异常实零点”（兰道–西格尔零点）给出的经典下界。没有它，后文需要遍历所有模 $q$ 算术级数的平均估算就会被一个异常的模 $q$ 拖垮：

::: {.theorem #thm-siegel-lower title="西格尔（Siegel）关于 $L(1, \chi)$ 的下界定理" lean="Formalism/LandauZeroFreeBounds/FinalSiegel.Formalism.ZeroFreeDirichlet.siegelLower"}
对任意 $\varepsilon > 0$，存在常数 $c > 0$，使得对一切正整数 $q \ge 1$ 及一切模 $q$ 的非平凡实二次狄利克雷特征 $\chi$（满足 $\chi^2 = 1$ 且 $\chi \neq 1$），均有
$$
\|L(\chi, 1)\| \ge c\, q^{-\varepsilon}.
$$
:::

::: proof
经由构造辅助乘积 $L$-函数并对其在实轴上的系数和极点残数建立关键不等式 `bqKey`，分“存在接近 $1$ 的异常实零点”与“不存在异常实零点”两种情形分别控制 $L(1, \chi)$ 的下界。注意这里的常数 $c$ 照例是非有效（ineffective）的，但这已足够支撑后续的西格尔–瓦尔菲什（Siegel–Walfisz）型分布定理。完整证明由 Lean 内核检查。
:::

好了，经典解析数论的弹药箱已经摊开。为什么依靠三角不等式和单条对数导数的老办法，一百多年来连 $\operatorname{Re}(s) \le 0.99$ 都突破不了？

因为 $3 + 4\cos\theta + \cos 2\theta \ge 0$ 只是**一次函数级的正定性**——它眼里只有素数和的一阶震荡，根本没有利用整数世界背后潜伏的**高重数对称**。

> 老方法之所以撞墙，不是因为素数太少，而是因为它只拿一把一厘米宽的尺子去量整片海洋。

下一章，我们看看有限域里的绝杀武器——斯捷潘诺夫的“高重数求导术”，以及如何把它强行塞进不能直接求导的整数世界里。

::: {.viz src="critical-mirror" height="560"}
**完整的复平面镜像与素数影子实验室：** 在复平面镜像与素数波动影子之间自由切换，拖动检验零点 $\rho = \sigma + it$，对比在临界线上（`on-line`）、偏离临界线（`off-line`）、不本原欧拉零点（`imprimitive`）与朗道失控巨浪（`landau-trap`）四种情景。数值仅在页面演示，定理依据由 Lean 内核核验。
:::
