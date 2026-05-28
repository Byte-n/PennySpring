# TabBar 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 重新实现 Badge 能力而未复用组件库 Badge

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TabBar/TabBar.tsx:77`
- 违反规范：`.claude/rules/component/coding-style.md`、`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：`renderBadge` 直接用 `View` + `Text` 渲染数字角标，并在 `TabBar/style/index.ts` 中维护 `badge` 的尺寸、圆角、背景色、定位和内边距，见 `TabBar.tsx:77`、`TabBar.tsx:88`、`TabBar.tsx:89` 与 `style/index.ts:93`。组件库已有 `Badge`，组件目录说明其职责是“计数或状态标记”，共享组件规范要求优先复用 `packages/pennyspring-ui` 中已有能力。
- 影响：TabBar 的角标行为与 Badge 组件分叉，后续 Badge 的颜色、溢出、dot、文本样式或主题规则更新不会自动同步到 TabBar，增加维护和视觉一致性风险。
- 推荐纠正方案：在 TabBar 中复用 `Badge` 渲染 `badgeText`/`badge`，通过 Badge 的 `count`、`color`、`styles` 等语义 API 表达角标；TabBar 私有样式只保留图标区域定位或与 TabBar 布局相关的 wrapper 样式。

## 需要人工确认

- 无
