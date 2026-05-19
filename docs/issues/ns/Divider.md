# Divider 自定义能力评估

## 现状

- 支持水平/垂直、内容位置、尺寸、children 和 content/line 样式。
- 内部固定使用 `Text` 渲染字符串内容。

## 需要完善

- 对简单分割线暂无强制完善项。
- 若后续用于复杂标题分隔，应增加 `renderContent` 或 content container 插槽，以区分内容节点与内容容器。
