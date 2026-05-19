# SwipeAction 自定义能力评估

## 现状

- 支持左右动作、受控打开侧、关闭策略、动作回调、disabled/readonly、children 和样式插槽。
- 动作项支持 text/content、color、backgroundColor。

## 需要完善

- `SwipeActionAction` 缺少 `width`、`buttonProps`、`renderAction`，动作按钮尺寸和交互不能完整控制。
- 只暴露 reveal/cancel/action，缺少 swipe start/end、progress 等手势状态回调。
- `backgroundColor` 是颜色字面量入口，建议改为语义 color 或 styles/action 级样式，避免绕过 token 体系。
