# FloatingActionGroup 自定义能力评估

## 现状

- 支持 Portal 挂载、动作列表、位置/偏移、折叠行为和容器/按钮样式。
- 内部固定使用 `Button` 与 `Icon` 渲染更多按钮和动作按钮。

## 需要完善

- `FloatingActionItem` 缺少 `content`、`buttonProps`、`renderItem`，动作按钮无法按项完整替换。
- 更多按钮为内部固定，缺少 `moreButton`/`renderMoreButton` 或图标配置。
- `Button` 的颜色、尺寸、形状等能力没有完整透传，样式只能覆盖外观的一部分。
