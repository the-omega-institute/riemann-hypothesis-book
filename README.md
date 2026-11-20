# 黎曼猜想证明导读 · `riemann-hypothesis-book`

> **临界线上的对称：黎曼猜想是如何被证明的**  
> *Symmetry on the Critical Line: How the Riemann Hypothesis Is Proved*

本仓库以 [`the-omega-institute/trureturing-books-template`](https://github.com/the-omega-institute/trureturing-books-template) 构建双语专著、静态数学插图、交互可视化实验室与双语字幕讲解视频，用通俗、可手算、直抵核心的方式解读 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 中黎曼猜想（RH）与狄利克雷 $L$ 函数广义黎曼猜想（GRH）的 Lean 4 形式化证明。

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
