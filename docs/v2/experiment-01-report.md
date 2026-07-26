# Experiment 01 — Report: Does pre-built project memory change how a coding agent works?

*A self-contained record of purpose, method, and results. No conclusions are drawn here by design.*

---

## Purpose — why this experiment

Atlas is a local tool that builds a "memory" of a software project for AI coding agents to draw on, so that an agent doesn't have to rediscover the project from scratch every session. The first memory layer it builds is a **structural map**: the project's directories, files, and declared dependencies, stored locally and renderable as a plain Markdown file.

The entire roadmap past this point (git history, then semantic/embedding layers) rests on one premise: that giving a coding agent a pre-built memory of the project makes it work more effectively. That premise had never been measured. Before building further layers on top of it, the goal was to get one measured number answering a narrower question:

> When a coding agent is handed the structural map as pre-built memory, does it do measurably less work to complete a real task than the same agent working without it?

There was a specific reason to doubt the structural layer in particular: which files exist and what the dependencies are may be exactly the kind of information a capable agent can rediscover cheaply on its own using search (grep/glob) — in which case pre-building it as "memory" would add little. This experiment was run to replace that speculation with a measurement.

---

## Method — what we did

**Repository under test:** `mavlink`, an unfamiliar open-source repository with non-trivial structure (73 directories, 385 files, a Python package `pymavlink` inside it that is a git submodule).

**The memory artifact:** the structural map rendered to a single Markdown file, `.atlas/memory.md` (521 lines) — a nested list of directories and files plus the dependency list. Structure only: no file contents, no code bodies, no history.

**Two arms, one difference between them:**

- **WITH memory** — the map is present as `CLAUDE.md` at the repo root, which Claude Code auto-loads into context at the start of the session.
- **WITHOUT memory** — no map present; a normal cold-start session.

The presence of that one file is the *only* difference between the arms. Same repository, same task, same model, same everything else.

**The task** (identical in both arms, pasted verbatim as the first message of each session):

> In pymavlink, add a method `time_since_last_heartbeat()` to the mavfile connection class that returns the number of seconds since the last HEARTBEAT message was received. Then stop.

The task was chosen because it is real, requires the agent to both *locate* the right code and *understand* the surrounding conventions, and ends in a concrete, checkable edit. (A first task attempt — adding `motors_disarmed_wait()` — was discarded before scoring because that method already existed in the code, so there was no edit to measure. That discarded attempt is also what surfaced that `pymavlink/` is a git submodule, which affected how the repo was reset between trials.)

**The metric — "exploration cost":** the number of look-around actions the agent took **before the first edit that survives into the final answer**. Look-around actions counted: `Read`, `Grep`, `Glob`, and any directory-listing/inspection shell command (`ls`, `find`, `cat`, etc.). Lower means the agent reached its working edit with less searching.

The qualifier "that survives into the final answer" is deliberate. Without it, an agent that reads very little, edits confidently, and is *wrong* would score as low-exploration — rewarding confident error. Anchoring the count to the first edit that is actually part of the delivered solution measures orientation that paid off, not mere motion.

**Controls:**

- Every trial was a brand-new session (not a continuation), so no trial's context carried into another.
- The injection method was held identical across all WITH trials (the map auto-loaded via `CLAUDE.md`), so the only thing varying between WITH trials was chance, not delivery.
- The WITHOUT arm was a genuine cold start: the agent was given no hints about where the code lived; if it asked, it was told to use its own judgment.
- The repository's code was reset between trials so each trial began from the same state.

**Sample:** 6 scored trials, run alternating — 3 WITHOUT, 3 WITH.

---

## Results

### Per-trial summary

| Trial | Arm | Exploration count | First surviving edit correct? |
|-------|-----|-------------------|-------------------------------|
| 1 | WITHOUT | 9 | yes |
| 2 | WITH | 5 | yes |
| 3 | WITHOUT | 6 | yes |
| 4 | WITH | 4 | yes |
| 5 | WITHOUT | 6 | yes |
| 6 | WITH | 9 | yes |

### Summary numbers

- **WITHOUT:** 9, 6, 6 — mean 7.0, range 6–9
- **WITH:** 5, 4, 9 — mean 6.0, range 4–9
- Correctness: 6 of 6 correct in both arms. In every trial the agent produced the same solution — a new method delegating to the existing `time_since('HEARTBEAT')` helper — and verified it.

### Full per-trial action logs

The exact action sequence each session took, in order. `→ EDIT` marks the first edit that survived into the final answer; only actions above it are counted.

**Discarded pre-trial — WITHOUT — task `motors_disarmed_wait()` (not scored):**
1. Grep `motors_armed_wait`
2. Grep `def motors_armed`
3. Read `mavutil.py` 856–885
4. Read `mavutil.py` 882–893
5. Grep `^class mavfile`
→ No edit — the method already existed. Trial discarded.

**Trial 1 — WITHOUT — 9:**
1. Bash `ls pymavlink/`
2. Bash `git submodule status; ls`
3. Grep `HEARTBEAT|heartbeat`
4. Grep `class mavfile|def __init__|self.timestamp`
5. Read 175–244
6. Read 401–580
7. Read 579–608
8. Read 371–402
9. Read 243–272
→ EDIT

**Trial 2 — WITH — 5:**
1. Grep `HEARTBEAT|heartbeat`
2. Grep `class mavfile`
3. Read 175–254
4. Read 401–580
5. Read 579–598
→ EDIT

**Trial 3 — WITHOUT — 6:**
1. Glob `**/mavutil.py`
2. Glob `**/pymavlink/**`
3. Grep `HEARTBEAT|heartbeat`
4. Read 241–360
5. Read 360–579
6. Read 579–618
→ EDIT

**Trial 4 — WITH — 4:**
1. Grep `HEARTBEAT`
2. Grep `class mavfile|def post_message|self.timestamp|time_since`
3. Read 371–450
4. Read 546–595
→ EDIT
5. Grep `def messages|self.start_time` — occurred after the edit (verification), not counted

**Trial 5 — WITHOUT — 6:**
1. Grep `class mavfile`
2. Grep `HEARTBEAT`
3. Read 175–254
4. Read 396–570
5. Grep `time_since|last_heartbeat|_timestamp`
6. Read 573–586
→ EDIT

**Trial 6 — WITH — 9:**
1. Grep `HEARTBEAT|heartbeat`
2. Grep `class mavfile`
3. Read 175–294
4. Read 401–570
5. Read 141–176
6. Read 356–401
7. Grep `_timestamp`
8. Read 573–592
9. Grep `^def add_message`
→ EDIT

### One observed detail, stated without interpretation

Across all trials, the actions divided into two kinds: a small number of **locate** actions (finding which file/class held the code — typically 1–2 actions, e.g. a glob or a first grep) and a larger number of **read** actions spent reading regions of `mavutil.py` to understand the existing `time_since()` helper and the message-timestamping path. The map contained information relevant to the first kind (which files exist) and did not contain information relevant to the second kind (what the code does).
