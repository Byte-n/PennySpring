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
- `Card`：分组内容承载面；plain / elevated / summary 三个变体均无描边，elevated 只用 `boxShadowTertiary`，summary 靠金额排印建立重点；尺寸 12 / 16 / 20 内边距。

## 排版与符号

- `Text`：应用和共享 UI 中的所有展示文本。
- `Icon`：按名称渲染图标
- `Ellipsis`：折叠或可展开的长文本。

## 操作

- `Button`：主/次/文字/链接/危险按钮；32 / 44 / 52 三档高度，默认 `type=default` 为浅底填充（`colorFillTertiary`），描边仅在显式 `variant=outlined` / `dashed` 时出现；支持图标位、加载、圆形与全宽。
- `FloatingActionGroup`：浮动操作入口。
- `SwipeAction`：行级滑动操作。
- `ActionSheet`：移动端操作菜单。

## 输入与控件

- `Input`：Material flat 风格的单行文本与搜索输入，支持浮动 label、独立底线、错误态、清除按钮、前后缀和加载态。
- `Textarea`：多行文本输入；下划线字段（1px 底边 + 2px 状态指示条，无底色无圆角），尺寸 14/24・16/26・18/28，错误不铺浅红底。
- `DisplayInput`：只读或触发式输入展示。自身持有 pressed、disabled、readonly 与错误态视觉，不接受调用方叠加状态样式。
- `ImagePicker`：以 `DisplayInput` 作为触发器，从相册或文件管理选择单张或多张图片。支持 `size`、`allowClear`、`status`、`helper`/`error`，触发器样式统一通过 `styles.input` 覆盖。
- `CalculatorInput`：带计算器弹窗的数字输入。`CalculatorInput.useCalculatorValueState` 封装弹层开关与表达式状态，打开时回填初始值，确认后再收起。
- `Stepper`：递增/递减数值调节。
- `Slider`：范围或数值调节。
- `Switch`：布尔开关。
- `Checkbox`：独立或分组多选。
- `Radio`：单选。

## 选择器与选择

- `WheelGroup`：滚轮组内核。支持多列、显式行高、`fit="container"` 按容器高度量化可见行（3/5/7）、实时 activeIndex、拖拽无惯性也提交。样式通过 `WheelGroupStyles` 覆盖。
- `Picker`：滚轮选择器与触发式选择模式。支持 `allowClear`、`status`、`helper`/`error`，触发器与 `DateTimePicker`、`CalendarPicker`、`ListPicker` 共用同一内部触发器实现；`Picker.Cascader` 为业务 Tab + 多列滚轮的级联子模式。
- `DateTimePicker`：日期时间选择。支持 `precision`（year/month/day/hour/minute/second）与 `layout`（`wheel` 默认 / `calendar` 日历浮层）；`DateTimePicker.Date` 仅日期、`DateTimePicker.Time` 仅时间（强制滚轮）。含时间精度且使用日历布局时，可点底部入口在日历与时间滚轮之间翻页。两种布局均支持 `allowClear`、`status`、`helper`/`error` 与 `loading`（日历布局以加载面板替代日历内容）。
- `CalendarPicker`：日历输入型选择器，值使用 `Date`。`CalendarPicker.View` 为纯日历面板（`mode` 支持 date/month/year，`CalendarPicker.View.Range` 为范围面板）；`CalendarPicker` 为触发器 + 浮层，`CalendarPicker.Range` 为输入型范围选择。面板支持标记、禁用日期、最小/最大日期与自定义文案，触发器支持 `allowClear` 与校验状态展示。
- `ListPicker`：基于 `FlatList` 的单选/多选触发器与选择面板，支持分组、搜索、受控值与 `allowClear`。触发器样式统一通过 `styles.input` 覆盖；`ListPicker.Cascader` 为层级 Tab + 列表的级联子模式，支持 `closeOnSelectLeaf`、`displayMode="tag"` 与 `allowClear`。
- `Segmented`：紧凑分段选择。
- `SegmentedControl`：顶部标签式分段控件。

## 列表与数据展示

- `List`：基于 `FlatList` 的数据列表容器，支持头尾、空/加载状态、刷新、分页与可折叠分组；行规格为 56 / 64 高、38 圆角图标底板、66 内缩分隔线，`amountText` 自动拆整数小数并按支出/收入/中性上色。
- `Tag`：紧凑标签。
- `Badge`：计数或状态标记。
- `Avatar`：用户/实体图片或首字母，也支持头像组。
- `Progress`：条形或环形进度。
- `Steps`：有序流程状态。
- `Result`：终态结果页或面板。
- `Empty`：无数据状态；inline / boxed / compact 三形态，标题 + 说明 + 单个操作三行结构，图标用 44 圆形底板。
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
- `Drawer`：左右侧滑出的抽屉面板；适合导航、筛选、设置等侧边内容，支持独立浮层和 `Drawer.Layout` 嵌入布局。
- `Popup`：锚定、底部或居中的浮层容器；`Popup.FloatingPanel` 适合可拖拽底部/顶部面板，支持 `titleText`、确认/取消按钮、自定义 header/footer；`bodyScrollable` 控制 body 使用 `ScrollView` 或普通 `View`，ScrollView 模式可通过 `scrollEnabled` 控制滚动。
- `Popover`：锚定触发元素的轻量浮层。`trigger` 支持 `click`（默认）/`longPress`/`manual`；`placement` 支持四向，空间不足自动翻转到对侧；`align` 控制交叉轴对齐并按屏幕边界收敛；内容经 `Portal` 挂载，点击外部或返回键关闭。
- `Portal`、`PortalProvider`：在常规树外渲染浮层内容。
- `Toast`、`useToast`：短暂轻量提示；999 胶囊、单实例替换、1800ms，`status` 提供 dot / success / error 三态图标。
- `Message`、`useMessage`：行内或全局反馈消息；16 语义图标 + 浅语义底（default 为白卡发丝线），支持单个 action 与 closable，有操作时常驻。
- `Notification`、`useNotification`：信息更丰富的通知；白卡 + 阴影、语义色只在 32 底板与图标，定位收敛为 top / bottom，支持最多两个 action。
- `Loading`：活动指示器；inline / block / more / overlay 四形态，转圈 16 / 20 / 28，tone 控制主色与次级灰。

## 常见组合

- 表单字段行：`Column` + `Text` 标签 + `Input`/`DisplayInput`/`ListPicker` 触发器。
- 设置项：`List` 的数据行 + 尾部 `Switch`、`Text`、`Badge`、`Tag` 或 `Icon`。
- 从列表选择流程：`ListPicker`；若数据形态匹配，也可用 `Picker`/`ListPicker.Cascader`/`Picker.Cascader`。
- 筛选栏：`Row`/`Space` + `Segmented` + `Button`/`Icon` 操作。
- 数据页面：`Column` + `HeaderBar`/页面标题 + `List` + `Empty`/`Skeleton`/`Loading` 状态。
- 卡片列表：使用 `List`；仅当每个重复项都需要框定承载面时搭配 `Card`。
- 进度状态：多阶段流程用 `Steps`，标量完成度用 `Progress`，最终成功/失败用 `Result`。
- 破坏性操作：行操作用 `SwipeAction`，操作选项用 `ActionSheet`，确认用 `Dialog`。
- 浮层表单：优先用 `Popup.FloatingPanel` 的 header/body/footer 与 `okText`/`onOk`/`onCancel`；更底层布局再用 `Popup` + `Column` + 输入控件 + `Button` 操作。

## 创建新 UI 前

先检查需求是否已被上方组件或组合覆盖。只有当模式可复用时才新增共享组件，不要仅因单个页面有局部排列需求就新增共享组件。
