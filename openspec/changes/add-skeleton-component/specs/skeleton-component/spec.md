## ADDED Requirements

### Requirement: Skeleton exposes token-driven loading placeholders
组件库 SHALL 提供 `Skeleton` 组件，用于渲染内容加载占位。组件 MUST 支持 `size?: SkeletonSize`，其中 `SkeletonSize` 仅包含 `small | normal | large`，默认值为 `normal`。组件 MUST 支持 `style` 根样式覆盖，默认视觉、间距、圆角、颜色和尺寸 MUST 由 `AliasToken` 通过 `createUseSheetStyle` 驱动。

#### Scenario: Default block placeholder
- **WHEN** `Skeleton` 使用默认 props 渲染
- **THEN** 它渲染一个 normal 尺寸的块状占位，并应用 token 派生的根样式和块状样式

#### Scenario: Size maps to token dimensions
- **WHEN** `Skeleton` 分别使用 `small`、`normal` 和 `large` 尺寸渲染
- **THEN** 占位尺寸、间距和圆角随 size 映射到对应 token 派生样式

### Requirement: Skeleton supports avatar block and text variants
组件 SHALL 支持 `variant="block" | "avatar" | "text"`。`block` SHALL 渲染基础矩形占位；`avatar` SHALL 渲染圆形头像占位；`text` SHALL 渲染可选标题和多行段落占位。`text` 的段落行数 SHALL 通过 `rows` 控制，并对非正数、非整数或非有限数值归一为默认行数。

#### Scenario: Avatar variant renders circular placeholder
- **WHEN** `Skeleton` 使用 `variant="avatar"` 渲染
- **THEN** 它渲染一个宽高相等且圆角等于尺寸的头像占位

#### Scenario: Text variant renders title and rows
- **WHEN** `Skeleton` 使用 `variant="text"`、`title` 和 `rows={2}` 渲染
- **THEN** 它渲染标题占位和两行段落占位

#### Scenario: Invalid rows use default
- **WHEN** `Skeleton` 使用 `variant="text"` 且 `rows` 为无效数值
- **THEN** 它渲染默认数量的段落占位

### Requirement: Skeleton supports active animation
组件 SHALL 支持 `active?: boolean` 控制骨架动画。`active` 为 true 时，组件 SHALL 使用 token 驱动的动效时长、缓动和颜色表达加载反馈；`active` 为 false 时 SHALL 渲染静态占位且不启动动画。

#### Scenario: Active true renders animated placeholders
- **WHEN** `Skeleton` 使用 `active` 渲染
- **THEN** 占位节点使用 animated 渲染路径，并以 token 驱动样式展示加载反馈

#### Scenario: Active false renders static placeholders
- **WHEN** `Skeleton` 使用 `active={false}` 渲染
- **THEN** 占位节点使用静态渲染路径

### Requirement: Skeleton supports loading wrapper behavior and slot styles
组件 SHALL 支持 `loading?: boolean` 和 `children`。当 `loading` 为 false 且存在 `children` 时，组件 SHALL 直接渲染 `children`。当 `loading` 为 true 或未提供 `children` 时，组件 SHALL 渲染骨架占位。组件 SHALL 支持 `styles` 覆盖声明的内部插槽，且外部样式 SHALL 在 token 样式之后合并。

#### Scenario: Loading false renders children
- **WHEN** `Skeleton` 接收 `loading={false}` 和 `children`
- **THEN** 它渲染 `children` 而不是骨架占位

#### Scenario: Slot styles merge after token styles
- **WHEN** `Skeleton` 接收 `style` 和内部 slot styles
- **THEN** 根样式和 slot 样式均应用在对应节点，并位于 token 样式之后
