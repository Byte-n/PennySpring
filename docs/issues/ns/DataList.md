# DataList 自定义能力评估

## 现状

- 基于列表/分组列表封装，支持 load more、refresh、footer、loading/complete 文案节点和样式插槽。
- 内部固定使用 `Loading`、`Text` 渲染底部状态。

## 需要完善

- 加载更多区块只有文本/节点，缺少 `renderLoadMore` 参数化能力，无法根据 hasMore/loadingMore/onLoadMore 生成完整交互。
- 空状态、错误状态未形成统一 API，业务需要在 `renderItem` 或 footer 中自行拼装。
- 底层列表能力透传不完整，应明确 `FlatList`/`SectionList` props 的透传边界。
