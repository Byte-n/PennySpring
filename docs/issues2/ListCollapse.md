# ListCollapse 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 标题和摘要文本优先通过 style 控制颜色

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:103`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`renderTextNode` 使用 `<Text style={style}>`，标题样式在 `ListCollapse.tsx:68` 到 `ListCollapse.tsx:73` 中包含 `color`；摘要文本也在 `ListCollapse.tsx:171` 使用 `tokenStyles.summaryText` 控制颜色。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：折叠列表的标题、摘要状态色绕过 `Text` 语义，和 List/ListItem 的文本规范不一致。
- 推荐纠正方案：标题使用 `Text color="heading"`，摘要使用 `Text color="description"`；样式插槽仅保留附加样式。

### 2. Header 与内容区使用 View 手写布局

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ListCollapse/ListCollapse.tsx:158`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根、left、summary、indicator、content 都使用 `View`，header 样式在 `ListCollapse.tsx:46` 到 `ListCollapse.tsx:57` 中手写 `flexDirection: 'row'`、`alignItems`、padding 等布局。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件。
- 影响：折叠标题行和内容区布局与 List/Row/Column 的语义不统一，后续尺寸和间距调整更容易漂移。
- 推荐纠正方案：header 使用 `Row`，根与内容区域使用 `Column`；left/summary/indicator 作为 Row 子项或语义插槽传递。

## 需要人工确认

- 无
