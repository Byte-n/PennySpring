# input-component Specification

## Purpose

提供基础单行文本输入组件，负责输入结构、值控制、清除行为、状态展示、可访问性语义、尺寸映射和样式覆盖。

## Requirements

### Requirement: 单行输入结构
`Input` SHALL render a single-line text input with optional label, placeholder, helper text, error text, prefix, suffix, loading feedback, and clear button slots.

#### Scenario: 渲染标签和辅助说明
- **WHEN** caller renders `Input` with `label`, `placeholder`, and `helperText`
- **THEN** the label SHALL render separately from the placeholder and the helper text SHALL render near the field

#### Scenario: 渲染前后缀
- **WHEN** caller provides `prefix` and `suffix`
- **THEN** `Input` SHALL render the prefix before the text input and the suffix on the right side when clear and loading feedback are not active

### Requirement: 值控制
`Input` SHALL support controlled `value` and uncontrolled `defaultValue` text flows.

#### Scenario: 非受控输入更新内部值
- **WHEN** caller renders `Input` with `defaultValue` and user changes text
- **THEN** `Input` SHALL update the displayed value and call `onChangeText` with the new text

#### Scenario: 受控输入由 value 决定
- **WHEN** caller renders `Input` with `value`
- **THEN** the displayed text SHALL come from `value`, and user text changes SHALL notify `onChangeText` without mutating the controlled value internally

### Requirement: 清除行为
`Input` SHALL support an optional clear button that clears editable non-empty values and calls the appropriate callback.

#### Scenario: 清除非受控值
- **WHEN** caller renders a clearable uncontrolled `Input` with text and presses the clear button
- **THEN** `Input` SHALL clear the displayed value and call `onClear` when provided

#### Scenario: 清除回退到 onChangeText
- **WHEN** caller renders a clearable `Input` without `onClear` and presses the clear button
- **THEN** `Input` SHALL call `onChangeText` with an empty string

#### Scenario: 不可编辑时隐藏清除按钮
- **WHEN** `Input` is disabled, readonly, loading, or empty
- **THEN** the clear button SHALL NOT be rendered

### Requirement: 状态展示
`Input` SHALL represent default, focused, error, warning, success, disabled, readonly, and loading states without executing validation.

#### Scenario: 错误文本优先
- **WHEN** `status` is `error` and `errorText` exists
- **THEN** `Input` SHALL render `errorText` and hide normal `helperText`

#### Scenario: 非错误状态不使用错误文本替代 helper
- **WHEN** `errorText` exists but `status` is not `error`
- **THEN** `Input` SHALL NOT render `errorText` as the message

#### Scenario: 禁用和只读不可编辑
- **WHEN** `disabled` or `readonly` is true
- **THEN** the native text input SHALL be non-editable

### Requirement: 可访问性
`Input` SHALL expose accessible input and clear button semantics.

#### Scenario: 标签推导可访问名称
- **WHEN** `label` is a string and `accessibilityLabel` is omitted
- **THEN** the text input SHALL use the label as its accessible name

#### Scenario: 可访问状态
- **WHEN** `Input` is disabled, loading, or in error status
- **THEN** the text input SHALL expose corresponding accessibility state

#### Scenario: 清除按钮语义
- **WHEN** the clear button is rendered
- **THEN** it SHALL have `accessibilityRole="button"` and an explicit `accessibilityLabel`

### Requirement: Token 样式与尺寸
`Input` SHALL build visual styles through `@pennyspring/theme` token APIs and support `small`, `normal`, and `large` sizes.

#### Scenario: 尺寸映射控件样式
- **WHEN** caller renders `Input` with each supported size
- **THEN** the field height, padding, and text sizing SHALL come from token-based size mappings

#### Scenario: 插槽样式合并
- **WHEN** caller provides `style` and `styles`
- **THEN** root style SHALL affect only the root and slot styles SHALL apply only to documented internal slots with state styles merged after shared slot styles
