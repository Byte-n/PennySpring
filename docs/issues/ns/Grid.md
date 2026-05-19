# Grid 自定义能力评估

## 现状

- 提供 `Grid` 与 `Grid.Item` 的列数、gap、span、onPress 和样式。
- 主要是布局组件，无内部业务区块。

## 需要完善

- `GridItem` 缺少 disabled/pressed 样式或 Pressable props 透传，点击格子定制不足。
- `gap` 支持有限，应明确是否允许语义 token、横纵分离和响应式列配置。
- 如果继续保留复合子组件形式，需要与组件规则中“数据驱动渲染”约束对齐。
