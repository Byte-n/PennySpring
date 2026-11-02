# PennySpring 组件目录

组件用途、样式规格与使用方式。选型时以本文为起点，细化参数查看对应组件的 `types.ts`。

## 布局

- `Row`：水平 flex 布局；`gap` 8 / 12 / 16，`wrap` 时行距与列距同值。
- `Column`：垂直 flex 布局；`gap` 默认 12，可选 8 / 12 / 16。
- `Space`：为子元素提供统一间距；8 / 12 / 16，`block` 拉满宽度，`justify='stretch'` 时子项等分。
- `Spacer`：空白占位；设 `size` 时横纵同值，不设时按 `flex` 占据剩余空间。
- `Grid`：网格布局与重复瓦片；`gap` 8 / 12 / 16。
- `GeometryReader`：测量布局尺寸。
- `StickyLayout` + `Sticky`：局部吸附 overlay；`Sticky` 支持 `placement="top" / "bottom"`、offset、disabled 与吸附状态回调。
- `KeyboardAwareScreen`、`KeyboardAwareFormScroll`、`KeyboardStickyFooter`、`useKeyboardInsets`：键盘避让能力，用于页面、表单滚动与底部操作区；FormScroll 默认关闭滚动，需要时显式设置 `scrollEnabled`。
- `Divider`：视觉分隔；`size` 调整间距（横向上下 12 / 16 / 20，纵向高 16 / 20 / 24、左右 8 / 12 / 16），`spacing` 覆盖两侧间距，`none` 关闭间距；内容 12 / 三级灰，`left` / `right` 短边 24。
- `Card`：分组内容承载面；plain / elevated / summary 三变体均无描边，elevated 仅用 `boxShadowTertiary`，summary 突出金额；内边距 12 / 16 / 20。

## 排版与符号

- `Text`：所有展示文本；支持 `size` / `weight` / `color` / `textAlign`。
- `Icon`：按名称渲染图标。
- `Ellipsis`：折叠或可展开的长文本。

## 操作

- `Button`：主 / 次 / 文字 / 链接 / 危险按钮；高度 32 / 44 / 52，默认 `type=default` 为浅底填充（`colorFillTertiary`），显式 `variant=outlined` / `dashed` 才有描边；支持图标位、加载、圆形与全宽。
- `FloatingActionGroup`：浮动操作入口；主 FAB 40 / 48 / 56，动作按网格或扇形展开，`n=1` 单击直达；`draggable` 与 `snapToEdge` 独立使用，可贴边压成 32×48 书签头。
- `SwipeAction`：行级滑动操作；行高 56 / 64 / 72，动作区宽 64 / 72 / 80（危险 +8），图标在上、12/600 文字在下，12 圆角。
- `ActionSheet`：移动端操作菜单。

## 输入与控件

- `Form` / `Form.Item`：表单与表单项，Item 承载 label、布局与校验错误；支持 `initialValues`、`beforeSubmit`、`onFinish` / `onFinishFailed` / `onValuesChange`、`validateTrigger`；`Form.useForm` 获取实例，`Form.List` 动态行，`Form.Subscribe` 条件渲染，`Form.ErrorSummary` 展示表单级错误，`Form.useFormState` 读取提交态；`Form.infer<Values>()` 返回类型化 Form。字段控件用 `Form.Item.useFieldProps` 绑定，字段状态用 `Form.Item.useFieldState`。校验规则只写在 Form.Item。
- `Input`：Material flat 风格单行文本与搜索输入；支持浮动 label、独立底线、错误态、清除、加载态、前后缀，`Input.Password` 支持密码显隐切换；加载态禁止输入。
- `Textarea`：多行文本输入；下划线字段（1px 底边 + 2px 状态指示条，无底色无圆角），浮动 label，尺寸 14/24・16/26・18/28，错误不铺浅红底。
- `DisplayInput`：只读或触发式输入展示；自带 pressed / disabled / readonly 与错误态视觉。
- `Image`：图片显示；`fit="cover" / "contain"`，圆角 none / small / normal / large / circle，缩略图底色占位，失败可点按重试或自定义 `error`；`preview` 默认关闭，单图显式开启后可全屏预览。`Image.PreviewGroup` 组内共享一个全屏预览（黑底、横滑翻页、双指 1–3×、双击 2×），`items` 数据入口优先于 children；`Image.Preview` 可直接受控使用。
- `ImagePicker`：以 `DisplayInput` 为触发器，从相册或文件管理选择单张或多张图片；支持 `size`、`allowClear`、`status`、`includeBase64`，触发器样式通过 `styles.input` 覆盖。`ImagePicker.Popup` 为无触发器浮层，`ImagePicker.ActionSheet` 仅处理来源选择（拍照 / 相册 / 文件），`ImagePicker.persistImage(value)` 在提交时把选图转存到永久目录并返回同形状新值；浮层内 3 列 1:1 网格（间距 8、左右 16、圆角 12），删除按钮 24，添加位与空态为虚线格，失败显示红色虚线错误框。
- `CalculatorInput`：带计算器弹窗的数字输入；`CalculatorInput.useCalculatorValueState` 管理弹层开关与表达式状态，打开时回填初始值。
- `Stepper`：递增 / 递减数值调节；999 胶囊，高度取 `controlHeightSM / controlHeight / controlHeightLG`，按钮 24 / 32 / 36 + 线性加减图标；数值 600 等宽，最小宽 32 / 40 / 48，`unitText` 以 12 / 三级紧跟数值。
- `Slider`：范围或数值调节；轨道 4 / 6 / 8、thumb 16 / 20 / 24，控件高取 `controlHeightSM / controlHeight / controlHeightLG`；轨道 `colorFillSecondary`、填充 `colorPrimary`，thumb 白面 + 2px 主色环 + `boxShadowTertiary`；端点留 thumb 半径。
- `Switch`：布尔开关；轨道 28×8 / 40×10 / 52×12，滑块 14 / 20 / 26 溢出轨道，控件高取 `controlHeightSM / controlHeight / controlHeightLG`；关态 `colorFillSecondary`、开态 `colorPrimary`，滑块白 + `boxShadowTertiary`；`checkedText` / `uncheckedText` 位于轨道右侧 8。
- `Checkbox`：独立或分组多选；勾选框 16 / 20 / 24（圆角 4 / 6 / 8，勾图标 12 / 14 / 16），行高与 chip 高取 `controlHeightSM / controlHeight / controlHeightLG`；`displayType="button"` 为 999 chip（未选 `colorFillTertiary`、选中 `colorPrimaryBg` + 主色）；`Checkbox.Group` 按 `options` 数据驱动，横向 / 纵向 / `block` 排布 gap 8。
- `Radio`：独立或分组单选；外圈 16 / 20 / 24、圆点 8 / 10 / 12，行高与 chip 高取 `controlHeightSM / controlHeight / controlHeightLG`；未选 2px `colorBorder`，选中主色描边 + 主色圆点，禁用外圈 `colorSplit` + 四级灰；`displayType="button"` 为 999 chip（未选 `colorFillTertiary`、选中 `colorPrimaryBg` + 主色）；`Radio.Group` 按 `options` 数据驱动，支持横向 / 纵向 / `block`。

## 选择器与选择

- `WheelGroup`：多列滚轮选择；支持显式行高，`fit="container"` 按容器高度显示 3 / 5 / 7 行；样式通过 `WheelGroupStyles` 覆盖。
- `Picker`：滚轮选择器与触发式选择；支持 `allowClear`、`status`；`Picker.Cascader` 为 Tab + 多列滚轮的级联模式，支持 `allowClear`。
- `DateTimePicker`：日期时间选择；支持 `precision`（year / month / day / hour / minute / second）与 `layout`（`wheel` 默认 / `calendar`）；`DateTimePicker.Date` 仅日期，`DateTimePicker.Time` 仅时间；两种布局均支持 `allowClear`、`status` 与 `loading`。
- `CalendarPicker`：日历输入型选择器，值为 `Date`；`CalendarPicker.View` 为纯日历面板（`mode` 支持 date / month / year，`.Range` 为范围面板），`CalendarPicker` 为触发器 + 浮层，`CalendarPicker.Range` 为范围选择；面板支持标记、禁用日期、最小 / 最大日期与自定义文案，触发器支持 `allowClear` 与校验状态。
- `ListPicker`：基于 `List` 的单选 / 多选触发器与选择面板，支持分组、搜索、受控值与 `allowClear`，触发器样式通过 `styles.input` 覆盖；`ListPicker.Cascader` 为层级 Tab + 列表的级联模式，支持 `closeOnSelectLeaf`、`displayMode="tag"` 与 `allowClear`。
- `Segmented`：紧凑分段选择；轨道高取 `controlHeightSM / controlHeight / controlHeightLG`，内边距 2 / 3 / 4，item 圆角 8 / 8 / 12；选中块白底 + `boxShadowTertiary` + `colorText` 600，未选二级、禁用四级；支持 `options[].icon` / `label` / `disabled`、`block` 与 `size`。
- `SegmentedControl`：顶部标签式分段控件。

## 列表与数据展示

- `List`：数据列表容器，默认关闭滚动，需要时设置 `scrollEnabled`；支持头尾、空 / 加载状态、刷新、分页、可折叠分组与 `renderSwipeActions` 行级滑动；行高 56 / 64，38 圆角图标底板，66 内缩分隔线，行尾通过 `right` 自定义。
- `Tag`：紧凑标签。
- `Badge`：计数或状态标记；高 16 / 20 / 24、圆点 6 / 8 / 10，字号 12 / 12 / 14，左右内边距 5 / 6 / 8；default 用 `colorText`，未读用 `colorError`；挂角补 2px `colorBgContainer` 环，超过 `overflowCount`（默认 99）显示 `99+`。
- `Avatar`：用户 / 实体图片或首字母，支持头像组；尺寸 28 / 40 / 56，方形圆角 8 / 12 / 16，首字 12 / 14 / 18 + 600 + `colorTextSecondary`；无图无字渲染人物占位图标；头像组重叠 8 / 10 / 14，每个头像外套 2px `colorBgContainer` 环，`+N` 胶囊与头像同尺寸。
- `Progress`：条形或环形进度；线宽 4 / 6 / 8、圆环 40 / 48 / 56（环宽 3 / 4 / 4）；轨道 `colorFillSecondary` + 999 圆角，只有已完成段与百分比跟随状态色；百分比 12 / 12 / 14 等宽，环内 12 / 14 / 16。
- `Steps`：有序流程状态；指示器 20 / 24 / 28，标题 14 / 16 / 18，说明 12 / 12 / 14；wait 白底发丝描边、process 主色 + 4px `colorPrimaryBg` 外环、finish 成功色 + 勾、error 错误色 + 叉；连接线 2px，未完成 `colorSplit`、已完成 `colorSuccess`。
- `Result`：终态结果页或面板；图标容器 40 / 48 / 56（语义浅底），图标 20 / 24 / 28，标题 16 / 18 / 22，说明 12 / 14 / 14（最大宽 320）；不自带容器与阴影，操作区间距 8、主按钮在左。
- `Empty`：无数据状态；inline / boxed / compact 三形态，标题 + 说明 + 单个操作，图标用 44 圆形底板。
- `Skeleton`：加载占位；line 行高 12 / 16 / 20（圆角 4 / 6 / 8），circle 32 / 40 / 48，rect 48 / 64 / 80（圆角 12）；`width` / `height` / `borderRadius` 可覆盖默认尺寸。
- `Carousel`：可滑动媒体 / 内容轮播；指示点 6px、选中拉成 16×6 胶囊、间距 8、距底 12；媒体场景用 `styles.indicatorDot*` 覆盖；超过 8 页切换右下角计数胶囊，单页不渲染指示器；自动播放默认 4s，拖拽期间暂停。

## 导航

- `TabBar`：底部标签栏；高度 48 / 56 / 64，图标盒 20 / 24 / 26，文字 12；选中改主色 + 600，不铺色块；按压 12 圆角 `colorFillTertiary`，禁用四级；角标 18 高（超 99 显示 99+）或红点，定位于图标右上；支持 `activeIcon`、`safeAreaInsetBottom`、`size`。
- `Tabs`：标签页内容；行高 32 / 40 / 48，选中主色 600 + 2px 下划线（与文字同宽）；列表线 `colorSplit`，按压 8 圆角 `colorFillTertiary`；支持 `layout="wrap" | "scroll"`、`block`、`size`、`renderContent`。
- `TopTabNavigator`：顶部标签页屏幕导航器。
- `IndexBar`：索引列表导航；字母视觉 20 / 24 / 28、条宽 36 / 36 / 40、字号 11 / 12 / 13；选中主色实底 + 白字；分组标题高 32、左右 16、12/600 + 字距 .08em 并吸顶；拖动时中央显示 64 气泡（`colorPrimaryBg` + 主色字母）。
- `HeaderBar`：顶部导航区域标题栏。

## 浮层与反馈

- `Dialog`：阻塞式确认或提示。
- `Drawer`：左右侧滑抽屉，适合导航、筛选、设置；支持独立浮层与 `Drawer.Layout` 嵌入；外沿 16 圆角、贴边侧直角，宽度 78% 且最大 320，内边距 16，遮罩 `colorBgMask`。
- `Popup`：锚定、底部或居中浮层；`Popup.FloatingPanel` 适合可拖拽底部 / 顶部面板，`scrollEnabled` 允许滚动，`bodyScrollable` 切换为普通 View body。
- `Popover`：锚定触发元素的轻量浮层；`trigger` 支持 `press`（默认）/ `longPress` / `manual`；`placement` 四向并自动翻转，`align` 控制交叉轴对齐；点击外部或返回键关闭。
- `Tooltip`：纯文本轻提示；`variant` 提供 dark（`colorBgSpotlight`）与 light（`colorBgElevated` + 1px `colorBorder`）；`trigger` 支持 `press`（默认）/ `longPress` / `manual`；默认 `top` 并自动翻转，宽封顶 240，`arrow` 可关闭；不要放交互控件，需要交互用 `Popover`。
- `Portal`、`PortalProvider`：在常规树外渲染浮层内容。
- `Toast`、`useToast`：短暂轻量提示；999 胶囊、单实例替换、1800ms，`status` 支持 dot / success / error。
- `Message`、`useMessage`：反馈消息；16 语义图标 + 浅语义底（default 为白卡发丝线），支持单个 action 与 closable。
- `Notification`、`useNotification`：通知；白卡 + 阴影，语义色只在 32 底板与图标，支持 top / bottom 定位与最多两个 action。
- `Loading`：活动指示器；inline / block / more / overlay 四形态，转圈 16 / 20 / 28，tone 控制主色与次级灰。

## 常见组合

- 表单字段行：`Form` + `Form.Item` 承载 label、布局与校验错误，字段控件直接放入 Item。
- 设置项：`List` 数据行 + 尾部 `Switch`、`Text`、`Badge`、`Tag` 或 `Icon`。
- 从列表选择：`ListPicker`；数据形态匹配时也可用 `Picker` / `ListPicker.Cascader` / `Picker.Cascader`。
- 筛选栏：`Row` / `Space` + `Segmented` + `Button` / `Icon`。
- 数据页面：`Column` + `HeaderBar` + `List` + `Empty` / `Skeleton` / `Loading` 状态。
- 卡片列表：使用 `List`；仅当每项都需要承载面时搭配 `Card`。
- 进度状态：多阶段流程用 `Steps`，标量完成度用 `Progress`，最终结果用 `Result`。
- 破坏性操作：行操作用 `SwipeAction`，操作选项用 `ActionSheet`，确认用 `Dialog`。
- 浮层表单：优先用 `Popup.FloatingPanel` 的 header/body/footer 与 `okText` / `onOk` / `onCancel`；需要自定义布局时用 `Popup` + `Column` + 输入控件 + `Button`。

## 创建新 UI 前

先检查需求是否已被上方组件或组合覆盖。只有模式可复用时才新增共享组件。
