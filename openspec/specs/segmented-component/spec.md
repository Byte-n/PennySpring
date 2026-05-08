## Requirements

### Requirement: Segmented API
`Segmented` 组件 SHALL 在 `packages/component` 中导出，并支持 `SegmentedValue`、`SegmentedOption`、`SegmentedLabeledOption` 和 `SegmentedProps` 公共类型。`SegmentedValue` SHALL 为 `string | number`。`SegmentedProps` MUST 支持 `options`、`value`、`defaultValue`、`onChange`、`disabled`、`block`、`size`、`style` 和 `styles`。

#### Scenario: 包入口导出
- **WHEN** 调用方从 `@pennyspring/component` 导入 `Segmented`
- **THEN** 组件和相关公共类型可通过包入口获得

#### Scenario: 支持 raw option
- **WHEN** `options` 包含字符串或数字 raw option
- **THEN** raw option 自身作为 `value` 和显示 label

#### Scenario: 支持 labeled option
- **WHEN** `options` 包含带 `label`、`value`、`disabled` 或 `icon` 的对象
- **THEN** 组件按对象字段渲染和处理该选项

### Requirement: 选择行为
`Segmented` SHALL 支持受控和非受控模式。点击可选且未选中的选项 MUST 触发 `onChange(value)`；点击已选中选项、组件禁用或选项禁用时 MUST NOT 触发 `onChange`。

#### Scenario: 非受控选择
- **WHEN** 组件使用 `defaultValue` 渲染并点击另一个可选项
- **THEN** 组件内部选中值更新并调用 `onChange` 一次

#### Scenario: 受控选择
- **WHEN** 组件使用 `value` 渲染并点击另一个可选项
- **THEN** 组件调用 `onChange`，但选中视觉由外部传入的新 `value` 决定

#### Scenario: 重复点击当前项
- **WHEN** 用户点击当前已选中选项
- **THEN** 组件不调用 `onChange`

#### Scenario: 禁用阻止选择
- **WHEN** 组件级 `disabled` 为 true 或目标选项 `disabled` 为 true
- **THEN** 点击该选项不调用 `onChange` 且不改变选中值

### Requirement: 视觉和布局
`Segmented` SHALL 呈现由 token 驱动的 segmented control 外观，包括外层轨道、选项内容、selected 状态、disabled 状态和 pressed 状态。`block=true` 时根容器 SHALL 撑满父容器宽度。带 `icon` 的 labeled option SHALL 横向渲染 icon 与可选 label。

#### Scenario: block 布局
- **WHEN** `block` 为 true
- **THEN** 根容器宽度使用撑满父容器的布局

#### Scenario: icon 与 label 排列
- **WHEN** labeled option 同时包含 `icon` 和 `label`
- **THEN** icon 与 label 在选项内容中横向排列

#### Scenario: token 驱动状态
- **WHEN** 选项处于 selected、pressed 或 disabled 状态
- **THEN** 对应视觉状态由 `createUseSheetStyle` 和 `@pennyspring/theme` token 样式表达
