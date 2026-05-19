# Toast 自定义能力评估

## 现状

- 支持受控/命令式展示、位置、持续时间、messageText/message、Portal 挂载和样式。
- 内部固定使用 `Portal` 与 `Text`。

## 需要完善

- 缺少 icon、type、action 等常见 Toast 区块能力。
- 缺少 `renderContent`，不能根据 placement/open 状态替换整体内容。
- 命令式控制缺少 key、更新已有 toast、关闭原因等能力。
