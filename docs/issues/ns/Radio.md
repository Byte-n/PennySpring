# Radio 自定义能力评估

## 现状

- 支持单项和 Group、可控/非可控、displayType、尺寸、方向和样式插槽。
- 内部固定使用 `Text` 渲染 option label。

## 需要完善

- `RadioGroupOption.label` 只支持节点，缺少 `renderOption`，无法基于 checked/disabled/readonly 状态完整替换一项。
- 单选圆点为内部固定图形，缺少 `checkedIcon` 或 `renderIndicator`。
- Group 缺少 option 级样式/props 覆盖。
