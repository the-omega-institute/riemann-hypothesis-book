"""根号尺度的 Theta 提升链与 Seesaw 周期恒等式。
The square-root-scale theta chain and the seesaw period identity.
"""

from math import isqrt

SIZE = (500, 270)
MARKUP = 2
WRAP = True
ALT = {
    "zh": "左栏是从 U(X₀) 到 U(Xₘ) 的 Theta 提升链，每步给重数加一，步数 m 约为 √X。"
          "右栏的 Seesaw 图用交叉虚线连接对偶对 U(Xₘ) 与 H、U(Y) 与 U(X₀)。"
          "左侧提升周期等于右侧与 Hecke 选择无关的 Bessel 周期。",
    "en": "The theta chain on the left runs from U(X₀) to U(Xₘ), adding one to the multiplicity at each "
          "step over roughly √X steps. In the seesaw on the right, dashed diagonals connect dual pairs "
          "U(Xₘ) with H and U(Y) with U(X₀). The lifted period on the left equals the Hecke-independent "
          "Bessel period on the right.",
}


def chain_panel(fig):
    t = fig.t
    fig.text(120, 21, t("√*X* 尺度的 Theta 链", "Theta chain at scale √*X*"), size=15, weight=600, anchor="middle")

    scale = 64
    depth = isqrt(scale)
    multiplicities = [0]
    for _ in range(depth):
        multiplicities.append(multiplicities[-1] + 1)
    assert depth ** 2 <= scale < (depth + 1) ** 2
    assert len(multiplicities) == depth + 1 and multiplicities[-1] - multiplicities[0] == depth
    assert all(b - a == 1 for a, b in zip(multiplicities, multiplicities[1:]))

    start = fig.box(68, 38, t("*U*(*X*_{0})", "*U*(*X*_{0})"), "cyan", w=82)
    first = fig.box(68, 86, t("*U*(*X*_{1})", "*U*(*X*_{1})"), "cyan", w=82)
    second = fig.box(68, 134, t("*U*(*X*_{2})", "*U*(*X*_{2})"), "cyan", w=82)
    last = fig.box(68, 216, t("*U*(*X*_{*m*})", "*U*(*X*_{*m*})"), "cyan", w=82)
    fig.link(start, first, "now", 2.1)
    fig.link(first, second, "cyan", 1.8)
    fig.link(second.bottom, (68, 178), "cyan", 1.6, head=5)
    fig.text(68, 190, t("⋮", "⋮"), size=16, color="dim", anchor="middle", middle=True)
    fig.link((68, 202), last.top, "cyan", 1.6, head=5, dash="2 3")

    fig.text(119, 78, t("每步重数 +1", "+1 multiplicity"), color="now", middle=True)
    fig.text(119, 98, t("一次 Theta 提升", "per theta lift"), size=13, color="dim", middle=True)
    fig.text(119, 232, t("*m* ≈ √*X*", "*m* ≈ √*X*"), color="dim", middle=True)


def seesaw_panel(fig):
    t = fig.t
    fig.text(120, 21, t("Seesaw 周期恒等式", "Seesaw period identity"), size=15, weight=600, anchor="middle")
    lifted = fig.box(59, 43, t("*U*(*X*_{*m*})", "*U*(*X*_{*m*})"), "cyan", w=82)
    dual = fig.box(181, 43, t("*U*(*Y*)", "*U*(*Y*)"), w=82)
    base = fig.box(59, 152, t("*U*(*X*_{0})", "*U*(*X*_{0})"), "cyan", w=82)
    subgroup = fig.box(181, 152, t("*H*", "*H*"), w=82)
    fig.line(*lifted.bottom, *subgroup.top, "dim", 1.4, dash="4 4")
    fig.line(*dual.bottom, *base.top, "dim", 1.4, dash="4 4")
    fig.link(lifted, base, "cyan", 1.8)
    fig.link(dual, subgroup, "lean", 1.8)
    fig.text(120, 88, t("对偶对", "Dual pairs"), size=13, color="dim", anchor="middle", middle=True)

    fig.text(59, 205, t("提升周期", "Lifted period"), size=13, color="cyan", anchor="middle")
    fig.text(120, 205, t("=", "="), anchor="middle", weight=600)
    fig.text(181, 205, t("Bessel 周期", "Bessel period"), size=13, color="lean", anchor="middle")
    fig.chip(160, 237, t("与 Hecke 无关", "Hecke-independent"), "lean", anchor="middle")


def draw(fig):
    left, right = fig.row([240, 240], 260, y=5)
    chain_panel(left)
    seesaw_panel(right)
