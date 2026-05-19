# Dialog 自定义能力评估

## 现状

- 支持标题文本/节点、取消/确认文本或节点、children、遮罩、open 状态和若干样式插槽。
- 内部固定使用 `Popup`、`Button`、`Text`。

## 需要完善

- 内部 `Button` 的 props 没有完整透出，缺少 `cancelButtonProps`、`okButtonProps`、按钮 loading、danger 等能力。
- 缺少 `renderFooter` 或 `footer` 整体替换，复杂操作区只能用 `cancel/ok` 两个节点拼。
- `Popup` 只透出部分属性，缺少 `popupProps` 或 `renderPopup`，无法替换浮层容器结构。
