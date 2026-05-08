## ADDED Requirements

### Requirement: Badge renders badge content
Badge 组件 SHALL 支持通过 `count`、`text` 或 `dot` 展示徽标内容，并 MUST 使用组件库内部 `Text` 组件渲染文本内容。

#### Scenario: Render count content
- **WHEN** 调用方传入 `count={8}`
- **THEN** Badge 展示文本 `8`

#### Scenario: Render text content
- **WHEN** 调用方传入 `text="NEW"` 与 `count={8}`
- **THEN** Badge 展示文本 `NEW`

#### Scenario: Render dot content
- **WHEN** 调用方传入 `dot={true}`、`text="NEW"` 与 `count={8}`
- **THEN** Badge 展示 dot 小点且不展示 `NEW` 或 `8`

### Requirement: Badge applies count visibility rules
Badge 组件 SHALL 支持 `maxCount` 溢出显示与 `showZero` 零值展示控制。

#### Scenario: Render overflow count
- **WHEN** 调用方传入 `count={120}` 与 `maxCount={99}`
- **THEN** Badge 展示文本 `99+`

#### Scenario: Hide zero by default
- **WHEN** 调用方传入 `count={0}` 且未传入 `showZero`
- **THEN** Badge 不展示徽标内容

#### Scenario: Show zero when enabled
- **WHEN** 调用方传入 `count={0}` 与 `showZero={true}`
- **THEN** Badge 展示文本 `0`

### Requirement: Badge supports children overlay and standalone mode
Badge 组件 SHALL 在存在 `children` 时将徽标叠加在 children 右上角，并在没有 `children` 时作为独立徽标展示。

#### Scenario: Overlay badge on children
- **WHEN** 调用方传入 children 与 `count={3}`
- **THEN** Badge 同时渲染 children 与右上角叠加徽标

#### Scenario: Render standalone badge
- **WHEN** 调用方不传入 children 且传入 `text="HOT"`
- **THEN** Badge 渲染独立徽标内容

### Requirement: Badge supports size and color semantics
Badge 组件 SHALL 支持 `size`、`status` 与 `color`，并 MUST 通过 `@pennyspring/theme` token 构建视觉样式。

#### Scenario: Apply size styles
- **WHEN** 调用方分别传入 `size="small"`、`size="normal"` 与 `size="large"`
- **THEN** Badge 使用对应 token 尺寸渲染不同高度的徽标

#### Scenario: Apply status color
- **WHEN** 调用方传入 `status="success"`
- **THEN** Badge 使用 success 语义 token 渲染徽标背景

#### Scenario: Color overrides status
- **WHEN** 调用方同时传入 `status="success"` 与 `color="error"`
- **THEN** Badge 使用 error 语义 token 渲染徽标背景

### Requirement: Badge supports disabled and stable style slots
Badge 组件 SHALL 支持 `disabled`、根 `style` 与稳定 `styles` slot 覆盖点，slot MUST 包含 `root`、`badge`、`text`、`dot`、`children`。

#### Scenario: Apply disabled styles
- **WHEN** 调用方传入 `disabled={true}` 与 `count={5}`
- **THEN** Badge 以 disabled token 样式展示徽标

#### Scenario: Apply style slots
- **WHEN** 调用方传入 `style` 与 `styles.root`、`styles.children`、`styles.badge`、`styles.text`、`styles.dot`
- **THEN** Badge 将这些覆盖样式应用到对应稳定 slot
