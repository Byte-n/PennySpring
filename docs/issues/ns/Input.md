# Input 自定义能力评估

## 现状

- 继承大部分 `TextInputProps`，支持 label、prefix/suffix、清除、loading、helper/error、状态、disabled/readonly 和样式插槽。
- `Input.Search` 增加搜索回调和图标。

## 需要完善

- `loading` 渲染区块固定，缺少 `loadingIndicator` 或 `renderLoading`。
- 清除按钮只支持样式和回调，缺少 `clearIcon`、`clearButtonProps` 或 `renderClearButton`。
- label/helper/error 仅接受节点或文本混合能力有限，应统一 `xxxText/xxx` 命名并提供容器插槽。
- `Input.Search` 缺少 search button/submit 区块能力，只能通过键盘事件和图标触发。
