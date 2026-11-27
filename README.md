# 黎曼猜想证明导读 · `riemann-hypothesis-book`

> **临界线上的对称：黎曼猜想是如何被证明的**  
> *Symmetry on the Critical Line: How the Riemann Hypothesis Is Proved*

本仓库以 [`the-omega-institute/trureturing-books-template`](https://github.com/the-omega-institute/trureturing-books-template) 构建双语专著、静态数学插图、交互可视化实验室与双语字幕讲解视频，用通俗、可手算、直抵核心的方式解读 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 中黎曼猜想（RH）与狄利克雷 $L$ 函数广义黎曼猜想（GRH）的 Lean 4 形式化证明。

经典黎曼猜想与狄利克雷广义黎曼猜想的 Lean 形式化主仓库由 Lean 社群维护。本书的逐条声明链接对应 Alpöge 原版。[leanprover-community/riemann-hypothesis](https://github.com/leanprover-community/riemann-hypothesis)

## 目录结构

- `books/riemann-hypothesis/zh/`、`en/`：序曲、七章正文与终章（中英双语逐条对齐）
- `books/riemann-hypothesis/figures/`：由 `figkit` 脚本按真实数学计算生成的矢量插图
- `books/riemann-hypothesis/viz/`：支持单卡引用与完整实验探索的交互可视化实验室
- `books/riemann-hypothesis/films/`：带英文旁白、双语字幕与程序化配乐的讲解视频源码
- `site.toml` & `trureturing.lock.json`：通过 `lean-source` 模式直接锚定 `the-omega-institute/riemann-hypothesis@main` 的对应 Lean 声明与源码行号

## 常用本地命令

```bash
./tbook doctor
./tbook pin
./tbook fig build --book riemann-hypothesis
./tbook check --book riemann-hypothesis
./tbook build html pdf epub --book riemann-hypothesis
./tbook serve
```

## 证据边界

- **绿色 `LEAN ✓`**：直接指向 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 所钉提交下的 Lean 声明源文件；全书导入闭包与公理闭包由 Lean 编译及独立内核重放机制负责校验。
- **红色 `OPEN`**：一般数域戴德金 $\zeta$ 函数（ERH）、高阶自守 $L$ 函数（Grand RH）、零点单重性与对关联统计等尚未覆盖的开放问题。

## 版权声明与致谢（Provenance, Copyright & Acknowledgments）

- **原证明作者与形式化源码版权**：黎曼猜想与狄利克雷 $L$ 函数广义黎曼猜想（GRH）的 Lean 4 证明源码由 **Levent Alpöge** 原创并于 2026 年 11 月 20 日公开发布（[作者声明 `alpo.ge/remark.pdf`](https://alpo.ge/remark.pdf)）。该形式化源码归原作者所有且发布时未附开源许可协议（All Rights Reserved）；本书库**不**再分发或重新许可该 Lean 源码，仅以永久链接与简短签名作直观导读与校验说明。
- **上游独立验证项目**：致谢 **Deicyde** 创建并维护的 [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis)，提供了未经修改的原始归档镜像、27 行只依赖 Mathlib 的挑战契约 `src/Challenge.lean`、`comparator.json` 配置、[`verification/NOTES.md`](https://github.com/Deicyde/riemann-hypothesis/blob/main/verification/NOTES.md) 与多检验器沙盒验证方案。
- **形式化仓库 Fork 说明**：本书所钉的 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 由 **The Omega Institute** 从 [`Deicyde/riemann-hypothesis`](https://github.com/Deicyde/riemann-hypothesis) **fork** 而来，完整保留原作者全部 Lean 证明源码不变，仅在其上补充 8,490 块内容寻址分片 CI 构建系统（`ci/plan.py`、`lean-parts.yml`）、16 个十六进制 GitHub Release 分仓与零信任本地重放脚本 `./verify`。
- **本书库许可协议**：专著导读正文、静态数学插图（`figures/`）、交互可视化页面（`viz/`）及讲解视频脚本与旁白文本由 The Omega Institute 按 **`CC-BY-4.0`**（Creative Commons Attribution 4.0 International）许可发布（声明于 [`books/riemann-hypothesis/book.toml`](books/riemann-hypothesis/book.toml)）；书库构建框架与主题工具链基于 [`the-omega-institute/trureturing-books-template`](https://github.com/the-omega-institute/trureturing-books-template) 按 **`Apache-2.0`** 许可发布（见 [`LICENSE`](LICENSE)）。
- **工具链与社区致谢**：致谢 **Lean 4**、**Mathlib 4**（`v4.33.1`）、`lake comparator`、`lean4export`、`leanchecker`、`nanoda`、`con-leche`、`con-ron`、`lean4lean`（Mario Carneiro），以及 `mdBook`、`Typst`、`Pandoc`、`KaTeX`、`Kokoro-82M` 社区。
