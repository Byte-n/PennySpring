# API

组件公共 API 从 `@pennyspring/ui` 导出。详细类型以各组件 `types.ts` 为准。

## Drawer

`Drawer` 用于左右侧滑出的抽屉面板，支持 `open`、`defaultOpen`、`onOpenChange`、`onCancel`、`drawerPosition`、`drawerType`、`width`、`swipeEnabled` 和 `mountPoint`。点击遮罩或手势关闭时会先触发 `onCancel`，再通过 `onOpenChange(false)` 请求关闭。

`Drawer.Layout` 用于将抽屉嵌入当前布局，适合侧边导航、筛选和设置面板；通过 `renderDrawerContent` 提供抽屉内容，`drawerType` 可选择 `front`、`slide` 或 `back`。

## Ellipsis

`Ellipsis` 用于长文本折叠展示，支持 `rows`、`direction`、`size`、`expandText`、`collapseText`、`open`、`defaultOpen` 和 `onOpenChange`。旧的 `expanded`、`defaultExpanded`、`onExpand` 仍兼容，但后续应优先使用统一的 open 命名。
