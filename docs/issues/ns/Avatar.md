# Avatar 自定义能力评估

## 现状

- `Avatar` 支持图片、文字、图标、尺寸、形状与内部样式插槽。
- `AvatarGroup` 支持 `items`、`maxCount`、尺寸和基础样式。

## 需要完善

- `Avatar` 缺少图片加载失败后的替代渲染策略，例如 `fallback`、`renderFallback` 或错误状态自定义内容。
- `AvatarGroup` 的溢出计数为内部固定展示，缺少 `renderRest`/`rest` 区块替换能力。
- `AvatarGroupItem` 继承 `AvatarProps`，但缺少 item 级 `renderItem`，无法按成员完全替换头像节点。
