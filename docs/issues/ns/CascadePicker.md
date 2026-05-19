# CascadePicker 自定义能力评估

## 现状

- 组合 `Picker` 与 `Tabs`，支持 tabs、级联选项、文本/节点标签、loading、empty、trigger children 和样式分组。
- 支持 `renderLabel` 定制选项标签。

## 需要完善

- 内部 `Tabs` 仅通过 `styles.tabs` 粗粒度覆盖，缺少 `tabsProps` 或 `renderTabs` 整体替换能力。
- 底层 `Picker` 只透出部分能力，缺少完整 `pickerProps`/`popupProps` 透传，无法替换 header/body/footer 等区块。
- `renderLabel` 只作用于选项标签，缺少 `renderOption` 或 column 级区块替换能力。
