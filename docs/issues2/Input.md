# Input 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Label、必填标记和辅助/错误文本优先通过 style 控制颜色

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Input/Input.tsx:259`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：label 使用 `<Text style={[tokenStyles.labelText, styles?.labelText]}>`，必填标记使用 `<Text style={tokenStyles.requiredMark}>`，辅助/错误文本使用 `tokenStyles.helper` 或 `tokenStyles.error`；这些样式在 `Input.tsx:104` 到 `Input.tsx:108`、`Input.tsx:171` 到 `Input.tsx:175` 中通过 token 设置颜色。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：输入组件的标签、状态提示色绕过 `Text` 语义，容易与 DisplayInput、Textarea 等表单控件产生漂移。
- 推荐纠正方案：label 使用 `Text color="label"`，必填标记使用错误色语义，helper/error 使用 `Text` 的语义 color props；样式仅保留额外布局属性。

### 2. 表单字段结构使用 View 手写布局

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Input/Input.tsx:296`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`InputRoot` 使用 `View` 承载根、labelRow、field、prefix、suffix，并在 `Input.tsx:96` 到 `Input.tsx:120` 手写 `flexDirection: 'row'`、`gap`、`alignItems` 等布局。项目规范要求界面布局优先使用 `Row`、`Column`、`Space` 等已有布局组件，避免用 `View` 手写等效布局结构。
- 影响：核心表单控件的布局语义不通过共享布局组件表达，后续与 DisplayInput、Textarea 等控件统一布局时维护成本较高。
- 推荐纠正方案：根结构使用 `Column`，label 与 field 内容使用 `Row`；TextInput 本身保留输入职责，prefix/suffix 容器用布局组件表达。

## 需要人工确认

- 无
