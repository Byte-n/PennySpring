---
name: openspec-tdd-task
description: 执行来自 OpenSpec tasks.md 的单个 `- [ ] X.Y` 任务。自动检测任务 mode（feature / removal / docs / refactor / preview / config）并走对应的子流水线。feature 模式强制执行 RED-GREEN-REFACTOR 严格 TDD；豁免的模式跳过 RED 仅跑 Verify。然后提交并翻转复选框。用作 `openspec-apply-change-gtdd` 流水线步骤 2（循环调用）。
license: MIT
compatibility: 依赖 git、yarn、jest（通过 `yarn test`）与 openspec CLI。
metadata:
  author: pennyspring
  version: "1.1"
---

**输入**：
- `<change-id>`（必填）
- `<task-id>`，例如 `1.2`（必填）

## 前置条件

- `openspec-worktree-setup` 已完成；CWD 位于 `../<repo>-<change-id>` 对应的 worktree。
- `openspec/changes/<change-id>/tasks.md` 中存在 `- [ ] <task-id> <description>` 行。
- 该行包含其**检测出的 mode 所需**的子小节（见表）。缺少必备子小节 → 停止并报告计划失败。

## Mode 检测（步骤 1 之前执行）

首次命中即确定。

| 优先级 | 信号 | Mode |
|--------|------|------|
| 1 | 任务描述含显式标签 `[mode: <name>]` | `<name>` |
| 2 | 所有 `### Files` 条目均位于 `packages/component-preview/**` | `preview` |
| 3 | 每个 `### Files` 条目都以 `Delete:` 或 `Remove:` 前缀 | `removal` |
| 4 | 所有 `### Files` 条目匹配 `*.md` 或 `docs/**` | `docs` |
| 5 | 所有 `### Files` 条目匹配 `*.json`、`*.yaml`、`*.yml`、`.eslintrc*`、`.prettierrc*`、`tsconfig*.json`、`babel.config.*`、`metro.config.*`、`jest.config.*` | `config` |
| 6 | 默认 | `feature` |

> 规则 2–5 与 [AGENTS.md](../../../AGENTS.md) 保持一致（component-preview 豁免；removal 无需新测试）。显式 `[mode: xxx]` 始终最高优先级。

## 按 mode 划分的必备子小节

| Mode | `### Files` | `### Spec Refs` | `### Test First (RED)` | `### Verify` |
|------|-------------|-----------------|------------------------|--------------|
| `feature` | ✅ 必填 | ✅ 必填 | ✅ **必填，须失败** | ✅ 必填 |
| `refactor` | ✅ 必填 | ✅ 必填 | ⚠️ 可选（行为保持时允许 `N/A`） | ✅ 必填 |
| `removal` | ✅ 必填（全部 `Delete:`/`Remove:`） | ✅ 必填 | ❌ 跳过 | ✅ 必填 |
| `docs` | ✅ 必填 | ⚠️ 可选 | ❌ 跳过 | ✅ 必填 |
| `preview` | ✅ 必填 | ⚠️ 可选 | ❌ 跳过 | ✅ 必填（至少 `yarn typecheck`） |
| `config` | ✅ 必填 | ⚠️ 可选 | ❌ 跳过 | ✅ 必填 |

## 步骤

1. **解析任务块** —— 提取 `mode`、`files`、`specRefs`、`redTest`（`### Test First (RED)` 下的第一个代码块；仅 feature/refactor 需要）、`verify`。

2. **公告**
   ```
   ## Task <task-id> [mode: <mode>]: <description>
   Files:     <n>
   Spec refs: <n>
   TDD:       <enabled|skipped (reason)>
   ```

3. **RED —— 写失败测试** _（当 `mode ∈ {removal, docs, preview, config}` 或 `mode == refactor` 且 RED 为 `N/A` 时跳过）_
   - 在 `files.Test` 处按 `redTest` 原样创建/覆写测试文件。
   - 运行 `verify` 中针对该测试文件的第一条命令。预期：非零退出或 ≥1 个 Jest 失败。
   - 若意外通过 → 移交 `openspec-debug-loop`。

4. **GREEN / EDIT —— 最小改动**（语义随 mode 而异）
   - `feature` / 带 RED 的 `refactor`：在 `files.Create`/`files.Modify` 做最小代码变更以通过 RED。禁止修改测试。重跑 verify 命令；仍失败则 → `openspec-debug-loop`。
   - `removal`：精确删除列出的 `Delete:`/`Remove:` 文件；清理孤立 import/export；不新增测试；删除被移除代码对应的既有测试。
   - `docs`：仅编辑列出的 `.md` 文件。
   - `preview`：仅编辑 `packages/component-preview/**`。
   - `config`：仅编辑列出的配置文件。

5. **运行完整 Verify 块** —— 每条命令必须 exit 0；任一失败 → `openspec-debug-loop`。`removal` 模式必须包含完整 `yarn test`（或等价命令）。

6. **REFACTOR**（仅 feature 模式，可选）—— 在测试保持绿色的前提下做小幅清理。

7. **提交** —— 按 mode 选择 conventional commit 类型：
   | mode | type |
   |------|------|
   | `feature` | `feat` |
   | `refactor` | `refactor` |
   | `removal` | `chore`（语义保持时用 `refactor`） |
   | `docs` | `docs` |
   | `preview` | `chore` |
   | `config` | `chore` |
   ```bash
   git add -A
   git commit -m "<type>(<change-id>): <task description>"
   ```
   可选正文（feature/refactor）：`Refs: specs/<cap>/spec.md → Scenario: <name>`。

8. **翻转复选框** —— 在 `tasks.md` 中将 `- [ ] <task-id> <description>` 改为 `- [x] <task-id> <description>`，保留子小节。

9. **汇报**
   ```
   ✓ Task <task-id> [mode: <mode>] done
     RED   → <failing output summary | skipped (mode=<mode>)>
     GREEN → <passing output summary | N/A>
     Verify→ <commands, all exit 0>
     Commit: <short sha>
   ```

## 硬守则

- **禁止为让 RED 通过而编辑或删除测试** → 交 `openspec-debug-loop`。
- **禁止在提交成功前**勾选复选框。
- **禁止跳过 Verify**，任何 mode 都不例外。
- **禁止扩大作用域**。仅触碰 `### Files` 下列出的文件；否则停止并请求修订任务。
- **禁止擅自变更 mode**。Mode 来自检测表；不允许静默升降级。
- **证据先于断言**：每一条声明都要附命令输出。

## 交接

- 步骤 3-5 出现任何意外失败 → `openspec-debug-loop`，附带：违规命令、完整 stdout+stderr、`<task-id>` 与 `<mode>`。

## 失败时的输出

```
## Task <task-id> [mode: <mode>] Failed at <RED|GREEN|Verify>

**Command:** <cmd>
**Exit:** <n>
**Tail:**
<last ~40 lines of output>

Handing off to openspec-debug-loop.
```
