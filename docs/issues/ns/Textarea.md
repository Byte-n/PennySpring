# Textarea 自定义能力评估

## 现状

- 继承大部分 `TextInputProps`，支持 label、helper/error、required、行数、字数、loading、disabled/readonly 和样式插槽。
- 内部使用 `Text` 渲染辅助文案和计数。

## 需要完善

- `loading` 区块固定，缺少 `loadingIndicator` 或 `renderLoading`。
- 字数计数只开关，缺少 `formatCount` 或 `renderCount`。
- label/helper/error 当前是节点，建议统一 text/node 命名并补齐容器样式插槽。
- 缺少 prefix/suffix 或 footer extra 区块，不能承载快捷操作。
