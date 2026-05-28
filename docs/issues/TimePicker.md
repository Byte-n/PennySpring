# TimePicker 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 空值状态会被默认当前时间占用，导致 placeholder 失效 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TimePicker/TimePicker.tsx:218`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 公共 API
- 不符合点：输入类组件必须显式支持 `placeholder`。`TimePickerProps` 声明了 `placeholder?: string`（`packages/pennyspring-ui/src/TimePicker/types.ts:57`），实现也传给内部 `Picker`（`TimePicker.tsx:252`），但 `TimePicker.tsx:218-220` 在调用方没有传 `defaultValue` 时仍把 `baseDate` 转成 `defaultPickerValue`。`Picker` 会用 `defaultValue` 初始化主值（`packages/pennyspring-ui/src/Picker/Picker.tsx:135-141`），并把格式化后的主值传给触发输入（`Picker.tsx:149-152`、`Picker.tsx:272-274`），因此无值时触发器显示当前时间而不是 placeholder。
- 影响：表单初始空值会被误呈现为已选择时间，调用方无法用 placeholder 表达“尚未选择”，影响用户理解和表单状态可信度。
- 推荐纠正方案：区分“触发器主值”和“弹层初始候选值”。无 `value/defaultValue` 时不要给 `Picker` 的 `defaultValue` 填入当前时间；如需打开弹层时默认聚焦当前时间，应在 TimePicker 或 Picker 层新增内部 draft 初始值机制，并补充 placeholder 行为测试。

### 2. 输入类组件缺少 readonly API ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TimePicker/types.ts:27`
- 违反规范：`.claude/rules/component/coding-style.md` 公共 API、状态与回调 API
- 不符合点：规范要求输入类组件必须显式支持 `placeholder`、`readonly` 和 `disabled`。TimePicker 只声明了 `placeholder?: string`（`types.ts:57`）和 `disabled?: boolean`（`types.ts:59`），没有 `readonly?: boolean`；实现中只向内部 Picker 传递 `disabled`（`TimePicker.tsx:236`），没有传递 Picker 已支持的 `readonly`（`packages/pennyspring-ui/src/Picker/types.ts:194`、`packages/pennyspring-ui/src/Picker/Picker.tsx:122`）。
- 影响：调用方无法让 TimePicker 呈现只读但非禁用的表单状态，只能用 `disabled` 替代，导致交互语义和视觉状态错误。
- 推荐纠正方案：在 `TimePickerProps` 中增加 `readonly?: boolean`，传递给内部 `Picker`，并增加测试验证 readonly 状态下触发器不会打开弹层且 disabled 语义不被误用。

### 3. 表单选择控件缺少 size API ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TimePicker/types.ts:27`
- 违反规范：`.claude/rules/component/coding-style.md` 尺寸 API
- 不符合点：TimePicker 是选择器/输入类表单控件，内部直接复用支持 `size?: ComponentSize` 的 Picker（`packages/pennyspring-ui/src/Picker/types.ts:172`），但 `TimePickerProps` 未声明 `size`，`TimePicker.tsx:231-273` 也未向 Picker 传递尺寸。规范要求交互控件、展示控件、表单控件等存在明确尺寸语义的组件应提供 `size`，只支持 `small`、`normal`、`large`，默认 `normal`，且内部组件的尺寸语义应随外层传递或映射。
- 影响：TimePicker 无法与同一表单中的 Input、DisplayInput、Picker 等组件保持尺寸一致；调用方只能尝试通过 `style/styles` 覆盖内部视觉，增加布局和 token 违规风险。
- 推荐纠正方案：在 `TimePickerProps` 中增加 `size?: ComponentSize`，默认交由 Picker 的 `normal` 处理，并将 `size={props.size}` 传给内部 Picker；补充 small/normal/large 透传测试或用户可感知行为断言。

### 4. styles 直接复用底层 PickerStyles，且未导出 TimePicker 自身样式类型 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/TimePicker/types.ts:63`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 目录与导出、样式 API
- 不符合点：规范要求公共 props 与导出的样式类型放在组件目录的 `types.ts`，且 `styles` 类型由当前组件的对外语义定义，不直接复用底层实现组件的 `styles` 类型。TimePicker 当前把 `styles?: PickerStyles` 暴露为公共 API（`types.ts:7`、`types.ts:63`），目录导出也没有 `TimePickerStyles`（`packages/pennyspring-ui/src/TimePicker/index.ts:2-8`，包级导出同样只导出 Props 与参数类型）。
- 影响：TimePicker 的外部样式 API 被绑定到 Picker 的内部结构，后续替换实现或调整语义插槽会破坏兼容性，也无法在组件目录中形成清晰的 TimePicker 样式契约。
- 推荐纠正方案：定义并导出 `TimePickerStyles`，用 TimePicker 的语义插槽描述可覆盖区域；内部再显式映射到 Picker 的 `styles`，避免直接把底层实现类型暴露给调用方。

## 需要人工确认

- 无
