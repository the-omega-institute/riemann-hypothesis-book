# 终章 黎曼之后的群山

> 一座伟大型猜想的第一次登顶，很少是一条平坦的高速公路；它更像一支满载绳索、冰镐与十六张地形图的探险队。旗帜已经插上雪顶，接下来几十年的风景，是看后人怎样把绕了三十英里的山路，修成一条步行半小时就能穿过的小径。

当最后一盏校验器的绿灯亮起，世界并不会突然停转。相反，最令人振奋的工作才刚刚开始。

正如作者在短记中极其坦诚地写下的那样：如今的 1,737 万行形式化证明里，一定还混杂着许多“为了赶路而搭起来的笨重脚手架”——那些在黑暗中摸索时拐过的弯、用得过猛的 $K$-群或者多余的层数选择，往往会在短短几年内被后来者大刀阔斧地削成几十页甚至十几页水晶般透亮的精简证明。这是数学史上一次又一次上演过的奇迹：当年阿贝尔、伽罗瓦、怀尔斯的第一代论证都曾显得庞大或奇险，而二十年后的研究生课本只用三章就能讲清它们的本质。

更重要的是，我们必须在这里画下一条**绝不越界的红线**：拿下黎曼猜想与全部狄利克雷 $L$ 函数的广义黎曼猜想，并不等于拿下了所有带“黎曼”二字的问题。下面四座依然耸立在云层之上的高峰，**尚未**在本书所剖析的这套形式化证明中得到解决——它们仍然是实实在在、向全人类敞开的开放问题：

::: {.conjecture #conj-erh-dedekind title="任意数域戴德金 $\zeta$ 函数的扩展黎曼猜想（ERH）"}
对任意代数数域 $K$，其戴德金 $\zeta$ 函数 $\zeta_K(s)$ 在临界带 $0 < \operatorname{Re}(s) < 1$ 内的全部非平凡零点均满足 $\operatorname{Re}(s) = \frac{1}{2}$。
:::

`the-omega-institute/riemann-hypothesis` 验证记录明确指出：当前证明覆盖的是有理数域 $\mathbb{Q}$ 上的黎曼 $\zeta$ 函数以及全部模 $N$ 的狄利克雷 $L$ 函数；一般数域上的戴德金 $\zeta$ 函数及阿廷（Artin）$L$ 函数尚未包含在形式化结论之内。

::: {.conjecture #conj-grh-automorphic title="高阶自守 $L$ 函数的全广义黎曼猜想（Grand RH）"}
对任意整体数域上的任意尖点自守表示 $\pi$（例如 $\mathrm{GL}_n$ 上的自守形式或椭圆曲线哈塞–韦伊 $L$ 函数），其完备标准 $L$ 函数 $L(s, \pi)$ 在临界带 $0 < \operatorname{Re}(s) < 1$ 内的全部非平凡零点均位于临界线 $\operatorname{Re}(s) = \frac{1}{2}$ 上。
:::

把线性、阿贝尔特征（$\mathrm{GL}_1$）上的方法推广到高阶群（$\mathrm{GL}_2, \mathrm{GL}_n$）的自守 $L$ 函数，依然是现代数论等待征服的宏伟山脉。

::: {.conjecture #conj-simple-zeros title="黎曼 $\zeta$ 函数零点的单零点猜想"}
黎曼 $\zeta$ 函数的每一个非平凡零点都是单重的，即对所有满足 $0 < \operatorname{Re}(\rho) < 1$ 且 $\zeta(\rho) = 0$ 的零点，均有 $\zeta'(\rho) \neq 0$。
:::

::: {.problem #prob-montgomery-gue title="蒙哥马利零点对关联猜想与随机矩阵统计"}
证明 $\zeta\bigl(\frac{1}{2} + it\bigr)$ 的非平凡零点在高处虚部 $T \to \infty$ 时的归一化间距分布与对关联函数，严格收敛到高斯酉系综（GUE）随机矩阵特征值的统计分布，并阐明其背后是否存在真实的希尔伯特–波利亚（Hilbert–Pólya）自伴算子。
:::

你看，证明一座百年猜想不是数学的终点，而是把旧的谜底变成新世界的地板。当我们终于能站在 $\operatorname{Re}(s) = \frac{1}{2}$ 这块稳固的礁石上往远处眺望，真正清晰的，是海面上那几道尚未被点亮的灯塔。

> 不要为失去一座灯塔而哀伤；每一座被人类真正熄灭的旧悬念，都会在它的原址上照亮十条通往未知的新路。

## 版权声明与致谢 {#sec-coda-copyright-acknowledgments}

本着科研诚实与署名清晰的原则，全书所涉形式化源码归属、仓库 Fork 渊源、许可边界与社区致谢一并列明于此：

- **原证明作者与形式化源码版权**：书中所涉黎曼猜想与狄利克雷 $L$ 函数广义黎曼猜想的 Lean 4 证明源码由 **Levent Alpöge** 独立创作，并于 2026 年 11 月 20 日在 [`alpo.ge/remark.pdf`](https://alpo.ge/remark.pdf) 公布。原作者保留形式化源码的全部权利（发布时未附开源许可协议）；本书及配套仓库**不**对原始 Lean 源码进行再分发或重新许可，所有定理卡片均通过永久链接与类型签名指向公开仓库供读者核验。
- **上游独立验证项目与仓库 Fork 说明**：谨向 **Deicyde** 创建的上游独立验证仓库 [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis) 致谢，感谢其整理原始发布归档、撰写 27 行 `src/Challenge.lean` 挑战契约、设计多检验器 `comparator.json` 并公开详尽的 `verification/NOTES.md`。本书所锚定的 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 由 The Omega Institute 从 [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis) **fork** 而来，完整保留全部证明源码不改一字，只增添 8,490 块内容寻址分片 CI 构建流水线、公开 Release 分仓与 `./verify` 零信任本地重放工具。
- **本书正文、可视化与工具链许可**：本书的中文与英文导读正文、静态数学插图脚本、交互可视化页面及讲解视频脚本版权归 The Omega Institute 所有，依据 **`CC-BY-4.0`** 知识共享署名 4.0 国际许可协议开放使用（见 [`book.toml`](https://github.com/the-omega-institute/riemann-hypothesis-book/blob/main/books/riemann-hypothesis/book.toml)）；书库出版框架与自动化校验工具链基于 [`the-omega-institute/trureturing-books-template`](https://github.com/the-omega-institute/trureturing-books-template) 构建，按 **`Apache-2.0`** 开源许可协议发布。
- **开源社区与基础软件致谢**：感谢 **Lean 4** 开发团队、**Mathlib 4**（`v4.33.1`）全体贡献者、Comparator 与 `lean4export` 作者团队，以及独立内核校验器 `leanchecker`、`nanoda`、`con-leche`、`con-ron` 与 `lean4lean`（Mario Carneiro）的作者；同时感谢让本双语多媒体专著得以端到端呈现的 `mdBook`、`Typst`、`Pandoc`、`KaTeX` 与 `Kokoro-82M` 开源项目。
