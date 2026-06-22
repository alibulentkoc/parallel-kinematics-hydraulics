"""
pkm_reference.py — a small, pure-Python reference for the PKM curriculum.

This mirrors the JavaScript simulation engine (src/) in plain Python so the
lessons' code examples and the Jupyter notebooks are runnable with nothing but
the standard library (math) — no third-party dependencies, so it cannot break
when a package updates. Every default below matches the engine and the lessons.

Run `python pkm_reference.py` to print the headline numbers used across the course.
"""

from math import pi, sqrt, hypot

# ---------------------------------------------------------------------------
# Machine defaults (identical to the simulation engine)
# ---------------------------------------------------------------------------
B = 0.6            # half base-width; anchors at (-B, 0) and (+B, 0)   [m]
L_CLOSED = 0.4     # cylinder length fully retracted                   [m]
STROKE = 0.6       # usable stroke, so L in [L_CLOSED, L_CLOSED+STROKE] [m]

BORE = 0.040       # piston (bore) diameter D                          [m]
ROD = 0.022        # rod diameter d                                    [m]

SUPPLY = 16e6      # supply pressure                                   [Pa]
RELIEF = 21e6      # relief-valve setting                              [Pa]
PUMP_MAX_FLOW = 6e-4   # pump max flow (= 36 L/min)                    [m^3/s]
RATED_FLOW = 2.5e-4    # valve rated flow (= 15 L/min)                 [m^3/s]
RATED_DP = 3.5e6       # valve rated pressure drop                     [Pa]
PAYLOAD = 12.0     # default payload mass                             [kg]


# ---------------------------------------------------------------------------
# Kinematics (2-RPR)
# ---------------------------------------------------------------------------
def inverse_kinematics(x, y, b=B):
    """Pose (x, y) -> leg lengths (L1, L2). The easy, closed-form direction."""
    L1 = hypot(x + b, y)
    L2 = hypot(x - b, y)
    return L1, L2


def forward_kinematics(L1, L2, b=B):
    """Leg lengths (L1, L2) -> pose (x, y) for the upper half-plane (y > 0)."""
    x = (L1**2 - L2**2) / (4 * b)
    y = sqrt(max(0.0, L1**2 - (x + b)**2))
    return x, y


def jacobian(x, y, b=B):
    """2x2 Jacobian dL/d(pose); rows are the unit leg-direction vectors."""
    L1, L2 = inverse_kinematics(x, y, b)
    return [[(x + b) / L1, y / L1],
            [(x - b) / L2, y / L2]]


def det_jacobian(x, y, b=B):
    """det(J) -> 0 on the base line (y -> 0): a singularity."""
    L1, L2 = inverse_kinematics(x, y, b)
    return 2 * b * y / (L1 * L2)


def manipulability(x, y, b=B):
    """A scalar 'dexterity' measure; collapses to 0 at a singularity."""
    return abs(det_jacobian(x, y, b))


# ---------------------------------------------------------------------------
# Hydraulics
# ---------------------------------------------------------------------------
def cap_area(D=BORE):
    """Full-bore (cap-side) piston area."""
    return pi * D**2 / 4


def rod_area(D=BORE, d=ROD):
    """Annular (rod-side) piston area."""
    return pi * (D**2 - d**2) / 4


def asymmetry(D=BORE, d=ROD):
    """phi = A_cap / A_rod  (always > 1 for a single-rod cylinder)."""
    return cap_area(D) / rod_area(D, d)


def cylinder_force(p, area):
    """F = p * A."""
    return p * area


def cylinder_speed(Q, area):
    """v = Q / A."""
    return Q / area


def valve_flow(u, dP, Qrated=RATED_FLOW, dPrated=RATED_DP):
    """Proportional-valve flow law: linear in command u, sqrt in pressure drop."""
    return u * Qrated * sqrt(max(0.0, dP / dPrated))


def hydraulic_power(p=SUPPLY, Q=PUMP_MAX_FLOW):
    """P = p * Q."""
    return p * Q


# ---------------------------------------------------------------------------
# Control
# ---------------------------------------------------------------------------
class PID:
    """Minimal PID with derivative-on-measurement and an anti-windup clamp."""

    def __init__(self, Kp, Ki, Kd, i_max=1.0):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.i_max = i_max
        self.integ = 0.0
        self.prev_meas = 0.0

    def update(self, error, meas, dt):
        self.integ = max(-self.i_max, min(self.i_max, self.integ + error * dt))
        deriv = -(meas - self.prev_meas) / dt        # derivative on measurement
        self.prev_meas = meas
        return self.Kp * error + self.Ki * self.integ + self.Kd * deriv


if __name__ == "__main__":
    L1, L2 = inverse_kinematics(0.10, 0.70)
    print(f"IK (0.10, 0.70):           L1={L1:.3f} m, L2={L2:.3f} m")
    x, y = forward_kinematics(L1, L2)
    print(f"FK round-trip:             x={x:.3f} m, y={y:.3f} m")
    print(f"det(J) at (0.10,0.70):     {det_jacobian(0.10,0.70):.4f}")
    print(f"A_cap, A_rod:              {cap_area()*1e6:.0f} mm^2, {rod_area()*1e6:.0f} mm^2")
    print(f"asymmetry phi:             {asymmetry():.2f}")
    print(f"extend force @16 MPa:      {cylinder_force(SUPPLY, cap_area())/1e3:.1f} kN")
    print(f"retract force @16 MPa:     {cylinder_force(SUPPLY, rod_area())/1e3:.1f} kN")
    print(f"extend speed @15 L/min:    {cylinder_speed(RATED_FLOW, cap_area()):.2f} m/s")
    print(f"valve flow u=0.7, half dP: {valve_flow(0.7, RATED_DP/2)*60000:.1f} L/min")
    print(f"hydraulic power:           {hydraulic_power()/1e3:.1f} kW")
