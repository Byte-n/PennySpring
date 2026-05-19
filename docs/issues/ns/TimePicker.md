# TimePicker 自定义能力评估

## 现状

- 基于 `Picker` 组合时间列，支持精度、步长、范围、标签格式化/渲染、trigger children 和常见弹窗文案节点。

## 需要完善

- 底层 `Picker` 的 popup/header/body 定制能力未完整透出，缺少 `pickerProps` 或分区 props。
- 只能自定义 label，缺少 `renderColumn`/`renderItem` 级能力。
- trigger 缺少带当前值和 open 状态的 `renderTrigger`。
