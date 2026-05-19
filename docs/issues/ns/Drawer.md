# Drawer 自定义能力评估

## 现状

- 支持 open 状态、Portal 挂载点、抽屉位置、宽度、手势开关、overlay/content/drawer 样式。
- `DrawerLayout` 通过 `renderDrawerContent` 提供抽屉内容。

## 需要完善

- `Drawer` 本体缺少 `renderDrawer`/`drawer` 区块，只能通过 children 承载内容，语义不够明确。
- overlay 只有样式，缺少 `renderOverlay`、overlay props 或点击关闭行为细分。
- 动画和手势参数未完整暴露，复杂抽屉体验无法配置阈值、速度和动画曲线。
