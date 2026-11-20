# 第五章 冲破 $2/3$ 天花板：格斜率、博斯特不等式与积分胶合

> 每个人单独攒钱，攒到三分之二就会被利息吃光；把整条街的账本胶合在一起，拿彼此正交的余数去摊薄成本，那最后六分之一的悬崖才终于垮塌下来。

第四章结束时我们撞上了一件无比诚实、也无比扎眼的事：**单靠一条孤立的迭代 Theta 提升链，整套不等式在 $\sigma = \frac{2}{3}$ 处会准时熄火。**

顺便一提，如果你关注过解析数论的历史，大概不会对 $\frac{2}{3}$ 这个分数感到陌生——从各种单变量均值、零点密度到切比雪夫式多面体截断，无数看似毫不相干的经典路线总爱在 $\frac{2}{3}$ 或者 $\frac{3}{4}$ 附近原地打转。这里的道理一点也不玄：每向上提升一次，形式次数（formal degree）与等距群上的整点范数确实会送给你一份整除收益；可与此同时，格子的**余体积（covolume）与能级高度成本**也跟着往上涨！算一遍账你就明白，单独拎一个赫克特征来做单线提升，收益的指数和成本的指数一抵消，最高只能推平到 $\sigma = \frac{2}{3}$，再往 $\frac{1}{2}$ 迈一步就会入不敷出。

怎么把成本降下来？答案就两步：**先用“格斜率”把成本账量到毫厘不差，再把整族特征“胶合”成一根公共的整骨架。**

## 5.1 格子的屋顶：什么是 Harder–Narasimhan 最大斜率？ {#sec-ch05-lattice-slopes}

别被“Harder–Narasimhan 滤过”和“博斯特（Bost）斜率不等式”这两个大词唬住。它们讲的其实是一个小学算术就能摸清的“屋顶与短向量”故事。

把一个 $r$ 维整格（lattice）$L \subset E$ 想象成一座盖在欧氏空间 $E$ 里的仓库：

- 它的维度（秩）是 $\operatorname{rk}(L)$；
- 它的基本平行多面体体积叫**余体积** $\operatorname{covol}(L)$。如果格点都很挤，余体积就特别小；如果格点稀稀拉拉，余体积就特别大。

为了把乘法变成加法，数学家给每个子格 $N \le L$ 定义一个叫**度数（degree）**的量，再除以秩，就得到这条子格的**斜率（slope）**：

$$
\deg(N) = -\ln \operatorname{covol}(N), \qquad \mu(N) = \frac{\deg(N)}{\operatorname{rk}(N)}.
$$

记住一个直觉就够了：**子格越紧凑（余体积越小），它的“度数”就越高，屋顶斜率 $\mu(N)$ 就越陡峭！** 而整个格 $L$ 所有非零子格斜率的上确界，叫做最大斜率 $\mu_{\max}(L)$。

来手算一个具体的四段小例子！假设一个秩为 $7$ 的格 $L$，里头嵌套着一串饱和子格 $0 = L_0 \subset L_1 \subset L_2 \subset L_3 \subset L_4 = L$，对应的 $(\operatorname{rk}, \deg)$ 坐标依次是：

- $(0, 0) \to (1, 1.8)$：第一段斜率 $\mu_1 = 1.8 / 1 = 1.8$（极其紧凑的短向量方向！）；
- $(1, 1.8) \to (3, 4.4)$：第二段增量斜率 $(4.4 - 1.8) / (3 - 1) = 1.3$；
- $(3, 4.4) \to (5, 5.4)$：第三段增量斜率 $(5.4 - 4.4) / (5 - 3) = 0.5$；
- $(5, 5.4) \to (7, 5.0)$：第四段增量斜率 $(5.0 - 5.4) / (7 - 5) = -0.2$。

把这四个点连成折线，你看到什么？斜率 $1.8 > 1.3 > 0.5 > -0.2$ 一步步严格递减，**像一座严格向上凸起的拱形屋顶！** 整个格子的平均斜率只有 $5.0/7 \approx 0.714$，可最左侧那一根“屋脊”就已经把 $\mu_{\max}(L) = 1.8$ 顶到了天上——而这根屋脊斜率，反过来立刻逼出一个长度极短的非零整格向量！

::: {.figure src="ch05-slope-barrier"}
**左：单特征提升在 $2/3$ 撞墙与多特征胶合击穿至 $1/2$（示意模型 `MODEL`）；右：Harder–Narasimhan 凸斜率多边形。** 左栏中，品红实线展示单特征提升在 $m \sim \sqrt{X}$ 后依然平滞在 $\sigma = 2/3$ 上方，而青色胶合曲线越过该水平墙并逼近绿色的 $\sigma = 1/2$ 临界线。右栏按 $(\operatorname{rk}, \deg)$ 实算点 $(0,0), (1,1.8), (3,4.4), (5,5.4), (7,5.0)$ 绘制斜率多边形：琥珀色标出最陡首段 $\mu_{\max} = 1.8$，灰色虚线为总平均斜率 $5.0/7 \approx 0.714$。
:::

Formalism 的 [`ExistsSaturatedSlopeEqMuMax.lean`](lean:Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.slopesBdd) 已经把这套“格斜率几何”从基石开始全部打进了 Lean 内核：

::: {.theorem #thm-slopes-bdd title="格斜率集合有上界与最大斜率控制" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.slopesBdd Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.slopeLeMuMax"}
对任意有限维实内积空间 $E$ 中的离散子模（整格）$L \le E$，其所有非零子格的斜率集合 $\operatorname{slopes}(L)$ 必有上界；且对任意非零子格 $N \le L$，恒有
$$
\mu(N) \le \mu_{\max}(L).
$$
:::

::: proof
借助格拉姆（Gram）行列式在正交投影与基底替换下的乘积上界 `gramDetLe`，先证明所有子格的余体积存在由向量范数下界决定的统一正下界，从而 $-\ln\operatorname{covol}(N)/\operatorname{rk}(N)$ 一致有上界；随后由上确界定义直接得到每个子格斜率不超过 $\mu_{\max}(L)$。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-short-vector title="闵可夫斯基短向量存在定理" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.shortVector"}
对任意有限维实内积空间 $E$ 中的非零离散格 $L \le E$，必存在非零向量 $v \in L$，使得
$$
\|v\| \le \sqrt{\operatorname{rk}(L)}\; \operatorname{covol}(L)^{1/\operatorname{rk}(L)}.
$$
:::

::: proof
将 `covol(L)` 等同于测度意义下的 ZLattice 余体积（`covolEqCovolume`），在以半径 $R$ 选取的凸对称体上调用闵可夫斯基凸体定理与格点离散性，从欧氏范数与 $\ell^\infty$ 范数的 $\sqrt{\operatorname{rk}(L)}$ 系数换算即得。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-deg-quot-add title="饱和子格的度数与秩的可加性" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.deg_eq_deg_add_deg_quot"}
设 $L \le E$ 为离散格，$N \le L$ 为饱和子格（即 $N = L \cap \operatorname{span}_{\mathbb{R}}(N)$），记 $L/N$ 在 $N^\perp$ 上的正交投影商格为 $\operatorname{quot}(L, N)$。则商格同样离散，且满足
$$
\operatorname{rk}(L) = \operatorname{rk}(N) + \operatorname{rk}\bigl(\operatorname{quot}(L, N)\bigr),
\qquad
\deg(L) = \deg(N) + \deg\bigl(\operatorname{quot}(L, N)\bigr).
$$
:::

::: proof
选取 $N$ 的一组整基并扩充为 $L$ 的整基，商格的正交投影给出块三角矩阵的格拉姆分解，于是 $\operatorname{covol}(L) = \operatorname{covol}(N)\cdot \operatorname{covol}(\operatorname{quot}(L, N))$；两边取负对数即得度数可加性。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-mumax-le-min title="最小向量长度对最大斜率的控制" lean="Formalism/LatticeSlopes/ExistsSaturatedSlopeEqMuMax.Formalism.F.muMaxLeMin"}
设 $L \le E$ 为非零离散格。若 $L$ 中一切非零向量的长度均不小于 $r > 0$，则最大斜率受控于
$$
\mu_{\max}(L) \le -\ln r + \frac{1}{2}\ln\bigl(\operatorname{rk}(L)\bigr).
$$
:::

::: proof
对任意非零子格 $N \le L$ 应用 [@thm-short-vector] 得 $r \le \|v\| \le \sqrt{\operatorname{rk}(N)}\,\operatorname{covol}(N)^{1/\operatorname{rk}(N)}$，取对数整理后再对所有子格取上确界，结合 $\operatorname{rk}(N) \le \operatorname{rk}(L)$ 完成。完整证明由 Lean 内核检查。
:::

看清楚这套“斜率控制短向量 / 最小长度反压斜率”的对偶了吗？博斯特（Bost）的斜率不等式（`SlopeInequality`）做的正是同一件事的映射版：如果你把一个整格 $L$ 通过单射线性映射 $\varphi$ 送进另一个整格 $M$，而且映射至多把长度放大 $C$ 倍，那么

$$
\mu(L) \le \mu_{\max}(M) + \ln C.
$$

只要你能造出一个在每一点都没有“意外高斜率尖刺”的整结构，整除链的算术高度就不会失控！

::: {.viz src="theta-chain-budget" preset="hn-polygon" height="500"}
**交互式 Harder–Narasimhan 凸斜率屋顶：** 由五个实算滤过点 $(0,0), (1, 1.8), (3, 4.4), (5, 5.4), (7, 5.0)$ 张成的上凸包络，琥珀色标出最陡首段斜率 $\mu_{\max} = 1.8$ 对照虚线总平均斜率 $5/7 \approx 0.714$。在完整页面里把 $(1, h_1)$ 往下拖过 $4.4/3$，屋顶便会直接跨步跳过 $(0,0) \to (3, 4.4)$。
:::

## 5.2 跨越 $2/3$ 的最后一跃：把整族赫克特征胶合起来 {#sec-ch05-integral-gluing}

现在回到最关键的算术账：**既然单挑一个赫克特征算账会停在 $\frac{2}{3}$，“跨特征胶合（integral gluing across Hecke characters）”究竟省下了哪一笔钱？**

打个生活化的比方。你去菜市场买 $K$ 样菜，如果每一家摊位都要你单买一只专用的塑料箱运回去，运费高得吓人（总成本随特征个数线性膨胀，压死在 $\frac{2}{3}$）；可如果你发现这 $K$ 样菜在同一个批发仓里有公共的最大公约数包装（“take a gcd”），能用同一个紧凑的整格子统一装下、并且不同特征对应的列向量在空间里**近似正交**——那总体积就不用乘以 $K$ 倍的惩罚，而是沿着正交方向把每根柱子的误差平方均摊掉！

在形式化证明显式的“第 15–16 步”里，这个想法精准落成两步组合拳：

1. **在多种赫克特征之间粘合出一个公共的整结构（integral structure）**，就像把不同特征的向量拼成一张大矩阵的各列，再借助 `GL(5)` 六重覆盖上的自守 $\mu$ 与相对迹公式（relative trace formula），经由柯西–施瓦茨不等式把相关性压回一个经过适当投影的庞加莱级数（Poincaré series）的范数上界。
2. **确认整结构各列之间“近似正交”**。只要列与列几乎垂直，整体方阵的格拉姆行列式就接近各列长度平方的乘积——没有多余的交叉塌缩，于是格斜率不会冒出可怕的尖峰，原本卡在 $\frac{2}{3}$ 的余项一下子掉进 $\frac{1}{2} + \varepsilon$ 的门槛之内！

> 单独的一根筷子容易在三分之二处折断；把彼此几乎垂直的向量胶合成一张整格的网，斜率就会自己站直。

不过，要把这张跨特征的大网真正铺开到**每一个**算术级数与狄利克雷特征上，还潜伏着最后一群最狡猾的捣乱分子：那些潜伏在岩泽（Iwasawa）特征塔层之间的共振，以及局部与整体伽罗瓦上同调里的顽固障碍类。

下一章，证明将搬出**贝伦德高维整数球壳**与弱化版范迪弗（Vandiver）控制定理，彻底清场并合拢大网！

::: {.viz src="theta-chain-budget" height="560"}
**完整的提升链与格斜率实验室：** 在“Theta 链与 $\frac{2}{3}$ 墙”和“Harder–Narasimhan 屋顶”两个场景间切换，滑动深度比 $m/\sqrt{X}$、跨特征胶合度与首段度数 $h_1$，观察整除预算如何从单兵停滞走入 $\frac{1}{2}$ 区间。
:::
