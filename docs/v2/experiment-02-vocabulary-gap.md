# Experiment 02 — Vocabulary gap: does the map help when the agent can't grep the obvious token?

## Status

**PRE-REGISTERED. Written before any trial was run.** Everything below the "Pre-registration lock" line was fixed in advance; results append below it and do not edit it.

---

## Purpose

Experiment 01 found no reliable effect of the structural map on a **high-overlap** task — the task said "heartbeat," the code said `HEARTBEAT`, and the agent found its target in one grep. The mechanism was legible: the agent barely spent effort on *location*, so a map of *where things are* had almost nothing to shrink.

That leaves one hypothesis alive: the map might have a domain after all — the regime where location *is* expensive. Location gets expensive not from repo size but from **vocabulary distance**: when the words a task naturally uses are not the words the code uses, the agent can't token-match and has to bridge. This experiment creates that regime deliberately and asks whether the structural map helps in it.

It carries a second, free readout. The cold arm's own struggle in this regime is a **pre-test of the embeddings premise** — not by simulating retrieval (that would leak the answer), but by measuring whether a location bottleneck exists *at all* when token overlap is denied. If the cold agent flails, there is a problem for semantic retrieval to solve. If it bridges synonyms cheaply on its own, there is no bottleneck and embeddings have no domain here either.

---

## Pre-registration lock

### Independent variable
Task↔code token overlap. Experiment 01 = high overlap. This experiment = **low overlap**, holding everything else (repo, rig, metric) constant.

### Repo and rig
`g:\mavlink`, identical setup to Experiment 01. Map artifact `.atlas/memory.md` (structure only), injected via `CLAUDE.md` auto-load for the WITH arm, absent for the WITHOUT arm. Fresh session per trial. Repo reset (`cd pymavlink && git checkout .`) between trials.

### Task (low-overlap; verified valid and absent before locking)
> In pymavlink, add a method `connection_reliability()` to the mavfile connection class that returns a score from 0 to 100 indicating how reliable the current link is, where 100 means the connection is perfectly healthy. Then stop.

The intended solution builds on the existing `packet_loss()` method (returns loss %), e.g. `return 100.0 - self.packet_loss()`. The gap: the task's words — "reliable," "healthy," "link," "score" — appear **nowhere** in the code (verified: `reliab`=0, `health`=0, `quality`=0, `dropped`=0 matches in `mavutil.py`). The agent must reason "reliability ← message loss ← is there a loss metric?" to reach `packet_loss`. It cannot token-match its way there.

### Metric
Identical to Experiment 01: exploration cost = count of look-around actions (`Read`/`Grep`/`Glob`/listing shell commands) before the first edit that survives into the final answer.

### Baseline honesty (task-specific)
Because the vocabulary gap *is* the experiment, the runner must not, if the agent asks, hint at `packet_loss` or "message loss." Only "use your judgment." Hinting the bridge is the answer-key leak and voids the trial.

### Sample size
**3 trials per arm, 6 total, alternating.** Fixed now.

### Decision rules (fixed now, applied without in-the-moment judgment)

1. **Does the map help in the low-overlap regime?** Call it a real effect ONLY IF *both*: (a) WITH mean ≤ WITHOUT mean − 3 (a gap larger than Experiment 01's within-arm noise floor of ~3), AND (b) the WITH and WITHOUT ranges do not overlap. If either fails → **"no effect at this power."** "Clean separation" that fails the −3 bar does **not** count, no matter how it looks. (This is the exact rule that Experiment 01 needed and that my mid-run read violated.)

2. **Is there a vocabulary-driven location bottleneck (embeddings pre-test)?** Compare this experiment's WITHOUT (cold) mean to Experiment 01's cold mean of 7.0. Call a bottleneck "shown" ONLY IF the cold mean here ≥ 11 (clearly above 7.0 + noise). Below that → **no measurable vocabulary bottleneck for this agent/repo**, which also means embeddings have no demonstrated domain here.

### Predictions (recorded to prevent post-hoc storytelling)

- **P1:** The structural map likely does **not** help even here, because it lists *file* names, not *method* names — the vocabulary that needs bridging (`packet_loss`) is a method inside `mavutil.py`, which the map does not contain. If P1 holds, the finding points at **symbol-level** memory (function/method names), not file-level, as the thing worth testing next.
- **P2:** Genuinely uncertain whether the cold agent shows a bottleneck. A strong agent may bridge "reliability → loss" in 2–3 greps (no bottleneck; narrow domain for both map and embeddings), or may flail across wrong tokens/files (bottleneck exists).

---

## Results

*(appended after the run; the section above is frozen)*

| Trial | Arm | Exploration count | First surviving edit correct? | Notes |
|-------|-----|-------------------|-------------------------------|-------|
| 1 | WITHOUT |  |  |  |
| 2 | WITH |  |  |  |
| 3 | WITHOUT |  |  |  |
| 4 | WITH |  |  |  |
| 5 | WITHOUT |  |  |  |
| 6 | WITH |  |  |  |

### Applied against the pre-registered rules
- WITHOUT mean: ____  | WITH mean: ____
- Rule 1 (map effect): ____
- Rule 2 (bottleneck / embeddings pre-test): cold mean ____ vs threshold 11 → ____
