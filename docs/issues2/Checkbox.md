# Checkbox 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. Checkbox 组和控件内容使用 View 手写布局

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:270`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`CheckboxGroup` 使用 `<View>` 作为组根节点，`CheckboxControl` 使用 `<View>` 作为内容、indicator 和 mark 容器；样式中 `groupRoot`、`control`、`content` 在 `style/index.ts:64` 到 `style/index.ts:103` 手写 `flexDirection`、`gap`、`alignItems` 等布局。项目规范要求布局优先使用 `Row`、`Column`、`Space`、`Grid` 等已有布局组件，避免用 `View` 手写等效布局结构。
- 影响：Checkbox 与 Checkbox.Group 的横纵排列、gap 和对齐语义脱离共享布局组件，容易和 Radio、Switch、表单行等交互控件产生实现漂移。
- 推荐纠正方案：根据 `direction` 用 `Row` 或 `Column` 承载组选项，控件内容使用 `Row`；indicator 内部若只是图形绘制可保留最小 View，但整体布局语义应迁移到布局组件。

## 需要人工确认

- 无
