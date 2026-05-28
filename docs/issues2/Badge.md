# Badge 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Badge 内部展示文本优先通过 style 控制字号和颜色

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Badge/Badge.tsx:284`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`renderBadgeContent` 使用 `<Text style={[tokenContentStyle, badgeStyles?.content]}>` 渲染计数文本，且 `tokenContentStyle` 来自 `Badge.tsx:262` 到 `Badge.tsx:268` 的 `color`、`fontSize`、`lineHeight` 等文本视觉属性。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再使用 `style`。
- 影响：Badge 计数文本绕过 `Text` 组件的颜色和尺寸语义，后续 Text 与 Icon 语义统一调整时容易产生漂移。
- 推荐纠正方案：将计数文本的颜色、字号、字重优先映射到 `Text` 组件公开 props；只将 `TextProps` 无法表达的局部排版样式留在 `style`。

### 2. 默认 overflowCount 使用未命名的硬编码业务阈值

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Badge/Badge.tsx:165`
- 违反规范：`.claude/rules/common/coding-style.md` Code Smells to Avoid；`CLAUDE.md` 通用工程约束
- 不符合点：`normalizeOverflowCount` 在 `overflowCount` 为空或非法时直接返回 `99`，同一数值还出现在 `Badge.tsx:169`。通用规范要求避免 magic numbers，对有语义的阈值使用命名常量。
- 影响：默认计数截断阈值的产品语义隐藏在实现中，后续维护者难以判断该值是否可调整或是否与设计约定一致。
- 推荐纠正方案：提取 `DEFAULT_OVERFLOW_COUNT` 等语义化常量，并在 props 注释或文档中说明默认行为。

## 需要人工确认

- 无
