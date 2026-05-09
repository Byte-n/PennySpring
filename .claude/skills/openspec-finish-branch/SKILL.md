---
name: openspec-finish-branch
description: 收束 OpenSpec 变更：在 `feature-openspec/<change-id>` 分支上开 PR、合并或丢弃，随后调用 `openspec-archive-change`。用作 `openspec-apply-change-gtdd` 流水线的最后一步，在 `openspec-pre-merge-verify` 通过之后。
license: MIT
compatibility: 依赖 git。创建 PR 时优先使用 GitHub CLI（`gh`），不可用时回退到手动指引。
metadata:
  author: pennyspring
  version: "1.0"
---

决定如何集成已完成的 OpenSpec 变更并完成清理。

**输入**：`<change-id>`（必填）。

## 前置条件

- `openspec-pre-merge-verify` 生成的 `.verification-report.md` 无 CRITICAL 问题（或用户显式接受 warnings）。
- worktree 的当前分支是 `feature-openspec/<change-id>`，所有提交均已落盘。

## 步骤

1. **推送分支**
   ```bash
   git push -u origin feature-openspec/<change-id>
   ```
   推送失败 → `openspec-debug-loop`（触发器：`finish-branch`）。

2. **选择集成方式（AskUserQuestion，单选）** —— 推荐 **Open PR**：
   - **Open PR（推荐）** —— 对 `main` 开 PR，正文使用 `.verification-report.md`
   - **Merge** —— 本地 `git merge --no-ff` 后推送 `main`
   - **Keep branch** —— 停在此处，保留分支/worktree 以便稍后复查
   - **Discard** —— 删除 worktree + 分支（需确认）

3a. **Open PR**（若选择）—— 检测 `gh`：
   - 可用：
     ```bash
     gh pr create \
       --base main \
       --head feature-openspec/<change-id> \
       --title "OpenSpec: <change-id>" \
       --body-file openspec/changes/<change-id>/.verification-report.md
     ```
     捕获 PR URL 并打印，继续步骤 4。
   - 不可用：打印手动指引（含远程 URL 与报告路径），继续步骤 4。

3b. **Merge**（若选择）
   ```bash
   git checkout main
   git pull --ff-only
   git merge --no-ff feature-openspec/<change-id> \
     -m "feat(openspec): <change-id>"
   git push origin main
   ```
   出现冲突 → AskUserQuestion（手动解决 / 中止 merge / 交给 debug-loop）。禁止自动解决。

3c. **Keep branch**（若选择）—— 停止并给出总结：分支名、worktree 路径、报告路径，以及精确的恢复命令（`gh pr create ...` 或 `git merge ...`）。不调用 `openspec-archive-change`。

3d. **Discard**（若选择）—— 需通过 AskUserQuestion 再次显式确认，然后：
   ```bash
   git worktree remove ../<repo>-<change-id>
   git branch -D feature-openspec/<change-id>
   git push origin --delete feature-openspec/<change-id>   # 仅当此前曾推送
   ```
   跳过归档。停止。

4. **归档变更**（仅 3a 或 3b 之后）—— 以 `<change-id>` 调用 `openspec-archive-change`。它会校验所有产物 `done`、将 `openspec/changes/<change-id>/` 移入归档，并把增量规格合并入 `openspec/specs/<capability>/spec.md`。

5. **清理 worktree**（仅 3a 已合并或 3b 成功后）—— 若 PR 上游已合并或本地 merge 成功：
   ```bash
   git worktree remove ../<repo>-<change-id>
   git branch -d feature-openspec/<change-id>
   git push origin --delete feature-openspec/<change-id>
   ```
   对于 3a "PR 已开但尚未合并" 的情况，保留 worktree，并把精确的清理命令作为提醒打印出来。

6. **汇报**
   ```
   ## OpenSpec Change Finalized — <change-id>

   Mode:     <Open PR | Merge | Keep | Discard>
   Branch:   feature-openspec/<change-id> <status>
   PR:       <URL or "n/a">
   Archive:  <path or "skipped">
   Worktree: <removed | kept at ../<repo>-<change-id>>
   ```

## 守则

- 分支名固定为 `feature-openspec/<change-id>` —— 禁止改名或缩短。
- 禁止自动解决 merge 冲突。
- 验证报告含未解决 CRITICAL 时禁止归档。
- Discard 需**两次**确认（选项 + 显式确认）。
- 没有用户明确同意禁止强制推送（`--force` / `--force-with-lease`）。
- 证据先于断言：每一次"成功"声明都附带对应命令输出。

## 交接

- 任何 push/merge/gh 失败 → `openspec-debug-loop`（触发器：`finish-branch`）。
- 成功集成后 → `openspec-archive-change`。
