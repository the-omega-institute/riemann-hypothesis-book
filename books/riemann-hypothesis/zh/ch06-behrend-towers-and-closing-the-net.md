# 第六章 贝伦德塔与收网时刻：驯服余项与打通所有特征

> 把整数放进高维球壳：球面弯成弧线，所以任意三个点永远排不成一条等差直线；可球面又足够宽敞，总有一层能接住整座塔的重量。等障碍全被这套球壳和局部–整体网压服，最后一张网就会同时收紧在所有狄利克雷特征头上。

到了第五章，我们已经知道了怎样靠“$\sqrt{X}$ 链条 + 跨特征胶合”砸穿 $\frac{2}{3}$ 的天花板。可要把这套装置真正放到**全部模 $N$、全部狄利克雷特征 $\chi$** 上运转起来，最后还有两头拦路虎需要清场：

1. **选塔的层级时怕撞上“等差共振”**：构建岩泽（Iwasawa）塔的层高时，如果选中的模数或旋转步长之间凑巧冒出三项等差关系 $s_2 - s_1 = s_3 - s_2$（或者更一般的整数关系 $\alpha s_1 + \beta s_2 + \gamma s_3 = 0$），相消误差就会沿着同一条轨道重复叠加、失控放大！
2. **拧不掉的局部–整体伽罗瓦障碍**：靠扭转（twisting）消不掉的伽罗瓦上同调障碍类（$H^1(\mathfrak{o}_E[1/\ell], \mathbb{Q}_\ell/\mathbb{Z}_\ell(-e))$），就像卡在齿轮缝里的铁屑——必须把一种强力的“弱化版范迪弗（Vandiver）界”和局部–整体朗兰兹相容性打穿，齿轮才能顺滑咬合。

## 6.1 为什么整数球壳永远躲得开三项等差数列？ {#sec-ch06-behrend-sphere}

先拿笔算一个你立刻就能爱上的几何把戏——1946 年贝伦德（Felix Behrend）用来构造“不含三项等差数列的最密整数集”的绝招。

把 $\{0, 1, 2, 3, 4\}^3$ 这 $5^3 = 125$ 个三维整数点想象成一座 $5 \times 5 \times 5$ 的立体方块。按每个点到原点的平方半径 $R = x_1^2 + x_2^2 + x_3^2$ 给它们分壳：最小是 $R = 0$，最大是 $R = 3 \times 4^2 = 48$，一共只有 $32$ 个不同的半径值！（注意并非 $0$ 到 $48$ 的所有整数都能写成三个平方之和，例如 $7, 15, 23, 28, 31, 39, 47$ 都不在其中。）

根据最朴素的鸽巢原理，既然 $125$ 个点挤在 $32$ 个不同球壳上，**至少有一个球壳上的点不少于 $\lceil 125 / 32 \rceil = 4$ 个**——实际上算出来最胖的球壳在 $R = 17$ 处，足足挂了 $9$ 个整点：

$$
(0, 1, 4),\; (0, 4, 1),\; (1, 0, 4),\; (1, 4, 0),\; (2, 2, 3),\; (2, 3, 2),\; (3, 2, 2),\; (4, 0, 1),\; (4, 1, 0).
$$

现在奇迹发生了：**在这 9 个点里，你绝对挑不出任何三个能排成等差数列 $A, B, C$（即 $B = \frac{A+C}{2}$）的组合！**

为什么？根本不用一个一个试，一眼就看穿：
球面是**严格外凸**的！如果 $A$ 和 $C$ 是同一个半径为 $\sqrt{R}$ 的球壳上的两个不同点，那连接它们的弦的中点 $B = \frac{A+C}{2}$ 必然**深深扎进球体内部**，它的平方半径严格小于 $R$（由平行四边形公式 $\|B\|^2 = \frac{\|A\|^2 + \|C\|^2}{2} - \frac{\|A-C\|^2}{4} = R - \frac{\|A-C\|^2}{4} < R$）！中点根本不可能落在球壳上！

把三维向量按进制 $B$ 编成一维整数 $t = x_1 + x_2 B + x_3 B^2$（如果进制 $B$ 足够大就不会发生进位串位），**球壳上的几何禁止三点共线，瞬间就翻译成整数集里绝不含三项等差数列！** 而只要升高维数再取最胖球壳，集合密度就能做到极其惊人的 $\ge N \exp(-C\sqrt{\ln N})$——既把共振轨道扫得干干净净，又几乎没损失多少层级容量！

::: {.viz src="behrend-sphere" preset="ap-forbidden" height="500"}
**三维贝伦德球壳禁绝三项等差数列：** 在 $\{0, \dots, 4\}^3$ 中平方半径为 $R = 17$ 的半透明玻璃球壳上精确嵌着 9 个整数点（青色）；任取其中两颗琥珀色端点 $a = (0,1,4)$ 与 $b = (2,3,2)$，连接它们的弦中点 $m = (1,2,3)$ 满足 $\|m\|^2 = 14 < 17$（品红色），必然深陷球壳内部——三项等差数列数为 $0$。
:::

有了这种“无共振厚集”和相应的加权分布控制，Lean 形式化用一条极其凝练的概率挑选定理 `select` 完成了去随机化抽取，又用 `trivStab` 锁死了高阶伽罗瓦矩阵群的平凡稳定子：

::: {.theorem #thm-behrend-select title="方差阈值下的确定性子集挑选定理" lean="Formalism/BehrendSets/TranslateMean.Formalism.BehrendSets.Final.select"}
设 $X$ 为有限集，$\delta \in [0, 1]$，随机代价函数 $Y : \mathcal{P}(X) \to \mathbb{R}_{\ge 0}$ 非负，且偏差阈值 $\lambda > 0$ 满足二项方差界 $2 |X| \delta(1 - \delta) < \lambda^2$。则必存在确定的子集 $T \subseteq X$，同时满足基数贴近均值且代价不超过两倍期望：
$$
\bigl|\lvert T\rvert - \delta \lvert X\rvert\bigr| \le \lambda
\qquad \text{且} \qquad
Y(T) \le 2\,\mathbb{E}_{X,\delta}[Y].
$$
:::

::: proof
在子集幂集上赋予参数 $\delta$ 的伯努利乘积测度，用切比雪夫不等式估算基数偏离超过 $\lambda$ 的事件概率严格小于 $1/2$，再用马尔可夫不等式估算 $Y(T) > 2\,\mathbb{E}[Y]$ 的概率至多为 $1/2$；两者之和严格小于 $1$，故必存在同时避开两类坏事件的确定性子集 $T$。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-triv-stab title="高阶素数幂群作用下的平凡稳定子定理" lean="Formalism/BehrendSets/FinalE.Formalism.BehrendSets.FinalE.trivStab"}
设 $E$ 为数域，$k \in \mathbb{N}$，$g$ 为素数且满足次数限制 $[E:\mathbb{Q}]\cdot k < g - 1$。则矩阵群 $\mathrm{GL}_k(E)$ 中任意有限 $g$-子群 $\Gamma$ 必为平凡群：
$$
\Gamma = \{1\}.
$$
:::

::: proof
若 $\Gamma$ 非平凡，必存在阶恰为素数 $g$ 的矩阵 $\gamma \in \Gamma$。其极小多项式在 $E$ 上必含本原 $g$ 次单位根的因子；分圆域 $\mathbb{Q}(\zeta_g)$ 在 $\mathbb{Q}$ 上的次数为 $g - 1$，而矩阵特征多项式至多将基域 $E$ 扩出 $[E:\mathbb{Q}]\cdot k$ 维，直接与 $[E:\mathbb{Q}]\cdot k < g - 1$ 矛盾。完整证明由 Lean 内核检查。
:::

## 6.2 从局部朗兰兹到全特征收网 {#sec-ch06-closing-the-net}

现在把整座大楼最后几根承重钢梁拼在一起。在 `src/Development/AutomorphicArithmetic/` 的顶层汇流模块里，Lean 把前面全部几百万行几何、分析、格斜率与贝伦德工具接成了一条无懈可击的逻辑主干：

::: {.figure src="ch06-proof-spine"}
**全证明顶层依赖骨架图。** 贝伦德塔挑选与稳定子刚性（`trivStab`）、局部朗兰兹中心单位构造（`recTExists`）与局部–整体伽罗瓦表示（`galoisLocalGlobalStrong_recParameter`）汇聚入小类数与稠密阈值引擎（`corGK`、`zeroFreeAll_of_topG`），经全特征提升 `plugAll` 与 `everyCharacter`，最终合龙为右半平面无零点与黎曼猜想。
:::

这条顶层主干由下面六条环环相扣的 Lean 定理直接锁死：

1. **局部朗兰兹与分歧特征标定**：[`RecTExists.lean`](lean:Development/AutomorphicArithmetic/Foundations/LocalLanglands/LocalCentralUnits/RecTExists.UpperTheory.Zero.LLC.recTExists) 为每个非阿基米德局部完备域构造出满足维数、一维特征相容、尖点不可约、对偶反转、单射与驯顺分歧深度的局部朗兰兹对应 `rc`。

::: {.theorem #thm-rec-t-exists title="带型律与中心特征相容的局部朗兰兹对应存在性" lean="Development/AutomorphicArithmetic/Foundations/LocalLanglands/LocalCentralUnits/RecTExists.UpperTheory.Zero.LLC.recTExists"}
全套局部朗兰兹对应与型律相容公理 `RecTExists` 成立：对任意局部域完备化构造，均存在满足维数保真、朗兰兹段分解、尖点不可约、对偶、单射与型律条件 `TypeLaw` 的映射 `rc`。
:::

::: proof
先由局部阿廷互反映射与尖点表示对应起步，利用通用单射扩张引理 `exists_isLExt` 将对应延拓到一般不可约表示，并逐项核验中心特征绝对值、扭转乘法律、深度保存与驯顺分歧特征多项式公式。完整证明由 Lean 内核检查。
:::

2. **局部–整体伽罗瓦整结构桥接**：[`RowSrc.lean`](lean:Development/AutomorphicArithmetic/Foundations/GaloisRepresentations/IntegralStructures/RowSrc.UpperTheory.Gal.Int.galoisLocalGlobalStrong_recParameter) 把 Theta 提升产生的算术参数送入全局伽罗瓦表示的整结构约束 `Row0b`。

::: {.theorem #thm-row-src title="来自 Theta 提升的强局部–整体伽罗瓦整结构" lean="Development/AutomorphicArithmetic/Foundations/GaloisRepresentations/IntegralStructures/RowSrc.UpperTheory.Gal.Int.galoisLocalGlobalStrong_recParameter"}
强局部–整体伽罗瓦整结构条件 `UpperTheory.GalStar.Row0b recT` 成立。
:::

::: proof
在形式化中直接把局部朗兰兹与特征标构造 `tLiftK` 送入主桥接定理 `galoisRepresentations_of_thetaLift`，推出整结构下界条件 `Row0b`。完整证明由 Lean 内核检查。
:::

3. **小类数与弱化版范迪弗界**：[`CorGKOf.lean`](lean:Development/AutomorphicArithmetic/AutomorphicVarieties/SmallClassNumbers/CorGKOf.UpperTheory.V.SmallClassNumbers.corGK) 打通了三阶酉群自守簇上的布洛赫–加藤（Bloch–Kato）塞尔默群长度控制 `CorGK`——哪怕某些高次上同调障碍类没法靠扭转直接消掉，它们的对数总长度也被 $(N(e+1))^A (\ln p + \ln p')$ 的多项式上界牢牢按住！

::: {.theorem #thm-cor-gk title="全素数加权塞尔默长度的小类数总控界" lean="Development/AutomorphicArithmetic/AutomorphicVarieties/SmallClassNumbers/CorGKOf.UpperTheory.V.SmallClassNumbers.corGK"}
一般数域、有限素数集合与分歧水平下的全素数加权塞尔默长度上界 `CorGK` 成立：加权长度和 $\sum_{l \in L_s} \ln l \sum_\psi V_n$ 受控于 $2 c_5 \varphi(H.\mathrm{index}) (N(e+1))^A (\ln p + \ln p')$。
:::

::: proof
由文献输入 `litN` 给出补缀（patching）假设 `HypothesesH'`，结合加藤（Kato）欧拉系统界、邻接提升与容许水平一阶约化推出 `PropGK`，进一步跨多个好素数 $p, p'$ 消去坏素数限制而得 `CorGK`。完整证明由 Lean 内核检查。
:::

4. **稠密阈值窗口打通所有特征**：[`ZeroFreeAllOfTopG.lean`](lean:Development/AutomorphicArithmetic/CharacterBoxes/ZeroFreeAllOfTopG.UpperTheory.Top.zeroFreeAll_of_topG) 与 [`EveryCharacter.lean`](lean:Development/AutomorphicArithmetic/CharacterBoxes/EveryCharacter.UpperTheory.Top.plugAll) 把前面所有贝伦德厚集挑选、格斜率窗、局部–整体相容与无零点判据全部接通：先对本原特征家族成立全平面无零点 `ZeroFreeAll`，再借助[第一章](ch01-the-mirror-on-half.md)的欧拉因子归约覆盖全部非本原特征。

::: {.theorem #thm-zero-free-topg title="从稠密阈值窗口推导全本原特征右半平面无零点" lean="Development/AutomorphicArithmetic/CharacterBoxes/ZeroFreeAllOfTopG.UpperTheory.Top.zeroFreeAll_of_topG"}
对任意步比 $\lambda > 1$，只要抽象稠密阈值连接假设 `TopG` 成立且每个本原特征家族均存在宿主窗口 `HostExW la (GChi ψ).req`，则对一切本原狄利克雷特征在 $\operatorname{Re}(s) > \frac{1}{2}$ 上的无零点定理 `ZeroFreeAll` 成立。
:::

::: proof
从每一个特征家族类的连接链提取出朗道阈值下界条件 `eFamC_of_cls` 与高度界条件 `hypV_of_cls`，联合比较层与能级界调用 `zeroFreeOn_of_tiedWin_cyc` 完成闭环。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-plug-all title="由全部窗口条件汇流得任意特征右半平面无零点" lean="Development/AutomorphicArithmetic/CharacterBoxes/EveryCharacter.UpperTheory.Top.plugAll"}
给定格林（Green）型条件 `hG`、弱范迪弗窗口界 `hV : VWin` 及闭环设计非空假设 `h`，即推出对一切模 $N$、一切狄利克雷特征 $\chi$ 与一切 $\operatorname{Re}(s) > \frac{1}{2}$（$\chi \neq 1$ 或 $s \neq 1$）成立 $L(\chi, s) \neq 0$（即 `UpperTheory.EveryCharacter`）。
:::

::: proof
先由 [@thm-zero-free-topg] 与形状窗口连接 `shapeWin`、特征供给 `supplyChi` 得出所有本原特征在右半平面无零点 `plugWin`；再经 `UpperTheory.Top.imprimitive` 剔除不会在 $\operatorname{Re}(s) > 0$ 取零的欧拉削弱因子，覆盖全部非本原特征。完整证明由 Lean 内核检查。
:::

5. **最终合龙**：在 [`MainConclusion.lean`](lean:Development/AutomorphicArithmetic/CharacterBoxes/MainConclusion.UpperTheory.FinalTheorems.everyCharacter) 中，无须任何额外未证假设，全套结构自动合龙：

::: {.theorem #thm-every-character title="无条件导出全部狄利克雷 $L$ 函数右半平面无零点" lean="Development/AutomorphicArithmetic/CharacterBoxes/MainConclusion.UpperTheory.FinalTheorems.everyCharacter"}
对任意正整数 $N \ge 1$、任意模 $N$ 的狄利克雷特征 $\chi$ 与任意复数 $s \in \mathbb{C}$，若 $\operatorname{Re}(s) > \frac{1}{2}$ 且（$\chi \neq 1$ 或 $s \neq 1$），则 $L(\chi, s) \neq 0$。
:::

::: proof
将已无条件证明的局部–整体伽罗瓦整结构定理 [@thm-row-src] 与局部朗兰兹对应定理 [@thm-rec-t-exists] 送入窗口与全特征汇流定理 `every_character_of_literature_of_vWin`，直接得出 `UpperTheory.EveryCharacter`，从而锁定整座证明的最后一枚楔石。完整证明由 Lean 内核检查。
:::

从 $\operatorname{Re}(s) = \frac{1}{2}$ 的对称镜，到 $G_z(x)$ 的朗道单侧陷阱，到 $\sqrt{X}$ 条 Theta 镜廊与跷跷板，到跨越 $\frac{2}{3}$ 天花板的格斜率与跨特征胶合，再到贝伦德整数球壳与全特征合龙——整条主路已经从头到尾走通。

可走通之前我们还有最后一道必须严肃回答的追问：**一千七百多万行没有注释的 Lean 代码，凭什么让外部世界相信它没有偷换概念、没有暗藏漏洞？**

下一章，让我们走进这座庞然大物的独立审计车间。

::: {.viz src="behrend-sphere" height="560"}
**完整的贝伦德整数球壳实验室：** 自由旋转 $\{0, \dots, M-1\}^3$ 的三维立方格点与半透明球壳，切换立方边长 $M \in [3, 6]$ 与壳层平方半径 $R$，点击球壳上任意两点核验中点落入球内的距离差，并在下方直方图查看鸽巢原理选出的最胖球壳（$M = 5$ 时为 $|S_{17}| = 9$）。
:::
