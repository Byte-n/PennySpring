# Result 自定义能力评估

## 现状

- 支持状态、尺寸、icon、标题/副标题文本或节点、extra 和样式插槽。
- 内部默认使用 `Icon` 与 `Text`。

## 需要完善

- `extra` 可放操作区，但缺少 `actions` 数据驱动能力和默认按钮配置。
- 状态 icon 只支持整体替换，缺少 per-status icon 配置或 `iconProps`。
- 缺少 `renderContent` 用于替换 icon/title/subtitle/extra 的整体布局。
