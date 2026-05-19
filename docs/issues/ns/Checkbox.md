# Checkbox 自定义能力评估

## 现状

- 支持单项和 Group、可控/非可控、indeterminate、displayType、尺寸、方向和样式插槽。
- 内部固定使用 `Text` 渲染 option label。

## 需要完善

- `CheckboxGroupOption.label` 只支持节点，缺少 `renderOption`，无法基于 checked/disabled/readonly 状态完整替换一项。
- 勾选标记为内部固定图形，缺少 `checkedIcon`、`indeterminateIcon` 或 `renderIndicator`。
- Group 缺少 option 级样式/props 覆盖，复杂表单项无法单独定制。
