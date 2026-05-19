# TabBar 自定义能力评估

## 现状

- 支持 items、标题文本/节点、图标/激活图标、badgeText/badge、可控/非可控、安全区和样式插槽。
- 内部固定使用 `Text` 渲染标题和 badge 文本。

## 需要完善

- tab item 缺少 `renderItem`，无法基于 active/pressed/disabled 完整替换。
- badge 只能传节点或文本，缺少 Badge 组件 props 级透传。
- `TabBarItem` 缺少 item 级样式/props，不能单独控制某个 tab。
