# 第四章 $\sqrt{X}$ 面镜子：迭代 Theta 提升与跷跷板法则

> 一面镜子只能把人照一遍；把 $\sqrt{X}$ 面镜子首尾排成一条长廊，每一次折射都在替你多求一次导——而走到走廊尽头时，跷跷板轻轻一翻，竟把原本缠住每个特征的绳索一把解开。

整座证明里最让人拍案叫绝的一句话，就出现在作者宣布工作成果的短记里：面对长度为 $X$ 的冯·曼戈尔特素数和，应该把 Theta 提升首尾相连多少次，才能在自守形式的世界里原生地模拟“高阶求导的重数 $m$”？

答案是：

$$
m \sim \sqrt{X}.
$$

退后一步想想，为什么偏偏是 $\sqrt{X}$？

如果整段素数和里有 $X$ 个自然数在晃动，你要靠“高重数”把它们按在临界线 $\sigma = \frac{1}{2}$ 附近，重数 $m$ 绝不能只是 $2$、$3$ 或者 $\ln X$——一个常数阶的重数就像拿玩具小铲子去拦钱塘江大潮。反过来，如果你贪心地让 $m$ 太大（比如 $m \sim X$），那每一步提升累积起来的体积、能级和高度成本就会当场把整座塔压垮！只有在 **$m \sim \sqrt{X}$** 这条刀锋平衡线上，“重数赢得的相消深度”才恰好和“整链条付出的高度代价”咬合成完美比例，让你在第五章胶合出直指 $\frac{1}{2}$ 的窗口！

## 4.1 什么是 Theta 提升链：多照一面镜子，就多一层导数 {#sec-ch04-theta-chain}

先把“定酉群上的 Theta 提升”翻译成普通人一眼就懂的画面。

别被“全定酉群 $U(X_j)$”四个字吓住。“全定（totally definite）”在几何上反而是**最温柔、最紧凑**的那一类群——不像在无穷远边界发散的双曲群，它在无穷远素位上是一个紧群（就像一只封闭圆润的球面），所以上面的自守形式其实只不过是在有限个厄米特格（Hermitian lattice）类代表上定义的有限维向量函数！

每做一次 Theta 提升 $U(X_j) \to U(X_{j+1})$，干的是什么事？
你可以把它看成一台“双核投影仪”：左边站着一群在 $U(X_j)$ 上算账的函数 $f$，中间挂着一块在两群乘积上写好的核矩阵 $\Theta$，经过有限个格代表点求和：

$$
(\text{提升后的函数})(y) = \sum_{i} w_i\, f(i)\, K_j(i, y).
$$

在表示论的语言里，一次提升把原本的自守表示 $\pi$ 换成了 $\pi \boxplus \mu_j[t]$——多塞进了一根与赫克特征 $\mu_j$ 相伴的“重数线”。当你把这样的核矩阵 $K_0, K_1, \dots, K_{m-1}$ 一环扣一环串联起来，从 $U(X_0)$ 一路提升到 $U(X_m)$：

$$
U(X_0) \longrightarrow U(X_1) \longrightarrow U(X_2) \longrightarrow \cdots \longrightarrow U(X_m),
$$

这串迭代锁链就原生生成了**阶数高达 $m$ 的相消与重数**，完全不需要人为硬去对整数做做不到的普通微积分求导！

::: {.figure src="ch04-theta-chain"}
**左：长度为 $m \sim \sqrt{X}$ 的迭代 Theta 提升链；右：把提升周期翻成无特征依赖的贝塞尔周期的跷跷板图。** 左栏展示从基空间 $U(X_0)$ 出发，每一节绿色核矩阵提升都为自守形式叠加一层重数（青色节点依次抬升，琥珀色标出当前传递环节），直到抵达第 $m$ 阶群 $U(X_m)$；右栏画出跷跷板菱形对偶，把左斜边上依赖赫克特征的迭代提升周期，对称翻转为右斜边上与赫克特征无关的贝塞尔（Bessel）周期。
:::

Formalism 里的 [`ChainScalar.lean`](lean:Formalism/ThetaLiftIndependence/ThetaOrbitSums/ChainScalar.Formalism.ThetaLiftIndependence.ChainScalarLemmas.mem) 和 [`LatLiftIndep.lean`](lean:Formalism/ThetaLiftIndependence/ThetaOrbitSums/LatLiftIndep.Formalism.ThetaLiftIndependence.latLiftIndep) 用极其清爽的有限维线性代数，把这条长链的两项核心不变性焊死了：

1. **整链条不会越出整数/子模边界**（迭代伴随链在整条 $m$ 步链上保持子模闭合）；
2. **提升结果不挑具体怎么选格代表元**（格类代表元的任意等距替换，总和一分不差）；
3. **有限域高斯算子的完美可逆对称**（用于把特征求和转换为对称内积时的核心标度 $\lvert\mathbb{F}\rvert$）。

::: {.lemma #lem-chain-scalar-mem title="迭代降阶链的伴随保持子模不变性" lean="Formalism/ThetaLiftIndependence/ThetaOrbitSums/ChainScalar.Formalism.ThetaLiftIndependence.ChainScalarLemmas.mem"}
设 $T_j : E_{j+1} \to E_j$ 是一列有限维内积空间之间的线性映射，$S_j \le E_j$ 为一列子模。若每一步的伴随算子都把 $S_j$ 映入 $S_{j+1}$（即 $\forall x \in S_j,\; T_j^*(x) \in S_{j+1}$），则对任意链长 $m \in \mathbb{N}$ 及任意 $x \in S_0$，沿着复合链走到底的伴随像仍落在终点子模中：
$$
(\mathrm{downChain}_T(m))^*(x) \in S_m.
$$
:::

::: proof
对链长 $m$ 作数学归纳：$m = 0$ 时伴随恒等映射留在 $S_0$；由 $(A \circ B)^* = B^* \circ A^*$ 把第 $m+1$ 步拆成先走前 $m$ 步再作用 $T_m^*$，直接由归纳假设与单步不变性完成。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-lat-lift-indep title="格提升求和不依赖于类代表元选取" lean="Formalism/ThetaLiftIndependence/ThetaOrbitSums/LatLiftIndep.Formalism.ThetaLiftIndependence.latLiftIndep"}
设 $K$ 为数域，$V$ 为 $K$-向量空间，$h$ 为 $V$ 上的埃尔米特型。若函数 $f$ 与核 $\Theta$ 均在等距群 $\operatorname{Isom}(h)$ 的作用下不变，则对格 $L$ 的任意两组合法的整类代表元集 $s, s'$，加权格提升和完全相等：
$$
\operatorname{latLift}(h, s, f, \Theta) = \operatorname{latLift}(h, s', f, \Theta).
$$
:::

::: proof
任意两组类代表元集 $s$ 与 $s'$ 之间都可以通过等距群作用建立双射（若存在两组群元素把同一格映过去，轨道稳定子对齐保证逆映射唯一配对）；结合权重、$f$ 与 $\Theta$ 的 $\operatorname{Isom}(h)$-不变性，两套求和逐项相等。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-final-gauss-op title="有限域高斯核算子的对偶反演律" lean="Formalism/ThetaLiftIndependence/FinalThetaLiftAMFKIndep.Formalism.ThetaLiftIndependence.final_gaussOp"}
设 $\mathbb{F}$ 为有限域，$\psi$ 为其上的非平凡加法特征，$\rho : \mathbb{F}^\times \to \operatorname{End}_{\mathbb{C}}(V)$ 为群表示。若向量 $v \in V$ 满足 $\sum_{c \in \mathbb{F}^\times} \rho(c) v = 0$，则高斯算子与它的对偶算子互相复原，且恰好缩放有限域的阶数 $|\mathbb{F}|$：
$$
\operatorname{gaussOp}(\psi, \rho)\bigl(\operatorname{gaussOpDual}(\psi, \rho)(v)\bigr) = |\mathbb{F}| \cdot v,
\qquad
\operatorname{gaussOpDual}(\psi, \rho)\bigl(\operatorname{gaussOp}(\psi, \rho)(v)\bigr) = |\mathbb{F}| \cdot v.
$$
:::

::: proof
展开两重高斯算子的求和并用加法特征正交关系：当乘子 $a = 1$ 时贡献 $|\mathbb{F}| - 1$，其余 $a \neq 1$ 的高斯和与 $\sum_{c \neq 0} \rho(c)v = 0$ 配对后正好补出最后的 $+1$，合为标量乘法 $|\mathbb{F}| \cdot v$。完整证明由 Lean 内核检查。
:::

## 4.2 跷跷板法则、大胞腔主子式与形式次数 {#sec-ch04-seesaw-bessel}

好了，现在整条 $\sqrt{X}$ 层的提升链已经搭到终点 $U(X_m)$ 上了。可你马上会遇到一个棘手的问题：**在 $U(X_m)$ 上直接算周期积分，里面还缠着一连串挑好的赫克特征 $\mu_1, \dots, \mu_m$！** 特征一多，上界就越缠越死，根本没法做独立下界估计。

怎么一把甩掉这串粘人的赫克特征？

答案叫**跷跷板法则（Seesaw identity）**，或者说是拉利斯（Rallis）内积公式的一记神来之笔。

玩过跷跷板的人都知道：左边一个胖孩子和右边一个瘦孩子坐在同一根横梁上，你想量左边那个孩子有多重，不必把秤硬塞到他屁股底下，只需站在右边称出对偶端那块配重有多沉就行了！在双群对偶（dual reductive pair）组成的菱形跷跷板上：

- **左斜边**记录的是“顺着链条一路提升 $m$ 次之后的自守积分周期”，它明显牵扯着那一串特征；
- **右斜边**则是把同一组自守积分“在另一条对偶腿上压扁”，把它直接变成大群体上的一枚**贝塞尔周期（Bessel period）**——神奇的是，这个贝塞尔周期里**干干净净，半点都不依赖那一串赫克特征了**！

不过，跷跷板能稳稳立住、而且左边的正定范数能反过来压出右边整除下界，还必须算准另外两笔硬账：一是分片积分时主胞腔（big cell）上的坐标变换和行列式主子式，二是离散系列表示（discrete series）的**形式次数（formal degree）**——它决定每一级提升在积分测度里到底值多少权重。

以下两条定理由 [`FinalBF.lean`](lean:Formalism/FormalDegreeBessel/FinalBF.Formalism.QuantumDeterminants.bigCellMinors) 与 [`FdegFactorial.lean`](lean:Formalism/FormalDegreeBessel/FdegFactorial.Formalism.QuantumDeterminants.fdegDimV) 精确刻画：

::: {.theorem #thm-big-cell-minors title="大胞腔坐标下的顺序主子式与双向量配对" lean="Formalism/FormalDegreeBessel/FinalBF.Formalism.QuantumDeterminants.bigCellMinors"}
设 $k, r \in \mathbb{N}$，$z, z' \in \mathbb{C}^{2r+k+1}$ 满足各向同性配对条件 `inWb`，对任意参数 $c \in \mathbb{C}^r$ 与内部酉块 $\mu \in M_{k+1}(\mathbb{C})$ 构造的大胞腔元素 `bigCell k r c μ`，其第 $l$ 阶顺序主子式精确等于前 $l$ 个对角参数之积
$$
D_l\bigl(\operatorname{bigCell}(k, r, c, \mu)\bigr) = \prod_{a < l} c_a,
$$
且当各 $c_a \neq 0$ 时，比值子式精确还原出 $c_a$，配对核函数亦由标准埃尔米特双线性型直接给出。
:::

::: proof
在经过 `inWb` 标架约化的基底下，大胞腔矩阵呈现清晰的块上/下三角与对角乘积结构；利用分块行列式分解即可逐阶算出全部顺序主子式与比值，并把核函数化归为标准埃尔米特配对。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-fdeg-dim-v title="哈里什–钱德拉（Harish-Chandra）离散系列的形式次数公式" lean="Formalism/FormalDegreeBessel/FdegFactorial.Formalism.QuantumDeterminants.fdegDimV"}
对任意正整数 $n \in \mathbb{N}$ 与严格递减的哈里什–钱德拉参数 $\lambda_0 > \lambda_1 > \dots > \lambda_{n-1}$，离散系列表示的形式次数精确等于参数差的范德蒙德乘积除以连续阶乘之积：
$$
\operatorname{fdeg}(\lambda) = \frac{\displaystyle\prod_{0 \le a < b < n} (\lambda_a - \lambda_b)}{\displaystyle\prod_{i=0}^{n-1} i!}.
$$
:::

::: proof
因为参数严格递减，所有绝对值 $|\lambda_a - \lambda_b|$ 均简化为 $\lambda_a - \lambda_b$；再把按行、按列重排的二重积 $\prod_{a < b}(b - a)$ 精确算成 $\prod_{i=0}^{n-1} i!$（`formal_degree_factorial_holds`），即得维数/形式次数闭式。完整证明由 Lean 内核检查。
:::

读到这里，链条有了，跷跷板也架好了。可真正算完这笔“每提升一次要花多少钱”的成本账时，数学家们立刻被泼了一盆冷水——

**如果老老实实只用单条提升链、不去动用一整族赫克特征的“胶合”，整座证明在 $\sigma = \frac{2}{3}$ 处就会彻底耗尽预算！**

> 任何孤立的好办法走到极限，都会撞上一道刚性的分数天花板。$\frac{2}{3}$ 不是偶然的数字，它是单兵作战的账本上限。

下一章，我们就来算一笔惊心动魄的几何账：用格斜率和博斯特不等式看清为什么 $\frac{2}{3}$ 卡得那么死，再用跨特征胶合一举把它砸穿到 $\frac{1}{2}$！

::: {.viz src="theta-chain-budget" preset="root-x-glued" height="500"}
**$\sqrt{X}$ 级联镜廊与 $\frac{2}{3}$ 天花板实验：** 左侧给出从 $U(X_0)$ 到 $U(X_m)$ 的迭代提升走廊与紫色跷跷板菱形（把带赫克特征的提升周期翻成无特征依赖的贝塞尔周期）；右侧的 `MODEL` 阈值曲线显示单特征模型停滞在 $\frac{2}{3}$，而当胶合正交参数到达并跨越阈值、深度推至 $b = m/\sqrt{X} = 3.5$ 时，青色胶合曲线跌至 $0.5002$ 逼近 $\frac{1}{2}$。
:::
