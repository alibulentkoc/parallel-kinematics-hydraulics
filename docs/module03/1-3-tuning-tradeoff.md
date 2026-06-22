!!! abstract "You are here"
    **Module 3 — Closed-Loop Control** · **Unit 1 — The Feedback Loop** · **Lesson 1.3 — The Tuning Trade-off**

# Lesson 1.3 — The Tuning Trade-off

> **Module 3 · Unit 1 · Lesson 1.3** · interactive
> The deep truth of control: fast and stable pull in opposite directions. Good
> tuning is the narrow band that satisfies both — and the metrics that tell you when
> you've found it.

---

## 1. Why This Matters

There is no "best" set of gains, only the best *for your requirement*. Push for
speed and you risk overshoot and oscillation; push for stability and you get a
sluggish machine. Every real specification — like our assignment's "settle within X
seconds with under Y% overshoot" — is really asking you to find the sweet spot of
this trade-off. Knowing the metrics lets you aim instead of fiddle.

## 2. Physical Intuition

Imagine parking a car against a wall by feel. Approach fast and you'll bump it
(overshoot); approach timidly and you'll take forever (slow rise). The right
approach is brisk but easing off near the end. A controller faces the same tension:
high gains move quickly but ring; low gains are calm but slow. The skill is shaping
the approach, not just choosing "more" or "less."

## 3. Mathematical Foundations

A step response is judged by a few standard numbers:

- **Rise time** — how fast it first reaches the target. Smaller \(\to\) faster.
- **Overshoot** — how far it passes the target, as a percentage:
  \(\text{OS} = (y_\text{peak} - r)/r \times 100\%\).
- **Settling time** — when it stays within a band (typically ±2%) of target.
- **Steady-state error** — the leftover gap once it settles.

Raising \(K_p\) cuts rise time but raises overshoot; the two move in opposite
directions, which is the trade-off made quantitative. Good tuning minimizes settling
time subject to an overshoot cap.

## 4. Visual Explanation

```mermaid
flowchart LR
    LOWKP["low Kp"] --> SLOW["slow rise,<br/>no overshoot,<br/>long settle"]
    HIGHKP["high Kp"] --> RING["fast rise,<br/>big overshoot,<br/>rings"]
    GOOD["balanced Kp,Ki,Kd"] --> BEST["fast rise,<br/>small overshoot,<br/>quick settle"]
```

The interactive demo draws the actual step-response curve and computes overshoot and
settling time live, so you can *see* the trade-off instead of just reading about it.

## 5. Engineering Example

The student assignment **M3 — Tuning trade-off** grades exactly these metrics: it
asks for a response that settles quickly *and* keeps overshoot under a limit, and the
grader (Module 4) scores the recorded trace against both. A submission that's fast
but rings fails the overshoot criterion; one that's calm but slow fails the settling
criterion. Only the balanced tuning passes — which is the lesson, enforced by the
rubric.

## 6. Worked Example

In the demo, start at the **too hot** preset (high \(K_p\), no \(K_d\)): the curve
shoots well past the target — say 40% overshoot — and takes a long time to stop
ringing, so settling time is *long* despite the fast rise. Now add derivative: the
overshoot drops toward 10% and the curve settles much sooner. The rise time barely
changed, but the *settling* time — the metric that actually matters — improved
dramatically. That's the trade-off resolved: \(K_d\) bought stability without
sacrificing speed.

## 7. Interactive Demonstration

<iframe src="../../demos/pid-tuning.html" title="PID Tuning — interactive demo" loading="lazy" style="width:100%;height:720px;border:1px solid var(--md-default-fg-color--lightest);border-radius:8px;background:#0e1217"></iframe>

[Open this demo full-screen in a new tab ↗](../demos/pid-tuning.html){ target=_blank }

Watch the **overshoot** and **settling time** readouts as you move the gains. Try to
beat the "well tuned" preset: find gains with overshoot under 20% *and* the shortest
settling time you can. Notice you can't drive both to zero — that impossibility *is*
the trade-off.

## 8. Code & Computation

```python
def step_response(Kp, Ki, Kd, sp=1.0, dt=0.01, n=800, c=3.0):
    integ = prev = y = v = 0.0; traj = []
    for _ in range(n):
        e = sp - y
        integ = max(-2, min(2, integ + e*dt))
        deriv = -(y - prev)/dt; prev = y
        u = Kp*e + Ki*integ + Kd*deriv
        v += (u - c*v)*dt; y += v*dt; traj.append(y)
    peak = max(traj); overshoot = max(0.0, (peak - sp)/sp)
    out = [i for i, val in enumerate(traj) if abs(val - sp) > 0.02]
    return overshoot, (out[-1]+1)*dt if out else 0.0
for name, g in {"too slow": (3,0,0), "too hot": (60,0,0), "well tuned": (30,0,8)}.items():
    os, ts = step_response(*g); print(f"{name:10s}: overshoot={os*100:5.1f}%  settling={ts:.2f}s")
```

!!! tip "Run it yourself"
    This computation is a runnable cell in the **[Module 3 notebook](../notebooks/module03.ipynb)** — pure Python, standard library only, so it runs anywhere with no installs. Response metrics match [`src/student/metrics.js`](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/src/student/metrics.js).

## 9. Knowledge Check

[Open the Lesson 3.1.3 check ↗](../quizzes/m3-l13.html){ target=_blank }

## 10. Challenge Problem

Your spec is "settle within 1.0 s with no more than 15% overshoot." Using the demo,
find a set of gains that meets it, and write down the rise time, overshoot, and
settling time you achieved. Then explain which single gain you'd change if the spec
tightened the overshoot limit to 5%.

## 11. Common Mistakes

- **Optimizing rise time alone.** A fast rise that rings has a *long* settling time —
  the metric that usually matters.
- **Chasing zero overshoot blindly.** Often a small overshoot with fast settling
  beats a slow, overshoot-free crawl.
- **Tuning without a spec.** "Best" is undefined; tune to the required settling and
  overshoot numbers.

## 12. Key Takeaways

- **Speed and stability trade off**: higher gains rise faster but overshoot more.
- Judge a response by **rise time, overshoot, settling time, steady-state error**.
- Good tuning **minimizes settling time subject to an overshoot cap** — exactly what
  the M3 rubric grades.
- Derivative action can buy stability without losing speed.

## AI Learning Companion

**Tutor**
```
Explain the fundamental trade-off in controller tuning between fast response and
low overshoot, and define rise time, overshoot, settling time, and steady-state
error.
```
**Practice**
```
Give me 5 step-response descriptions with rough rise/overshoot/settling numbers and
ask me to judge whether each meets a given spec, and which gain to change. Answers
included.
```

---

*Next lesson: [2.1 — Joint-Space vs Task-Space](2-1-joint-vs-task-space.md), where we control a whole parallel machine, not one cylinder.*
