# ActionSheet 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 面板内部布局直接使用 View 手写等效结构

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ActionSheet/ActionSheet.tsx:219`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 适用范围与组件复用要求；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：组件内部多处使用 `View` 承载面板、标题、动作列表、按钮内容等布局结构，例如 `ActionSheet.tsx:219` 的面板根节点、`ActionSheet.tsx:225` 的 actions 容器、`ActionSheet.tsx:142` 的 action content。项目规范要求界面布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：基础组件绕开统一布局组件后，间距、方向、对齐和后续布局语义更难保持一致，也降低与组件目录中布局原语的组合一致性。
- 推荐纠正方案：将垂直结构改为 `Column`，动作项内部居中结构按语义使用 `Column` 或 `Space`；仅在非布局语义或底层 RN 能力必须直接使用时保留 `View`。

## 需要人工确认

- 无
