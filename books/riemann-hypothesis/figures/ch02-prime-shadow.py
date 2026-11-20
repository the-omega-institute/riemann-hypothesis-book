"""冯·曼戈尔特和的余项与假设零点的振荡。
The von Mangoldt remainder and the oscillation from a hypothetical zero.
"""

import math

SIZE = (480, 300)
MARKUP = 2
ALT = {
    "zh": "从 x = 2 到 120，青线是冯·曼戈尔特加权和得到的 G_z(x) 减去 ln(2π)。"
          "四分之一步长的采样都在绿色虚线 ±0.05√x 内。品红色点线给出假设零点 0.78 + 11.13i 的单对振荡，"
          "从 x 约为 67 起越过包络。",
    "en": "From x = 2 to 120, the cyan curve shows the weighted von Mangoldt remainder G_z(x) minus ln(2π). "
          "All quarter-step samples lie inside the dashed green envelope ±0.05√x. The dotted magenta wave "
          "from the illustrative zero 0.78 + 11.13i first exceeds that envelope at about x = 67.",
}

LIMIT = 120
GAMMA = 0.5772156649015329
BASELINE = math.log(math.tau)
RHO = complex(0.78, 11.13)


def mangoldt(limit):
    """Return Λ(n) via a sieve and the powers of each prime."""
    composite = [False] * (limit + 1)
    values = [0.0] * (limit + 1)
    for p in range(2, limit + 1):
        if composite[p]:
            continue
        for multiple in range(p * p, limit + 1, p):
            composite[multiple] = True
        power = p
        while power <= limit:
            values[power] = math.log(p)
            power *= p
    return values


MANGOLDT = mangoldt(LIMIT)


def sz(x):
    return math.fsum(MANGOLDT[n] * (x / n - 1) for n in range(1, math.floor(x) + 1))


def gz(x):
    return sz(x) - x * math.log(x) + (1 + GAMMA) * x


def envelope(x):
    return 0.05 * math.sqrt(x)


def off_line_wave(x):
    return -2 * (x ** RHO / (RHO * (RHO - 1))).real


def draw(fig):
    t = fig.t
    assert MANGOLDT[1] == MANGOLDT[12] == 0
    assert MANGOLDT[64] == math.log(2) and MANGOLDT[81] == math.log(3)
    assert abs(gz(10) - 1.86080) < 1e-3
    assert abs(gz(100) - 1.72169) < 1e-3
    xs = [n / 4 for n in range(8, 4 * LIMIT + 1)]
    residual = [(x, gz(x) - BASELINE) for x in xs]
    wave = [(x, off_line_wave(x)) for x in xs]
    assert all(abs(y) <= envelope(x) for x, y in residual)
    assert all(abs(y) <= envelope(x) for x, y in wave if x <= 60)
    assert any(abs(y) > envelope(x) for x, y in wave if x >= 90)

    ax = fig.axes(56, 48, 391, 177, (2, LIMIT), (-0.75, 0.75))
    ticks = (2, 30, 60, 90, LIMIT)
    ax.grid(xs=ticks[1:-1], ys=[-0.5, 0.5])
    ax.frame()
    ax.hline(0, "faint", 1.2, dash="4 4")
    ax.path([(x, envelope(x)) for x in xs], "lean", 1.6, dash="6 4")
    ax.path([(x, -envelope(x)) for x in xs], "lean", 1.6, dash="6 4")
    ax.path(residual, "cyan", 2.1, join="round")
    ax.path(wave, "magenta", 2.1, dash="1 4", cap="round")
    ax.xaxis(ticks=ticks, labels=[t(str(n), str(n)) for n in ticks], size=14)
    ax.yaxis(ticks=[-0.5, 0, 0.5], labels=[t("−0.5", "−0.5"), t("0", "0"), t("0.5", "0.5")], size=14)
    fig.text(467, 244, t("*x*", "*x*"), color="dim")
    fig.text(56, 26, t("*G*_{*z*}(*x*) − ln(2π)", "*G*_{*z*}(*x*) − ln(2π)"), color="cyan", size=16, weight=600)
    fig.text(447, 26, t("±0.05√*x* 包络", "±0.05√*x* envelope"), color="lean", anchor="end")

    fig.line(56, 278, 78, 278, "magenta", 2.1, dash="1 4", cap="round")
    fig.text(87, 278, t("模型：σ = 0.78，*t* = 11.13", "MODEL · σ = 0.78, *t* = 11.13"),
             color="magenta", middle=True)
    fig.line(307, 278, 329, 278, "faint", 1.2, dash="4 4")
    fig.text(338, 278, t("ln(2π) 基线", "ln(2π) baseline"), color="dim", middle=True)
