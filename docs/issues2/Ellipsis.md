# Ellipsis 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 展开状态 API 同时暴露旧同义命名

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Ellipsis/types.ts:24`
- 违反规范：`.claude/rules/component/coding-style.md` 状态与回调 API
- 不符合点：`EllipsisProps` 已提供 `defaultOpen`、`open`、`onOpenChange`，但又继续暴露 `defaultExpanded`、`expanded`、`onExpand`，实现中在 `Ellipsis.tsx:155` 到 `Ellipsis.tsx:160` 合并两套命名。组件规范要求可见状态统一使用 `open`、`onOpenChange`、`defaultOpen`。
- 影响：公开 API 存在两套同义状态命名，增加调用方选择成本，也使受控/非受控行为和类型文档更复杂。
- 推荐纠正方案：保留 `open`、`defaultOpen`、`onOpenChange` 作为唯一规范 API；旧命名仅作为迁移兼容时，应在计划中移除并避免继续扩展。

### 2. 展开/收起操作文本优先通过 style 控制颜色和字号

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Ellipsis/Ellipsis.tsx:284`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：操作文本使用 `<Text style={actionStyle}>`，`actionStyle` 包含 `styles.action`，其定义在 `Ellipsis.tsx:58` 到 `Ellipsis.tsx:63` 中包含 `color`、`fontSize`、`lineHeight`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：展开/收起操作的文本语义绕过 `Text` API，容易与链接色、字号语义不一致。
- 推荐纠正方案：将操作文本颜色映射到 `Text color="primary"`，字号映射到 `Text size`；`styles.action` 仅保留额外样式覆盖。

## 需要人工确认

- 无
