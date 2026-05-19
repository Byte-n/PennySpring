# ListCollapse 自定义能力评估

## 现状

- 支持标题文本/节点、left、summary、indicator、展开受控、header press、loading、children 和样式插槽。
- 内部固定使用 `Text` 渲染标题与展开文案。

## 需要完善

- indicator 只能传节点，缺少 `renderIndicator(expanded)`，不能按状态渲染。
- header 由 left/title/summary/indicator 拼装，缺少 `header` 或 `renderHeader` 整体替换。
- loading 状态没有 `loadingNode` 或内容区替换策略，无法自定义加载反馈。
