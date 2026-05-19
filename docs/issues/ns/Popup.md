# Popup 自定义能力评估

## 现状

- 支持 Portal 挂载、位置、动画、遮罩、关闭原因、open 状态、body/mask 样式。
- `FloatingPanel` 扩展拖拽面板、尺寸和值变化。

## 需要完善

- 缺少 `renderMask`、`renderBody` 或 container props，遮罩和内容容器无法整体替换。
- 动画只暴露类型和时长，缺少 easing、进入/退出生命周期细分和动画节点替换。
- `FloatingPanel` 的 handle 只能样式覆盖，缺少 `handle`/`renderHandle`。
