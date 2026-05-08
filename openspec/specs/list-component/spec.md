# list-component Specification

## Purpose
提供基础列表容器组件，用于承载结构一致的内容项，并统一列表区域、项目结构、左右插槽、空与加载状态、分割线、尺寸样式和可访问性语义。
## Requirements
### Requirement: List renders structural regions
`List` 组件 SHALL 渲染调用方提供的头部、项目内容、底部、空状态和加载反馈，并且不改变调用方传入的 children。

#### Scenario: Header and footer render around content
- **WHEN** 调用方传入 `header`、`children` 和 `footer`
- **THEN** List 按 header、children、footer 的结构渲染这些内容

#### Scenario: Empty renders when children are empty
- **WHEN** 调用方未传入有效 `children` 且传入 `empty`
- **THEN** List 渲染 empty 内容

#### Scenario: Empty does not replace existing children
- **WHEN** 调用方同时传入有效 `children` 和 `empty`
- **THEN** List 渲染 children，且不渲染 empty 内容

#### Scenario: Loading renders without replacing empty
- **WHEN** 调用方传入 `loading` 和 `empty` 且没有有效 children
- **THEN** List 同时渲染 loading 区域和 empty 内容

### Requirement: List.Item renders standard slots
`List.Item` 组件 SHALL 支持左侧识别区、中间内容区、右侧内容区、主标题、副标题和自定义主体内容。

#### Scenario: Standard slots render in order
- **WHEN** 调用方传入 `left`、`title`、`description` 和 `right`
- **THEN** List.Item 按 left、content、right 的结构渲染这些内容

#### Scenario: Children override default text body
- **WHEN** 调用方传入 `children`，同时传入 `title` 和 `description`
- **THEN** List.Item 在内容区渲染 children，不渲染由 title 和 description 生成的默认文本

### Requirement: List.Item handles interaction state
`List.Item` SHALL 只有在 `onPress` 存在且未 disabled 时可点击，禁用时不得触发调用方事件。

#### Scenario: Interactive item uses button semantics
- **WHEN** 调用方传入 `onPress`
- **THEN** List.Item 使用可点击节点并具备 button 语义

#### Scenario: Display item is not a button
- **WHEN** 调用方未传入 `onPress`
- **THEN** List.Item 不声明 button 语义

#### Scenario: Disabled item does not call onPress
- **WHEN** 调用方传入 `onPress` 且 `disabled={true}` 后触发 press
- **THEN** List.Item 不调用 onPress，并暴露 disabled 状态

### Requirement: List.Item exposes selected state structurally
`List.Item` SHALL 在 selected 时提供结构化状态表达，并向辅助技术暴露 selected 状态。

#### Scenario: Selected item exposes state and marker
- **WHEN** 调用方传入 `selected={true}`
- **THEN** List.Item 暴露 selected 可访问状态，并渲染独立的选中标记

### Requirement: List applies divider rules
`List` 和 `List.Item` SHALL 支持 `none`、`inset` 和 `full` 分割线模式，且 item 显式 divider 优先于 List 默认值。

#### Scenario: List divider is inherited by item
- **WHEN** List 设置 `divider="full"` 且 List.Item 未设置 divider
- **THEN** List.Item 渲染 full 分割线

#### Scenario: Item divider overrides List divider
- **WHEN** List 设置 `divider="full"` 且 List.Item 设置 `divider="none"`
- **THEN** 该 List.Item 不渲染分割线

#### Scenario: Default divider is inset
- **WHEN** List 和 List.Item 都未传入 divider
- **THEN** List.Item 渲染 inset 分割线

### Requirement: List uses tokenized size styles
`List` 和 `List.Item` SHALL 通过 `AliasToken` 和 `createUseSheetStyle` 实现 `size` 对行高、内距、文本密度和插槽间距的影响。

#### Scenario: Item inherits List size
- **WHEN** List 设置 `size="large"` 且 List.Item 未设置 size
- **THEN** List.Item 使用 large 对应的行高和内距 token 映射

#### Scenario: Item size overrides List size
- **WHEN** List 设置 `size="large"` 且 List.Item 设置 `size="small"`
- **THEN** List.Item 使用 small 对应的行高和内距 token 映射

### Requirement: List exposes stable style slots
`List` 和 `List.Item` SHALL 支持根样式与声明过的内部 slot 样式覆盖，并保持默认 token 样式先于外部样式合并。

#### Scenario: List root and region styles are applied
- **WHEN** 调用方传入 `List.style` 和 `List.styles`
- **THEN** 根样式应用到 List 根元素，内部区域样式合并到对应 slot token 样式之后

#### Scenario: Item root and slot styles are applied
- **WHEN** 调用方传入 `List.Item.style` 和 `List.Item.styles`
- **THEN** 根样式应用到 item 根元素，内部 slot 样式合并到对应 token 样式之后

#### Scenario: Item state styles are applied after base slot styles
- **WHEN** 调用方传入 selected、disabled 或 pressed 状态 slot 样式
- **THEN** 对应状态样式在基础 item 样式之后生效
