# DateTimePicker 自定义能力评估

## 现状

- 基于 `Picker` 组合日期时间列，支持精度、范围、步长、标签格式化/渲染、trigger children 和常见弹窗文案节点。

## 需要完善

- 底层 `Picker` 的 header/body/popup 定制能力没有完整透出，缺少 `pickerProps` 或分区 props。
- 只能自定义 label，缺少 `renderColumn`/`renderItem` 级能力，不能替换日期列整体展示。
- trigger 展示主要依赖 `displayInputProps` 或 children，缺少 `renderTrigger` 带当前值与 open 状态的参数化入口。
