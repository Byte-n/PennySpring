# TopTabNavigator 自定义能力评估

## 现状

- 组合 React Navigation top tabs、自定义 HeaderBar 和 SegmentedControl。
- 支持 screens、左右 actions、sceneContainer/headerBar/segmentedControl 样式。

## 需要完善

- `TabScreen` 只有 `label: string`，缺少 label 节点、icon、badge、disabled 等 tab 自定义能力。
- HeaderBar 只提供左右 actions，缺少 `center`/`title`/`renderHeader` 整体替换。
- SegmentedControl 缺少 `renderOption` 和 option 级 props，不能按 focused/pressed 状态完整替换 tab。
- React Navigation 的 screenOptions、navigator props 等能力未透出，实际路由配置扩展不足。
