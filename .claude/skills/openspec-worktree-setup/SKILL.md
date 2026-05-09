---
name: openspec-worktree-setup
description: 从 tasks.md 解析 apply 策略（显式元信息块或由任务 mode 自动推断），随后在 `feature-openspec/<change-id>` 上创建隔离的 git worktree 并完成基线校验；对仅文档变更则跳过 worktree 创建。用作 `openspec-apply-change-gtdd` 流水线的步骤 1。
license: MIT
compatibility: 依赖 git 2.5+、项目的包管理器（yarn）与 openspec CLI。
metadata:
  author: pennyspring
  version: "1.1"
---

**输入**：`<change-id>`（kebab-case）。省略时从当前活动变更推断，或通过 AskUserQuestion + `openspec list --json` 询问。

## 前置条件

- 工作树干净（`git status --porcelain`）；若不干净，AskUserQuestion：stash / commit / abort。
- `openspec/changes/<change-id>/` 存在且至少包含 `tasks.md`。

## 步骤 0 —— 解析 apply 策略（最先执行）

策略仅来自 AI 可读的来源。禁止读取 `.openspec.yaml`。

### 0.a 在 `tasks.md` 顶部查找显式元信息块

扫描前 30 行以寻找 HTML 注释：

```markdown
<!-- apply-strategy
worktree: auto            # auto | required | disabled
baseline: auto            # auto | full | typecheck-only | skip
branch: feature-openspec/<change-id>   # 可选覆盖；必须以 feature-openspec/ 开头
-->
```

所有字段可选；未知字段忽略。

### 0.b 若任一字段为 `auto` 或缺失，按任务 mode 推断

对 `tasks.md` 中每个 `- [ ] X.Y`（除去固定分组 `## 0.` 与 `## N.`），按与 `openspec-tdd-task` 相同的规则检测其 mode，随后套用：

| Mode 分布 | `worktree` | `baseline` |
|-----------|------------|------------|
| 所有任务均为 `docs` | `disabled` | `skip` |
| 所有任务均为 `preview` | `required` | `typecheck-only` |
| 所有任务均为 `config` | `required` | `typecheck-only` + 每个配置项自检 |
| 存在任意 `feature` / `refactor` / `removal`，或无法判定 | `required` | `full` |

显式元信息块的取值始终优先于推断值。

### 0.c 校验并公告

- 若覆盖了 `branch`，必须以 `feature-openspec/` 开头；否则拒绝并 AskUserQuestion。
- 将解析后的策略在步骤 5 中写入 `.baseline.json` 的 `strategy` 字段。
- 公告：
  ```
  ## Apply Strategy
  worktree: <required|disabled>   (source: <explicit|inferred>)
  baseline: <full|typecheck-only|skip>
  branch:   <branch or "(current)">
  ```

## 主流程

### 当 `worktree = disabled`（仅文档 / 原地）

1. 保持在当前分支。不创建 worktree，不切换 CWD。
2. 若当前分支是 `main` / `master`，AskUserQuestion（创建普通分支 / 中止）。若允许，则不建 worktree，直接 `git switch -c feature-openspec/<change-id>`。
3. 跳过基线，在 `.baseline.json` 中记录为跳过。
4. 在 `tasks.md` 中自动翻转：
   - `- [x] 0.1 ... (skipped: docs-only change, no worktree)`
   - `- [x] 0.2 ... (skipped: docs-only change, no baseline)`
5. 跳转至"汇报完成"。

### 当 `worktree = required`（默认 / 涉及代码）

1. **解析名称/路径**
   - 分支：`feature-openspec/<change-id>`（除非通过元信息块覆盖）。
   - 路径：`../<repo-name>-<change-id>`。

2. **检查已存在的分支/worktree（幂等）** —— 使用 `git worktree list --porcelain` + `git branch --list feature-openspec/<change-id>`：
   - 两者均不存在 → 全新创建（步骤 3a）。
   - 分支存在、worktree 缺失 → 附加（`git worktree add <path> feature-openspec/<change-id>`）。
   - worktree 已在预期路径 → 复用，跳至步骤 4。
   - worktree 在其他路径 → AskUserQuestion（复用 / 迁移 / 中止）；禁止强制。

3. **创建 worktree**
   - 全新：`git worktree add ../<repo>-<change-id> -b feature-openspec/<change-id>`。
   - 若分支已由上次运行残留，仅在用户明确同意后才以 `-B` 重试。

4. **安装依赖 + 基线校验**（在 worktree 内执行，捕获 stdout/stderr）：
   - 始终：`yarn install --frozen-lockfile`（若无 lockfile 则 `yarn`）。
   - `baseline == full` → `yarn typecheck` + `yarn test`。
   - `baseline == typecheck-only` → `yarn typecheck`。
   - `baseline == skip` → 不再执行命令。

5. **持久化基线** 至 `openspec/changes/<change-id>/.baseline.json`：
   ```json
   {
     "branch": "feature-openspec/<change-id>",
     "worktreePath": "<absolute path or null>",
     "strategy": {
       "worktree": "required|disabled",
       "baseline": "full|typecheck-only|skip",
       "source": "explicit|inferred"
     },
     "commands": [
       { "cmd": "yarn typecheck", "exitCode": 0, "durationMs": 12345 },
       { "cmd": "yarn test", "exitCode": 0, "passed": 123, "failed": 0 }
     ],
     "createdAt": "<ISO-8601 timestamp>"
   }
   ```
   当 `disabled` / `skip` 时，`commands` 可为空；`worktreePath` 为 `null`。

6. **处理基线失败** —— 任何非零退出 → 附带捕获输出移交 `openspec-debug-loop`。不得继续、不得打补丁、不得声称成功。

7. **自动翻转固定分组 0** —— 确认 worktree（或跳过）后 `- [x] 0.1`；确认基线（或跳过）后 `- [x] 0.2`。

## 汇报完成

```
## Worktree Ready
Mode:     <required | disabled (reason)>
Branch:   feature-openspec/<change-id>   | (保留当前分支)
Path:     ../<repo>-<change-id>           | (原地)
Baseline: ✓ typecheck, ✓ test (N/N passing) | skipped (<reason>)
Next:     openspec-tdd-task 将按顺序迭代 `- [ ] X.Y` 任务。
```

## 守则

- **来源顺序固定**：显式 `<!-- apply-strategy -->` → 按 mode 推断 → 默认 `required / full`。禁止臆测。
- **禁止读取 `.openspec.yaml`** 用于决定策略。
- **分支名必须以 `feature-openspec/` 开头**，覆盖时亦然。
- **禁止对已存在分支使用 `git checkout -B`** 未经用户同意。
- **不要把 `0.1` / `0.2` 标记为完成**，除非对应命令（或跳过决定）产出了输出。
- **基线必须绿**，只要 `baseline != skip`。无输出的"看起来没问题"不可接受。
- **`worktree = disabled` 仅在变更完全是文档变更时合法**（所有任务为 `[mode: docs]`），除非用户显式设置。若推断为 `disabled` 但后续出现非 docs 任务，停止并 AskUserQuestion。

## 失败时的输出

```
## Worktree Setup Failed

**Step:** <strategy-resolve | install | typecheck | test>
**Exit code:** <n>
**Captured output (tail):**
<last ~40 lines>

Handing off to openspec-debug-loop. No further tasks will run until the baseline is green.
```
