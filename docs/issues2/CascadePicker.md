# CascadePicker 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：low
- 问题数量：2

## 问题列表

### 1. 组件内默认文案使用英文

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/CascadePicker/CascadePicker.tsx:215`
- 违反规范：`.claude/rules/component/coding-style.md` 组件文案
- 不符合点：`getTabLabel` 在没有 `label` 和 `labelText` 时返回 ``Tab ${tab.tabKey}``。组件规范要求组件内默认提示文案语言为中文。
- 影响：调用方未传 tab 文案时会出现英文默认文本，和组件库中文默认文案体系不一致。
- 推荐纠正方案：将默认文案改为中文，例如 `选项 ${tab.tabKey}`，或要求 `CascadePickerTab` 必传 `labelText` 并避免组件内部生成英文文案。

### 2. Popup header 扩展使用 View 手写布局容器

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/CascadePicker/CascadePicker.tsx:394`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`pickerRenderHeader` 使用 `<View>` 包裹 `header` 和 `Tabs`。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件，避免用 `View` 手写等效布局结构。
- 影响：弹层头部组合绕开共享布局原语，后续 header 与 tabs 间距、方向和样式语义不易统一。
- 推荐纠正方案：使用 `Column` 或 `Space` 组合 `header` 与 `Tabs`，保留必要插槽样式到语义化 `styles.tabs`。

## 需要人工确认

- 无
