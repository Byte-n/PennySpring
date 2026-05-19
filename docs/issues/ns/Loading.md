# Loading 自定义能力评估

## 现状

- 支持指示器节点、文本、垂直布局、尺寸和样式。
- 内部默认用 React Native `ActivityIndicator` 与组件库 `Text`。

## 需要完善

- `indicator` 可以替换节点，但缺少默认 `ActivityIndicator` props 透传。
- `text` 仅为字符串，建议补充 `textNode` 或采用 `textText/text` 命名，避免文案与节点扩展冲突。
