# List 自定义能力评估

## 现状

- `List` 支持 header/footer/empty/loading、items+renderItem 或 children。
- `ListItem` 支持 left/title/description/right/children、selected/disabled/divider 和样式插槽。

## 需要完善

- `List` 的 loading 只有文本/节点，缺少 `renderLoading` 参数和错误状态区块。
- `ListItem` 缺少 `renderItem` 状态参数或 `itemProps`，无法按 pressed/selected/disabled 替换整行结构。
- 分割线能力较固定，缺少 divider 渲染函数或按 item 控制的完整样式。
