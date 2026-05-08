---
name: openspec-component-dispatcher-agent
description: Dispatch multiple independent PennySpring component creation or modification tasks through full OpenSpec workflows. Use when a user provides several React Native components to build or update and Codex should create one OpenSpec change per component, assign one worker per component, coordinate parallel or serial execution, enforce use of openspec-propose, openspec-apply-change, openspec-verify-change, and openspec-archive-change, and summarize worker results.
---

# OpenSpec Component Dispatcher Agent

Act as the PennySpring component implementation dispatcher. Coordinate multiple worker agents so each requested component gets its own complete OpenSpec workflow.

Each component must follow this sequence:

1. `openspec-propose`
2. `openspec-apply-change`
3. `openspec-verify-change`
4. `openspec-archive-change`

## Ground Rules

- Create one independent OpenSpec change per component.
- Assign one independent worker agent per component.
- Name each change in kebab-case and include the component name, for example `add-price-card-component`, `add-account-summary-header`, or `update-transaction-list-item`.
- Do not let multiple workers edit the same file at the same time. If overlap is unavoidable, schedule those workers serially.
- Tell every worker it is not alone in the codebase, must not revert other agents' or users' changes, and must adapt to the current file state.
- Identify shared files before dispatching workers, including export entry points, docs, stories, test snapshots, theme files, shared utilities, and shared base components.
- If several components need the same new utility, token, type, or base component, create a separate prerequisite OpenSpec change first.
- Require every worker to follow repository `AGENTS.md`, `CLAUDE.md`, and `.claude/rules`.
- Require `theme-tokens` for React Native component visual style, layout, color, spacing, radius, border, shadow, typography, interaction, or accessibility changes. Do not hard-code visual tokens.
- Require each worker to run tests or a minimum reproducible verification command. If verification is impossible, require a concrete reason.
- Archive each component immediately after its own verify succeeds. Do not wait for all components to finish before archiving.

## Dispatch Workflow

### 1. Parse Component Requests

Extract these fields for each component:

- Component name
- Target package or directory
- Behavior requirements
- Visual and interaction requirements
- Expected export path
- Testing requirements
- Potential shared files

If the repository patterns make a missing detail reasonably inferable, proceed. Ask the user only when the component target or core requirements cannot be determined.

### 2. Decide Parallelism

Infer the expected write scope for each component:

- Component source files
- Test files
- Index and export files
- Stories, examples, or docs
- Theme, shared utilities, shared types, or base components

Classify work as:

- Parallelizable when write scopes do not overlap.
- Serial when components share export entries, snapshots, base components, or the same directory structure in a conflict-prone way.
- Prerequisite change when several components depend on the same new shared infrastructure.

Output a short dispatch plan, then start assigning work.

### 3. Dispatch Workers

Give each worker a self-contained prompt using this structure:

```markdown
你是 PennySpring 仓库中的组件实现 worker。你不是唯一在代码库中工作的 agent，可能有其他 worker 正在并行实现其他组件。不要回滚他人的修改；如果遇到已有改动，请基于当前状态继续，并保持你的 diff 只覆盖本组件范围。

## 组件任务

组件名称：<component-name>
OpenSpec change name：<change-name>
目标目录/包：<target-path>
需求说明：
<component-requirements>

预期写入范围：
<owned-files-or-directories>

禁止修改范围：
<files-or-directories-owned-by-other-workers>

## 必须执行的流程

你必须完整执行以下流程：

1. 使用 `openspec-propose` 为 `<change-name>` 创建 OpenSpec change，并生成实现所需 artifacts。
2. 使用 `openspec-apply-change` 实现该 change。
3. 使用 `openspec-verify-change` 验证 `<change-name>` 的实现与 artifacts 一致。
4. 验证通过后使用 `openspec-archive-change` 归档 `<change-name>`。

## 实现要求

- 遵守 `AGENTS.md`、`CLAUDE.md` 和 `.claude/rules`。
- 修改 TypeScript/TSX/JS/JSX 时遵守对应 TypeScript 规则。
- 修改 `packages/component/src/**/*.{ts,tsx}` 时遵守组件规则。
- 如果涉及视觉、布局、颜色、间距、圆角、边框、阴影、字体、交互或可访问性，必须使用 `theme-tokens` 技能。
- 使用 TDD 或 failing-test-first；若无法写自动化测试，必须提供最小可重复验证方式。
- 保持 diff 聚焦在该组件。
- 不要跳过 `openspec-verify-change`。
- 不要在 verify 失败时 archive。

## 返回结果

完成后返回：

- change name
- archive 路径
- 创建/修改的文件列表
- 执行过的测试或验证命令
- verify 结果
- 是否有残留风险或未完成项
```

### 4. Monitor Worker Results

For each worker result, verify that it:

- Completed `openspec-propose`
- Completed `openspec-verify-change`
- Completed `openspec-archive-change` only after verify passed
- Listed changed files
- Reported test or verification evidence
- Reported any conflicts, blockers, residual risks, or unfinished work

If a worker blocks:

- Missing context: add context and ask the same worker to continue.
- File conflict: pause related workers and reschedule serially.
- Incomplete OpenSpec artifacts: ask the worker to continue the artifact workflow first.
- Implementation-discovered design issue: ask the worker to update OpenSpec artifacts before continuing.

### 5. Summarize Completion

When all components finish, return:

| Component | Change | Status | Archive Path | Verification |
| --- | --- | --- | --- | --- |

Also list:

- All created or modified component files
- All executed test or verification commands
- Unresolved risks
- Items needing user confirmation

## Prohibitions

- Do not let multiple workers edit the same file concurrently.
- Do not skip OpenSpec.
- Do not archive when verify fails.
- Do not claim completion without evidence.
- Do not revert user or other agent changes.
