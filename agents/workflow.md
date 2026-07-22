# Atlas Development Workflow

## Happy Path

1. Human defines objective.

2. Project Manager creates task using the task template.

3. Developer reads all referenced documents, then implements the task.

4. Reviewer validates the implementation.

5. Project Manager closes the task and moves it to completed.

6. Architecture changes require Architect approval before implementation begins.

---

## Failure Paths

### Changes Requested

If the Reviewer returns a task with status `Changes Requested`:

1. Reviewer documents required changes in the `Review Outcome` section of the task.
2. Project Manager reassigns the task to the Developer with status `Active`.
3. Developer addresses the requested changes only.
4. Developer resubmits for review.
5. Reviewer re-validates.

### Blocked

If the Developer cannot proceed due to missing information or unclear requirements:

1. Developer updates task status to `Blocked`.
2. Developer documents the blocker in the task under a `Blockers` section.
3. Project Manager escalates the blocker to the Human for resolution.
4. Once resolved, Project Manager updates the task and returns it to `Active`.

### Architect Escalation

If the Developer identifies that a task requires an architectural decision:

1. Developer stops implementation.
2. Developer documents the question in the task under a `Blockers` section.
3. Project Manager escalates to the Architect Agent.
4. Architect reviews and documents the decision in `docs/v2/decision-log.md`.
5. Project Manager returns the task to the Developer with `Active` status.

---

## Rules

- Developer cannot modify architecture.
- Reviewer cannot expand scope.
- Architect cannot implement code.
- Project Manager cannot write production code.
- No agent may make product or scope decisions — escalate to the Human.
