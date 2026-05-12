## 已实现

- [x] Avatar / Avatar.Group
- [x] Button
- [x] Calendar
- [x] Card
- [x] ConfigProvider
- [x] Grid / Grid.Item
- [x] Input
- [x] List / List.Item
- [x] ListCollapse
- [x] ListGroup
- [x] Portal / PortalProvider
- [x] Popup
- [x] Segmented
- [x] SelectionList / SelectionList.Popup
- [x] Space
- [x] Tag
- [x] Text
- [x] Textarea
- [x] TopTabNavigator / HeaderBar / SegmentedControl
- [x] Input.Search
- [x] Dialog 对话框
- [x] Checkbox / Radio、Radio.Group，均支持展示类型：普通，按钮样式
- [x] Drawer / Drawer.Layout
- [x] Divider
- [x] Icon（第三方图标库 + theme color key）
- [x] Slider 滑动输入条
- [x] Progress 纯逻辑组件，Progress.Bar 进度条 Progress.Circle 进度圈
- [x] Switch 开关
- [x] Empty 空状态
- [x] Loading 加载中
- [x] ActionSheet 动作面板
- [x] Stepper 步进器
- [x] Tabs
- [x] Ellipsis
- [x] DataList / DataList.Section
- [x] SwipeAction 滑动操作
- [x] Result
- [x] 骨架屏
- [x] Toast / Message / Notification
- [x] Badge 徽标
- [x] SideBar
- [x] TabBar

## 待办

- [ ] IndexBar
- [ ] FloatingPanel 浮动面板
- [ ] Steps 步骤条
- [ ] Swiper 走马灯
- [ ] Cascader / Cascader.View

## DataList 进度

- [x] 支持 InfiniteScroll 无限滚动功能
- [x] 支持 PullToRefresh 下拉刷新功能

## 规范
- [x] 组件规范
  - 可见状态 `open` 、 `onOpenChange`、`defaultOpen`（需要支持可控和非可控，受控模式触发关闭，不会触发 `onCancel`）
  - 关闭/取消：`onCancel`，禁止出现 `onClose` 等，除非已有 `onCancel`
  - 完成/确认：`onOk`，禁止出现 `onFinished` 等，除非已有 `onOk`
  - 值 / 主要值：`value` `onChange` `defaultValue` （需要支持可控和非可控）
  - 回调顺序：操作涉及触发多个回调时，语义动作先发生：onCancel 再 onOpenChange (false)
  - 内部节点渲染名称与类型（例如 `Card` 的 `title`，List.Group 等组件的标题，或者选择器里面的按钮等，）：
    - ❌ `{ title: string | ReactNode }`
    - ❌ `{ title: string, titleNode: ReactNode }`
    - ✅ `{ titleText: string, title: ReactNode }`
  - 内部插槽：
    - 文本样式只作用于内部文本，如 `styles.titleText` 仅作用于 `titleText`。
    - 如需包裹节点，使用 `titleContainer` 承载 `title ?? titleText`，不要用 `title` 表示容器。
  - 内部选项、子项都应该通过数据驱动渲染：
    - ❌：<A> <A.Item/> </A>
    - ✅ ： <A。data={[]} renderItem={(data,index, opt?: 如果有其他A的内部属性) => ({})} />
  - 受控/非受控 判断由 特定 hook 统一处理。`const [value, onChange, isControled] = useControllableValue(props.defaultValue, props.value, props.onChange)`
  - 组件外部传入的数据相关的props必须有完善的 Ts 类型推导。例如 options 的选项类型 与 value / onChange / onOk 等...
  - zindex 层级：Dialog > Popup > Picker 等其他组件的弹窗（这些 zindex 一致）：指定详细的规则，那种默认用 tokens 中的那个
