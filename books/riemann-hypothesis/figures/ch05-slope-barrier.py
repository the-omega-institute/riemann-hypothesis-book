"""无零点界的示意曲线与格滤过的斜率多边形。
Illustrative zero-free bounds and the slope polygon of a lattice filtration.
"""

import math
from fractions import Fraction

SIZE = (510, 275)
MARKUP = 2
WRAP = True
ALT = {
    "zh": "左栏两条模型曲线从同一处出发。单特征提升从上方趋向 σ = 2/3，拼接族提升穿过这道界线，趋向 σ = 1/2。"
          "右栏的 Harder–Narasimhan 多边形有四段，斜率依次为 1.8、1.3、0.5、−0.2。"
          "琥珀色首段的斜率最大，灰色虚线连接首尾两点，给出平均斜率 5/7。",
    "en": "Two model curves start at the same abscissa. The single-character lift approaches σ = 2/3 from above, "
          "while the glued family passes it and approaches σ = 1/2. The four Harder–Narasimhan segments on the "
          "right have slopes 1.8, 1.3, 0.5, and −0.2. The amber first segment is steepest. The dashed grey "
          "chord joins the endpoints and shows the average slope 5/7.",
}

CRITICAL = Fraction(1, 2)
BARRIER = Fraction(2, 3)
INITIAL = Fraction(11, 12)
FILTRATION = [(0, Fraction(0)), (1, Fraction("1.8")), (3, Fraction("4.4")),
              (5, Fraction("5.4")), (7, Fraction("5.0"))]


def abscissa(depth, limit):
    return limit + (INITIAL - limit) * math.exp(-depth)


def barrier_panel(fig):
    t = fig.t
    fig.text(122.5, 20, t("无零点界 σ(*m*)", "Zero-free abscissa σ(*m*)"), size=15, weight=600, anchor="middle")
    for limit in (BARRIER, CRITICAL):
        assert math.isclose(abscissa(0, limit), float(INITIAL), abs_tol=1e-14)
    assert abscissa(4, BARRIER) > BARRIER
    assert CRITICAL < abscissa(1, CRITICAL) < BARRIER
    assert CRITICAL < abscissa(4, CRITICAL) < abscissa(1, CRITICAL)

    ax = fig.axes(42, 35, 158, 142, (0, 4), (0.46, 0.98))
    ax.grid(xs=[1, 2, 3], ys=[0.8, 0.9])
    ax.hline(BARRIER, "magenta", 1.5, dash="5 4")
    ax.hline(CRITICAL, "lean", 1.5, dash="5 4")
    ax.plot(lambda d: abscissa(d, BARRIER), color="magenta", width=2.2)
    ax.plot(lambda d: abscissa(d, CRITICAL), color="cyan", width=2.2)
    ax.xaxis(ticks=range(5), labels=[t(str(n), str(n)) for n in range(5)], size=12)
    ax.yaxis(ticks=[0.8, 0.9], labels=[t("0.8", "0.8"), t("0.9", "0.9")])
    ax.text(4, BARRIER, t("2/3", "2/3"), dx=5, color="magenta", middle=True)
    ax.text(4, CRITICAL, t("1/2", "1/2"), dx=5, color="lean", middle=True)
    fig.text(235, 217, t("*m* / √*X*", "*m* / √*X*"), color="dim", anchor="end")
    fig.legend(24, 236, [
        ("magenta", t("单特征提升模型", "Single-character model")),
        ("cyan", t("拼接族提升模型", "Glued-family model")),
    ], gap=21)


def slope_panel(fig):
    t = fig.t
    fig.text(122.5, 20, t("Harder–Narasimhan 多边形", "Harder–Narasimhan polygon"),
             size=15, weight=600, anchor="middle")
    slopes = [(dy - y) / (dx - x) for (x, y), (dx, dy) in zip(FILTRATION, FILTRATION[1:])]
    assert slopes == [Fraction(s) for s in ("1.8", "1.3", "0.5", "-0.2")]
    assert all(a > b for a, b in zip(slopes, slopes[1:]))
    start, end = FILTRATION[0], FILTRATION[-1]
    average = (end[1] - start[1]) / (end[0] - start[0])
    assert average == Fraction(5, 7)
    assert all(degree > average * rank for rank, degree in FILTRATION[1:-1])

    ax = fig.axes(42, 50, 178, 133, (0, 7.4), (0, 6))
    ax.grid(ys=[2, 4, 6])
    ax.xaxis(ticks=[0, 1, 3, 5, 7], labels=[t(str(n), str(n)) for n in (0, 1, 3, 5, 7)], size=12)
    ax.yaxis(ticks=[2, 4, 6], labels=[t(str(n), str(n)) for n in (2, 4, 6)])
    ax.path([start, end], "dim", 1.6, dash="5 4")
    ax.path(FILTRATION, "cyan", 2.5)
    ax.path(FILTRATION[:2], "now", 2.8)
    ax.points(FILTRATION[2:], "cyan", 3.4, ring="bg")
    ax.points(FILTRATION[:2], "now", 3.4, ring="bg")
    fig.text(42, 43, t("次数", "Degree"), size=12, color="dim")
    fig.text(235, 215, t("秩", "Rank"), size=12, color="dim", anchor="end")

    fig.line(28, 225, 48, 225, "now", 2.8)
    fig.text(56, 225, t("最大斜率 μ_{max} = 1.8", "Max slope μ_{max} = 1.8"), size=13, middle=True)
    fig.line(28, 249, 48, 249, "dim", 1.6, dash="5 4")
    fig.text(56, 249, t("平均斜率 μ(*L*) = 5/7", "Mean slope μ(*L*) = 5/7"), size=13, middle=True)


def draw(fig):
    left, right = fig.row([245, 245], 265, y=5)
    barrier_panel(left)
    slope_panel(right)
