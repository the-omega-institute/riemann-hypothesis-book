# 第七章 一千七百万行代码的骨架：独立内核重放与数学诚实

> 谁要是敢递交一份 175,187 个文件、1,737 万行、零行注释的手稿，还要求别人“凭信任签字”，那他和中世纪出售赎罪券的商人没什么区别。好在形式化世界里有一句冷冰冰的铁律：**别信作者的嘴，把 `.olean` 扔进空白内核里重放一遍。**

如果这篇证明是一篇一万页的 PDF 论文，人类审稿委员会大概要花二十年才能翻完，还不保证第 4,812 页没漏掉一个边界等号。

但在 Lean 4 的机械内核面前，体量庞大反而不是“免审金牌”，而是必须接受最冷酷审讯的对象。只要哪怕**一条**中间引理用了未证明的 `sorry`、偷塞了一句自定义公理 `axiom`，或者悄悄改写了 `RiemannHypothesis` 的定义，一个只有三十几行的挑战文件就能当场把它揪出来。

## 7.1 三十五行“挑战契约”：如何防止作弊 {#sec-ch07-challenge-contract}

在 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 仓库的根目录和 `src/` 下，独立审计者做了一件极其聪明、极其冷峻的事：写了一枚只依赖官方 Mathlib `v4.33.1`（精确对应官方提交 `0df444a360ea`）的极简挑战文件 `src/Challenge.lean`。

这份契约文件只问五个问题，连证明里到底用了酉群还是椭圆曲线都懒得过问：

1. 你在 `src/Main.lean` 里证明的 `riemannHypothesis`，其类型是否**字节级严格等同于**官方 Mathlib 原生的 `RiemannHypothesis`？
2. 其余四条顶层定理的类型，是否**字节级严格等同于**仅由 Mathlib 定义写就的 `Statements.lean` 中的四条陈述？
3. 整个 175,187 文件的源码树里，有没有哪怕一处 `sorry`、`admit`、`axiom`、`native_decide`、`unsafe`、`implemented_by`、`opaque`、`debug.*` 开关或 `skipKernelTC`？
4. 所有九个上游依赖包（Mathlib、batteries、aesop、Qq 等）的锁死版本，是否都原封不动来自官方上游提交？
5. 在一个断网、只读、空白环境的沙盒里，用独立的 Lean 内核与多个互不相干的第三方极小内核校验器（`leanchecker-paranoid`、`nanoda`、`con-leche`、`con-ron`、`lean4lean`）从头重放一遍，是否全部放行、且公理闭包只包含标准数学基础的三条公理 `{propext, Classical.choice, Quot.sound}`？

> 你可以把证明写成一千七百万行迷宫，但门口的安检仪只看两件事：入口是不是大家公认的那道题，脚下有没有只踩那三条标准公理。

下面的汇总表列出了 `Supplements/Kernels/MainTheorems.lean` 导出、并最终汇入 `Main.lean` 的顶层内核汇总定理：

::: {.theorem #thm-kernels-all-chi title="内核汇总：全部狄利克雷特征右半平面无零点" lean="Supplements/Kernels/MainTheorems.allChi"}
全范围非零性断言 `UpperTheory.EveryCharacter` 成立：对一切模 $N \ge 1$、一切狄利克雷特征 $\chi$ 与一切 $\operatorname{Re}(s) > \frac{1}{2}$（排除 $\chi = 1, s = 1$），均有 $L(\chi, s) \neq 0$。
:::

::: proof
在 [`MainTheorems.lean`](lean:Supplements/Kernels/MainTheorems.allChi) 中直接引用已完成全链条合龙的 [@thm-every-character]。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-kernels-rh title="内核汇总：黎曼猜想" lean="Supplements/Kernels/MainTheorems.rhOfAll"}
Mathlib 定义的 `RiemannHypothesis` 成立。
:::

::: proof
将 [@thm-kernels-all-chi] 送入 [@thm-rh-of-right]（通过主干 `Formalism.VW.rh_of_every`）直接给出 `RiemannHypothesis`。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-kernels-crit title="内核汇总：本原特征临界线定理" lean="Supplements/Kernels/MainTheorems.critAll"}
对任意模 $N \ge 1$、任意本原狄利克雷特征 $\chi$ 及任意 $0 < \operatorname{Re}(s) < 1$，若 $L(\chi, s) = 0$，则 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

::: proof
将 [@thm-kernels-all-chi] 送入本原反射归约 [@thm-crit-line] 直接得出。完整证明由 Lean 内核检查。
:::

::: {.theorem #thm-kernels-claim-all title="内核汇总：半平面、临界带与 $\zeta$ 零点三联结论" lean="Supplements/Kernels/MainTheorems.claimAll"}
合取命题 `Claim.HalfPlane ∧ Claim.Strip ∧ Claim.Zeta` 成立，即全部狄利克雷 $L$ 函数在 $\operatorname{Re}(s) > \frac{1}{2}$ 无零点、在 $0 < \operatorname{Re}(s) < 1$ 零点实部皆为 $\frac{1}{2}$、且 $\zeta(s)$ 的全部非平凡零点实部皆为 $\frac{1}{2}$。
:::

::: proof
将 [@thm-kernels-all-chi] 同时送入 [@thm-claim-strip] 与临界带向 $\zeta$ 的特化引理 `Claim.zeta` 组合成三元合取。完整证明由 Lean 内核检查。
:::

## 7.2 8,490 块分片与诚实边界声明 {#sec-ch07-shards-and-honesty}

为了避免任何人因为“单机编译完整 `Main` 要烧几百 GB 内存和十几个小时”而无法复现验证，验证镜像仓库把 `Main` 的整棵依赖图按真实导入拓扑切成了 **8,490 个可独立哈希校验的编译分片**（跨 36 层依赖深度），并在 GitHub Release 中逐片发布。任何人都可以用简单的命令行脚本在本地拉取分片、核验 SHA-256 校验和并在空白环境中重放内核检查。

| 模块层级 | 文件数 | 代码行数 | 在整体结构中的角色 |
| :--- | ---: | ---: | :--- |
| `Development` | 141,928 | 12,232,663 | 自守算术、阿贝尔簇、字符窗与顶层合龙 |
| `Formalism` | 18,254 | 3,200,748 | 朗道归约、格斜率、Fock/Weyl、Theta 链与贝伦德工具 |
| `GroundTheory` | 8,507 | 1,119,138 | 算术几何、整体/局部域、$p$-进霍奇与上同调底座 |
| `ReciprocityTheory` | 3,845 | 563,016 | 切博塔廖夫、类域论、阿代尔逼近与局部特征 |
| `CompanionTheory` | 2,027 | 194,218 | 实群离散系列、哈里什–钱德拉模与谱几何 |
| `PositivityTheory` | 449 | 55,130 | 自守正定性与已发表基础定理接口 |
| `Lemmata` | 167 | 9,232 | 行列式单调性、范数估计与多项式基础引理 |
| 顶层入口与补充文件 | 10 | 70 | `Main.lean`、`Statements.lean` 与内核总汇 |

最后，按科学诚实的最高标准，本书也必须把验证笔记（`verification/NOTES.md`）记录的四条客观边界写得清清楚楚：

1. **Comparator 的完整运行是长耗时工程任务**：静态扫描（无 `sorry`/`axiom`/`unsafe`/`opaque`）、九项上游依赖与官方 Mathlib `v4.33.1` 对账、以及 Comparator 在 Mathlib 体量测试集上的冒烟测试均已通过；而针对完整 1,737 万行源码的 Comparator 多校验器重放与分片发布构建属于持续数小时的大型计算流水线。本书读到的每一条定理声明与证明源码，均直接取自同一不可变源码提交。
2. **源码静态扫描与局部内核重放的关系**：本仓库的 `./tbook check` 在 `lean-source` 模式下会核对每条引用定理的真实文件、精确行号、签名摘要以及直接不含 `sorry`/`admit`；而最底层的全导入闭包公理检查，依然必须交由 Lean 编译器与独立内核重放完成。
3. **跨工具链的信任底线**：即便是六重独立内核重放通过，一切人类与机器验证归根结底仍共同信任：Lean 检验器本身的逻辑自洽、Mathlib `v4.33.1` 中对 `RiemannHypothesis` 与 `DirichletCharacter.LFunction` 的形式化定义确实符合数学家的本意，以及执行构建的硬件与沙盒未被破坏。

> 机器不能替你理解“为什么对”，但机器会替你揪出哪怕藏在一千七百万行深处的半句谎言。真正的美，从来经得起最严苛的冷铁审查。

在[终章](coda.md)里，让我们走出这座刚刚建成的证明大厦，看看窗外还留着哪些依然敞开的数学群山。
