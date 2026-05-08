# calendar-component Specification

## Purpose
TBD - created by archiving change add-calendar-component. Update Purpose after archive.
## Requirements
### Requirement: Calendar 提供单值年、月、日选择
Calendar SHALL provide a `Calendar` component that selects one value in `date`, `month`, or `year` mode. Public values MUST be strings formatted as `YYYY-MM-DD`, `YYYY-MM`, or `YYYY` according to mode. The component MUST support controlled `value`, uncontrolled `defaultValue`, and `onChange`.

#### Scenario: 非受控日期选择
- **WHEN** 用户在 `mode="date"` 的非受控 Calendar 中选择一个可用日期
- **THEN** Calendar MUST update the displayed selected date and call `onChange` with `YYYY-MM-DD`

#### Scenario: 受控月份选择
- **WHEN** 用户在 `mode="month"` 的受控 Calendar 中选择一个可用月份
- **THEN** Calendar MUST call `onChange` with `YYYY-MM` without replacing the displayed controlled value until props change

#### Scenario: 年份选择
- **WHEN** 用户在 `mode="year"` 的 Calendar 中选择一个可用年份
- **THEN** Calendar MUST call `onChange` with `YYYY`

### Requirement: Calendar.Range 提供完整范围选择
Calendar SHALL expose `Calendar.Range` for selecting complete `[start, end]` ranges in `date`, `month`, or `year` mode. Public range values MUST be ordered tuples whose item format follows mode. Half-selected ranges MUST remain internal only.

#### Scenario: 日期范围按时间顺序提交
- **WHEN** 用户先选择较晚日期再选择较早日期
- **THEN** Calendar.Range MUST submit `[earlier, later]` to `onChange`

#### Scenario: 范围半选不提交
- **WHEN** 用户只点击范围起点
- **THEN** Calendar.Range MUST show the draft start state but MUST NOT call `onChange`

#### Scenario: 月份范围提交
- **WHEN** 用户在 `mode="month"` 的 Calendar.Range 中选择两个可用月份
- **THEN** Calendar.Range MUST call `onChange` with `[YYYY-MM, YYYY-MM]`

### Requirement: 禁用规则限制不可选值
Calendar SHALL treat values outside `minDate` and `maxDate`, values rejected by `disabledDate`, and all values when `disabled` is true as disabled. Disabled values MUST not trigger selection callbacks.

#### Scenario: minDate 和 maxDate 阻止越界选择
- **WHEN** 用户点击小于 `minDate` 或大于 `maxDate` 的单元格
- **THEN** Calendar MUST not call `onChange` and the cell MUST expose disabled accessibility state

#### Scenario: disabledDate 阻止自定义不可选值
- **WHEN** `disabledDate` returns true for a cell value and the user clicks that cell
- **THEN** Calendar MUST not call `onChange`

#### Scenario: disabled 禁止切换和选择
- **WHEN** Calendar has `disabled={true}` and the user presses navigation or a cell
- **THEN** Calendar MUST keep the panel and value unchanged

#### Scenario: readonly 允许切换但禁止选择
- **WHEN** Calendar has `readonly={true}` and the user presses navigation and then a cell
- **THEN** Calendar MUST allow panel navigation but MUST not call `onChange` for selection

### Requirement: 确认模式延迟提交
Calendar SHALL support `showConfirm`. In confirm mode, selecting values MUST update internal draft state only. Confirmation MUST call both `onChange` and `onConfirm` with the draft value when complete. Cancel MUST discard draft state and call `onCancel`.

#### Scenario: 单值确认后提交
- **WHEN** 用户在 `showConfirm` 的 Calendar 中选择日期并点击确认
- **THEN** Calendar MUST call `onChange` and `onConfirm` with the selected date

#### Scenario: 单值取消丢弃草稿
- **WHEN** 用户在 `showConfirm` 的 Calendar 中选择日期并点击取消
- **THEN** Calendar MUST restore the committed selection and call `onCancel`

#### Scenario: 范围确认只提交完整草稿
- **WHEN** 用户在 `showConfirm` 的 Calendar.Range 中只选择起点并点击确认
- **THEN** Calendar.Range MUST NOT call `onChange` or `onConfirm`

### Requirement: 面板、今天操作和标记展示
Calendar SHALL render a header with previous/next panel controls and a title, a stable grid, optional week header for date mode, date marks for `date` mode, and optional today action. Today action MUST switch to today's panel and select today's value according to mode when selectable.

#### Scenario: 切换面板不改变选择值
- **WHEN** 用户点击上一个或下一个面板按钮
- **THEN** Calendar MUST update only the internal panel and MUST NOT call `onChange`

#### Scenario: 今天操作选择当前精度值
- **WHEN** `showToday` is true and the user presses today
- **THEN** Calendar MUST switch to today's panel and submit today's date, month, or year value according to mode if selectable

#### Scenario: 日期标记仅作用于 date mode
- **WHEN** `marks` contains a date matching a visible date cell in `mode="date"`
- **THEN** Calendar MUST render mark content for that cell without changing its value text

### Requirement: 格式化预设和自定义格式化
Calendar SHALL support built-in format presets `date`, `dateSlash`, `month`, `monthSlash`, `year`, `displayDate`, `displayMonth`, and `displayYear`, plus custom format functions. Formatting MUST apply to individual values only; Calendar.Range MUST combine formatted start and end values.

#### Scenario: 内置斜杠日期格式
- **WHEN** Calendar receives `format="dateSlash"` and value `2026-05-07`
- **THEN** the selected value display MUST include `2026/05/07`

#### Scenario: 自定义格式函数
- **WHEN** Calendar receives a custom `format` function
- **THEN** Calendar MUST use the function result for selected value display

#### Scenario: Range 分别格式化起止值
- **WHEN** Calendar.Range receives a range and `format="monthSlash"`
- **THEN** it MUST display formatted start and end values as a range

### Requirement: 样式插槽和可访问性语义
Calendar SHALL expose the documented `CalendarStyles` slots and use token-driven defaults. Selectable cells MUST use button semantics. Selected, disabled, today, and range states MUST be available through accessibility state or labels and MUST not rely on color alone.

#### Scenario: 样式插槽可覆盖稳定内部元素
- **WHEN** Calendar receives `styles` for documented slots
- **THEN** those styles MUST be merged into the corresponding header, title, week header, grid, cell, state cell, text, mark, and footer slots

#### Scenario: 可交互单元格具有语义状态
- **WHEN** Calendar renders selected, disabled, and today cells
- **THEN** cells MUST expose button role and selected, disabled, or descriptive accessibility metadata

