# Atlas — Context Handoff

*A self-contained brief for continuing this work in a fresh chat. Read this fully before suggesting anything.*

---

## Me / working style

- I push to git myself — **commit locally only, never `git push`.**
- Windows, VS Code, Git Bash + PowerShell. Node.js installed at `C:\Program Files\nodejs`.
- I value blunt intellectual honesty over agreement. Push back with reasoning; don't flatter. Actively catch confounds and rigged reasoning.

---

## What the project is

Atlas = a local tool giving AI coding agents persistent memory of a project, so understanding survives context resets. Repo: `g:\HARLEM`. Two tracks:

- **v1 (frozen, tagged `v1.0.0`/`v1.1.0`):** a hosted project-management web platform (FastAPI + Postgres + Helm/EKS). Docs in `docs/v1.0/`. Not under development.
- **v2 (active):** a **local VS Code extension**. Branch: `atlas-memory-core`. Milestone 1 built & merged (PR #3): scans a workspace, parses dependencies, stores structure in SQLite (`.atlas/memory.db` via `sql.js`), shows a sidebar tree. Code in `extension/src/` (`scanner`, `dependencies`, `storage`, `treeView`, `extension`, `contextExport`). Docs in `docs/v2/`.

---

## The big turn (most important part)

Instead of building the roadmap (Milestone 2 git history → Milestone 3 embeddings), we stopped to **test the core premise**: does feeding an agent the project's memory actually change its behavior? We built a map→markdown exporter (`extension/src/contextExport.ts`) and ran a controlled A/B on an unfamiliar repo (`g:\mavlink`).

### Experiment 01 (DONE): does the structural map reduce an agent's work?

- **Metric — "exploration cost":** count of look-around actions (Read/Grep/Glob/ls) before the first edit that *survives into the final answer*. (The survives-clause stops a confident-but-wrong fast edit from scoring as low exploration.)
- **Controls:** injection frozen (map as auto-loaded `CLAUDE.md`), honest cold-start baseline (no hints), fresh session per trial, repo reset between trials. 3 WITHOUT + 3 WITH, alternating.
- **Result: NULL.** WITHOUT 9,6,6 (mean 7.0); WITH 5,4,9 (mean 6.0). Within-arm noise (±3) swamped the 1-action mean difference; ranges overlap. All 6 edits correct.
- **Mechanism (the real finding):** the map helps *locate* (1–2 actions), but the dominant cost is *comprehension reads* (understanding existing helpers), which structure can't shrink. Structure is the cheap-to-rederive layer.
- **Records:** `docs/v2/experiment-01-report.md` (neutral, no-conclusion, shareable), `experiment-01-results.md` (full logs + my interpretation), `experiment-01-does-the-map-move-the-agent.md` (protocol).

---

## Methodological principles locked in (apply to everything from here)

1. **Pre-registration.** Sample size + decision threshold fixed *before* data. Standing rule: **at 3 trials/arm, no difference counts as real, however clean the separation looks.** "No overlap" between tiny samples feels like signal but isn't. My in-the-moment read must be out of the loop by construction.
2. **One trap, three costumes.** Every experiment dies when the injected manipulation carries a *second payload* you didn't mean to measure: handicapped baseline ("we crippled the control"), answer-key hint ("we told it the answer"), size-as-proxy ("we tested the wrong variable"). Watch for the leak every time.
3. **Test whether the problem exists; never simulate the fix.** That's how you pre-test embeddings honestly — measure whether the cold agent struggles, don't fake a retrieval result (faking it = answer-key leak).

---

## WHAT WE ARE DOING NEXT (do this — do NOT propose alternatives)

**The method is fixed: every next step is a cheap, pre-registered experiment, NOT a feature build.** Do not suggest building Milestone 2 (git history), embeddings, or any new infrastructure until an experiment earns it. Do not skip pre-registration. If you feel the urge to propose "a better memory system" or "one more layer," stop — that impulse is the exact thing this effort exists to discipline.

### Immediate next action: run Experiment 02

Already pre-registered and locked in `docs/v2/experiment-02-vocabulary-gap.md`. Do not redesign it.

- **Hypothesis:** the map might help when the agent *can't* token-match — a **vocabulary gap** (task words ≠ code words). Tests the map's real domain AND pre-tests embeddings at once.
- **Task (verified valid):** add `connection_reliability()` to mavlink's `mavfile` class; the natural solution is `100 - packet_loss()`, but "reliable/healthy/link" appear nowhere in the code, forcing the agent to bridge to `packet_loss`.
- **Rig:** identical to Exp 01. 6 sessions on `g:\mavlink`, alternating WITHOUT/WITH (`CLAUDE.md` = the map or absent), reset `cd pymavlink && git checkout .` between trials. **If the agent asks where things are, say only "use your judgment" — never mention `packet_loss` or message loss (answer-key leak).**
- **Pre-registered decision rules:** map "helps" ONLY IF WITH beats WITHOUT by **≥3 mean AND non-overlapping ranges**. Vocabulary bottleneck "shown" ONLY IF **cold mean ≥ 11**.
- **Pre-registered prediction:** the map probably still won't help — it lists *file* names, not *method* names like `packet_loss`. If so, it nominates a **symbol-level map** as Experiment 03.

### Decision tree after Experiment 02 (follow the rules, not vibes)

1. **Map helps** (≥3 mean gap AND non-overlapping) → surprising; structure has a real domain (the vocabulary-gap regime). Re-examine the roadmap in that light.
2. **Map null again BUT cold bottleneck shown** (cold mean ≥ 11) → the *problem* (location under vocabulary stress) is real, but the *file-level* map is the wrong granularity. → **Experiment 03: a symbol-level map** (function/method/class names — what a language server gives cheaply — which would actually contain `packet_loss`). Same rig, same metric, pre-registered.
3. **Map null AND no cold bottleneck** (cold mean < 11) → even under vocabulary stress the agent bridges on its own; location just isn't where cost lives. Structure AND embeddings both have a narrow/nonexistent domain. → Pivot to the **comprehension/intent layer**: a *task-blind*, hand-written note of general project knowledge (conventions, "the canonical way to do X") vs cold baseline. This is the layer every experiment keeps pointing at — what the agent re-derives each session that grep can't provide. Keep it task-blind or it's the answer-key trap.

**The through-line:** we are hunting for *which layer of memory actually changes agent behavior*, one cheap honest experiment at a time, before committing engineering to any of it. The structural layer failed its first test. Exp 02 tests whether it has any domain. Whatever wins, we test it before we build it.

---

## Git state

- Branch `atlas-memory-core`, last commit `46d1b7d` ("Add MIT license and CI/license badges").
- **Uncommitted** (experiment work — nothing pushed): `docs/v2/experiment-01-*.md`, `docs/v2/experiment-02-vocabulary-gap.md`, `docs/v2/context-handoff.md`, `extension/src/contextExport.ts`, and edits to `extension/src/extension.ts`, `extension/package.json`, `docs/v2/decision-log.md` (ADR-005/006), `docs/v2/progress.md`.
- The extension compiles (`cd extension && npm run compile`). The map for mavlink is generated at `g:\mavlink\.atlas\memory.md`.
