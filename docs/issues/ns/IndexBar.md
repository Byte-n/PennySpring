# IndexBar 自定义能力评估

## 现状

- 支持 Panel、索引值可控/非可控、标题文本/节点、children 和丰富样式插槽。
- 内部固定使用 `Text` 渲染标题与索引项。

## 需要完善

- 侧边索引项缺少 `renderIndexItem`，不能根据 active/pressed/disabled 完整替换。
- Panel 标题只有文本/节点，缺少 `renderPanelHeader` 或 panel 级配置。
- 滚动定位和容器能力不明确，缺少底层 ScrollView props 或外部滚动容器接入点。
