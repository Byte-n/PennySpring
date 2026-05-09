---
name: openspec-pre-merge-verify
description: 运行完整的 test/typecheck/lint 套件以及 openspec-verify-change，然后将证据汇总到 `.verification-report.md`。用作 `openspec-apply-change-gtdd` 流水线的步骤 3：在 `## 1..N-1` 组内所有 `- [ ]` 任务完成之后、`openspec-finish-branch` 之前执行。
license: MIT
compatibility: 依赖 yarn、项目测试运行器与 openspec CLI。
metadata:
  author: pennyspring
  version: "1.0"
---

预合并验证门禁。阻塞流水线，直到完整套件全绿且 `openspec-verify-change` 无 CRITICAL 问题。

**输入**：`<change-id>`（必填）。

## 前置条件

- `../<repo>-<change-id>` 的 worktree 处于激活状态；分支为 `feature-openspec/<change-id>`。
- `tasks.md` 中 `## 1`..`## <N-1>` 任务组的每个 `- [ ]` 已翻转为 `- [x]`。否则停止并报告未完成任务。

## 步骤

1. **公告**
   ```
   ## Pre-Merge Verification — <change-id>
   Branch: feature-openspec/<change-id>
   ```

2. **执行完整命令套件（每条必须 exit 0）** —— 记录命令、退出码、输出尾部。任何非零退出 → `openspec-debug-loop`。
   - `yarn test`
   - `yarn typecheck`
   - `yarn lint`

3. **调用 `openspec-verify-change`** 针对 `<change-id>`。捕获三维报告：
   - 完备性（任务与规格覆盖）
   - 正确性（需求映射与场景覆盖）
   - 一致性（设计符合度与模式一致性）

4. **调用 OpenSpec CLI**
   - `openspec status --change <change-id> --json` —— 期望所有产物 `done`。
   - 若 CLI 提供校验器（例如 `openspec validate --change <change-id>`），一并执行。

5. **汇总证据 → `.verification-report.md`**，路径 `openspec/changes/<change-id>/.verification-report.md`：

   ```markdown
   # Verification Report — <change-id>

   **Branch:** feature-openspec/<change-id>
   **Generated:** <ISO-8601 timestamp>

   ## Command Suite
   | Command        | Exit | Summary                 |
   |----------------|------|-------------------------|
   | yarn test      | 0    | <N/N passing>           |
   | yarn typecheck | 0    | no errors               |
   | yarn lint      | 0    | no errors               |

   ## openspec-verify-change Report
   | Dimension    | Status                       |
   |--------------|------------------------------|
   | Completeness | <tasks/total>, <reqs/total>  |
   | Correctness  | <reqs covered>               |
   | Coherence    | <followed|issues>            |

   ### Issues
   - CRITICAL: <list or "none">
   - WARNING:  <list>
   - SUGGESTION: <list>

   ## openspec CLI
   ```
   <`openspec status` JSON trimmed>
   ```

   ## Command Output Tails
   （每个失败命令最后约 40 行；全部绿色时省略）
   ```

6. **门禁决策**
   - **任何 CRITICAL**（命令失败或 verify-change 给出 CRITICAL） → `openspec-debug-loop`（触发器：`pre-merge-verify`）。返回后从步骤 2 重新开始。
   - **仅有 WARNING / SUGGESTION** → AskUserQuestion：
     1. 原样继续到 `openspec-finish-branch`
     2. 先修复 warnings（交还给 `openspec-apply-change-gtdd` 修订任务）
     3. 中止
   - **全部绿色** → 自动推进到 `openspec-finish-branch`。

7. **汇报**
   ```
   ## Verification: <PASS | PASS (with warnings) | BLOCKED>

   Commands: ✓ test, ✓ typecheck, ✓ lint
   Verify:   <CRITICAL=0 WARNING=n SUGGESTION=m>
   Report:   openspec/changes/<change-id>/.verification-report.md

   Next: openspec-finish-branch  (or: debug-loop)
   ```

## 守则

- **禁止跳过步骤 2 中的任何命令**。三条都必须运行并捕获输出。
- **禁止在对应动作未真正完成并附证据前**标记 `- [ ] N.1 / N.2 / N.3`。
- **CRITICAL 始终阻塞**。不走 debug-loop 就不得放行。
- **证据先于断言**：本技能的整个目的就是产生证据；禁止无原始输出的总结。

## 交接

- 步骤 2-4 任何失败 → `openspec-debug-loop`，附 `trigger: pre-merge-verify` + 违规命令 + 完整输出。
- 全部绿色 → `openspec-finish-branch`。
