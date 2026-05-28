# Picker 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Header 按钮、标题和选项文本优先通过 style 控制颜色 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Picker/PickerHeaderButton.tsx:47`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：Header 按钮 fallback 文本使用 `<Text style={textStyle}>`；标题在 `PickerTitle.tsx:30` 使用 `styles.titleText`，选项在 `PickerColumnItem.tsx:63` 使用 `styles.itemText`。这些样式的颜色来源在 `usePickerStyles.ts:87`、`usePickerStyles.ts:96`、`usePickerStyles.ts:124`、`usePickerStyles.ts:130`、`usePickerStyles.ts:137`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：Picker 作为多选择组件基础能力，文本颜色和状态色绕过 `Text` API 会影响 DateTimePicker、CascadePicker 等组合组件的一致性。
- 推荐纠正方案：Header 按钮、标题、选项文本使用 `Text color`、`size`、`weight` 等 props 表达语义；样式插槽只保留额外样式。

### 2. Picker 面板结构使用 View 手写布局 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Picker/PickerHeader.tsx:40`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：PickerHeader、PickerPanel、PickerBody、PickerView、PickerTitle 等多处使用 `View` 承载布局结构，例如 `PickerHeader.tsx:40`、`PickerPanel.tsx:64`、`PickerBody.tsx:76`、`PickerView.tsx:61`。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件。
- 影响：Picker 内部 header/body/title/column 布局语义分散，组合组件复用时难以统一间距和对齐。
- 推荐纠正方案：保留滚轮/测量必要的底层 View，普通 header、body、title 容器迁移到 `Row`、`Column` 或 `Space`。

## 需要人工确认

- 无
