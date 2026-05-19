# TagValueDisplay 自定义能力评估

## 现状

- 内部组件，被 `SelectionList`、`Cascader` 用于 tag 模式展示。
- 支持 maxCount、wrap、closable、disabled 和 onRemove。
- 内部固定使用 `Tag`、`Icon`、`Pressable` 渲染标签和关闭按钮。

## 需要完善

- `TagValueItem.label` 只能是字符串，缺少节点或 `renderTag`，无法展示复杂标签内容。
- `tagProps` 只覆盖 maxCount/wrap/closable，没有透出 `TagProps`，不能配置 Tag 颜色、变体、样式等。
- 关闭按钮固定为 close icon，缺少 `closeIcon`、`renderClose` 或 close button props。
- 溢出标签固定为 `+N`，缺少 `renderOverflow` 或溢出文案格式化能力。
