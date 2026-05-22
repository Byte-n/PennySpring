# packages/pennyspring-ui 组件规范违背审查

本文件原列出的组件规范问题已全部修复。

## 修复状态

- List：移除 `List.Item` 复合子组件 API，新增数据驱动 `items` / `renderItem`；加载态文案改为显式 `loadingText` / `loadingContent`。
- Picker：`styles` 已按 `popup`、`panel`、`header`、`body`、`view`、`column` 等子组件边界归组。
- Calendar：底部 Today / Cancel / Confirm 操作已补充点击热区。
- Stepper：递减和递增按钮已移除 `hitSlop={0}` 并补充点击热区。
- Input：清除按钮已补充点击热区。
- Drawer：`DrawerLayoutStyles.container` 已移除，根样式改由 `style` 承载。
- TopTabNavigator：`HeaderBarStyles.container` 与 `SegmentedControlStyles.container` 已移除，根样式改由 `style` 承载。
- Ellipsis：测量文本已封装为隐藏测量节点，展示文本仍使用组件库 `Text`。
