"""消失阶数与两个独立的行降权算子。
Vanishing order and two independent row-lowering operators.
"""

from math import comb, factorial

SIZE = (500, 270)
MARKUP = 2
WRAP = True
ALT = {
    "zh": "左栏在同一零点比较 x 与 x⁵，按位置只数一次，按消失阶数分别数一次和五次。"
          "右栏在两个三次对称幂的张量积中画出 16 个权重。箭头从琥珀色最高权 (3,3) 出发，逐次转移一个行次数，始终留在格内。",
    "en": "The left panel compares x and x⁵ at their common zero. Counting by location gives one zero each, "
          "while counting by vanishing order gives one and five. The right panel shows the 16 weights in a tensor "
          "product of two cubic symmetric powers. The staircase starts at the amber highest weight (3,3). "
          "Each move transfers one row degree and stays within the grid.",
}


def vanishing_panel(fig):
    t = fig.t
    fig.text(120, 21, t("同一零点，不同重数", "Same zero, different orders"), size=15, anchor="middle", weight=600)
    ax = fig.axes(31, 39, 178, 148, (-1.04, 1.04), (-1.13, 1.13))
    ax.hline(0, "axis", 1.3)
    ax.vline(0, "faint", 1.1, dash="3 4")
    for order, color in ((1, "dim"), (5, "cyan")):
        # Derivatives at zero of the monomial x^order.
        jet = [factorial(order) if k == order else 0 for k in range(6)]
        assert next(k for k, value in enumerate(jet) if value) == order
        ax.plot(lambda x: x ** order, -1, 1, color=color, width=2.2)
    assert abs(0.5 ** 5) < abs(0.5)
    ax.points([(0, 0)], "ink", 3.2, ring="bg")
    ax.text(0, 0, t("*x*_{0}", "*x*_{0}"), dx=7, dy=19, color="dim")
    ax.text(-0.7, -0.7, t("*x*, *m* = 1", "*x*, *m* = 1"), dx=9, dy=17, color="dim", halo=True)
    ax.text(0.66, 0.66 ** 5, t("*x*⁵, *m* = 5", "*x*⁵, *m* = 5"), dy=25, color="cyan", anchor="middle", halo=True)
    fig.text(120, 230, t("一个位置，计五重", "One location, fivefold count"), color="dim", anchor="middle")


def weight_panel(fig):
    t = fig.t
    fig.text(120, 21, t("外尔模的权重格", "Weyl module weights"), size=15, anchor="middle", weight=600)

    # A product of two cubic symmetric powers. In each pair the substitution
    # x -> x + ty moves degree from x to y. The coefficient of t^k is the divided power.
    weights = {(p, q) for p in range(4) for q in range(4)}
    lowerings = [
        ((p, q), (p - k, q), comb(p, k))
        for p, q in sorted(weights)
        for k in range(1, p + 1)
    ] + [
        ((p, q), (p, q - k), comb(q, k))
        for p, q in sorted(weights)
        for k in range(1, q + 1)
    ]
    highest = max(weights)
    assert len(weights) == 16 and highest == (3, 3)
    assert all(target in weights and coefficient > 0 for _, target, coefficient in lowerings)
    path = [highest]
    for i in range(6):
        p, q = path[-1]
        path.append((p - 1, q) if i % 2 == 0 else (p, q - 1))
    assert path[-1] == (0, 0)
    assert all(any((a, b) == (start, end) for a, b, _ in lowerings) for start, end in zip(path, path[1:]))

    ax = fig.axes(51, 33, 153, 153, (-0.45, 3.45), (-0.45, 3.45))
    ax.grid(xs=range(4), ys=range(4), color="faint", dash=None)
    ax.frame("lean", 1.5)
    for start, end in zip(path, path[1:]):
        x1, y1 = ax.pt(*start)
        x2, y2 = ax.pt(*end)
        dx, dy = (x2 - x1) / 5, (y2 - y1) / 5
        fig.arrow(x1 + dx, y1 + dy, x2 - dx, y2 - dy, "cyan", 1.8, head=6)
    ax.points(sorted(weights), "dim", 3.0, ring="bg")
    ax.points(path[1:], "cyan", 3.2, ring="bg")
    ax.points([highest], "now", 5.1, ring="bg")
    for n in range(4):
        ax.text(n, 0, t(str(n), str(n)), dy=32, color="dim", anchor="middle")
        ax.text(0, n, t(str(n), str(n)), dx=-25, color="dim", anchor="end", middle=True)
    fig.text(26, 34, t("*q*", "*q*"), color="dim", anchor="end")
    fig.text(210, 203, t("*p*", "*p*"), color="dim")
    fig.text(120, 229, t("行除幂降权", "Row divided-power lowering"), color="cyan", anchor="middle")
    fig.text(120, 251, t("weylEqNablaQ · rowDivClosedGraded", "weylEqNablaQ · rowDivClosedGraded"),
             size=12, color="dim", anchor="middle")


def draw(fig):
    left, right = fig.row([240, 240], 260, y=5)
    vanishing_panel(left)
    weight_panel(right)
