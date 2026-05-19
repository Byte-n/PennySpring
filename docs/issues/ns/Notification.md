# Notification 自定义能力评估

## 现状

- 支持受控/命令式展示、标题/描述文本或节点、类型、位置、持续时间、Portal 挂载和样式。
- 内部固定使用 `Text` 渲染默认标题描述。

## 需要完善

- 缺少 icon、close button、action 区块和对应 render props，通知常见交互无法由组件承载。
- 缺少 `renderContent`，不能基于 type/placement 替换整个通知卡片。
- 命令式控制缺少更新、手动关闭回调原因、唯一 key 等能力。
