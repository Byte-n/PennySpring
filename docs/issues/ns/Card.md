# Card 自定义能力评估

## 现状

- 支持标题文本/节点、extra、footer、loadingNode、可点击、尺寸、变体和样式插槽。
- 内部固定用 `Text` 渲染标题文本。

## 需要完善

- `loading` 仅能替换主体内容，缺少默认 loading 区块配置、header/footer loading 策略或 `renderLoading` 参数。
- 缺少 `renderHeader`/`header` 整体替换能力，当前只能拼 title 与 extra。
- 可点击状态的 pressed/disabled 仅由内部实现控制，样式插槽没有状态化覆盖能力。
