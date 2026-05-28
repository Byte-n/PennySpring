# Textarea 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：6
- 修复数量：6

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Textarea/Textarea.tsx:111`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Textarea` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `Textarea.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、尺寸映射、状态样式与输入行为逻辑耦合，后续维护视觉规范时容易扩大修改范围。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Textarea/style/index.ts`，将 `SIZE_CONFIG`、`TextareaStyleOptions`、状态样式解析和 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。
- 状态：已修复
- 修复内容：新建 `style/index.ts`，迁移 `SIZE_CONFIG`、`TextareaStyleOptions`、`SizeConfig`、`resolveRows`、`resolveMaxRows`、`getRowHeight`、`getVerticalPadding`、`getFieldHeight`、`clampHeight`、`getStatusBorderColor` 和 `createUseSheetStyle` 调用。

### 2. `label` API 使用 `ReactNode`，未区分文本 prop 与节点 prop

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Textarea/types.ts:58`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`label?: ReactNode` 同时承担文本和自定义节点语义，且实现中 `Textarea.tsx:313` 将 `label` 包裹进 `Text` 渲染；规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，并明确 `null` 与 `undefined` 的插槽语义。
- 影响：调用方传入自定义节点时会被错误包裹到 `Text` 内，且 API 无法清晰表达文本标签与自定义标签节点的差异。
- 推荐纠正方案：调整为 `labelText?: string` 与 `label?: ReactNode | null`；仅在 `label === undefined` 时回退 `labelText`，`label === null` 明确不渲染标签区域，自定义节点直接渲染。
- 状态：已修复
- 修复内容：`types.ts` 新增 `labelText?: string`，`label` 改为 `ReactNode | null`。组件内 `label === null` 不渲染标签区域，`label` 为自定义节点时直接渲染（不包裹 Text），`label` 为 string 时自动包裹 Text，`label === undefined` 回退 `labelText`。

### 3. 使用 `View` 手写等效布局结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Textarea/Textarea.tsx:310`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根节点、标签行、输入外壳、底部说明行和占位空节点均使用 `View`，并通过 `flexDirection`、`alignItems`、`justifyContent`、`gap` 等样式手写布局；项目要求共享组件布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件。
- 影响：表单字段布局无法复用统一布局原语，后续间距、对齐和尺寸语义容易与其它组件漂移。
- 推荐纠正方案：根布局改用 `Column`，标签行与底部说明行改用 `Row`，空位保留用 `Spacer`；仅将承载 `TextInput`、loading 绝对定位等确有原生需求的节点保留为 `View`。
- 状态：已修复
- 修复内容：根布局改用 `Column`，标签行改用 `Row align="center" gap="small"`，底部说明行改用 `Row justify="between" align="start"`，空位改用 `Spacer`；输入外壳保留 `View`（需承载 TextInput 与 loading 绝对定位）。

### 4. root.gap 级别偏小（使用 "small" 而非 "normal"）

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Textarea/Textarea.tsx:129`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`root.gap` 使用 `token.marginXXS`（"small" 级别），但 Textarea 默认无 `size` prop，应视为 "normal" 级别，使用 `marginXS`。
- 影响：标签、输入框和底部说明之间的垂直间距比规范预期偏小。
- 推荐纠正方案：将 `root.gap` 改为 `token.marginXS`（"normal" 级别）。
- 状态：已修复
- 修复内容：`root.gap` 从 `token.marginXXS` 改为 `token.marginXS`。

### 5. `Text` 颜色、字号和字重优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Textarea/Textarea.tsx:313`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：标签、必填标记、辅助说明、错误说明和计数字符均使用 `Text` 组件，但颜色、字号、行高和字重通过 `tokenStyles.label`、`tokenStyles.requiredMark`、`tokenStyles.helper`、`tokenStyles.error`、`tokenStyles.count` 作为 `style` 传入；项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本排版和颜色语义绕过 `Text` 组件 API，容易与其它组件的文本和图标色彩语义漂移。
- 推荐纠正方案：将状态和语义映射到 `Text` 的 `size`、`weight`、`color` props；外部 `styles?.label`、`styles?.helper`、`styles?.error`、`styles?.count` 仅作为补充覆盖。
- 状态：已修复
- 修复内容：
  - 标签：`<Text size="sm" weight="medium" color={disabled ? 'disabled' : 'label'}>`
  - 必填标记：`<Text size="sm" color="error">`
  - 辅助说明：`<Text size="sm" color="description">`
  - 错误说明：`<Text size="sm" color="errorText">`
  - 计数字符：`<Text size="sm" color="tertiary">`
  - style/index.ts 中移除 `label`、`requiredMark`、`helper`、`error`、`count` 的 fontFamily/fontSize/fontLineHeight/fontWeight/color 样式，仅保留布局属性（`flex: 1`）。

### 6. focus 状态改变边框宽度，可能导致布局尺寸跳动

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Textarea/Textarea.tsx:162`
- 违反规范：`.claude/rules/common/component-visual-layout.md` 通用交互
- 不符合点：默认 `field.borderWidth` 为 `token.lineWidth`，聚焦时 `fieldFocused.borderWidth` 改为 `token.lineWidthBold`；规范要求状态变化不得导致布局尺寸跳动。
- 影响：输入框聚焦/失焦时边框厚度变化可能改变内容区域可用尺寸，造成文本和布局轻微跳动。
- 推荐纠正方案：保持边框宽度恒定，只改变 `borderColor` 或使用不影响布局的外层 focus ring / outline 表达聚焦状态。
- 状态：已修复
- 修复内容：`fieldFocused` 样式移除 `borderWidth: token.lineWidthBold`，仅保留 `borderColor` 变化。

## 需要人工确认

- 无
