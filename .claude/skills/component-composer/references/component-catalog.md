# PennySpring 组件目录

将本文作为起始地图。编码前仍需检查组件的 `types.ts`、实现和测试。

## 布局

- `Row`：水平 flex 布局；`gap` 三档 8 / 12 / 16（`sizeXS` / `paddingSM` / `padding`），未传不设间距，`wrap` 后行距与列距同值。
- `Column`：垂直 flex 布局；默认 `gap='normal'` = 12，三档 8 / 12 / 16，同一层只保留一个 gap。
- `Space`：为子元素提供一致间距；三档 8 / 12 / 16，纵向与 `wrap` 行距同值，`block` 拉满宽度，`justify='stretch'` 时子项等分。
- `Spacer`：固定或弹性的空白占位；设 `size` 时横向取宽、纵向取高且两向同值，不设 `size` 时按 `flex` 吃剩余空间。
- `Grid`：网格布局和重复瓦片；三档 gap 8 / 12 / 16，格内只保留横向半 gap，行距等于 gap，外层负半 gap 抵消首列外扩。
- `GeometryReader`：布局尺寸测量。
- `KeyboardAwareScreen`、`KeyboardAwareFormScroll`、`KeyboardStickyFooter`、`useKeyboardInsets`：页面、表单滚动与底部操作区的键盘避让布局能力。FormScroll 默认关闭滚动，需滚动时显式设置 `scrollEnabled`。inset 统一按 `max(0, 键盘高 − 安全区)` 计算；Screen 只在键盘可见时补一次，FormScroll 内容底部只补 `inset + extraBottomInset`（默认 0），StickyFooter 取 `max(inset, safeAreaBottom)` 并带 1px `colorSplit` 顶线。
- `Divider`：视觉分隔；`size` 只调间距（横向上下 12 / 16 / 20，纵向高 16 / 20 / 24、左右 8 / 12 / 16），`spacing` 可覆盖两侧间距、`none` 关闭间距，内容固定 12 三级灰、左右 12，`left` / `right` 短边固定 24。
- `Card`：分组内容承载面；plain / elevated / summary 三个变体均无描边，elevated 只用 `boxShadowTertiary`，summary 靠金额排印建立重点；尺寸 12 / 16 / 20 内边距。

## 排版与符号

- `Text`：应用和共享 UI 中的所有展示文本；支持 `size` / `weight` / `color` / `textAlign`。
- `Icon`：按名称渲染图标
- `Ellipsis`：折叠或可展开的长文本。

## 操作

- `Button`：主/次/文字/链接/危险按钮；32 / 44 / 52 三档高度，默认 `type=default` 为浅底填充（`colorFillTertiary`），描边仅在显式 `variant=outlined` / `dashed` 时出现；支持图标位、加载、圆形与全宽。
- `FloatingActionGroup`：浮动操作入口；主 FAB 40 / 48 / 56（圆角 12 / 16 / 16），展开项为 44 图标 + 左侧 32 文字胶囊，只有主 FAB 带投影；「更多」用加号旋转 45° 表达收起，展开 180ms + 30ms 阶梯 + 8px 浮出；贴边左右 16，上下 16 + 安全区。
- `SwipeAction`：行级滑动操作；行高 56 / 64 / 72 与 List 行对齐，动作区固定宽 64 / 72 / 80（危险 +8），图标在上、12/600 文字在下，动作区与行共用 12 圆角裁切，按压缩放 .98。
- `ActionSheet`：移动端操作菜单。

## 输入与控件

- `Form` / `Form.Item`：表单与表单项；支持 item/child/noStyle 布局、跨字段 `dependencies`、`Form.Subscribe` 条件渲染、`required` 在未传 rules 时自动校验、`extra`/`errorRender` 反馈、rules 数组与 `asyncDebounceMs`。FormProps 提供 `initialValues`、`beforeSubmit`（校验通过后、onFinish 前的异步值变换，结果写回表单且抛错中止提交）、`onFinish`、`onFinishFailed`、`onValuesChange`、`validateTrigger`；`Form.useForm(form?)` 返回 `[FormInstance]`，不传 form 时 Form 自动创建实例。`Form.List` 提供动态行，`Form.ErrorSummary` 展示表单级/根级错误，`Form.useFormState(selector)` 读取提交态。`Form.infer<Values>()` 返回带类型的 Form（含 `Item`/`List`/`Subscribe`/`ErrorSummary`/`useForm`/`useFormInstance`/`useFormState`，不含 `infer`）；字段控件用 `Form.Item.useFieldProps` 自动绑定，状态读取用 `Form.Item.useFieldState`。校验规则只在 Form.Item，Form 不提供表单级 rules/validators。
- `Input`：Material flat 风格的单行文本与搜索输入，支持浮动 label、独立底线、错误态、清除按钮、前后缀和加载态。
- `Textarea`：多行文本输入；下划线字段（1px 底边 + 2px 状态指示条，无底色无圆角），浮动 label（与 Input 一致，placeholder 聚焦后出现），尺寸 14/24・16/26・18/28，错误不铺浅红底。
- `DisplayInput`：只读或触发式输入展示。自身持有 pressed、disabled、readonly 与错误态视觉，不接受调用方叠加状态样式。
- `Image`：图片显示原语。支持 `fit="cover" / "contain"`、圆角 none/small/normal/large/circle、缩略图底色占位、失败态点按重试与自定义 `error` 内容；`preview` 默认关闭，单图显式开启后才可点击打开全屏预览。`Image.PreviewGroup` 用 Context 自动注册子图片（组内忽略单图 `preview`），`items` 数据入口优先于 children，组内共享一个全屏预览：固定黑底、关闭/计数、横滑翻页、双指 1–3×、双击 2×、放大后平移；`Image.Preview` 为可直接受控使用的全屏预览层。
- `ImagePicker`：以 `DisplayInput` 作为触发器，从相册或文件管理选择单张或多张图片。支持 `size`、`allowClear`、`status`、`includeBase64`，触发器样式统一通过 `styles.input` 覆盖；`ImagePicker.Popup` 为无触发器的独立浮层版本，适合聊天/附件等场景自行控制入口；`ImagePicker.persistImage(value)` 在提交时把选图副本转存到应用永久目录并返回同形状的新值（已是永久路径时原样返回）；浮层内 3 列 1:1 网格（间距 8、左右 16、圆角 12），缩略图由 Image 渲染并自动注册到 Image.PreviewGroup，点击可全屏预览；删除按钮 24 + 2px 容器环且独立命中，添加位与空态为虚线格，加载失败显示红色虚线错误框并可点击重试。
- `CalculatorInput`：带计算器弹窗的数字输入。`CalculatorInput.useCalculatorValueState` 封装弹层开关与表达式状态，打开时回填初始值，确认后再收起。
- `Stepper`：递增/递减数值调节。999 胶囊，高度取 `controlHeightSM / controlHeight / controlHeightLG`（无描边无分隔线），按钮 24 / 32 / 36 + 线性加减图标；数值 600 等宽、最小宽 32 / 40 / 48，`unitText` 以 12/三级紧跟数值；按压只作用于按钮，到边界仅降对应按钮，禁用降胶囊底，只读保留胶囊底但降数值。
- `Slider`：范围或数值调节。轨道 4 / 6 / 8、thumb 16 / 20 / 24，控件高取 `controlHeightSM / controlHeight / controlHeightLG`；轨道 `colorFillSecondary`、填充 `colorPrimary`，thumb 白面 + 2px 主色环 + `boxShadowTertiary`；按压 thumb ×1.1，禁用改四级灰并去投影，只读保留主色但不响应；端点左右留 thumb 半径。
- `Switch`：布尔开关。轨道 28×8 / 40×10 / 52×12，滑块 14 / 20 / 26 溢出轨道，控件高取 `controlHeightSM / controlHeight / controlHeightLG`；关态 `colorFillSecondary`、开态 `colorPrimary`，滑块白 + `boxShadowTertiary`；`checkedText` / `uncheckedText` 在轨道右侧 8；支持 disabled / readonly / size。
- `Checkbox`：独立或分组多选。勾选框 16/20/24（圆角 4/6/8，勾图标 12/14/16），行高与 chip 高统一取 `controlHeightSM / controlHeight / controlHeightLG`；`displayType="button"` 为 999 chip（未选 `colorFillTertiary`、选中 `colorPrimaryBg` + 主色 600 带小勾）；支持 disabled / readonly / indeterminate，`Checkbox.Group` 按 `options` 数据驱动，横向 / 纵向 / `block` 排布统一 gap 8。
- `Radio`：独立或分组单选。外圈 16/20/24、圆点 8/10/12，行高与 chip 高统一取 `controlHeightSM / controlHeight / controlHeightLG`；未选 2px `colorBorder`，选中主色描边 + 主色圆点，按压整行 `colorFillTertiary`，禁用外圈 `colorSplit` + 四级圆点 + 三级文字，只读保留主色圆点且不响应；`displayType="button"` 为 999 chip（未选 `colorFillTertiary`、选中 `colorPrimaryBg` + 主色 600）；已选项再点不取消，`Radio.Group` 按 `options` 数据驱动，支持横向 / 纵向 / `block` 排布。

## 选择器与选择

- `WheelGroup`：滚轮组内核。支持多列、显式行高、`fit="container"` 按容器高度量化可见行（3/5/7）、实时 activeIndex、拖拽无惯性也提交。样式通过 `WheelGroupStyles` 覆盖。
- `Picker`：滚轮选择器与触发式选择模式。支持 `allowClear`、`status`，触发器与 `DateTimePicker`、`CalendarPicker`、`ListPicker` 共用同一内部触发器实现；`Picker.Cascader` 为业务 Tab + 多列滚轮的级联子模式，同样支持 `allowClear`（清除当前 Tab 路径）。
- `DateTimePicker`：日期时间选择。支持 `precision`（year/month/day/hour/minute/second）与 `layout`（`wheel` 默认 / `calendar` 日历浮层）；`DateTimePicker.Date` 仅日期、`DateTimePicker.Time` 仅时间（强制滚轮）。含时间精度且使用日历布局时，可点底部入口在日历与时间滚轮之间翻页。两种布局均支持 `allowClear`、`status` 与 `loading`（日历布局以加载面板替代日历内容）。
- `CalendarPicker`：日历输入型选择器，值使用 `Date`。`CalendarPicker.View` 为纯日历面板（`mode` 支持 date/month/year，`CalendarPicker.View.Range` 为范围面板）；`CalendarPicker` 为触发器 + 浮层，`CalendarPicker.Range` 为输入型范围选择。面板支持标记、禁用日期、最小/最大日期与自定义文案，触发器支持 `allowClear` 与校验状态展示。
- `ListPicker`：基于 `List` 的单选/多选触发器与选择面板，支持分组、搜索、受控值与 `allowClear`。触发器样式统一通过 `styles.input` 覆盖；`ListPicker.Cascader` 为层级 Tab + 列表的级联子模式，支持 `closeOnSelectLeaf`、`displayMode="tag"` 与 `allowClear`。
- `Segmented`：紧凑分段选择。轨道高取 `controlHeightSM / controlHeight / controlHeightLG`，内边距 2 / 3 / 4，item 圆角 8 / 8 / 12；选中块为白底 + `boxShadowTertiary` + `colorText` 600，未选二级、禁用四级；支持 `options[].icon` / `label` / `disabled`、`block` 与 `size`。
- `SegmentedControl`：顶部标签式分段控件。

## 列表与数据展示

- `List`：基于 `FlatList` 的数据列表容器，默认关闭滚动，需滚动时显式设置 `scrollEnabled`；支持头尾、空/加载状态、刷新、分页、可折叠分组与通过 `renderSwipeActions` 配置行级滑动操作；行规格为 56 / 64 高、38 圆角图标底板、66 内缩分隔线，行尾内容通过 `right` 插槽由业务自定义。
- `Tag`：紧凑标签。
- `Badge`：计数或状态标记。高 16 / 20 / 24、圆点 6 / 8 / 10，字号 12 / 12 / 14，左右内边距 5 / 6 / 8；default 用 `colorText`，未读用 `colorError`；挂角时补 2px `colorBgContainer` 环，计数位移 40%、圆点 50%，超过 `overflowCount`（默认 99）显示 `99+`。
- `Avatar`：用户/实体图片或首字母，也支持头像组。尺寸 28 / 40 / 56，方形圆角 8 / 12 / 16，首字 12 / 14 / 18 + 600 + `colorTextSecondary`；无图无字时渲染 16 / 20 / 26 人物占位图标；头像组重叠 8 / 10 / 14，每个头像外套 2px `colorBgContainer` 环，`+N` 胶囊与头像同尺寸。
- `Progress`：条形或环形进度。线宽 4 / 6 / 8、圆环 40 / 48 / 56（环宽 3 / 4 / 4）；轨道 `colorFillSecondary` + 999 圆角，只有已完成段与百分比跟随状态色；百分比 12 / 12 / 14 等宽，环内 12 / 14 / 16，0% 不渲染圆头。
- `Steps`：有序流程状态。指示器 20 / 24 / 28，标题 14 / 16 / 18，说明 12 / 12 / 14；wait 白底发丝描边、process 主色 + 4px `colorPrimaryBg` 外环、finish 成功色 + 勾、error 错误色 + 叉；连接线 2px，未完成 `colorSplit`、已完成 `colorSuccess`；只读保留对比，禁用整体 .45。
- `Result`：终态结果页或面板。图标容器 40 / 48 / 56（语义浅底），图标本体 20 / 24 / 28，标题 16 / 18 / 22，说明 12 / 14 / 14（最大宽 320）；组件不自带容器与阴影，操作区间距 8、主按钮在左，`icon={null}` 时标题不再保留图标占位。
- `Empty`：无数据状态；inline / boxed / compact 三形态，标题 + 说明 + 单个操作三行结构，图标用 44 圆形底板。
- `Skeleton`：加载占位。line 行高 12 / 16 / 20（圆角 4 / 6 / 8），circle 32 / 40 / 48，rect 48 / 64 / 80（圆角 12）；`width` / `height` / `borderRadius` 可覆盖默认尺寸；shimmer 占容器 40% 宽、1.2s 循环，静态不渲染高光；加载完成时内容 100ms 淡入。
- `Carousel`：可滑动媒体/内容轮播。指示点 6px、选中拉成 16×6 胶囊、间距 8、距底 12；默认 surface 预设（主色 / 四级灰），媒体场景用 `styles.indicatorDot*` 覆盖为白点；超过 8 页切换右下角计数胶囊，单页不渲染指示器；自动播放默认 4s，拖拽期间暂停。

## 导航

- `TabBar`：底部标签栏导航。高度 48 / 56 / 64，图标盒 20 / 24 / 26，文字统一 12；选中只改图标与文字为主色 + 600，不铺色块；按压为 12 圆角 `colorFillTertiary`，禁用四级；角标 18 高（超 99 显示 99+）或红点，绝对定位于图标右上，不参与布局；支持 `activeIcon`、`safeAreaInsetBottom`、`size`。
- `Tabs`：标签页内容。行高 32 / 40 / 48，项内边距承担间距，选中为主色 600 + 2px 下划线（宽度等于文字）；列表线 `colorSplit`，按压为 8 圆角 `colorFillTertiary`，禁用文字四级；支持 `layout="wrap" | "scroll"`、`block`、`size`、`renderContent`（唯一函数插槽）。
- `TopTabNavigator`：顶部标签页屏幕导航器。
- `IndexBar`：索引列表导航。字母视觉 20 / 24 / 28、条宽 36 / 36 / 40、字号 11 / 12 / 13；默认二级文字，按压 `colorBgTextHover`，选中主色实底 + 白字，禁用四级且不响应；分组标题高 32、左右 16、12/600 + 字距 .08em 并吸顶；拖动字母条时面板中央显示 64 气泡（`colorPrimaryBg` + 主色字母）。
- `HeaderBar`：顶部导航区域标题栏。

## 浮层与反馈

- `Dialog`：阻塞式确认或提示。
- `Drawer`：左右侧滑出的抽屉面板；适合导航、筛选、设置等侧边内容，支持独立浮层和 `Drawer.Layout` 嵌入布局。外沿 16 圆角、贴边侧直角，宽度 78% 且最大 320，内边距 16；遮罩取 `colorBgMask`，front / slide / back 共用 `motionDurationMid` 且退出对称。
- `Popup`：锚定、底部或居中的浮层容器；`Popup.FloatingPanel` 适合可拖拽底部/顶部面板，默认 body 使用 ScrollView 但滚动关闭；通过 `scrollEnabled` 显式允许滚动，`bodyScrollable` 可切换为普通 View body。
- `Popover`：锚定触发元素的轻量浮层。`trigger` 支持 `press`（默认）/`longPress`/`manual`；`placement` 支持四向，空间不足自动翻转到对侧；`align` 控制交叉轴对齐并按屏幕边界收敛；内容经 `Portal` 挂载，点击外部或返回键关闭。
- `Tooltip`：纯文本轻提示。`variant` 提供 dark（`colorBgSpotlight`，压图表/金额）与 light（`colorBgElevated` + 1px `colorBorder`，贴列表）；`trigger` 支持 `press`（默认）/`longPress`/`manual`；默认 `top`，空间不足翻到对侧；宽封顶 240，高取当前方位可用空间并按整行封顶，超出在气泡内滚动；`arrow` 可关闭；不放按钮或表单，需要交互请用 `Popover`。
- `Portal`、`PortalProvider`：在常规树外渲染浮层内容。
- `Toast`、`useToast`：短暂轻量提示；999 胶囊、单实例替换、1800ms，`status` 提供 dot / success / error 三态图标。
- `Message`、`useMessage`：行内或全局反馈消息；16 语义图标 + 浅语义底（default 为白卡发丝线），支持单个 action 与 closable，有操作时常驻。
- `Notification`、`useNotification`：信息更丰富的通知；白卡 + 阴影、语义色只在 32 底板与图标，定位收敛为 top / bottom，支持最多两个 action。
- `Loading`：活动指示器；inline / block / more / overlay 四形态，转圈 16 / 20 / 28，tone 控制主色与次级灰。

## 常见组合

- 表单字段行：优先 `Form` + `Form.Item` 承载 label、布局与校验错误；字段控件直接放入 Item，不再手写 `Text` 标签。
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
