# Button 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Button 内部文本优先通过 style 控制字号和颜色 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Button/Button.tsx:355`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`renderContent` 使用 `<Text style={[style, stateStyle]}>` 渲染按钮文本，传入的 `style` 包含 `Button.tsx:335` 到 `Button.tsx:341` 中的 `color`、`fontSize`、`lineHeight`、`fontWeight` 等文本视觉属性。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再使用 `style`。
- 影响：按钮作为核心交互组件，如果文本语义绕过 `Text` props，会增加尺寸、颜色、禁用态与 Icon 语义对齐成本。
- 推荐纠正方案：将按钮文本颜色、字号、字重优先映射到 `Text` 的 `color`、`size`、`weight` 等公开 props；`styles.content` 仅保留必要的局部覆盖。

### 2. Button 使用 View 手写图标布局容器 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Button/Button.tsx:439`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：图标节点使用 `<View style={[tokenStyles.icon, styles?.icon]}>`，对应样式在 `Button.tsx:330` 到 `Button.tsx:334` 中手写居中布局。项目规范要求布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件，避免用 `View` 手写等效布局结构。
- 影响：按钮内部布局语义分散在原始 `View` 样式中，和共享布局原语的对齐、gap 与尺寸策略不一致。
- 推荐纠正方案：优先用 `Row`/`Column` 或现有布局原语承载图标容器；若 `Pressable` 子节点必须保持当前结构，也应将可复用的对齐语义收敛到布局组件或语义插槽中。

## 需要人工确认

- 无
