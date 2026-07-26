# Experiment 01 — Does the structural map move the agent?

## Status

Instrument built. Trials not yet run.

---

## Why this exists

Every milestone past Milestone 1 (git history, embeddings, agent exposure) assumes the same unproven premise: that feeding a coding agent a memory of the project changes its behaviour for the better. Nothing has tested that premise yet. Milestone 1 proved Atlas can build an *accurate* map; it never proved the map *matters*.

This experiment gates the roadmap. No further data-layer milestone is scoped or built until this produces a number. A clean null result is as valuable as a large positive one — it tells us the structural layer, the thing every later milestone builds on, is scaffolding rather than signal.

This is a deliberate reordering. The original roadmap deferred agent exposure to last, which meant no evidence about whether *any* layer works would exist until the very end. This pulls the smallest possible end-to-end loop to the front, using the map we already have.

---

## Hypothesis

Injecting the structural map into an agent's context reduces the amount of orientation work the agent does before it starts productively editing, on a task in a repository it hasn't seen.

---

## The metric

**Exploration cost: the number of file reads / greps the agent makes before its first edit that survives into the final answer.**

The "survives into the final answer" clause is load-bearing and must not be dropped when this is operationalised. Without it, an agent that reads five files, edits confidently, and is *wrong* scores as low exploration — rewarding confident failure and polluting the signal. Anchoring the count to reads that precede a *surviving* edit measures orientation that actually paid off, not motion.

Lower is better. Memory "works" if it consistently lowers this number.

---

## Frozen variables (the confounds)

These are fixed for every trial. Varying any of them means the delta can't be attributed to the map.

### Injection method — FROZEN

The map is delivered as a single Markdown file, `.atlas/memory.md`, produced deterministically by the `Atlas: Export Context (Markdown)` command (`renderMemoryMarkdown` in `extension/src/contextExport.ts`). The same snapshot always renders byte-identical output.

One injection mechanism, chosen and held constant: the file is provided to the agent at the **start** of the session (not read on demand mid-task), identically across every with-memory trial. When intent or any later layer is tested, it uses this same injection path — so the only thing that ever changes between arms is content, never delivery.

### Baseline — HONEST COLD START

The without-memory arm is the agent's *normal* behaviour opening the repo cold and being asked the task. It must not be a handicapped agent told to avoid exploring, and it must not be denied any tool it would normally have. The comparison is only real if the baseline is exactly what happens today.

### Task and repo

* A repository the model has not been trained to navigate familiarly and that has non-trivial structure.
* A real, self-contained task with a checkable definition of done (e.g. "add field X to model Y and surface it through the API").
* The *same* task and repo across the with/without arms.

### Trials

Three or four different tasks, a few trials each per arm, because a single task on a single repo is dominated by task choice, not by memory. One measurement is directional, not a verdict. Trust a consistent delta across tasks far more than a large delta on one.

---

## Instrument (built)

* `renderMemoryMarkdown(projectName, snapshot)` — pure, deterministic map → Markdown. No `vscode` import; headlessly testable like the other core modules.
* `Atlas: Export Context (Markdown)` command — reads `.atlas/memory.db`, writes `.atlas/memory.md`.
* Verified against this repo: 23 directories / 92 files / 9 dependencies rendered to a stable 92-line map.

---

## Embeddings trigger (recorded now, on purpose)

Embeddings are demoted, not struck. The pull toward them will return dressed as something reasonable; a named gate turns "revisit later" from a vibe into a condition — the same discipline that would have avoided over-engineering elsewhere.

**Revisit embeddings / semantic retrieval only when at least one of these is true on a real target repo:**

* the rendered `.atlas/memory.md` exceeds ~2,000 lines (the map no longer fits usefully in context), or
* grep-for-a-known-token routinely returns more hits than are useful to hand an agent (structure + the agent's own search has stopped scaling).

Until a trigger fires, embeddings are solving an unmeasured problem.

---

## Outcomes and what each means

* **Consistent drop across tasks** → memory delivery works; the structural layer is load-bearing. Next: add intent as a second content layer over the *same* injection path and measure the marginal gain.
* **No movement** → the structural map is scaffolding. Stop building data layers on top of it. This is the most important thing the experiment can teach, and it costs a day.
* **Noisy / task-dependent** → the metric or task set needs tightening before any roadmap decision; do not proceed on a single-task result.
