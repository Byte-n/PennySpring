# Button 自定义能力评估

## 现状

- 支持类型、颜色、变体、尺寸、形状、图标、loading、block、Pressable props 与样式插槽。
- 内部固定使用 `Icon`、`Text` 渲染图标和内容。

## 需要完善

- `loading` 仅支持延迟和自定义图标，缺少 loading 文案、loading 区块整体替换以及 loading 状态下内容保留策略配置。
- `styles` 只有 `icon/content`，缺少根节点 pressed、disabled、loading 等状态插槽，对复杂状态视觉控制不足。
- `iconProps` 只覆盖 `Icon` 配置，缺少 `renderIcon` 参数化能力，无法根据 pressed/disabled/loading 状态生成图标。
