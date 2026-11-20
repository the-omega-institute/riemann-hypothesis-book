# 第七章 一千七百万行代码的骨架：独立内核重放与数学诚实

> 谁要是敢递交一份 175,187 个文件、1,737 万行、零行注释的手稿，还要求别人“凭信任签字”，那他和中世纪出售赎罪券的商人没什么区别。好在形式化世界里有一句冷冰冰的铁律：**别信作者的嘴，把 `.olean` 扔进空白内核里重放一遍。**

如果这篇证明是一篇一万页的 PDF 论文，人类审稿委员会大概要花二十年才能翻完，还不保证第 4,812 页没漏掉一个边界等号。

但在 Lean 4 的机械内核面前，体量庞大反而不是“免审金牌”，而是必须接受最冷酷审讯的对象。只要哪怕**一条**中间引理用了未证明的 `sorry`、偷塞了一句自定义公理 `axiom`，或者悄悄改写了 `RiemannHypothesis` 的定义，一个只有 27 行的挑战文件就能当场把它揪出来。

## 7.1 27 行“挑战契约”：如何防止作弊 {#sec-ch07-challenge-contract}

在追踪 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 的源码之前，先把脉络与致谢交代清楚：整份黎曼猜想与狄利克雷 $L$ 函数 GRH 的 Lean 4 证明源码由 **Levent Alpöge** 原创并发布于 [`alpo.ge/remark.pdf`](https://alpo.ge/remark.pdf)；随后 **Deicyde** 创建了上游独立验证镜像仓库 [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis)，在不修改证明源码一字一符的前提下，在仓库根目录和 `src/` 下放入了一枚只依赖官方 Mathlib `v4.33.1`（精确对应官方提交 `0df444a360ea`）的 27 行极简挑战文件 `src/Challenge.lean`；而本书所钉的 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 则是由 The Omega Institute 从 `Deicyde/riemann-hypothesis` **fork** 而来，原封不动保留证明源码与挑战契约，专门补充公开分片 CI 构建与 `./verify` 零信任本地重放工具。

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

## 7.2 8,490 块内容寻址分片与公开 CI 流水线 {#sec-ch07-shards-and-honesty}

问题很现实：如果有人宣布证明了黎曼猜想，却把检查门票定为“自备一台 503 GB 内存的工作站连跑十个小时”，那这套形式化检验其实仍然关在少数实验室的门后。

真实编译成本确实高得吓人。在 48 核、503 GB 内存的高配 Linux 机器上从零构建整棵 `Main` 依赖树，耗时在 7 到 10 小时之间；构建工具 Lake 为每个模块生成的 `.setup.json` 文件平均约 6 MB——乘以 175,187 个模块，光是瞬时中间描述就接近 **1 TB**。下面是整部证明的模块盘点：

| 模块层级 | 文件数 | 代码行数 | 在整体结构中的角色 |
| :--- | ---: | ---: | :--- |
| `Development` | 141,928 | 12,232,663 | 自守算术、阿贝尔簇、字符窗与顶层合龙 |
| `Formalism` | 18,254 | 3,200,748 | 朗道归约、格斜率、Fock/Weyl、Theta 链与贝伦德工具 |
| `GroundTheory` | 8,507 | 1,119,138 | 算术几何、整体/局部域、$p$-进霍奇与上同调底座 |
| `ReciprocityTheory` | 3,845 | 563,016 | 切博塔廖夫、类域论、阿代尔逼近与局部特征 |
| `CompanionTheory` | 2,027 | 194,218 | 实群离散系列、哈里什–钱德拉模与谱几何 |
| `PositivityTheory` | 449 | 55,130 | 自守正定性与已发表基础定理接口 |
| `Lemmata` | 167 | 9,232 | 行列式单调性、范数估计与多项式基础引理 |
| 顶层入口与补充文件 | 10 | 70 | `Main.lean`、`Statements.lean`、`BuildAid` 与内核总汇 |

为了把“只有超级服务器能验证”变成“任何普通电脑都能在公开 CI 上看见并复验每一步”，[`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 仓库的 `ci/plan.py` 没有硬啃整块巨石，而是沿着真实的 `import` 有向无环图，把整个 `Main` 闭包切成了 **8,490 块有界分片**：

- **每一块都有硬上限**：每个分片最多包含 **400 个模块**、源码体积不超过 **2.5 MB**，横跨 **36 层依赖深度**。最底部先立住 **17 块基础分片**（`Statements` 与 `BuildAid` 等底座），一过关就同时解锁 **529 个完全互不依赖的并行编译任务**。
- **每一块都有指纹锁（内容寻址）**：每块分片的哈希密钥把四样东西一起塞进 SHA-256——`lean-toolchain`、`lake-manifest.json` 与 `lakefile.toml` 的配置摘要、该分片内所有 `.lean` 文件的 Git blob 哈希，以及全部前置分片的密钥。哪怕只改了一个叶子里的一行字，也只有它的上游祖先链会重新生成密钥；其余分支原封不动复用缓存。
- **长路径优先调度与十六个公开分仓**：公开 GitHub Actions 工作流 `lean-parts.yml` 每分钟扫描一次当前刚被前置解锁的“可编译分片”，优先派发剩余通往 `Main` 路径最长的分片批次，把编译好的 `.olean` 与轨迹压缩打包进 16 个十六进制 GitHub Pre-release 分仓（`lean-parts-v1-0` 到 `lean-parts-v1-f`），并保留 Actions 产物回退恢复。此刻公开 CI 已经把绝大部分分片编译并推送上线，正在把最后几层依赖推进到 `Main` 与最终汇总发布 `build-<commit>`。

下面这张交互图把这 8,490 块内容寻址分片如何从第 0 层一层层解锁、推进到 `Main.lean` 的过程摆在了台面上：

::: {.viz src="proof-replay" preset="dag-shards" height="500"}
**36 层依赖图上的 8,490 块内容寻址分片。** 拖动公开 CI 进度条或点击任意节点，观察最左侧的 17 块底座如何瞬间扇出 529 个并行任务、内容寻址密钥如何决定失效范围，并沿 36 层推进到 `Main`。
:::

## 7.3 任何人都能亲自验证：四行命令与零信任重放 {#sec-ch07-verify-yourself}

> “公开发布已经编好的二进制分片，是不是就意味着读者只能盲信 CI 跑分器没有被收买？”——恰恰相反：下载别人编译好的砖头，**不等于**相信造砖人没偷工减料；只要你家里有自己的秤，把每一块砖现场过一遍秤，信任成本就是零。

这套设计最漂亮的地方，在于彻底分开了“费时间”和“要信任”这两件事。你**不需要**拥有 GitHub 账号，也不用花十小时烧风扇重编一千七百万行源码；任何人在一台装有 `git`、Python `3.12+`、`curl`、`zstd` 与 `elan`（会自动切换至所钉 Lean `v4.33.1`）的 Linux x86-64 机器上，敲下四行命令就能自己验完（如果只想看看当前哪几层分片已经上线，连 macOS 也可以直接跑前三条里的 `--status`）：

```sh
git clone --depth 1 https://github.com/the-omega-institute/riemann-hypothesis.git
cd riemann-hypothesis
./verify --status Main
./verify Main
```

如果你想**立刻动手**走一遍完整流程而不等待整棵证明树下载，还有两条马上能跑通的命令：

```sh
./verify BuildAid.D1           # 立刻拿一个极小模块走通“拉分片 → 校验 SHA-256 → 空白内核重放”全链路
./verify --build-missing Main  # 先拉取公开 CI 已编好的分片，只在本机补编最后尚未上线的收尾模块
```

为什么读到这里可以拍案叫绝？把 `./verify Main` 拆开看，它一步都没信任何外部服务器的“好话”：

1. **先验指纹再解包**：它把公开 Release 上拉下来的每一块分片都做本地 **SHA-256** 校验，核对每块分片真的匹配源码树算出的内容密钥。
2. **绝不直接“放过” `.olean`**：恢复完文件后，脚本运行的是 `lake env leanchecker --fresh --verbose Main`——注意那个 `--fresh` 开关！它不是偷懒信别人写好的摘要，而是打开一个**空无一物的全新 Lean 4 内核**，把整张依赖图里的 818,755 条声明在你的本地 CPU 上逐条重新检查类型是否匹配。假如有人在传输途中篡改了哪怕半个 `.olean` 证明项，或者偷偷塞了一行 `sorry`，空白内核会在那一条声明处当场报错拒收。
3. **再用 `Audit.lean` 查门口的锁**：内核放行后，本地脚本接着跑通 [`ci/Audit.lean`](https://github.com/the-omega-institute/riemann-hypothesis/blob/main/ci/Audit.lean)，死死核验五条顶层定理的类型真的精确对齐 Mathlib 的 `RiemannHypothesis` 与四条陈述，并用 `#print axioms` 打印完整公理闭包，确认没有混进标准数学基础 `{propext, Classical.choice, Quot.sound}` 之外的任何一条私货公理，最终把结果落盘到 `.lake/parts/axioms.txt`。

你可以直接在下面的实验卡里“动手试着作弊”——切换几种造假手法，看看究竟是 SHA-256、空白内核重放还是公理审计，在哪一道闸门前把造假者当场拦下：

::: {.viz src="proof-replay" preset="tamper-caught" height="500"}
**零信任重放：试着作弊。** 切换“干净证明 / 篡改分片 / 偷塞公理 / 偷换题目”四种情形，看清楚为什么就算从公开 CI 下载分片，任何造假都会在 `leanchecker --fresh`、`Audit.lean` 或 `Challenge.lean` 面前寸步难行。
:::

除了本机运行的 `./verify` 单命令路径，独立审计方还搭建了更严苛的**六重异构独立内核交叉检查流水线**（详见仓库 [`README.md`](https://github.com/the-omega-institute/riemann-hypothesis/blob/main/README.md) 与 `verification/NOTES.md`）：先用 [`lean4export`](https://github.com/leanprover/lean4export) 把无网络沙盒中构建的 `Challenge` 与 `Main` 导出成纯粹的 S-表达式证明账本（预计 `Main` 导出体积约 70–75 GB），再把这两份导出账本丢进开启 `bubblewrap` 网络隔离的 Lean `v4.36.0` `lake comparator` 里，依次交给**五套独立检验器**（`Lean 4.36 内核`、`leanchecker-paranoid`、Rust 写就的 `nanoda`、`con-leche`、`con-ron`）分别从零重放；第六套检验器 `lean4lean` 则因 Lean `v4.36.0` 核心库改写了 `Decidable` 定义，改用同一 pinned `v4.33.1` 工具链单独执行 `lake env lean4lean --fresh Main` 重放 `.olean` 文件。

你可以在下面这个完整验证实验室里自由切换“36 层分片依赖波”与“零信任本地重放 + 六重检验器”两个舞台，点选节点、调节 CI 进度并对照五条直接引自 `src/Main.lean` 的已检验定理签名：

::: {.viz src="proof-replay" height="560"}
**完整验证实验室 · 从 8,490 块公开 CI 分片到四行 `./verify` 命令与六重独立内核校验。** 点按左图分片查看增量缓存失效锥；切到右舞台测试不同造假手段如何被当场击落。
:::

如果你更想用不到三分钟看清整套“公开分片 + 零信任本地重放 + 多核对照”的运作逻辑，下面这支短片把全流程顺了一遍。

::: {.film src="verifying-the-riemann-proof"}
**如何验证一千七百万行黎曼猜想证明。** 用两分多钟走完四个步骤：27 行挑战契约、公开 CI 上的 8,490 块内容寻址分片、任何人四行就能跑起来的 `./verify` 命令，以及为什么零信任重放与六套独立内核让作弊无处遁形。
:::

## 7.4 诚实的边界与验证范围声明 {#sec-ch07-honest-boundaries}

按科学诚实的最高标准，把验证笔记（`verification/NOTES.md`）记录的三条客观边界交代清楚，比任何胜利宣言都更重要：

1. **完整异构重放仍处于长耗时流水线推进中**：仓库的静态扫描（零 `sorry` / `axiom` / `native_decide` / `unsafe` / `opaque`）、九项上游依赖与官方 Mathlib `v4.33.1` 对账、以及 Comparator 在 54,461 条声明的 Mathlib 体量烟雾测试上的五核通过纪录均已落地；公开 CI 正在持续推进 8,490 块分片直至顶层 `Main` 合龙，而全量 70+ GB 导出的多核 Comparator 重放本身也是耗时十数小时级别的独立长任务。
2. **本书校验模式与完整内核重放的分工**：本仓库的 `./tbook check` 在 `lean-source` 模式下会核对每条引用定理在所钉提交下的真实文件、精确行号、签名摘要与直接不含 `sorry`/`admit`；而最底层的整棵传递导入闭包类型重放与公理闭包检查，必须也只能由 Lean 编译器、[`./verify`](https://github.com/the-omega-institute/riemann-hypothesis/blob/main/verify)（`leanchecker --fresh`）及多检验器 Comparator 在 Linux 环境下完成。
3. **跨工具链的最终信任底线**：即便所有独立检验器一并放行，人类与机器校验共同依靠的最后一厘米依然清晰可见——我们共同相信 Lean 类型论内核本身的逻辑自洽、Mathlib `v4.33.1` 对 `RiemannHypothesis` 与 `DirichletCharacter.LFunction` 的形式化定义准确表达了数学家的本意、以及运行检验的本地或沙盒硬件未被恶意破坏。

> 机器不能替你理解“为什么对”，但机器会替你揪出哪怕藏在一千七百万行深处的半句谎言。真正的美，从来经得起最严苛的冷铁审查。

在[终章](coda.md)里，让我们走出这座刚刚建成的证明大厦，看看窗外还留着哪些依然敞开的数学群山。
