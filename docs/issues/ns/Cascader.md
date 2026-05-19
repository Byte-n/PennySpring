# Cascader 自定义能力评估

## 现状

- `CascaderView` 支持 tabs、列表、empty/loading、选项标签渲染和样式插槽。
- `Cascader` 组合 `Popup`、`CascaderView` 与内部 `TagValueDisplay`，支持 displayMode 和 tagProps。

## 需要完善

- `Cascader` 未提供 `renderTrigger`/`trigger`，默认展示区只在 text/tag 两种内部模式中选择，替换能力不足。
- 内部 `Popup` 没有完整 `popupProps` 透传，也缺少 `renderPanel` 用于替换整个浮层内容。
- `CascaderView` 的选项只支持标签渲染，缺少 `renderOption`，不能替换包含选中态、右侧箭头、描述等完整行。
- `Tabs` 仅通过 styles 间接定制，缺少 `tabsProps` 或 tab item 渲染能力。
