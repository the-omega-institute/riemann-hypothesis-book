# 第一章 对称之镜：为什么只需清空右半平面

> 不要同时和两个影子搏斗。只要把镜子擦亮，清空右侧的房间，左侧的幽灵就会跟着一起消失。

如果你问一个学过微积分的朋友“黎曼猜想是什么”，他多半会在纸上画出复平面，点一条竖线 $\operatorname{Re}(s) = \frac{1}{2}$，然后说：“$\zeta(s)$ 的非平凡零点全在这条线上。”

听起来像是一道必须从两边夹逼、精雕细琢的等式题——既要证明 $\operatorname{Re}(s)$ 不能大于 $\frac{1}{2}$，又要证明它不能小于 $\frac{1}{2}$。

其实不用。**你只需要证明一半，另一半是白送的。**

原因在于黎曼 $\zeta$ 函数和所有本原狄利克雷 $L$ 函数都藏着一面极其锋利的镜子——**函数方程（functional equation）**。只要把复数 $s$ 换成 $1 - s$，实部 $\sigma$ 就变成 $1 - \sigma$：

- 如果一个点在右侧 $\sigma = 0.76$，它的镜像就在左侧 $1 - 0.76 = 0.24$；
- 如果一个点在左侧 $\sigma = 0.24$，它的镜像就跳回右侧 $0.76$；
- 唯一在镜子里原地不动的位置，正好是 $\sigma = 1 - \sigma$，也就是 $\sigma = \frac{1}{2}$！

这就是整个证明的**第一道杠杆**：把“精确等于 $\frac{1}{2}$”这个等式难题，直接降维成“右半平面 $\operatorname{Re}(s) > \frac{1}{2}$ 里一个零点也没有”的不等式难题。

::: {.figure src="ch01-critical-mirror"}
**复平面上的对称之镜。** 浅青色竖带是临界带 $0 < \operatorname{Re}(s) < 1$，正中央的绿色实线是临界线 $\operatorname{Re}(s) = 1/2$。如果右半带出现一枚琥珀色假想零点 $\rho$（$\operatorname{Re}(\rho) = 0.76$），函数方程会立刻在左半带映出它的品红镜像 $1 - \bar\rho$（$\operatorname{Re} = 0.24$）；负偶数 $-2, -4$ 是 $\Gamma$ 因子带来的平凡零点，非本原特征多余的欧拉因子零点则被钉死在紫色虚线 $\operatorname{Re}(s) = 0$ 上，绝不闯入临界带。
:::

## 1.1 五条顶层结论究竟在说什么 {#sec-ch01-five-headlines}

翻开证明仓库的入口文件 [`Main.lean`](lean:Main.riemannHypothesis)，你会发现全书 1,737 万行代码最后全部汇流进五条极其干净的顶层定理。先把它们的精确内容摆在桌面上，不夸大一分，也不漏掉一个条件。

::: {.theorem #thm-main-rh title="黎曼猜想" lean="Main.riemannHypothesis"}
Mathlib 中的标准命题 `RiemannHypothesis` 成立：对任意复数 $s \in \mathbb{C}$，若 $\zeta(s) = 0$，且 $s$ 不是负偶数 $-2(n+1)$（$n \in \mathbb{N}$），且 $s \neq 1$，则
$$
\operatorname{Re}(s) = \frac{1}{2}.
$$
:::

::: proof
在形式化源码中，[`Main.riemannHypothesis`](lean:Main.riemannHypothesis) 由更强的全部狄利克雷 $L$ 函数右半平面无零点结论（[@thm-main-l-right]）经 [@thm-rh-of-right] 一步推出。完整证明由 Lean 内核检查。
:::

第二条定理把 Mathlib 里的定义原样展开写清，确保读者一眼看明排除了哪些点（负偶平凡零点以及 $\zeta$ 函数的极点 $s = 1$）：

::: {.theorem #thm-main-zeta-line title="黎曼 $\zeta$ 函数的非平凡零点全在临界线上" lean="Main.riemannZeta_eq_zero_re"}
对所有 $s \in \mathbb{C}$，若 $\zeta(s) = 0$，且不存在 $n \in \mathbb{N}$ 使得 $s = -2(n+1)$，且 $s \neq 1$，则 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

::: proof
与 [@thm-main-rh] 等价，直接由全部特征的右半平面无零点定理推出。完整证明由 Lean 内核检查。
:::

真正干重活的是第三条——它不只是拿下 $\zeta(s)$，而是一口气扫平了**所有模 $N \ge 1$、所有狄利克雷特征 $\chi$** 的右半平面：

::: {.theorem #thm-main-l-right title="全部狄利克雷 $L$ 函数在右半平面无零点" lean="Main.LFunction_ne_zero_of_half_lt_re"}
对任意正整数 $N \ge 1$、任意模 $N$ 的狄利克雷特征 $\chi$ 与任意复数 $s \in \mathbb{C}$，若 $\operatorname{Re}(s) > \frac{1}{2}$，且（$\chi \neq 1$ 或 $s \neq 1$），则
$$
L(\chi, s) \neq 0.
$$
:::

::: proof
这是整座证明的终极汇流点（第六章将逐步追溯它的全部前置引擎）。当 $N = 1$ 且 $\chi = 1$ 时，$L(1, s) = \zeta(s)$，于是立得 $\zeta(s)$ 在 $\operatorname{Re}(s) > \frac{1}{2}$（$s \neq 1$）上无零点。完整证明由 Lean 内核检查。
:::

一旦 [@thm-main-l-right] 到手，临界带内所有狄利克雷 $L$ 函数（包括非本原特征和本原特征）的零点就全部被镜子按死在 $\operatorname{Re}(s) = \frac{1}{2}$ 上：

::: {.theorem #thm-main-l-strip title="全部狄利克雷 $L$ 函数的广义黎曼猜想" lean="Main.LFunction_eq_zero_re"}
对任意正整数 $N \ge 1$、任意模 $N$ 的狄利克雷特征 $\chi$ 与任意复数 $s \in \mathbb{C}$，若 $0 < \operatorname{Re}(s) < 1$ 且 $L(\chi, s) = 0$，则 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

::: proof
由 [@thm-main-l-right] 结合 [@thm-claim-strip] 推出：先将非本原特征约化到它的本原特征，再用本原特征的函数方程把 $0 < \operatorname{Re}(s) < \frac{1}{2}$ 反射到右半平面 $\operatorname{Re}(1-s) > \frac{1}{2}$。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-main-l-prim title="本原狄利克雷 $L$ 函数的临界线定理" lean="Main.LFunction_eq_zero_re_of_isPrimitive"}
对任意正整数 $N \ge 1$、任意模 $N$ 的本原狄利克雷特征 $\chi$ 与任意复数 $s \in \mathbb{C}$，若 $0 < \operatorname{Re}(s) < 1$ 且 $L(\chi, s) = 0$，则 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

::: proof
对本原特征直接调用函数方程反射，见 [@thm-crit-line]。完整证明由 Lean 内核检查。
:::

::: remark
请注意范围的诚实边界：这里的广义黎曼猜想（GRH）针对的是**全部狄利克雷 $L$ 函数**（任意模 $N$、任意特征 $\chi$），并不自动涵盖一般数域的戴德金 $\zeta$ 函数或更高阶的自守 $L$ 函数（我们在[终章](coda.md)把那些仍敞开的群山单独标为开放问题）。
:::

## 1.2 镜子怎么运作：从右半平面到临界线 {#sec-ch01-how-mirror-works}

别急着跳过这一步，因为这一步恰恰最适合亲手摸清门道——你用高中代数的三分法就能看穿它。

假设你已经知道了右半平面 $\operatorname{Re}(s) > \frac{1}{2}$ 里没有 $\zeta$ 的零点。现在随便抓一个满足 $\zeta(s) = 0$、$s \neq 1$ 且 $s$ 不是负偶数的复数 $s$。它的实部 $\operatorname{Re}(s)$ 只可能落在三种位置：

1. **$\operatorname{Re}(s) > \frac{1}{2}$**：直接违背“右半平面无零点”，出局。
2. **$\operatorname{Re}(s) = \frac{1}{2}$**：正是我们要的结论，收工。
3. **$\operatorname{Re}(s) < \frac{1}{2}$**：这时把镜子翻过来，看 $1 - s$！它的实部是 $1 - \operatorname{Re}(s) > \frac{1}{2}$，正好落进已经清空的右半平面。

那么问题来了：**$\zeta(s) = 0$ 一定会让 $\zeta(1-s) = 0$ 吗？**

小心！这里藏着一个几乎所有科普书都会一笔带过的细微陷阱。黎曼的函数方程把 $\zeta(s)$ 和 $\zeta(1-s)$ 绑在了一起：

$$
\zeta(s) = 2^s \pi^{s-1} \sin\!\left(\frac{\pi s}{2}\right) \Gamma(1-s)\, \zeta(1-s),
$$

或者写成等价的余弦形式（对应 $s \mapsto 1-s$）。你看右边有四个因子相乘。如果 $\zeta(s) = 0$，左边为零，右边也必须为零——**但这并不自动意味着 $\zeta(1-s) = 0$**，万一是前面那个 $\sin(\frac{\pi s}{2})$ 或 $\Gamma(1-s)$ 恰好等于零呢？

来手算一遍！

- $2^s \pi^{s-1}$ 永远不为零（指数函数绝不触零）。
- 当 $\operatorname{Re}(s) < \frac{1}{2}$ 时，$\operatorname{Re}(1-s) > \frac{1}{2} > 0$，而伽马函数 $\Gamma(z)$ 在右半平面 $\operatorname{Re}(z) > 0$ 里既没有极点也没有零点！
- 唯一可能偷偷等于零的“冒牌货”就是 $\sin(\frac{\pi s}{2})$。它什么时候为零？恰恰是 $s = 0, -2, -4, -6, \dots$！
  - $s = 0$ 时，$\zeta(0) = -\frac{1}{2} \neq 0$，不是零点；
  - $s = -2, -4, -6, \dots$ 正是定理前提里已经剔除的**平凡零点**！

把这些冒牌货清干净之后，前面所有因子全部非零，所以 $\zeta(s) = 0$ 被迫拖着 $\zeta(1-s) = 0$ 一起下水——可 $1 - s$ 在右半平面 $\operatorname{Re}(1-s) > \frac{1}{2}$，那里根本没有零点！矛盾诞生。

这就是以下两条 Lean 定理精准打包的逻辑：

::: {.theorem #thm-rh-of-right title="右半平面清空即得黎曼猜想" lean="Formalism/GammaFactorNonvanishing/RhOfRight.Formalism.VW.rh_of_right"}
若对一切满足 $\operatorname{Re}(s) > \frac{1}{2}$ 且 $s \neq 1$ 的复数 $s$ 均有 $\zeta(s) \neq 0$，则黎曼猜想成立。
:::

::: proof
对任意非平凡零点 $s$（$s \neq 1$ 且 $s \neq -2(n+1)$），按 $\operatorname{Re}(s)$ 与 $\frac{1}{2}$ 的大小三分。若 $\operatorname{Re}(s) > \frac{1}{2}$ 直接矛盾；若 $\operatorname{Re}(s) < \frac{1}{2}$，先由 $\zeta(0) = -1/2 \neq 0$ 排除 $s = 0$，再对 $1-s$ 调用函数方程 `riemannZeta_one_sub`：因为 $\operatorname{Re}(1-s) > \frac{1}{2}$，因子 $2(2\pi)^{-(1-s)}$、$\Gamma(1-s)$ 与 $\cos(\pi(1-s)/2)$ 均非零（后者为零恰对应 $s = 0$ 或负偶数），从而迫使 $\zeta(1-s) = 0$，与前提矛盾。完整证明由 Lean 内核检查。
:::

在另一条路径 [`RHofHalfPlane.lean`](lean:Formalism/ZetaNonvanishing/RHofHalfPlane.Formalism.riemannHypothesis_of_zero_free_halfPlane) 中，形式化还顺手显式检验了所有负奇数处 $\zeta(-(2m+1)) \neq 0$，给出等价的半平面归约：

::: {.proposition #prop-rh-halfplane title="半平面无零点归约（负整数分检版）" lean="Formalism/ZetaNonvanishing/RHofHalfPlane.Formalism.riemannHypothesis_of_zero_free_halfPlane"}
若对一切 $\operatorname{Re}(s) > \frac{1}{2}$ 均有 $\zeta(s) \neq 0$，则黎曼猜想成立。
:::

::: proof
当 $\operatorname{Re}(s) < \frac{1}{2}$ 时，若 $s$ 为非正整数，负偶数已被前提排除，$s = 0$ 由 $\zeta(0) \neq 0$ 排除，负奇数由函数方程在正偶数处的非零性排除；其余情形直接反射到 $1 - s$ 触发矛盾。完整证明由 Lean 内核检查。
:::

::: {.viz src="critical-mirror" preset="off-line" height="500"}
**复平面临界线镜像实验：** 绿色实线标出 $\operatorname{Re}(s) = \frac{1}{2}$ 与首个非平凡零点 $\frac{1}{2} + 14.1347i$；琥珀色测试点 $\rho = 0.76 + 10i$ 越过临界线时，函数方程立刻在左半带生成对称孪生点 $1 - \bar{\rho} = 0.24 + 10i$（品红色）。拖动画布上的 $\rho$ 或切换实验卡，即可把这面对称镜推回临界线。
:::

## 1.3 当镜子遇上“不纯”的狄利克雷特征 {#sec-ch01-imprimitive}

好了，$\zeta(s)$ 的镜子非常顺滑。可如果换成一个任意模 $N$ 的狄利克雷特征 $\chi$ 呢？

这里又有一只拦路虎。并不是每个特征 $\chi$ 都自带干净的函数方程——只有**本原特征（primitive character）**才满足完备函数方程 $\Lambda(\chi, s) = \varepsilon(\chi)\,\Lambda(\chi^{-1}, 1-s)$。

什么是“非本原”？打个极简单的比方：模 $12$ 的特征里，有些特征其实只关心一个数除以 $4$ 的余数，只不过它顺手把 $3$ 的倍数全都强行抹成了 $0$。从乘积角度看，这个模 $12$ 的 $L$ 函数，其实就是它背后的本原模 $4$ $L$ 函数，额外乘上了一枚有限的**欧拉削弱因子**：

$$
L(\chi, s) = L(\chi^{\mathrm{prim}}, s) \prod_{p \mid N} \bigl(1 - \chi^{\mathrm{prim}}(p)\, p^{-s}\bigr).
$$

读者立刻会警觉：坏了！如果这个多余的乘积因子 $(1 - \chi^{\mathrm{prim}}(p)\, p^{-s})$ 在临界带 $0 < \operatorname{Re}(s) < 1$ 里偷偷等于零，那非本原特征不就会冒出镜子管不到的“假零点”吗？

拿笔算一秒钟，心就放回肚子里了！设素数 $p \ge 2$，且 $\operatorname{Re}(s) > 0$。因为特征值要么是 $0$ 要么是单位圆上的复数，总有 $|\chi^{\mathrm{prim}}(p)| \le 1$；而另一方面，

$$
|p^{-s}| = p^{-\operatorname{Re}(s)} < p^0 = 1!
$$

两个数相乘，模长严格小于 $1$，它**绝对不可能等于 $1$**！也就是说，多余的欧拉因子只可能在 $\operatorname{Re}(s) = 0$ 的竖直边界上等于零，绝不可能迈进 $0 < \operatorname{Re}(s) < 1$ 半步！

> 数学里很多吓人的障碍，只要量一量它的模长，就会发现它连门都进不来。

下面三条 Lean 定理一气呵成地完成了“去掉多余欧拉因子 → 本原反射 → 锁定临界带”的三连击：

::: {.lemma #lem-euler-factor-ne-zero title="多余欧拉因子在开右半平面绝不为零" lean="Development/AutomorphicArithmetic/CharacterBoxes/ClaimStrip.Claim.factor_ne_zero"}
对任意模 $M$ 的狄利克雷特征 $\psi$、任意素数 $p$ 以及任意满足 $\operatorname{Re}(s) > 0$ 的复数 $s$，均有
$$
1 - \psi(p)\, p^{-s} \neq 0.
$$
:::

::: proof
由 $|\psi(p)| \le 1$ 与 $\operatorname{Re}(s) > 0$ 得 $|p^{-s}| = p^{-\operatorname{Re}(s)} < 1$，故 $|\psi(p) p^{-s}| < 1$，不可能等于 $1$。完整证明由 Lean 内核检查。
:::

::: {.lemma #lem-prim-reflect title="本原特征零点的临界带反射" lean="Development/AutomorphicArithmetic/CharacterBoxes/ClaimStrip.Claim.prim_reflect"}
设 $\psi$ 为模 $M \ge 1$ 的本原狄利克雷特征。若 $0 < \operatorname{Re}(s) < 1$ 且 $L(\psi, s) = 0$，则
$$
L(\psi^{-1}, 1 - s) = 0.
$$
:::

::: proof
因为 $\operatorname{Re}(s) > 0$，狄利克雷 $L$ 函数的伽马因子非零，于是 $L(\psi, s) = 0$ 迫使完备 $L$ 函数 $\Lambda(\psi, s) = 0$。由本原特征函数方程得 $\Lambda(\psi^{-1}, 1 - s) = 0$，再由 $\operatorname{Re}(1 - s) > 0$ 除回伽马因子即得 $L(\psi^{-1}, 1 - s) = 0$。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-crit-line title="本原特征的半平面到临界线归约" lean="Formalism/GammaFactorNonvanishing/CritLine.Formalism.VW.critLine"}
若对一切模 $N \ge 1$、一切狄利克雷特征 $\chi$ 与一切满足 $\operatorname{Re}(s) > \frac{1}{2}$ 且（$\chi \neq 1$ 或 $s \neq 1$）的 $s$ 均有 $L(\chi, s) \neq 0$，则对每个本原特征 $\chi$，其在临界带 $0 < \operatorname{Re}(s) < 1$ 内的所有零点都满足 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

::: proof
反证假设零点 $s$ 满足 $\operatorname{Re}(s) \neq \frac{1}{2}$。若 $\operatorname{Re}(s) > \frac{1}{2}$ 直接矛盾；若 $\operatorname{Re}(s) < \frac{1}{2}$，经由完备 $L$ 函数反射至 $(\chi^{-1}, 1 - s)$，其满足 $\operatorname{Re}(1-s) > \frac{1}{2}$ 且 $1 - s \neq 1$，再度与右半平面无零点矛盾。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-claim-strip title="任意特征的临界带归约" lean="Development/AutomorphicArithmetic/CharacterBoxes/ClaimStrip.Claim.strip"}
若全部狄利克雷 $L$ 函数在右半平面 $\operatorname{Re}(s) > \frac{1}{2}$（排除 $\chi = 1, s = 1$）上无零点，则对任意模 $N \ge 1$ 的任意（含非本原）狄利克雷特征 $\chi$，其在临界带 $0 < \operatorname{Re}(s) < 1$ 内的所有零点均满足 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

::: proof
由 [@lem-euler-factor-ne-zero]，非本原特征在 $0 < \operatorname{Re}(s) < 1$ 内的任何零点必然也是其诱导本原特征的零点；随后由 [@lem-prim-reflect] 反射至右半平面即得矛盾。完整证明由 Lean 内核检查。
:::

现在战局已经彻底明朗了。我们不再需要和“恰好等于 $\frac{1}{2}$”较劲，只需要回答一个更干脆的问题：

**怎样证明，在 $\operatorname{Re}(s) > \frac{1}{2}$ 的整片右半平面里，没有任何一个狄利克雷 $L$ 函数能碰到零？**

下一章，朗道将把复平面上这群看不见的幽灵，一把拽回到实数轴上的素数账本里。
