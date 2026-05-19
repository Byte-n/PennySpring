# Steps 自定义能力评估

## 现状

- 支持数据驱动步骤、标题/描述文本或节点、状态、尺寸、可控/非可控和样式插槽。
- 内部固定渲染 indicator、connector、Text 内容。

## 需要完善

- indicator 缺少 `icon`、`renderIndicator`，无法按 status/index 自定义图标。
- `StepsItem` 缺少 item 级样式/props，不能单独定制某个步骤。
- 缺少横向/纵向布局、进度方向或 `renderConnector` 等结构级定制。
