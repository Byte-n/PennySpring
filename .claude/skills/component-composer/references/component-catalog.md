# PennySpring 组件目录

将本文作为起始地图。编码前仍需检查组件的 `types.ts`、实现和测试。

## 布局

- `Row`：水平 flex 布局。
- `Column`：垂直 flex 布局。
- `Space`：为子元素提供一致间距。
- `Spacer`：固定或弹性的空白占位。
- `Grid`：网格布局和重复瓦片。
- `GeometryReader`：布局尺寸测量。
- `KeyboardAwareScreen`、`KeyboardAwareFormScroll`、`KeyboardStickyFooter`、`useKeyboardInsets`：页面、表单滚动与底部操作区的键盘避让布局能力。
- `Divider`：视觉分隔。
- `Card`：分组内容承载面。

## 排版与符号

- `Text`：应用和共享 UI 中的所有展示文本。
- `Icon`：按名称渲染图标。
- `Ellipsis`：折叠或可展开的长文本。

## 操作

- `Button`：主按钮、次按钮、图标、加载和形状变体。
- `FloatingActionGroup`：浮动操作入口。
- `SwipeAction`：行级滑动操作。
- `ActionSheet`：移动端操作菜单。

## 输入与控件

- `Input`：单行文本与搜索输入。
- `Textarea`：多行文本输入。
- `DisplayInput`：只读或触发式输入展示。
- `ImagePicker`：以 `DisplayInput` 作为触发器，从相册或文件管理选择单张图片。
- `CalculatorInput`：带计算器弹窗的数字输入。
- `Stepper`：递增/递减数值调节。
- `Slider`：范围或数值调节。
- `Switch`：布尔开关。
- `Checkbox`：独立或分组多选。
- `Radio`：单选。

## 选择器与选择

- `Picker`：滚轮选择器与触发式选择模式。
- `TimePicker`：时间值选择。
- `DateTimePicker`：日期/时间选择。
- `Calendar`：日历展示与日期/范围选择。
- `CascadePicker`：级联选择弹窗。
- `Cascader`：级联选择视图或弹窗。
- `SelectionList`：分组或扁平选项选择，可通过 `displayInputProps` 定制触发器、通过 `popupProps` 定制弹层。
- `Segmented`：紧凑分段选择。
- `SegmentedControl`：顶部标签式分段控件。

## 列表与数据展示

- `List`、`ListItem`：设置行、菜单和结构化条目列表。
- `DataList`：分区、可刷新或带加载态的数据列表。
- `ListCollapse`：可展开的分组列表内容。
- `Tag`：紧凑标签。
- `Badge`：计数或状态标记。
- `Avatar`：用户/实体图片或首字母，也支持头像组。
- `Progress`：条形或环形进度。
- `Steps`：有序流程状态。
- `Result`：终态结果页或面板。
- `Empty`：无数据状态。
- `Skeleton`：加载占位。
- `Carousel`：可滑动媒体/内容轮播。

## 导航

- `TabBar`：底部或标签栏样式导航。
- `Tabs`：标签页内容。
- `TopTabNavigator`：顶部标签页屏幕导航器。
- `SideBar`：侧边分类导航。
- `IndexBar`：索引列表导航。
- `HeaderBar`：顶部导航区域标题栏。

## 浮层与反馈

- `Dialog`：阻塞式确认或提示。
- `Popup`：锚定、底部或居中的浮层容器；`Popup.FloatingPanel` 适合可拖拽底部/顶部面板，支持 `titleText`、确认/取消按钮和自定义 header/footer。
- `Portal`、`PortalProvider`：在常规树外渲染浮层内容。
- `Toast`、`useToast`：短暂轻量提示。
- `Message`、`useMessage`：行内或全局反馈消息。
- `Notification`、`useNotification`：信息更丰富的通知。
- `Loading`：活动指示器。

## 常见组合

- 表单字段行：`Column` + `Text` 标签 + `Input`/`DisplayInput`/`SelectionList` 触发器。
- 设置项：`ListItem` + 尾部 `Switch`、`Text`、`Badge`、`Tag` 或 `Icon`。
- 从列表选择流程：`DisplayInput` + `Popup` + `SelectionList`；若数据形态匹配，也可用 `Picker`/`Cascader`。
- 筛选栏：`Row`/`Space` + `Segmented` + `Button`/`Icon` 操作。
- 数据页面：`Column` + `HeaderBar`/页面标题 + `DataList` + `Empty`/`Skeleton`/`Loading` 状态。
- 卡片列表：使用 `DataList` 或 `List`；仅当每个重复项都需要框定承载面时搭配 `Card`。
- 进度状态：多阶段流程用 `Steps`，标量完成度用 `Progress`，最终成功/失败用 `Result`。
- 破坏性操作：行操作用 `SwipeAction`，操作选项用 `ActionSheet`，确认用 `Dialog`。
- 浮层表单：优先用 `Popup.FloatingPanel` 的 header/body/footer 与 `okText`/`onOk`/`onCancel`；更底层布局再用 `Popup` + `Column` + 输入控件 + `Button` 操作。

## 创建新 UI 前

先检查需求是否已被上方组件或组合覆盖。只有当模式可复用时才新增共享组件，不要仅因单个页面有局部排列需求就新增共享组件。
