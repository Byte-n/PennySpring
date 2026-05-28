# Popup 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：low
- 问题数量：2

## 问题列表

### 1. FloatingPanel 标题文本优先通过 style 控制颜色

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Popup/FloatingPanel.tsx:357`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：FloatingPanel 标题使用 `<Text ... style={titleTextStyle}>`，标题样式颜色来源在 `FloatingPanel.tsx:217` 的 `color: token.colorTextHeading`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：浮层标题色彩语义绕过 `Text` API，和 Dialog、Picker 等浮层标题不易统一。
- 推荐纠正方案：标题使用 `Text color="heading"` 和合适的 `size/weight` props；样式插槽只保留额外覆盖。

### 2. FloatingPanel 内容结构使用 View 手写布局

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Popup/FloatingPanel.tsx:784`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：FloatingPanel root、content、header、body、footer 等结构使用 `View`（如 `FloatingPanel.tsx:784`、`FloatingPanel.tsx:786`、`FloatingPanel.tsx:788`、`FloatingPanel.tsx:792`、`FloatingPanel.tsx:796`）。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件。
- 影响：浮层面板的 header/body/footer 布局语义分散在原始 View 中，后续与 Dialog/Picker 的面板结构统一成本更高。
- 推荐纠正方案：保留 Popup 动画和手势必要容器，普通面板内容结构使用 `Column`/`Row` 组合。

## 需要人工确认

- 无
