# Tag 自定义能力评估

## 现状

- 支持颜色、变体、尺寸、disabled、onPress、children 和 content 样式。
- 内部固定使用 `Text` 包裹字符串内容。

## 需要完善

- 缺少 closeable、icon、prefix/suffix 等常见标签区块。
- `styles` 只有 content，缺少 pressed/disabled/root 状态化样式插槽。
- 缺少 `renderContent`，不能基于 color/variant/disabled 替换内部内容。
