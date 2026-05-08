---
name: openspec-superpowers
description: Execute OpenSpec change with Superpowers rigor in a single-agent workflow. Use this for OpenSpec implementation when the user wants TDD, local review, verification, and tasks.md sync without dispatching implementation subagents.
---

# OpenSpec Superpowers

以单 agent 方式执行 OpenSpec 变更任务。从 OpenSpec CLI 加载变更上下文，分析任务依赖关系，按分组串行执行，使用 TDD、本地审查和最终验证保证质量，并将进度同步回 tasks.md。

**输入**：可指定变更名称（如 `/openspec-superpowers implement-theme-engine`）。若省略，检查是否可从对话上下文推断。若模糊不清，提示用户选择可用变更。

**开始时宣布**："使用 OpenSpec + Superpowers 单 agent 模式实现 <change-name>。"

## 流程

### 步骤 1：选择变更

若已提供变更名称，直接使用。否则：

```bash
openspec list --json
```

- 若仅有一个活跃变更，自动选择
- 若有多个，请用户选择
- 宣布："使用变更：<name>" 及如何覆盖

### 步骤 2：加载变更上下文

执行以下两个命令：

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

读取 `contextFiles` 中列出的所有文件路径。对于 spec-driven 模式，包括 proposal.md、design.md、所有 delta specs 和 tasks.md。其他 schema 遵循 contextFiles 返回的内容，不要假定文件名。

### 步骤 4：分析依赖并构建执行计划

解析 tasks.md，构建分组级别的 DAG：

1. **按 `##` 标题拆分为分组**：每个标题为一个任务组。
2. **扫描每个任务**中的文件路径引用（创建 `src/X.ts`、从 `../algorithms/` 导入、修改 `src/Y.tsx`）。
3. **推断分组间的依赖关系**：
   - B 组引用了 A 组创建的文件 → B 依赖 A
   - 分组无文件引用 → 可尽早执行
   - 同层级分组无交叉引用 → 仍按清晰的串行顺序执行，不派发子代理
4. **为每个分组选择策略**：
   - **串行**：所有分组按拓扑顺序由当前 agent 逐组执行
   - **批量**：将组内同一文件的小任务合并为一次修改
   - **局部**：每次只处理当前分组的文件和行为，不提前修改下游分组
5. **从详细产物中摘录每个分组的关联上下文**（proposal.md、design.md、delta specs）：
   - 先提取适用于所有分组的全局约束、通用说明、技术约定，记录为"全局上下文"
   - 将每个分组的任务映射到产物中描述或约束它们的章节
   - 仅摘录相关段落，不让执行阶段重新读取完整 proposal/design/specs
   - 包含：分组任务、目标说明、设计决策、规格要求、全局约束
   - 排除：仅与其他分组相关的内容、任务描述已覆盖的背景信息
6. **组装分组执行包**：每个分组获得一份自包含的执行简报，包含：
   - tasks.md 中该分组的任务列表
   - 从 proposal/design/specs 摘录的上下文片段
   - 需要读取/创建/修改的文件路径
   - 依赖说明（该分组运行前必须已存在的条件）

简要展示执行计划后立即继续，无需用户确认。

### 步骤 5：按顺序执行分组

对每个分组按拓扑顺序执行：

1. **宣布**："正在执行分组：<heading>（N 个任务）"
2. **重新读取当前分组相关文件**：包括任务引用的源文件、测试文件和局部上下文。
3. **应用 TDD**（通过 `superpowers:test-driven-development` 的流程）：先写失败测试 → 最小实现 → 通过 → 重构。
4. **保持范围**：当前分组内的多个子任务可以合并处理，但不把实现工作交给子代理。
5. **本地代码审查**：按 code-review 姿态检查当前分组 diff，重点看正确性、回归、边界条件、缺失测试和与 OpenSpec 产物的一致性。
6. **处理问题**：修复所有 CRITICAL 或 HIGH 级别的问题。
7. **验证**：运行当前分组最窄相关测试；必要时再运行更广的测试集。

若分组内包含独立子任务，当前 agent 仍逐项或批量串行处理。不得使用 `superpowers:dispatching-parallel-agents` 派发实现子代理。

### 步骤 6：同步进度

分组完成且所有测试通过后：

读取 tasks.md，将该 `##` 标题下的所有 checkbox 从 `- [ ]` 翻转为 `- [x]`。找到该分组标题下的确切行，只替换未勾选的 checkbox。

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
   确认 `state: "all_done"` 且所有进度显示完成。

2. **报告最终状态**：
   ```markdown
   ## 实现完成

   **变更：** <change-name>
   **Schema：** <schema-name>
   **进度：** N/N 任务完成

   ### 已完成分组
   - [x] 分组 1（M 个任务）
   - [x] 分组 2（K 个任务）

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

- [ ] 1.1 创建 `src/presetColors.ts`：描述
- [x] 1.2 创建 `src/types.ts`：描述
```

检测正则：
- 任务行：`/^[-*]\s+\[[\sx]\]/i`
- 未勾选：`/^[-*]\s+\[ \]/i`

同步时仅修改 checkbox 标记，完全保留所有任务描述原文。

## 约束规则

- 按依赖顺序执行分组，而非文档顺序
- 从 CLI 输出读取 contextFiles，不硬编码路径
- 仅在分组边界同步进度，绝不在分组执行中途同步
- TDD 不可跳过：没有先写失败测试，不允许写实现代码
- 不派发实现子代理；所有实现、测试、修复和进度同步由当前 agent 完成
- 代码审查默认为本地审查，不依赖 code-reviewer 子代理
- 决不强行通过阻塞，暂停并询问
- 使用 CLI 输出中的 schema 产物名称，而非自行假定
- 若 tasks.md 中有已提前勾选的任务，予以保留
- 代码改动范围仅限当前分组的任务
