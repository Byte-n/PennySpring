# Carousel 自定义能力评估

## 现状

- 支持数据驱动渲染、手势、自动播放、循环、方向、虚拟渲染和自定义指示器。
- 内部分为 slides、indicator 与多个 hook。

## 需要完善

- 指示器支持函数替换，但没有透出 `indicatorProps` 或默认指示器的更多状态参数，例如方向、是否滚动中。
- slide 容器缺少语义样式插槽或 `renderSlideContainer`，无法定制每页外壳、间距和状态效果。
- 手势生命周期只暴露 `onIndexChange`，缺少 drag start/end、transition start/end 等回调，业务无法同步复杂交互。
