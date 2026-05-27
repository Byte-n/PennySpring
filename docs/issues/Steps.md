# Steps 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Steps/Steps.tsx:115`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Steps` 在组件实现文件中直接定义 `useStyles`，组件目录实际只包含 `Steps.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、尺寸映射与渲染逻辑耦合，后续调整视觉规范时更容易影响组件行为实现。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Steps/style/index.ts`，将 `SIZE_STYLE_MAP`、`StepsStyleOptions` 与 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费生成的样式 hook。

### 2. 使用 `View` 手写等效布局结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Steps/Steps.tsx:248`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根节点、步骤头、指示器、内容区和连接线均使用 `View` 搭配 `flexDirection`、`alignItems`、`gap`、`width` 等样式手写布局，而项目要求共享组件布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件。
- 影响：布局语义与项目布局原语脱节，后续间距、对齐和尺寸语义容易与其它组件漂移。
- 推荐纠正方案：将根列表和内容区改为 `Column`，单个步骤行改为 `Row`，步骤头内部用 `Column` 组织指示器与连接线；仅将确实需要特殊测量或绘制的节点保留为原生 `View`。

### 3. `Text` 字号和颜色优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Steps/Steps.tsx:91`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`renderContent` 将标题/描述文本的字号、行高、字重和颜色全部通过 `Text` 的 `style` 传入；指示器文本也在 `Steps.tsx:287` 通过 `style` 设置颜色和字号。项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本语义绕过 `Text` 组件 API，可能造成排版 token、颜色语义和图标颜色语义在不同组件中漂移。
- 推荐纠正方案：将 `Steps.size` 和状态映射到 `Text` 的 `size`、`weight`、`color` props；仅把外部 `styles?.titleText`、`styles?.descriptionText`、`styles?.indicatorText` 作为补充覆盖。

### 5. `title={null}` / `description={null}` 未按插槽语义显式不渲染

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Steps/Steps.tsx:83`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`renderContent` 在 `node` 为 `null` 时会继续回退到 `titleText` 或 `descriptionText`；但规范要求 `xxx`、`xxxRender` 和插槽类 prop 为 `null` 时表示明确不渲染该部分内容，`undefined` 才表示走默认行为。
- 影响：调用方无法通过 `title={null}` 或 `description={null}` 明确关闭对应插槽，公共 API 语义与项目组件规范不一致。
- 推荐纠正方案：将 `node === null` 作为显式不渲染直接返回 `null`；仅在 `node === undefined` 时回退到 `xxxText`。

## 需要人工确认

- 无
