---
name: openspec-debug-loop
description: 系统化地调查 `openspec-apply-change-gtdd` 流水线任意阶段遇到的任何 bug、测试失败、类型错误、lint 错误或异常行为。在提出任何修复之前使用。强制执行"复现 → 根因 → 根因处修复 → 验证"四阶段。
license: MIT
compatibility: 依赖 git、yarn 与项目测试运行器。
metadata:
  author: pennyspring
  version: "1.0"
---

`openspec-apply-change-gtdd` 流水线的系统化调试。由 `openspec-apply-change-gtdd`、`openspec-worktree-setup`、`openspec-tdd-task`、`openspec-pre-merge-verify` 作为失败处理器调用。

**核心原则（不可妥协）**：在提出或实施任何修复之前先系统化调查。禁止为"让它变绿"而打补丁、放宽断言或删除失败用例。

**输入**：
- `<change-id>`（必填）
- `trigger`：`worktree-setup` / `tdd-task:<id>` / `pre-merge-verify` / `ad-hoc`
- 调用方捕获的命令 + 完整 stdout + stderr

## 四阶段（顺序不可调）

### 阶段 1 —— 复现

目标：得到一条最小且可确定复现故障的命令。

1. 重跑触发命令，确认现象。
2. 精简到仍能复现故障的最小调用（用 `-t` 或特定文件收窄 `yarn test`）。
3. 原样捕获 stdout+stderr+退出码。

退出条件：一条命令 + 作为证据的捕获输出。

### 阶段 2 —— 根因追踪

目标：定位真正的源头，而非表象位置。

1. 列出**至少 2 个假设**；优先选简单、可证伪的。
2. 为每个假设选一种证伪方法（print、聚焦测试、`git log -p`、`git blame`、阅读引用文件、收窄输入）。
3. 执行证伪，捕获证据（输出、diff、调用栈）。
4. 逐一排除假设，直到只剩一个 —— 即根因。

退出条件：一个具体文件（理想情况下精确到行号区间）作为**触发源**，而非表象现场。

禁止：修改生产代码；"大概是 X，我直接改吧" —— 先补证据。

### 阶段 3 —— 根因处修复 + 纵深防御

目标：在根因处修复并增设护栏。

1. **根因修复** —— 在已定位位置做最小改动。
2. **纵深防御**（至少增加一项）：
   - 更强的边界类型（例如将 `unknown` 收窄为带标签的联合类型）。
   - 在调用端或入口处增加不变量断言 / schema 校验。
   - 添加一个在修复前必然失败的契约测试。
3. **回归测试** —— 新增一个捕获本 bug 的失败测试，与相关测试放在一起。先确认它能复现 bug，再确认修复后它变绿。

禁止：编辑或删除原本失败的测试；大范围无关重构。

### 阶段 4 —— 验证

目标：证明修复是真的，且没有造成回归。

1. 重跑阶段 1 的复现命令 → 期望成功。
2. 重跑原本失败的套件（例如 `yarn test <path>`） → 期望成功。
3. 至少重跑 `yarn typecheck`。若 `trigger === "pre-merge-verify"`，还需重跑完整 verify 套件。
4. 捕获全部输出。

退出条件：上述每条命令都 exit 0 **且输出可见**。

## 调试日志

每个阶段都必须追加到 `openspec/changes/<change-id>/.debug-log.md`：

```markdown
## <ISO-8601 timestamp> | Phase <1-4> | trigger=<trigger>

**Command:** <cmd>
**Hypotheses (Phase 2 only):**
- H1: <...> — falsified by <evidence>
- H2: <...> — root cause
**Evidence:**
```
<captured output, trimmed to last ~40 lines>
```
**Conclusion:** <what you learned / did>
```

## 守则

- **连续失败迭代最多 3 次**（阶段 2→3→4 在阶段 4 仍红）。达到第 3 次 → 通过 AskUserQuestion **暂停**：
  1. 停下来并交还人工
  2. 扩大作用域（允许触碰任务 `### Files` 之外的文件）
  3. 将该任务标记为 blocked 并跳过
- **禁止**在没有完整阶段 4 输出（在会话或 `.debug-log.md` 中）的情况下声称 bug 已修复。
- **禁止**为让失败测试通过而修改它。唯一可接受的编辑是*新增*一个回归测试。

## 交接返回

成功后返回给调用方：
```
## Debug complete — <trigger>

Root cause: <file>:<lines> — <short explanation>
Fix:        <file>:<lines>
Regression test: <file>
Defense-in-depth: <where>
Phase 4 output: all green (see .debug-log.md)
```

调用方（通常是 `openspec-tdd-task` 或 `openspec-pre-merge-verify`）随后从暂停处恢复执行。
