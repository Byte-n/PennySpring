# grid-component Specification

## Purpose

提供基础网格布局组件，负责固定列布局、项目间距、数据渲染和 Grid.Item 内容承载。

## Requirements

### Requirement: Grid provides fixed column layout
`Grid` 组件 SHALL 按明确列数生成稳定网格布局，并在列数缺失或不可用时使用组件默认列数。

#### Scenario: Data is grouped by configured columns
- **WHEN** 调用方传入 `columns={3}` 和 5 条 `data`
- **THEN** Grid 渲染 2 行项目结构，第一行包含 3 个项目，第二行包含 2 个项目

#### Scenario: Columns below one are normalized
- **WHEN** 调用方传入 `columns={0}` 和多条 `data`
- **THEN** Grid 使用 1 列布局渲染项目，不产生不可用列宽

#### Scenario: Default columns are applied
- **WHEN** 调用方未传入 `columns`
- **THEN** Grid 使用组件默认列数渲染数据项目

### Requirement: Grid renders data through renderCell
`Grid` 组件 SHALL 在数据模式下按输入数据顺序调用 `renderCell`，并将调用方返回的节点承载在网格项目中。

#### Scenario: Data cells render in order
- **WHEN** 调用方传入 `data` 和 `renderCell`
- **THEN** Grid 按数据原始顺序渲染所有单元格内容

#### Scenario: Custom keys are used when provided
- **WHEN** 调用方传入 `keyExtractor`
- **THEN** Grid 使用 `keyExtractor(data, index)` 的返回值作为对应项目 key

#### Scenario: Index keys are used by default
- **WHEN** 调用方未传入 `keyExtractor`
- **THEN** Grid 使用数据索引作为稳定兜底 key

### Requirement: Grid children take precedence
`Grid` 组件 SHALL 在 `children` 和 `data` 同时存在时优先渲染 `children`，不再调用 `renderCell` 渲染数据项。

#### Scenario: Children override data rendering
- **WHEN** 调用方同时传入 `children`、`data` 和 `renderCell`
- **THEN** Grid 渲染 `children` 内容，并且不渲染 `renderCell` 返回的内容

### Requirement: Grid.Item carries custom content
`Grid.Item` 子组件 SHALL 只负责承载调用方传入的内容，不内置业务内容、选中状态、禁用状态或点击逻辑。

#### Scenario: Grid.Item renders supplied children
- **WHEN** 调用方在 `Grid.Item` 内传入自定义节点
- **THEN** Grid.Item 渲染该节点内容

#### Scenario: Grid.Item does not bind press behavior
- **WHEN** 调用方渲染 `Grid.Item`
- **THEN** Grid.Item 不声明按钮角色或 press 事件

### Requirement: Grid uses tokenized size styles
`Grid` 和 `Grid.Item` SHALL 通过 `AliasToken` 和 `createUseSheetStyle` 实现 `size` 对项目间距和内容内距的影响。

#### Scenario: Grid size changes item spacing
- **WHEN** 调用方分别以 `small`、`normal`、`large` 渲染 Grid
- **THEN** Grid 使用对应 token 映射改变项目间距

#### Scenario: Grid.Item size changes content padding
- **WHEN** 调用方分别以 `small`、`normal`、`large` 渲染 Grid.Item
- **THEN** Grid.Item 使用对应 token 映射改变内容内距

#### Scenario: Grid.Item inherits Grid size in data mode
- **WHEN** Grid 通过 `data + renderCell` 渲染项目并设置 `size`
- **THEN** 数据项目内部的 Grid.Item 使用 Grid 的 `size`

### Requirement: Grid exposes stable style slots
`Grid` 和 `Grid.Item` SHALL 支持根样式与声明过的内部插槽样式覆盖，并保持默认 token 样式先于外部样式合并。

#### Scenario: Grid root style is applied
- **WHEN** 调用方传入 `Grid.style`
- **THEN** 样式被应用到 Grid 根元素

#### Scenario: Grid row style slot is applied
- **WHEN** 调用方传入 `Grid.styles.row`
- **THEN** 样式被合并到行容器 token 样式之后

#### Scenario: Grid item wrapper style slot is applied
- **WHEN** 调用方传入 `Grid.styles.itemWrapper`
- **THEN** 样式被合并到项目外层占位 token 样式之后

#### Scenario: Grid.Item content style slot is applied
- **WHEN** 调用方传入 `Grid.Item` 的 `styles.content`
- **THEN** 样式被合并到项目内容容器 token 样式之后
