# DateTimePicker 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 无值场景下 `placeholder` 被内部默认日期覆盖

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DateTimePicker/DateTimePicker.tsx:321`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 公共 API
- 不符合点：输入类组件必须显式支持 `placeholder`。DateTimePicker 虽然在 `types.ts:72` 声明了 `placeholder?: string`，并在 `DateTimePicker.tsx:356` 传给 Picker，但 `DateTimePicker.tsx:321-323` 在调用方没有传 `defaultValue` 时仍把 `baseDate` 转成 `defaultPickerValue`，随后 `DateTimePicker.tsx:339` 无条件传给 Picker。Picker 会把 `defaultValue` 作为主值初始化（`packages/pennyspring-ui/src/Picker/Picker.tsx:135-151`），并把格式化后的主值传给触发输入（`packages/pennyspring-ui/src/Picker/Picker.tsx:272-274`），因此无值时触发器也会显示当前日期时间而不是 placeholder。
- 影响：调用方传入 `placeholder` 也无法表达“尚未选择日期时间”的状态，表单用户体验与输入组件 API 语义不一致。
- 推荐纠正方案：区分“触发器主值”和“弹层初始候选值”。无 `value/defaultValue` 时不要给 Picker 的 `defaultValue` 填入当前日期；如需打开弹层时默认聚焦当前时间，应在 DateTimePicker 或 Picker 层新增内部 draft 初始值机制，并补充 placeholder 行为测试。

### 2. 缺少输入类组件必需的 `readonly` API

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DateTimePicker/types.ts:42`
- 违反规范：`.claude/rules/component/coding-style.md` 公共 API
- 不符合点：规范要求输入类组件必须显式支持 `placeholder`、`readonly` 和 `disabled`。DateTimePickerProps 仅提供 `placeholder?: string`（`types.ts:72`）和 `disabled?: boolean`（`types.ts:74`），没有 `readonly?: boolean`；实现中也只向 Picker 传递 `disabled`（`DateTimePicker.tsx:340`），没有向 Picker 传递其已支持的 `readonly`（`packages/pennyspring-ui/src/Picker/types.ts:194`、`packages/pennyspring-ui/src/Picker/Picker.tsx:122`）。
- 影响：调用方无法让 DateTimePicker 呈现只读但非禁用的表单状态，只能用 `disabled` 替代，导致交互语义和视觉状态错误。
- 推荐纠正方案：在 `DateTimePickerProps` 中增加 `readonly?: boolean`，传递给内部 `Picker`，并增加测试验证 readonly 状态下触发器不会打开弹层且 disabled 语义不被误用。

### 3. 缺少 `size` API，无法传递表单控件尺寸语义

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DateTimePicker/types.ts:42`
- 违反规范：`.claude/rules/component/coding-style.md` 尺寸 API；`.claude/rules/common/component-visual-layout.md` Size 与间距 Token
- 不符合点：DateTimePicker 是选择器/输入类表单控件，内部直接复用支持 `size?: ComponentSize` 的 Picker（`packages/pennyspring-ui/src/Picker/types.ts:172`）和 DisplayInput（`packages/pennyspring-ui/src/DisplayInput/types.ts:22`），但 DateTimePickerProps 未声明 `size`，`DateTimePicker.tsx:335-377` 也未向 Picker 传递尺寸。规范要求交互控件、展示控件、表单控件等存在明确尺寸语义的组件应提供 `size`，且只支持 `small`、`normal`、`large`，默认 `normal`。
- 影响：DateTimePicker 无法与同一表单中的 Input、DisplayInput、Picker 等组件保持尺寸一致；调用方只能尝试通过 `style/styles` 覆盖内部视觉，增加布局和 token 违规风险。
- 推荐纠正方案：在 `DateTimePickerProps` 中增加 `size?: ComponentSize`，默认交由 Picker 的 `normal` 处理，并将 `size={props.size}` 传给内部 Picker；补充 small/normal/large 透传测试或快照级行为断言。

### 4. `styles` 直接复用底层 PickerStyles，且未导出 DateTimePicker 自身样式类型

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/DateTimePicker/types.ts:78`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出；`.claude/rules/component/coding-style.md` 样式 API
- 不符合点：规范要求公共 props 与导出的样式类型放在组件目录的 `types.ts`，且 `styles` 类型由当前组件的对外语义定义，不直接复用底层实现组件的 `styles` 类型。DateTimePicker 当前把 `styles?: PickerStyles` 暴露为公共 API（`types.ts:7-8`、`types.ts:78`），目录导出也没有 `DateTimePickerStyles`（`packages/pennyspring-ui/src/DateTimePicker/index.ts:2-8`，包级导出同样只导出 Props 和参数类型）。
- 影响：DateTimePicker 的外部样式 API 被绑定到 Picker 的内部结构，后续替换实现或调整语义插槽会破坏兼容性，也无法在组件目录中形成清晰的 DateTimePicker 样式契约。
- 推荐纠正方案：定义并导出 `DateTimePickerStyles`，用 DateTimePicker 的语义插槽描述可覆盖区域；内部再显式映射到 Picker 的 `styles`，避免直接把底层实现类型暴露给调用方。

## 需要人工确认

- 无
