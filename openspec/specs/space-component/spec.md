# space-component Specification

## Purpose

提供基础间距布局组件，负责子项方向、对齐、分布、换行、块级占位和 token 驱动间距。

## Requirements

### Requirement: Space arranges children by direction
`Space` 组件 SHALL 按配置方向排列有效子项，并在未配置方向时使用横向布局。

#### Scenario: Horizontal direction is the default
- **WHEN** 调用方渲染多个有效 children 且未传入 `direction`
- **THEN** Space 使用横向排列子项

#### Scenario: Vertical direction stacks children
- **WHEN** 调用方传入 `direction="vertical"`
- **THEN** Space 使用纵向排列子项

#### Scenario: Nullish children are ignored
- **WHEN** children 中包含 `null` 或 `undefined`
- **THEN** Space 不为这些值渲染 item 容器

### Requirement: Space applies tokenized size gaps
`Space` 组件 SHALL 通过 `AliasToken` 和 `createUseSheetStyle` 实现 `size` 对子项间距的影响。

#### Scenario: Horizontal size changes item spacing
- **WHEN** 调用方分别以 `small`、`normal`、`large` 渲染横向 Space
- **THEN** Space 使用对应 token 映射改变非最后子项的横向间距

#### Scenario: Vertical size changes item spacing
- **WHEN** 调用方分别以 `small`、`normal`、`large` 渲染纵向 Space
- **THEN** Space 使用对应 token 映射改变非最后子项的纵向间距

### Requirement: Space supports alignment and justification
`Space` 组件 SHALL 将对齐和分布 props 映射到 React Native flexbox 样式。

#### Scenario: Align maps to alignItems
- **WHEN** 调用方传入 `align="center"`
- **THEN** Space 根容器使用居中交叉轴对齐

#### Scenario: Justify maps to justifyContent
- **WHEN** 调用方传入 `justify="between"`
- **THEN** Space 根容器使用两端分布主轴布局

### Requirement: Space supports wrapping and block layout
`Space` 组件 SHALL 支持横向换行和块级占位语义。

#### Scenario: Horizontal wrap adds wrapping behavior
- **WHEN** 调用方传入 `wrap`
- **THEN** 横向 Space 根容器允许换行，并为子项提供纵向换行间距

#### Scenario: Block stretches root container
- **WHEN** 调用方传入 `block`
- **THEN** Space 根容器使用块级 stretch 占位语义

### Requirement: Space exposes stable style slots
`Space` 组件 SHALL 支持根样式与声明过的内部子项样式覆盖，并保持默认 token 样式先于外部样式合并。

#### Scenario: Root style is applied
- **WHEN** 调用方传入 `Space.style`
- **THEN** 样式被应用到 Space 根元素

#### Scenario: Item style slot is applied
- **WHEN** 调用方传入 `Space.styles.item`
- **THEN** 样式被合并到每个 item 容器样式之后

### Requirement: Space has no built-in interaction behavior
`Space` 组件 SHALL 只负责布局，不内置 press 行为或按钮语义。

#### Scenario: Space does not bind press behavior
- **WHEN** 调用方渲染 Space
- **THEN** Space 不声明按钮角色或 press 事件
