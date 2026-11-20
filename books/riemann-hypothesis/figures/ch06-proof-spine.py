"""从两组输入到 RH 与狄利克雷 GRH 的证明骨架。
The proof spine from its two inputs to RH and Dirichlet GRH.
"""

SIZE = (358, 520)
MARKUP = 2
ALT = {
    "zh": "Behrend 球壳与局部朗兰兹和伽罗瓦的两支输入汇入迭代 Theta 提升与格斜率。"
          "随后依次是稠密阈值窗口覆盖全部本原特征，推广到右半平面无零点（排除主特征在 1 的极点），"
          "最后得到黎曼猜想和狄利克雷广义黎曼猜想。最后三步标有 LEAN ✓。",
    "en": "The Behrend shell and local–global Galois inputs meet at the theta chain and lattice slopes. "
          "The next steps give dense threshold windows for all primitive characters and extend nonvanishing "
          "to the right of the critical line, excluding the principal pole at 1. The final step gives RH "
          "and Dirichlet GRH. The last three boxes carry LEAN ✓.",
}


def draw(fig):
    t = fig.t
    galois_name = t("galoisLocalGlobalStrong_recParameter", "galoisLocalGlobalStrong_recParameter")
    galois_note = "\n".join((t("recTExists", "recTExists"), galois_name.replace("_", "_\n")))
    shell = fig.box(67, 15, t("Behrend 球壳", "Behrend Shell"), note=t("trivStab", "trivStab"),
                    w=118, pad=9, note_size=12)
    galois = fig.box(242, 15, t("局部朗兰兹与伽罗瓦", "Local–Global Galois"), note=galois_note,
                      w=214, pad=9, note_size=12)
    chain = fig.box(179, 139, t("迭代 Theta 提升与格斜率", "Theta Chain & Lattice Slopes"),
                    note=t("final_gaussOp · shortVector", "final_gaussOp · shortVector"), w=328)
    windows = fig.box(179, 228, t("稠密阈值与全部本原特征", "Dense Threshold Windows"), "lean",
                      note=t("zeroFreeAll_of_topG · plugAll", "zeroFreeAll_of_topG · plugAll"),
                      chip=t("LEAN ✓", "LEAN ✓"), w=328)
    half_plane = fig.box(179, 317, t("右半平面无零点", "Zero-Free Re(*s*) > 1/2"), "lean",
                         note=t("everyCharacter", "everyCharacter"), chip=t("LEAN ✓", "LEAN ✓"), w=328)
    goal = fig.box(179, 406, t("黎曼猜想与广义黎曼猜想", "RH & Dirichlet GRH"), "lean",
                   note=t("riemannHypothesis\nLFunction_eq_zero_re", "riemannHypothesis\nLFunction_eq_zero_re"),
                   chip=t("LEAN ✓", "LEAN ✓"), w=328)

    # The two inputs enter distinct ports of the first shared step.
    shared_steps = (chain, windows, half_plane, goal)
    links = [(shell.bottom, (104, chain.y)), (galois.bottom, (242, chain.y))]
    links.extend((a.bottom, b.top) for a, b in zip(shared_steps, shared_steps[1:]))
    assert all(a[1] + 12 < b[1] for a, b in links)
    assert shell.x + shell.w < galois.x and goal.y + goal.h < fig.height
    for start, end in links:
        fig.link(start, end, "ink", 1.5)
