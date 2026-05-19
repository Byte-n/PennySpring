# Empty 自定义能力评估

## 现状

- 支持 icon、messageText/message、尺寸和样式插槽。
- 内部默认使用 `Icon` 与 `Text`。

## 需要完善

- 缺少 `extra` 或 `actions` 区块，空状态常见操作按钮无法由组件承载。
- 默认 icon 的 `IconProps` 未暴露，不能调整图标权重、颜色等细节。
- 缺少 `renderContent` 用于整体替换空状态主体。
