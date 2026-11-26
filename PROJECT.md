# 黎曼猜想证明导读 · 项目规则（`riemann-hypothesis-book`）

本文件归本书库所有，模板更新不会覆盖它。仓库根级托管守则 `AGENTS.md` 自动引入本文件。

## 1. 定位与证据原则

阅读和构建黎曼猜想（RH）与狄利克雷广义黎曼猜想（GRH）的 Lean 4 证明，首选 [lsernau/grh-lean](https://github.com/lsernau/grh-lean)。这个项目改写了 Alpöge 的原证明，提供[可读版导览](https://github.com/lsernau/grh-lean/blob/72fead102f663d5c7a407964a13dc0cf9d977207/grh/GUIDE.md)和[精简版](https://github.com/lsernau/grh-lean/tree/72fead102f663d5c7a407964a13dc0cf9d977207/grh-compact)。

- 本书库出版围绕 [`the-omega-institute/riemann-hypothesis`](https://github.com/the-omega-institute/riemann-hypothesis) 构建的直观导读专著《临界线上的对称：黎曼猜想是如何被证明的》，涵盖中英双语正文、脚本生成静态图（`figures/`）、交互可视化实验室（`viz/`）与双语字幕讲解视频（`films/`）。
- 站点通过 `site.toml` 的 `[trureturing] mode = "lean-source"` 与 `source_root = "src"` 将形式化引用直接锚定到 `the-omega-institute/riemann-hypothesis@main` 的 `.lean` 源文件及精确行号；隐藏模板示例书（`hide = ["example-*"]`）。
- 严格区分三层证据：绿色 **LEAN ✓** 仅授予锁文件核验通过的 `theorem` / `lemma`；`NUM` 与 `MODEL` 用于直觉算例与机制示意；终章中未解决的扩展猜想与问题一律使用红色 **OPEN**（`conjecture` / `problem`），严禁附加 `lean` 属性。

## 2. 文风与体例约定

- **通俗易懂，不晦涩**：用费曼式的手算例与物理直觉打开每一个概念（先算具体数字与小结构，再给严谨陈述）；用尼采式的短促格言点破旧方法为何撞墙、新方案如何破局。
- **定理框内零修辞**：`theorem` / `lemma` / `proposition` / `corollary` / `definition` 框内语言纯粹精确，与所引 Lean 签名严格对齐；`proof` 紧随定理框之后，通俗讲透证明骨架并以“完整证明由 Lean 内核检查。”／“The full proof is checked by the Lean kernel.”收尾。
- **双语严格对齐**：中文版（`zh/`）为权威版本，英文版（`en/`）自然地道，与中文保持相同文件顺序、目录层级、定理序列与媒体序列。
- **媒体不连排**：静态图、实验卡、完整实验室与视频之间均须隔着正文段落；零模型标识出现在任何出版正文、图注、代码或提交文案之外（遵循模板最新守则第 9–11 条）。
