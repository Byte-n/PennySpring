---
name: "OPSX: Superpowers"
description: Execute OpenSpec change with Superpowers rigor (TDD, review, verification)
category: Workflow
tags: [workflow, artifacts, experimental, superpowers]
---

Execute OpenSpec change tasks using Superpowers engineering rigor. Load change context from OpenSpec CLI, analyze task dependencies, execute each task group with TDD and code review, and sync progress back to tasks.md.

**Input**: Optionally specify a change name (e.g., `/opsx:superpowers implement-theme-engine`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous, prompt for available changes.

**Announce at start**: "Using OpenSpec + Superpowers to implement <change-name>."

## Process

### Step 1: Select the Change

If a change name is provided, use it. Otherwise:

```bash
openspec list --json
```

- Auto-select if only one active change exists
- If multiple, use **AskUserQuestion** to let the user pick
- Announce: "Using change: <name>" and how to override

### Step 2: Load Change Context

Run both commands in parallel:

```bash
openspec status --change "<name>" --json
openspec instructions apply --change "<name>" --json
```

Parse `status` output for `schemaName`, `isComplete`, and `artifacts` status.

Parse `instructions apply` output for:
- `contextFiles`: artifact ID → array of file paths to read
- `state`: "blocked" | "all_done" | ready
- `progress`: { total, complete, remaining }
- `tasks`: task list with completion status

**Handle states:**
- `state: "blocked"` → report missing artifacts, suggest `/opsx:continue`
- `state: "all_done"` → report completion, suggest `/opsx:archive`
- Otherwise → proceed

### Step 3: Read Context Files

Read every file path listed in `contextFiles`. For spec-driven this includes proposal.md, design.md, all delta specs, and tasks.md. Other schemas follow whatever contextFiles returns — don't assume specific file names.

### Step 4: Analyze Dependencies and Build Execution Plan

Parse tasks.md to build a group-level DAG:

1. **Split into groups** by `##` headings — each heading is a task group
2. **Scan each task** for file path references (create `src/X.ts`, import from `../algorithms/`, modify `src/Y.tsx`)
3. **Infer dependencies** between groups:
   - Group B references files created by Group A → B depends on A
   - Group has no file references → independent, can run earliest
   - Groups at same depth with no cross-references → parallel candidates
4. **Choose strategy per group:**
   - **Serial**: downstream groups after upstream (topological order)
   - **Batch**: merge small same-file tasks within a group into one change
   - **Parallel**: groups at same depth with no cross-dependencies (use `superpowers:dispatching-parallel-agents`)

Display the execution plan briefly and proceed immediately — no confirmation needed.

### Step 5: Execute Groups in Order

For each group in topological order:

1. **Announce**: "Executing group: <heading> (N tasks)"
2. **Read relevant context**: re-read task descriptions and any referenced files
3. **Apply TDD** via `superpowers:test-driven-development`: write failing test → minimal implementation → pass → refactor
4. **Code review** via `superpowers:requesting-code-review`: dispatch code-reviewer subagent for this group's changes
5. **Address issues**: fix any CRITICAL or HIGH findings
6. **Verify**: run tests to confirm everything passes

If a group contains independent sub-tasks, dispatch them as parallel subagents via `superpowers:dispatching-parallel-agents`. Each subagent follows the same TDD + review discipline.

### Step 6: Sync Progress

After a group completes AND all tests pass:

Read tasks.md and flip all checkboxes belonging to this `##` group from `- [ ]` to `- [x]`. Use the Edit tool — find the exact lines under the group's heading and replace each unchecked box.

Report: "Group <heading>: N/N tasks done. Synced to tasks.md."

If sync fails (file changed externally, edit conflict), re-read tasks.md and retry.

### Step 7: Continue or Complete

- **More groups remain** → loop back to Step 5 for the next group
- **All groups done** → proceed to Step 8

### Step 8: Final Verification and Completion

1. **Verify**: invoke `superpowers:verification-before-completion`
   ```bash
   openspec instructions apply --change "<name>" --json
   ```
   Confirm `state: "all_done"` and all progress shows complete

2. **Report final status**:
   ```
   ## Implementation Complete

   **Change:** <change-name>
   **Schema:** <schema-name>
   **Progress:** N/N tasks complete ✓

   ### Groups Completed
   - [x] Group 1 (M tasks)
   - [x] Group 2 (K tasks)
   ...

   All tasks complete. Archive with `/opsx:archive`.
   ```

3. **Suggest archive**: "Run `/opsx:archive` when ready."

## Error Handling

**Pause execution when:**
- A task description is ambiguous → ask for clarification
- Tests fail after implementation → use `superpowers:systematic-debugging` before continuing
- Design issue discovered → report and suggest updating artifacts via `/opsx:continue`
- External dependency missing → report and wait

**On pause**, show which group failed, what went wrong, and specific resolution options.

**Resume**: after the issue is resolved, re-run `openspec instructions apply --change "<name>" --json` to get current state before continuing from the interrupted group.

## Tasks.md Format

OpenSpec uses standard GFM checkboxes:

```markdown
## 1. Types and Constants

- [ ] 1.1 Create `src/presetColors.ts` — description
- [x] 1.2 Create `src/types.ts` — description
```

Regex for detection:
- Task line: `/^[-*]\s+\[[\sx]\]/i`
- Unchecked: `/^[-*]\s+\[ \]/i`

When syncing, only modify checkbox markers — preserve all task descriptions exactly.

## Guardrails

- Execute groups in dependency order, not document order
- Read contextFiles from CLI output — don't hardcode paths
- Sync progress at group boundaries, never mid-group
- TDD is non-negotiable: no production code without a failing test first
- Never force through blockers — pause and ask
- Use schema's artifact names from CLI output, not assumed names
- If tasks.md has pre-checked items, respect them — those were done previously
- Keep code changes scoped to the current group's tasks
