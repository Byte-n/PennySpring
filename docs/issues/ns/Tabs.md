# Tabs 自定义能力评估

## 现状

- 支持 items、可控/非可控、layout、block、renderContent 和样式插槽。
- 内部固定使用 `Text` 渲染 label。

## 需要完善

- tab 本身缺少 `renderTab`，不能根据 active/pressed/disabled 完整替换。
- `TabsItem.label` 直接是 ReactNode，缺少 labelText/label 分离，内部文本样式边界不清晰。
- 指示器/下划线结构未作为独立插槽或 render props 暴露。
