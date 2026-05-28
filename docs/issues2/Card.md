# Card 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Header 与内容区使用 View 手写布局 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Card/Card.tsx:179`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`Card` header、titleContainer、extra、body、footer 等结构均使用 `View`，并在 `Card.tsx:96` 到 `Card.tsx:115` 中手写 `flexDirection: 'row'`、`alignItems`、`gap` 等布局。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：Card 是基础容器组件，内部布局绕开布局原语会导致间距、方向与对齐语义难以统一，后续组合其他组件时一致性下降。
- 推荐纠正方案：使用 `Column` 表达 Card 主体纵向结构，使用 `Row` 表达 header 与 extra 的横向布局；必要的根 Pressable 状态样式保留在根节点。

### 2. 标题文本优先通过 style 控制字号和颜色 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Card/Card.tsx:170`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`titleText` 通过 `<Text style={[tokenStyles.title, styles?.titleText]}>` 渲染，`tokenStyles.title` 在 `Card.tsx:105` 到 `Card.tsx:110` 中包含 `color`、`fontSize`、`fontWeight`、`lineHeight`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：标题文字语义脱离 `Text` 公开 API，可能与全局文本尺寸、颜色语义调整不一致。
- 推荐纠正方案：将标题字号、颜色、字重优先映射为 `Text` props，样式插槽仅保留额外布局或无法通过 Text props 表达的属性。

## 需要人工确认

- 无
