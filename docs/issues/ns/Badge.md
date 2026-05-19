# Badge 自定义能力评估

## 现状

- 支持角标数值、圆点、偏移、尺寸、颜色、子节点和样式插槽。
- 内部固定使用 `Text` 渲染文本角标。

## 需要完善

- `count` 虽然是 `ReactNode`，但缺少 `renderCount`/`renderIndicator`，无法基于最终裁剪后的值自定义渲染。
- 缺少 `indicatorProps` 或可替换外层角标容器的能力，复杂徽标、动画徽标需要绕过组件实现。
- `overflowCount` 只覆盖数值截断，不支持自定义溢出文案格式。
