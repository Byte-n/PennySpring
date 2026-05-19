# SideBar 自定义能力评估

## 现状

- 支持 items、可控/非可控、layout、block、renderContent 和样式插槽。
- 内部固定使用 `Text` 渲染 label。

## 需要完善

- 侧边 tab 本身缺少 `renderItem`，不能根据 active/pressed/disabled 完整替换。
- `SideBarItem` 缺少 labelText 语义，当前 `label?: ReactNode` 对内部文本样式作用边界不清晰。
- panel 只有 `renderContent`，缺少空内容、loading 或按 item 的额外 props。
