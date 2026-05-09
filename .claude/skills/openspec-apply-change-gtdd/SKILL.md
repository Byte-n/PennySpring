---
name: openspec-apply-change-gtdd
description: 通过 Superpowers 风格的守卫式 TDD 流水线（worktree → 按 mode 的 TDD 循环 → 预合并校验 → 收束分支 → 归档）执行 OpenSpec 变更。从 tasks.md 解析 apply 策略（显式元信息块或任务 mode），把所有失败路由到 `openspec-debug-loop`，并要求每一次 "完成" 声明都附带证据。当用户需要完整的守卫式流水线（隔离分支、测试先行、系统化调试）时使用此技能，而非普通的 `openspec-apply-change`。
license: MIT
compatibility: 依赖 openspec CLI、git 2.5+、yarn。
metadata:
  author: pennyspring
  version: "1.0"
---

以守卫式 TDD 协调 apply 阶段。本技能按严格顺序驱动 5 个子技能，并把所有失败路由到 `openspec-debug-loop`；它本身不实现任务。

**与 `openspec-apply-change` 的关系**：可选的增强替代，不是取代。普通技能适用于简单顺序执行；当变更需要隔离、测试先行和完整预合并门禁时使用本技能。

**输入**：可选指定变更名。省略时从对话推断；有歧义则通过 AskUserQuestion + `openspec list --json` 询问。

## 流水线概览

```
worktree-setup → tdd-task（循环）→ pre-merge-verify → finish-branch → archive-change
```

**失败策略（任意步骤）**：在提出任何修复前先移交给 `openspec-debug-loop`。禁止为让测试通过而打补丁。

## 步骤

1. **选择变更** —— 使用传入名称、推断、或仅存在一个活动变更时自动选取，否则 `openspec list --json` + AskUserQuestion。公告：`Using change: <name>`，并给出覆盖写法（例如 `/opsx:apply-gtdd <other>`）。

2. **检查状态并读取上下文**
   ```bash
   openspec status --change "<name>" --json
   openspec instructions apply --change "<name>" --json
   ```
   - 解析 `schemaName` 与 `contextFiles`。
   - `state: "blocked"` → 建议 `openspec-continue-change`，停止。
   - `state: "all_done"` → 建议归档，停止。
   - 否则读取 `contextFiles` 下的每条路径（proposal / specs / design / tasks）。

3. **校验任务结构（按 mode）** —— 对 `## 1`..`## N-1` 下的每个 `- [ ] X.Y`：
   - 检测 mode（显式 `[mode: xxx]` → 基于路径 → 默认 `feature`）；必须与 `openspec-tdd-task` 一致。
   - 确认该 mode 所需的子小节齐备（见 `openspec-tdd-task` 表）。
   - 任一缺失 → 停止，报告计划失败，建议 `openspec-continue-change`。禁止臆断内容。

4. **显示当前进度**
   ```
   ## Applying (gtdd): <change-id> (schema: <schema-name>)
   Branch target: feature-openspec/<change-id>   (可能随 apply-strategy 变化)
   Tasks:         <done>/<total>  (modes: feature=<n>, docs=<n>, removal=<n>, ...)
   Pipeline:      worktree → tdd-task (loop) → pre-merge-verify → finish-branch
   ```

5. **步骤 1 —— worktree-setup** —— 以 `<change-id>` 调用。子技能解析 `<!-- apply-strategy -->` 或按 mode 推断（仅文档场景下 `worktree=disabled` 合法）。失败 → `openspec-debug-loop`（触发器：`worktree-setup`）；最多重试一次，否则暂停。成功后它会自动翻转 `- [ ] 0.1` / `0.2`。

6. **步骤 2 —— TDD 循环（按 mode）** —— 对 `## 1`..`## N-1` 下每个待办 `- [ ]`，按文档顺序：
   - 以 `<change-id>` 与 `<task-id>` 调用 `openspec-tdd-task`；子技能按 mode 选择正确的子流水线。
   - 失败 → `openspec-debug-loop`（触发器：`tdd-task:<task-id>`），随后继续同一任务。
   - 同一任务连续 3 次 debug-loop 仍无进展 → 通过 AskUserQuestion 暂停（继续 / 跳过 / 中止）。
   - 子技能按 mode 使用合适的 conventional commit 类型翻转复选框并提交。

   当组 1..N-1 中不再有 `- [ ]` 时停止。

7. **步骤 3 —— pre-merge-verify** —— 以 `<change-id>` 调用。
   - CRITICAL → `openspec-debug-loop`（触发器：`pre-merge-verify`），随后重新执行步骤 7。
   - 仅 WARNING → 子技能负责 AskUserQuestion；遵循用户选择。
   - 全绿 → 在每项对应动作完成后翻转 `- [ ] N.1` / `N.2`。

8. **步骤 4 —— finish-branch** —— 以 `<change-id>` 调用。
   - Open PR / Merge → 子技能调用 `openspec-archive-change`。
   - Keep / Discard → 流水线停止并给出总结。
   - 用户选择被落实后翻转 `- [ ] N.3`。
   - `worktree=disabled` 时，子技能负责"原地收束"。

9. **汇报**
   ```
   ## Apply (gtdd) Pipeline Complete — <change-id>

   Strategy: worktree=<required|disabled> baseline=<full|typecheck-only|skip>
   Branch:   feature-openspec/<change-id>
   Tasks:    <total>/<total> ✓  (modes: feature=<n>, docs=<n>, ...)
   Verify:   CRITICAL=0 WARNING=<n>
   Mode:     <Open PR | Merge | Keep | Discard>
   Archive:  <path or skipped>
   ```

## 协调器规则

- **不要自己实现任务**，始终委派。
- **不要跳步**。顺序固定：worktree → tdd-loop → pre-merge-verify → finish-branch。
- **不要绕过 debug-loop**。任何非零退出、测试/类型/lint 失败、运行时异常或异常现象，必须先路由到 `openspec-debug-loop` 再做任何代码改动。
- **不要使用 `feature-openspec/<change-id>` 以外的分支名**（元信息块覆盖也必须以 `feature-openspec/` 开头）。
- **不要把复选框标记为 `- [x]`**，直到子技能产出证据（输出、sha 或报告文件）。
- **不要升降级任务 mode**。Mode 来自 `tasks.md`；需调整请走 `openspec-continue-change`。
- **暂停而非臆断** —— 需求不清 → AskUserQuestion。

## 暂停时的输出（遇到问题）

```
## Apply (gtdd) Paused — <change-id>

**Step:** <worktree | tdd-task:<id> | pre-merge-verify | finish-branch>
**Reason:** <short reason>
**Evidence:** see .debug-log.md / .verification-report.md / session output

**Options:**
1. 人工介入后重试此步骤
2. 通过 openspec-continue-change 修正 tasks.md
3. 中止 apply 流水线
4. 回退到普通 `openspec-apply-change`（不保证 TDD / worktree）

What would you like to do?
```

## 流水线协同

- **任意时刻可调用** —— `tasks.md` 存在后即可；每一步都是幂等的。
- **若实现过程中发现 spec/design 问题**，暂停并交还给 `openspec-continue-change`；禁止在 apply 内部静默修改产物。
- **与 `openspec-apply-change` 共存**：独立的协调器。仅在干净边界（没有半截的 TDD 循环、没有未释放的 worktree）处切换。
- 下游子技能（`openspec-verify-change`、`openspec-archive-change`）保留各自原有职责。
