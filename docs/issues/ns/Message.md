# Message 自定义能力评估

## 现状

- 支持受控/命令式展示、类型、位置、持续时间、messageText/message、Portal 挂载和样式。
- 内部固定使用 `Portal` 与 `Text`。

## 需要完善

- 类型图标/状态视觉不可替换，缺少 `icon`、`renderIcon` 或类型配置表。
- 缺少 `renderContent`，不能根据 type/placement/open 状态替换整条消息。
- 命令式 `show` options 与组件 props 能力基本一致，但缺少 key、更新已有消息等控制能力。
