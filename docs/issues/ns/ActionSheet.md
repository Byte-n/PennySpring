# ActionSheet 自定义能力评估

## 现状

- 对外支持 `titleText/title`、`cancelText/cancel`、`styles`、`Popup` 可见性与遮罩相关能力。
- 内部固定使用 `Popup`、`Button`、`Text` 渲染标题、动作项和取消按钮。

## 需要完善

- `actions` 仅支持文本、描述、危险和禁用状态，缺少 `content`、`icon`、`renderAction` 或按 action 级别的样式/props 覆盖，动作行无法完整替换。
- 内部 `Button` 只暴露取消按钮文本样式，缺少 `cancelButtonProps`、`actionButtonProps` 或 `renderCancel`，不能定制按钮行为与变体。
- `Popup` 能力只透出一部分，缺少 `popupProps` 或 `renderPopup` 级别的整体区块替换能力。
