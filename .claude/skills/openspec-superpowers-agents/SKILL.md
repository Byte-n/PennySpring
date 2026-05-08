---
name: openspec-superpowers-agents
description: Execute OpenSpec change with Superpowers rigor using multiple agents for parallel implementation, code review, and verification
---

# OpenSpec Superpowers Agents

以 Superpowers 工程化方式执行 OpenSpec 变更任务。从 OpenSpec CLI 加载变更上下文，分析任务依赖关系，以 TDD 加代码审查的方式执行每个任务组，并将进度同步回 tasks.md。

**输入**：可指定变更名称（如 `/openspec-superpowers-agents implement-theme-engine`）。若省略，检查是否可从对话上下文推断。若模糊不清，提示用户选择可用变更。

**开始时宣布**："使用 OpenSpec + Superpowers 实现 <change-name>。"

## 流程

### 步骤 1：选择变更

若已提供变更名称，直接使用。否则：

```bash
openspec list --json
```

- 若仅有一个活跃变更，自动选择
- 若有多个，使用 **AskUserQuestion** 让用户选择
- 宣布："使用变更：<name>" 及如何覆盖

### 步骤 2：加载变更上下文

并行执行以下两个命令：

```bash
openspec status --change "<name>" --json
openspec instructions apply --change "<name>" --json
```

解析 `status` 输出，获取 `schemaName`、`isComplete` 和各产物的状态。

解析 `instructions apply` 输出，获取：
- `contextFiles`：产物 ID → 需读取的文件路径数组
- `state`："blocked" | "all_done" | 就绪
- `progress`：{ total, complete, remaining }
- `tasks`：带完成状态的任务列表

**处理各状态：**
- `state: "blocked"` → 报告缺失的产物，建议 `/opsx:continue`
- `state: "all_done"` → 报告已完成，建议 `/opsx:archive`
- 其他 → 继续执行

### 步骤 3：读取上下文文件

读取 `contextFiles` 中列出的所有文件路径。对于 spec-driven 模式，包括 proposal.md、design.md、所有 delta specs 和 tasks.md。其他 schema 遵循 contextFiles 返回的内容——不要假定文件名。

### 步骤 4：分析依赖并构建执行计划

解析 tasks.md，构建分组级别的 DAG：

1. **按 `##` 标题拆分为分组**——每个标题为一个任务组
2. **扫描每个任务**中的文件路径引用（创建 `src/X.ts`、从 `../algorithms/` 导入、修改 `src/Y.tsx`）
3. **推断分组间的依赖关系**：
   - B 组引用了 A 组创建的文件 → B 依赖 A
   - 分组无文件引用 → 独立，可最先执行
   - 同层级分组无交叉引用 → 并行候选
4. **为每个分组选择策略**：
   - **串行**：下游分组在上游之后（拓扑顺序）
   - **批量**：将组内同一文件的小任务合并为一次修改
   - **并行**：同层级无交叉依赖的分组（使用 `superpowers:dispatching-parallel-agents`）
5. **从详细产物中摘录每个分组的关联上下文**（proposal.md、design.md、delta specs）：
   - **优先识别全局约束与说明**：先从产物中提取适用于所有分组的全局约束、通用说明、技术约定等，记录为"全局上下文"，每个分组的执行简报都需包含这份全局上下文
   - 将每个分组的任务映射到产物中描述或约束它们的章节
   - 仅摘录相关段落——不读取完整文档
   - 包含：该分组的需求描述（分组自身的任务、目标说明）、约束它的设计决策、它必须满足的规格要求、以及全局约束与说明
   - 排除：仅与其他分组相关的内容、任务描述已覆盖的背景信息
6. **组装分组执行包**：每个分组获得一份自包含的执行简报，包含：
   - tasks.md 中该分组的任务列表
   - 从 proposal/design/specs 摘录的上下文片段
   - 需要读取/创建/修改的文件路径
   - 依赖说明（该分组运行前必须已存在的条件）

简要展示执行计划后立即继续——无需用户确认。

### 步骤 5：按顺序执行分组

对每个分组按拓扑顺序执行：

1. **宣布**："正在执行分组：<heading>（N 个任务）"
2. **将分组执行包**（在步骤 4.6 中组装的）**交给执行技能**：
   - 将摘录的上下文片段 + 任务列表 + 文件引用作为 prompt 传递给各技能
   - 不要让技能重新读取完整的 proposal/design/specs——仅使用预先摘录的片段
3. **应用 TDD**（通过 `superpowers:test-driven-development`）：先写失败测试 → 最小实现 → 通过 → 重构
4. **代码审查**（通过 `superpowers:requesting-code-review`）：为此分组的改动派发 code-reviewer 子代理
5. **处理问题**：修复所有 CRITICAL 或 HIGH 级别的审查意见
6. **验证**：运行测试确认全部通过

若分组内包含独立的子任务，通过 `superpowers:dispatching-parallel-agents` 派发为并行子代理。每个子代理仅接收与其子任务相关的上下文片段，而非完整的分组执行包。每个子代理遵循相同的 TDD + 审查流程。

### 步骤 6：同步进度

分组完成且所有测试通过后：

读取 tasks.md，将该 `##` 标题下的所有 checkbox 从 `- [ ]` 翻转为 `- [x]`。使用 Edit 工具——找到该分组标题下的确切行，替换每个未勾选的 checkbox。

报告："分组 <heading>：N/N 任务完成。已同步到 tasks.md。"

若同步失败（文件被外部修改、编辑冲突），重新读取 tasks.md 并重试。

### 步骤 7：继续或完成

- **还有剩余分组** → 回到步骤 5 执行下一个分组
- **所有分组完成** → 进入步骤 8

### 步骤 8：最终验证与完成

1. **验证**：调用 `superpowers:verification-before-completion`
   ```bash
   openspec instructions apply --change "<name>" --json
   ```
   确认 `state: "all_done"` 且所有进度显示完成

2. **报告最终状态**：
   ```
   ## 实现完成

   **变更：** <change-name>
   **Schema：** <schema-name>
   **进度：** N/N 任务完成 ✓

   ### 已完成分组
   - [x] 分组 1（M 个任务）
   - [x] 分组 2（K 个任务）
   ...

   所有任务完成。使用 `/opsx:archive` 归档。
   ```

3. **建议归档**："准备就绪后运行 `/opsx:archive`。"

## 错误处理

**以下情况暂停执行：**
- 任务描述模糊不清 → 请求澄清
- 实现后测试失败 → 在继续前使用 `superpowers:systematic-debugging`
- 发现设计问题 → 报告并建议通过 `/opsx:continue` 更新产物
- 缺少外部依赖 → 报告并等待

**暂停时**，显示哪个分组失败、出了什么问题、以及具体的解决方案选项。

**恢复**：问题解决后，重新运行 `openspec instructions apply --change "<name>" --json` 获取当前状态，然后从中断的分组继续。

## Tasks.md 格式

OpenSpec 使用标准 GFM checkbox：

```markdown
## 1. 类型与常量

- [ ] 1.1 创建 `src/presetColors.ts`——描述
- [x] 1.2 创建 `src/types.ts`——描述
```

检测正则：
- 任务行：`/^[-*]\s+\[[\sx]\]/i`
- 未勾选：`/^[-*]\s+\[ \]/i`

同步时仅修改 checkbox 标记——完全保留所有任务描述原文。

## 约束规则

- 按依赖顺序执行分组，而非文档顺序
- 从 CLI 输出读取 contextFiles——不要硬编码路径
- 仅在分组边界同步进度，绝不在分组执行中途同步
- TDD 不可跳过：没有先写失败测试，不允许写实现代码
- 决不强行通过阻塞——暂停并询问
- 使用 CLI 输出中的 schema 产物名称，而非自行假定
- 若 tasks.md 中有已提前勾选的任务，予以保留——这些是之前已完成的
- 代码改动范围仅限当前分组的任务
