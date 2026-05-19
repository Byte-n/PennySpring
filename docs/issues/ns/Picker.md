# Picker 自定义能力评估

## 现状

- 支持 trigger、popup、panel、header、body、view、column 等多层 styles，并支持 title/cancel/ok/loading/empty 文本或节点。
- 内部组合 `DisplayInput`、`Popup`、`Button`、`GeometryReader`、`Text`。

## 需要完善

- `PickerProps.popupProps` 只覆盖部分弹窗内容配置，缺少完整 `PopupProps` 透传或 `renderPopup`。
- 已有 `renderHeader`，但缺少 `renderBody`、`renderColumn`、`renderItem` 的完整区块替换链路。
- `DisplayInput` 只通过 `displayInputProps` 定制，缺少带当前 value/open/disabled 的 `renderTrigger`。
- 内部 `Button` 的 props 未完整透出，取消/确认按钮无法配置 loading、danger、形状等行为。
