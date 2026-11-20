"""临界带中的函数方程反射。
Functional-equation reflection in the critical strip.
"""

import math

SIZE = (480, 320)
MARKUP = 2
ALT = {
    "zh": "复平面上，浅青色临界带介于实部 0 与 1 之间，绿色临界线的实部为 1/2。"
          "第一个非平凡 ζ 零点在临界线上，虚部约为 14.13。虚部为 10 的一对假设零点关于临界线对称。"
          "实轴上的 −4 和 −2 是平凡零点，1 是极点。紫色点是模 2 的欧拉因子零点，实部为 0。",
    "en": "The pale cyan critical strip runs from real part 0 to 1, with the green critical line at real part 1/2. "
          "The first nontrivial zeta zero lies on that line at height 14.13. The hypothetical pair at height 10 "
          "reflects across the line. The real axis shows trivial zeros at −4 and −2 and a pole at 1. "
          "Violet marks show zeros of the Euler factor for the principal character modulo 2 on the line of real part 0.",
}

FIRST_ZERO = complex(0.5, 14.13472514173469)


def zeta_from_eta(s):
    """Evaluate zeta near the first zero using the Euler transform of eta."""
    terms = [n ** (-s) for n in range(1, 66)]
    eta = 0j
    for order in range(len(terms)):
        eta += terms[0] / 2 ** (order + 1)
        terms = [a - b for a, b in zip(terms, terms[1:])]
    return eta / (1 - 2 ** (1 - s))


def draw(fig):
    t = fig.t
    rho = complex(0.76, 10)
    mirror = 1 - rho.conjugate()
    assert 1 - 0.76 == mirror.real == 0.24
    assert (rho.real + mirror.real) / 2 == 0.5
    assert mirror.imag == rho.imag
    assert round(FIRST_ZERO.imag, 2) == 14.13
    assert abs(zeta_from_eta(FIRST_ZERO)) < 1e-10

    ax = fig.axes(55, 44, 384, 220, (-4.5, 1.5), (-4, 18))
    fig.rect(ax.X(0), ax.y, ax.X(1) - ax.X(0), ax.h, color=None, fill="cyan", fill_opacity=0.12)
    ax.grid(ys=[5, 10, 15])
    ax.frame()
    ax.hline(0, "axis", 1.4)
    ax.vline(0, "violet", 1.5, dash="4 4")
    ax.vline(0.5, "lean", 2.0)
    ax.vline(1, "faint", 1.2)
    ax.xaxis(ticks=[-4, -2, 0, 1], labels=[t("−4", "−4"), t("−2", "−2"), t("0", "0"), t("1", "1")], size=14)
    ax.yaxis(ticks=[0, 5, 10, 15], labels=[t(str(n), str(n)) for n in (0, 5, 10, 15)], size=14)
    fig.text(55, 28, t("Im(*s*)", "Im(*s*)"), color="dim")
    fig.text(439, 305, t("Re(*s*)", "Re(*s*)"), color="dim", anchor="end")
    fig.text(ax.X(0.5), 28, t("Re(*s*) = 1/2", "Re(*s*) = 1/2"), color="lean", anchor="middle")

    zero_x, zero_y = ax.pt(FIRST_ZERO.real, FIRST_ZERO.imag)
    fig.line(310, zero_y, zero_x, zero_y, "lean", 1.1, opacity=0.65)
    fig.dot(zero_x, zero_y, 4.8, "lean", ring="bg")
    fig.text(302, zero_y, t("首个非平凡 ζ 零点", "First nontrivial ζ zero"), color="lean", anchor="end", middle=True, halo=True)

    left_x, pair_y = ax.pt(mirror.real, mirror.imag)
    right_x = ax.X(rho.real)
    fig.arrow(right_x - 6, pair_y, left_x + 6, pair_y, "ink", 1.3, head=5, dash="2 2")
    fig.dot(left_x, pair_y, 4.2, "magenta", ring="bg")
    fig.dot(right_x, pair_y, 4.2, "now", ring="bg")
    mirror_x, mirror_y = left_x - 7, pair_y - 10
    fig.text(mirror_x - 11, mirror_y, "1 −", color="magenta", anchor="end", halo=True)
    fig.overline(mirror_x, mirror_y, "ρ", color="magenta", anchor="end", halo=True)
    fig.text(right_x + 7, pair_y - 10, t("ρ", "ρ"), color="now", halo=True)
    # Cross the violet guide in the gap between its dashes at y = 96 and y = 100.
    callout_y = pair_y - 26
    fig.text(246, callout_y, t("假设的镜像零点", "Hypothetical mirror pair"), anchor="end", middle=True, halo=True)
    fig.polyline([(254, callout_y), (left_x, callout_y), (left_x, pair_y - 6)], "dim", 1.1)

    step = math.tau / math.log(2)
    euler_heights = [k * step for k in range(math.ceil(-4 / step), math.floor(18 / step) + 1)]
    assert all(abs(1 - 2 ** (-complex(0, height))) < 1e-12 for height in euler_heights)
    ax.points([(0, height) for height in euler_heights], "violet", 4.2, ring="bg")
    fig.polyline([ax.pt(0, step), (318, ax.Y(6)), (310, ax.Y(6))], "violet", 1.1)
    ax.text(0, 6, t("欧拉因子零点（实部为 0）", "Euler-factor zeros (Re(*s*) = 0)"),
            dx=-41, color="violet", anchor="end", middle=True, halo=True)

    for real in (-4, -2):
        fig.circle(*ax.pt(real, 0), 4.8, color="cyan", fill="bg", width=1.7)
    ax.text(-3, 0, t("平凡零点", "Trivial zeros"), dy=24, color="dim", anchor="middle")
    fig.cross(*ax.pt(1, 0), size=4.5, color="magenta", width=2.1)
    ax.text(1, 0, t("极点", "Pole"), dx=8, dy=-10, color="magenta", halo=True)
