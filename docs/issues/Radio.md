# Radio 组件规范巡检报告

## 结论

发现明确规范违规，需修复后复查。

## 问题列表

### 1. 包级入口遗漏 `RadioGroup` 值导出

- 证据：`packages/pennyspring-ui/src/Radio/index.ts:1` 导出了 `Radio` 和 `RadioGroup`；包级入口 `packages/pennyspring-ui/src/index.ts:189` 只导出 `Radio`，但 `packages/pennyspring-ui/src/index.ts:190` 到 `packages/pennyspring-ui/src/index.ts:199` 已导出 `RadioGroupProps`、`RadioGroupStyles`、`RadioGroupValue` 等类型。
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 的“目录与导出”。
- 不符合点：规范要求共享组件由目录内 `index.ts` 和包级 `src/index.ts` 导出，并保持同步。当前目录入口公开了 `RadioGroup` 值，包级入口只公开了对应类型，调用方无法从包级入口直接导入 `RadioGroup`。

### 2. 样式实现没有按组件规范拆到 `style/index.ts`

- 证据：Radio 目录只有 `packages/pennyspring-ui/src/Radio/Radio.tsx`、`packages/pennyspring-ui/src/Radio/index.ts`、`packages/pennyspring-ui/src/Radio/types.ts`；样式工厂直接定义在 `packages/pennyspring-ui/src/Radio/Radio.tsx:81` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:177`。
- 违反规范：`.claude/rules/component/coding-style.md` 的“目录与导出”。
- 不符合点：规范规定组件样式文件为 `style/index.ts`。当前 Radio 的 token 样式实现集中在组件实现文件中，目录结构不符合组件样式文件约定。

### 3. `RadioGroupOption.label` 同时承载文本和节点，未按文本/节点分离命名

- 证据：`packages/pennyspring-ui/src/Radio/types.ts:37` 到 `packages/pennyspring-ui/src/Radio/types.ts:40` 定义 `label?: ReactNode`；实现中 `packages/pennyspring-ui/src/Radio/Radio.tsx:379` 把 `option.label` 交给 `renderLabel`，而 `renderLabel` 在 `packages/pennyspring-ui/src/Radio/Radio.tsx:184` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:192` 同时支持字符串、数字和自定义节点。
- 违反规范：`.claude/rules/component/coding-style.md` 的“内部渲染节点”；`CLAUDE.md` 组件约束。
- 不符合点：规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，且 `xxxText` 只能是 `string`。当前 `label?: ReactNode` 将文本和节点混在同一个公开字段中，调用方传字符串和传节点走同一个 API，语义不清晰。

### 4. 默认文本视觉优先通过 `Text style` 设置，绕过 Text 语义 props

- 证据：`renderLabel` 在 `packages/pennyspring-ui/src/Radio/Radio.tsx:186` 使用 `<Text size="sm" style={style}>`；传入的 `style` 包含 `tokenStyles.label`、`labelSelected`、`labelDisabled` 和外部 `styles?.label`（`packages/pennyspring-ui/src/Radio/Radio.tsx:304` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:309`、`packages/pennyspring-ui/src/Radio/Radio.tsx:379` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:384`）。默认 `label` 样式在 `packages/pennyspring-ui/src/Radio/Radio.tsx:162` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:168` 直接设置 `fontFamily`、`fontSize`、`lineHeight`、`color`、`fontWeight`。
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 的“内部渲染节点”。
- 不符合点：项目要求展示文本统一使用 `Text`，且 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再用 `style`，禁止优先使用 `style`。Radio 当前把尺寸、颜色、字重和行高主要放进 `style`，并且固定传 `size="sm"` 后再用样式覆盖不同 `size` 的字体。

### 5. 内部插槽样式合并顺序早于运行时状态样式

- 证据：`renderControl` 中 `styles?.control` 位于 `selected`、`disabled` 状态样式之前（`packages/pennyspring-ui/src/Radio/Radio.tsx:225` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:230`），`styles?.indicator` 位于 `indicatorDisabled` 之前（`packages/pennyspring-ui/src/Radio/Radio.tsx:234` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:238`）；label 合并同样把 `styles?.label` 放在 selected/disabled 状态之前（`packages/pennyspring-ui/src/Radio/Radio.tsx:304` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:309`、`packages/pennyspring-ui/src/Radio/Radio.tsx:379` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:384`）。
- 违反规范：`.claude/rules/component/coding-style.md` 的“样式实现”。
- 不符合点：规范要求默认按“token 样式、组件运行时样式、外部样式”合并。当前内部 `styles` 插槽被放在 selected、disabled 等运行时状态之前，导致调用方的语义化内部样式覆盖会被状态样式覆盖，合并优先级与规范不一致。

### 6. RadioGroup 使用原始 `View` 手写等效布局，且 gap 使用 size tokens

- 证据：`packages/pennyspring-ui/src/Radio/Radio.tsx:3` 从 `react-native` 导入 `View`；`group` 样式在 `packages/pennyspring-ui/src/Radio/Radio.tsx:87` 到 `packages/pennyspring-ui/src/Radio/Radio.tsx:93` 手写 `flexDirection`、`alignItems`、`alignSelf`、`gap`；渲染处在 `packages/pennyspring-ui/src/Radio/Radio.tsx:346` 使用 `<View testID="radio-group" style={[tokenStyles.group, style]}>` 作为组布局容器，并在 `packages/pennyspring-ui/src/Radio/Radio.tsx:303`、`packages/pennyspring-ui/src/Radio/Radio.tsx:378` 用 `View` 承载内容行。
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程；`.claude/rules/component/coding-style.md` 适用范围；`.claude/rules/common/component-visual-layout.md` Layout Gap。
- 不符合点：项目要求界面布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid` 或 `GeometryReader` 等已有布局组件，禁止用 `View` 手写等效布局结构。RadioGroup 的横向/纵向排列和内容行属于已有布局组件可表达的布局语义。此外 `group.gap` 使用 `sizeXS`/`sizeSM`（size tokens），而非规范要求的 `marginXXS`/`marginXS`/`marginSM`（spacing tokens）。

## 需要人工确认

- `RadioProps.children?: ReactNode` 目前也同时承载文本和自定义节点，但 `children` 是 React 常见内容 API。本次仅将 `RadioGroupOption.label?: ReactNode` 作为明确违规记录；是否将单个 `Radio` 的内容 API 同步迁移为 `labelText`/`label` 需要 API 兼容性确认。

将单个 `Radio` 的内容 API 同步迁移为 `labelText`/`label`
