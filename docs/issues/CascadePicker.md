# CascadePicker 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 包级导出遗漏 `CascadePickerStyles` ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/index.ts:233`
- 违反规范：`CLAUDE.md` 的组件约束要求共享组件由目录内 `index.ts` 和包级 `src/index.ts` 导出；`.claude/rules/component/coding-style.md` 的“目录与导出”要求公共 props 与导出的样式类型放在组件目录 `types.ts`，并同步从包级导出。
- 不符合点：`CascadePickerStyles` 已作为公共样式类型定义在 `packages/pennyspring-ui/src/CascadePicker/types.ts:15`，并由组件目录 `packages/pennyspring-ui/src/CascadePicker/index.ts:2`-`packages/pennyspring-ui/src/CascadePicker/index.ts:10` 导出。但包级 `packages/pennyspring-ui/src/index.ts:233`-`packages/pennyspring-ui/src/index.ts:241` 只导出了 `CascadePickerChangeParams`、`CascadePickerOkParams`、`CascadePickerOption`、`CascadePickerTab`、`CascadePickerTabKey`、`CascadePickerProps` 和 `CascadePickerValue`，没有同步导出 `CascadePickerStyles`。
- 影响：外部调用方可以使用 `styles?: CascadePickerStyles`（`packages/pennyspring-ui/src/CascadePicker/types.ts:110`），但无法从包级入口直接导入该公共样式类型，和其他公共类型的导出一致性不符。
- 推荐纠正方案：在 `packages/pennyspring-ui/src/index.ts` 的 `CascadePicker` 类型导出列表中补充 `CascadePickerStyles`，并用现有包级导入方式验证类型可用。

### 2. 输入类组件缺少 `readonly` 公共 API ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/CascadePicker/types.ts:103`
- 违反规范：`.claude/rules/component/coding-style.md` 的“公共 API”要求输入类组件必须显式支持 `placeholder`、`readonly` 和 `disabled`；同文件“状态与回调 API”要求可控和非可控状态语义保持一致。
- 不符合点：`CascadePickerProps` 暴露了 `placeholder?: string`（`packages/pennyspring-ui/src/CascadePicker/types.ts:103`）和 `disabled?: boolean`（`packages/pennyspring-ui/src/CascadePicker/types.ts:105`），但没有 `readonly?: boolean`。底层 `PickerProps` 已支持 `readonly?: boolean`（`packages/pennyspring-ui/src/Picker/types.ts:193`-`packages/pennyspring-ui/src/Picker/types.ts:195`），且 `Picker` 会在触发入口中阻止 `readonly` 打开弹窗（`packages/pennyspring-ui/src/Picker/Picker.tsx:171`-`packages/pennyspring-ui/src/Picker/Picker.tsx:178`）。`CascadePicker` 渲染底层 `Picker` 时传递了 `disabled`、`placeholder` 等属性（`packages/pennyspring-ui/src/CascadePicker/CascadePicker.tsx:411`-`packages/pennyspring-ui/src/CascadePicker/CascadePicker.tsx:470`），但没有可传递的 `readonly` 属性。
- 影响：调用方无法把 CascadePicker 设置为只读但仍保持可展示值的输入态，只能使用 `disabled`，导致只读和禁用语义混同；现有测试只覆盖打开、切换、选择、确认、取消、空态等行为（`packages/pennyspring-ui/__tests__/CascadePicker.test.tsx:104`-`packages/pennyspring-ui/__tests__/CascadePicker.test.tsx:368`），没有只读行为保护。
- 推荐纠正方案：在 `CascadePickerProps` 增加 `readonly?: boolean`，渲染 `Picker` 时透传 `readonly={props.readonly}`，并补充测试覆盖 `readonly` 下触发器不会打开弹窗、不会触发 `onOpenChange(true, { reason: 'trigger' })`。

## 需要人工确认

无
