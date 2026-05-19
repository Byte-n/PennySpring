# Skeleton 自定义能力评估

## 现状

- 支持 shape、size、animated、loading、children 和 bone 样式。
- 无内部组件依赖。

## 需要完善

- 只支持单个骨架形状，缺少 rows、avatar/title/paragraph 等组合配置。
- 缺少 `renderSkeleton` 或 children fallback 策略，复杂骨架屏需要重新拼装。
- animated 只开关，不支持动画速度、方向或颜色语义配置。
