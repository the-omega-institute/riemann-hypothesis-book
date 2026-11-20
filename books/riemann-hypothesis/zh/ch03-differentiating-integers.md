# 第三章 给整数求导：斯捷潘诺夫行列式与高重数梦境

> 如果世界只是多项式，那一切都有导数可求、有重根可数；可整数偏偏是一块坚硬的石头——你只能先把它放进几何，石头才会长出切线。

为什么黎曼猜想在“有限域的函数世界”里早就被证明了？

把整数换成有限域 $\mathbb{F}_q$ 上的曲线（比如 $y^2 = x^3 + x$），那里的黎曼猜想分别被韦伊（André Weil）、德利涅（Pierre Deligne）以及斯捷潘诺夫（Sergei Stepanov）攻克。尤其是斯捷潘诺夫在 1969 年的证明，简直像一场魔术——只有短短几页初等代数，连上同调的影子都不用碰。

这场魔术的秘密就两个字：**重数（multiplicity）**。

## 3.1 斯捷潘诺夫魔术：为什么要造高阶零点 {#sec-ch03-stepanov}

拿一个极简单的例子看懂斯捷潘诺夫怎么数点。假设你想控制一条有限域曲线上有多少个有理点。如果只造一个普通多项式 $P(x)$，让它在每个点取值为 $0$（重数 $m = 1$），你最多只能说“点不能超过多项式的次数”，算来算去正好撞上平凡界，一点便宜也占不到。

可如果你能强迫 $P(x)$ 在每一个有理点不仅自己为 $0$，**连它的一阶导数、二阶导数……一直到第 $(m-1)$ 阶导数全都是 $0$**，情况就翻天覆地了！

每个点一下子抵得上 $m$ 个根。只要 $P$ 不是恒零多项式，就有经典的天平不等式：

$$
m \times (\text{点的个数}) \le \deg P.
$$

重数 $m$ 越做越大，点数的误差上限就被 $m$ 生生砍成原来的 $1/m$！打个直观比方：同样一张长度 $100$ 的菜单，如果每个菜只占 $1$ 格，能摆 $100$ 道菜；要是你规定每道菜必须连占 $m = 10$ 格，房间里最多就只能塞下 $10$ 道菜。

> 单次计数只管得了门槛，高重数才管得了人群；可离开多项式，谁允许你对整数求导？

这就是拦在所有数论学家面前一百五十年的**离散高墙**：有限域的多项式环里，导数 $\frac{d}{dx}$ 是天生免费的；可在普通的整数 $\mathbb{Z}$ 与素数面前，你怎么“对一个整数求导”？$n$ 和 $n+1$ 之间隔着无法连续缩小的空隙，普通微积分一脚踏进来就踩空了。

## 3.2 在不能求导的地方造出导数：二次型、CM 曲线与分次外尔模 {#sec-ch03-differentiating-integers}

要让整数也长出“导数”和“重数”，这套证明做了两件表面上看风马牛不相及、底层却通向同一个几何机制的改造：

1. **几何化身：把指数和变成二次型，把整数挂到 CM 椭圆曲线上**。面对素数或特征指数和，先通过反复使用帕塞瓦尔（Parseval）等式与“路径二次型”（$x_1 x_2 + x_2 x_3 + \cdots + x_{k-1} x_k$），把难以直接捉摸的特征平均，变成一组双线性配对；而在带有复乘法（CM）的椭圆曲线上，不变微分算子 $D$ 满足 $D^p \equiv 0 \pmod{p}$（对惰性素数 $p$），像在有限特征里自带“天然杀导数开关”一样，让泰勒展开的系数自动被素数幂整除！
2. **代数骨架：用“行除幂算子”与福克空间替导数守门**。在纯代数层面，如果我们要造出一个带有 $m$ 阶“整除重数”且绝对不会在有理系数之外散架的多项式/矩阵空间，就必须确保把矩阵行之间按分步降阶求导（除以阶乘的 **除幂算子** `rowDiv`）反复作用之后，整数格子仍然闭合不散！

::: {.figure src="ch03-stepanov-grid"}
**左：一阶穿越与 $m$ 阶贴轴的差别；右：分次外尔模与福克正定阶梯。** 左栏中，青色曲线 $(x - x_0)^5$ 在根处贴着横轴平躺，单个根抵得上五个线性根的次数预算；右栏中，从顶角最高权（琥珀色）出发，每一次分次行降阶算子 `rowDiv` 都沿着格点向下移动一格，并在青色福克正交结构下严格留在绿色外尔模边界之内。
:::

让我们在纸面上亲自摸一下右图里的这台“整数求导机”（分次外尔整除性 `GradedWeylDivisibility`）。想象一块 $r \times n$ 的变元矩阵 $X = (x_{a,j})$：列指标 $j$ 记录多项式的权重 $\nu$，行指标 $a$ 记录对称性。普通导数 $\partial/\partial x$ 在遇到 $x^5$ 时会吐出一个系数 $5$——如果在特征 $p$ 或者整环 $\mathbb{Z}$ 上做算术，这个吐出来的因子很烦人，因为它会把分母搞乱。

数学家的办法是改用**除幂算子（divided-power operator）** $\frac{1}{k!} D^k$：作用在 $x^k$ 上直接给出干净的 $1$，绝不带多余的阶乘碎片。可问题来了：你怎么保证由这些最高权向量的“除幂降阶”生成的整体格（外尔模 `weyl`），和由对称不变方程刻画的整体格（对偶外尔模 `dualWeyl`），在有理数乃至整数倍的意义下恰好对得严丝合缝？

这里登场的是量子物理学家再熟悉不过的老朋友——**福克内积（Fock / Fischer inner product）**。两个多项式 $f, g$ 的福克内积记作

$$
\langle f, g \rangle_{\mathrm{Fock}} = \sum_{m} f_m\, g_m \prod_{k} (m_k!),
$$

其中 $m$ 遍历所有单项式，系数乘上对应次数的阶乘积！你看这多像量子谐振子的阶梯算符：乘以变量 $x_k$ 是“升阶”，求导 $\partial/\partial x_k$ 是“降阶”，而那串阶乘 $\prod m_k!$ 恰恰保证了求导与乘法、乃至任意行除幂算子 `rowDiv a b k` 与它的反向算子 `rowDiv b a k` 互为精确伴随！

以下是 Lean 内核在 [`FinalB.lean`](lean:Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.fockQPos) 验真的一整串代数齿轮：

::: {.lemma #lem-fock-pos title="有理福克内积的对偶对称与严格正定性" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.fockQPos"}
对任意指标集 $\sigma$ 与任意有理系数多元多项式 $f, g \in \mathbb{Q}[X_\sigma]$，有理福克配对满足对称性 $\langle f, g \rangle_{\mathrm{Fock}} = \langle g, f \rangle_{\mathrm{Fock}}$，且只要 $f \neq 0$，必有
$$
\langle f, f \rangle_{\mathrm{Fock}} > 0.
$$
:::

::: proof
展开表达式 $\sum_m f_m^2 \prod_k m_k!$，每一项阶乘严格为正；只要 $f \neq 0$，至少存在一个支持集指标 $m$ 使得 $f_m \neq 0$，从而平方和严格大于零。完整证明由 Lean 内核检查。
:::

::: {.lemma #lem-fock-adj title="行除幂算子的福克伴随律" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.fockQRowDivAdj"}
对任意整数 $r, n \in \mathbb{N}$、任意行指标 $a, b \in \{0,\dots,r-1\}$、任意阶数 $k \in \mathbb{N}$ 及任意多项式 $f, g \in \mathbb{Q}[X_{r\times n}]$，成立
$$
\langle \operatorname{rowDiv}_{a,b}^{(k)}(f),\, g \rangle_{\mathrm{Fock}} = \langle f,\, \operatorname{rowDiv}_{b,a}^{(k)}(g) \rangle_{\mathrm{Fock}}.
$$
:::

::: proof
借助阶乘权重的组合恒等式，把单项式基底上“从第 $b$ 行抽走 $k$ 次幂并转移到第 $a$ 行”的系数对比与反向转移对齐，逐项验证线性算子伴随关系。完整证明由 Lean 内核检查。
:::

::: {.lemma #lem-rowdiv-graded title="除幂闭合子空间自动按行权重分次" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.rowDivClosedGraded"}
设 $M \subseteq \mathbb{Q}[X_{r\times n}]$ 是在全部行除幂算子 $\operatorname{rowDiv}_{a,b}^{(k)}$ 作用下闭合的 $\mathbb{Q}$-子模。则对任意 $f \in M$ 及任意行权重 $\mu : \operatorname{Fin} r \to \mathbb{N}$，$f$ 在权重 $\mu$ 上的齐次分量仍然属于 $M$。
:::

::: proof
对角化行拉伸算子（实际上只需提取各行总次数的幂次与欧拉算子），利用除幂闭合性在无限域 $\mathbb{Q}$ 上作范德蒙德（Vandermonde）插值，即可逐个剥离出任意单一权重 $\mu$ 的齐次分量。完整证明由 Lean 内核检查。
:::

把上面三块拼到一起，正交补就无处可逃了：如果外尔子模 $W$ 比对偶外尔模 $\nabla$ 小，取正交补 $W^\perp$，由正定性与伴随律，它里面必然藏着一个被所有升阶算子消灭的“第二条最高权直线”——可最高权直线在同权之下唯一，它已经躺在 $W$ 里了！所以正交补只能是零！

::: {.theorem #thm-weyl-eq-nabla title="有理数域上的分次外尔对偶重合定理" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.weylEqNablaQ"}
对任意自然数 $n \le r$ 及任意单调不增的权向量 $\nu : \operatorname{Fin} n \to \mathbb{N}$，有理外尔模与对偶外尔模完全重合：
$$
\operatorname{weyl}_{\mathbb{Q}}(r, n, \nu) = \operatorname{dualWeyl}_{\mathbb{Q}}(r, n, \nu).
$$
:::

::: proof
在有理福克内积（[@lem-fock-pos]）下，外尔模是含最高权向量的最小除幂闭合子模。由除幂伴随律（[@lem-fock-adj]）与分次分解（[@lem-rowdiv-graded]），任何正交补中的非零元素必能提升至一个最高权向量；而最高权线唯一且已在 `weyl` 中（`hwLine`），故正交补必为零，两者相等。完整证明由 Lean 内核检查。
:::

::: {.corollary #cor-weyl-rational title="整对偶外尔模的整数倍可控定理" lean="Formalism/GradedWeylDivisibility/FinalB.Formalism.GradedWeylDivisibility.weylRational"}
对任意 $n \le r$、任意反单调权 $\nu$ 及任意整系数对偶外尔模元素 $f \in \operatorname{dualWeyl}_{\mathbb{Z}}(r, n, \nu)$，存在非零整数 $c \neq 0$，使得
$$
c \cdot f \in \operatorname{weyl}_{\mathbb{Z}}(r, n, \nu).
$$
:::

::: proof
将整多项式 $f$ 映射到 $\mathbb{Q}$ 中落入 $\operatorname{dualWeyl}_{\mathbb{Q}}$，由 [@thm-weyl-eq-nabla] 写成有理外尔基元的有限线性组合，清去公分母 $c \in \mathbb{Z}\setminus\{0\}$ 即返回整外尔模。完整证明由 Lean 内核检查。
:::

你看清这台机器的用途了吗？**它保证无论整除重数叠得多高，整系数结构永远不会在除法过程中漏出有理分母的窟窿。**

可光有这台抽象的整除引擎还不够——在真正面对长度高达 $X$ 的素数和 $\sum_{n \le X} \Lambda(n)(X/n - 1)$ 时，我们上哪儿去连造几百、几千甚至 $m \sim \sqrt{X}$ 阶“彼此嵌套的自守导数”呢？

> 当单个空间给不出足够的重数，唯一的出路不是硬挤同一把尺子，而是把一连串空间首尾相接，让每一次跃迁替你多求一次导。

下一章，我们将目睹整座证明最令人屏息的一步：用一条由 $\sqrt{X}$ 面镜子组成的 **Theta 提升链**，在自守形式的世界里原生地造出 $\sqrt{X}$ 阶重数。
