# Input 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. 值变更 API 使用 `onChangeText`，未按组件规范提供 `onChange`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Input/Input.tsx:242`
- 违反规范：`.claude/rules/component/coding-style.md:39`、`.claude/rules/component/coding-style.md:40`
- 不符合点：规范要求值或主要值统一使用 `value`、`onChange` 和 `defaultValue`，并以 `useControllableValue(props.defaultValue, props.value, props.onChange)` 处理可控/非可控。Input 当前从 props 解构 `onChangeText`，并在 `useControllableValue(defaultValue ?? '', value, onChangeText)` 中作为主值变更回调使用；`SearchInput` 也在 `packages/pennyspring-ui/src/Input/Input.tsx:386` 使用同样模式。测试也固定验证 `onChangeText` 行为，例如 `packages/pennyspring-ui/__tests__/Input.test.tsx:72` 和 `packages/pennyspring-ui/__tests__/Input.test.tsx:84`。
- 影响：Input 作为共享输入类组件的受控 API 与项目统一组件 API 不一致，调用方需要记忆 React Native `TextInput` 的 `onChangeText` 特例；后续与 `DisplayInput`、`Textarea`、`CalculatorInput` 等输入类组件组合时，主要值回调语义容易漂移。
- 推荐纠正方案：在 `InputProps` 中显式定义 `onChange?: (value: string) => void`，并从继承的 `TextInputProps` 中排除 `onChange` / `onChangeText` 等会冲突的底层值变更入口；实现中改为 `useControllableValue(defaultValue ?? '', value, onChange)`。如需兼容底层事件，可另设语义清晰的内部或透传 prop，但主值 API 应以 `onChange` 为准，并补充 `value/onChange/defaultValue` 受控和非受控测试。

### 2. `label` 同时承载文本和自定义节点，未拆分为文本 prop 与节点插槽

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Input/types.ts:60`
- 违反规范：`.claude/rules/component/coding-style.md:52`、`.claude/rules/component/coding-style.md:55`、`.claude/rules/component/coding-style.md:56`
- 不符合点：规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，且 `xxxText` 只能是 `string`，需要允许调用方用 `null` 控制不渲染时再提供节点 prop。Input 当前只提供 `label?: ReactNode`，既可传字符串也可传自定义节点；实现中又直接渲染为 `<Text ...>{label}</Text>`，见 `packages/pennyspring-ui/src/Input/Input.tsx:292`，没有 `labelText?: string` 与 `label?: ReactNode | null` 的分离语义。
- 影响：公共 API 无法区分“标签文本”和“自定义标签节点”，也无法用 `label={null}` 明确压制默认文本标签结构；自定义节点被包进项目 `Text` 组件后，还可能导致调用方节点结构与样式插槽语义不稳定。
- 推荐纠正方案：将标签 API 调整为 `labelText?: string` 与 `label?: ReactNode | null` 的组合，`labelText` 只负责内部 `Text` 渲染，`label` 作为自定义节点插槽并支持 `null` 表示明确不渲染。同步调整 `styles` 插槽命名，确保文本样式只作用于 `labelText` 渲染出的文本。

### 3. `Input.Search` 的搜索图标按钮缺少 `hitSlop`

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Input/Input.tsx:447`
- 违反规范：`.claude/rules/common/component-visual-layout.md:26`、`.claude/rules/common/component-visual-layout.md:53`
- 不符合点：视觉与布局规范要求可点击区域优先保证 `controlHeight` 或 `hitSlop`，且小图标按钮必须提供足够的 `hitSlop`。Input 的清除按钮在 `packages/pennyspring-ui/src/Input/Input.tsx:331` 使用了 `hitSlop`，但 `Input.Search` 的搜索按钮同样是只含搜索图标的小型 `Pressable`，在 `packages/pennyspring-ui/src/Input/Input.tsx:447` 至 `packages/pennyspring-ui/src/Input/Input.tsx:455` 未设置 `hitSlop`。
- 影响：搜索触发区域与清除按钮的交互容错不一致，小尺寸输入框中搜索图标较难准确点击，影响输入类控件的移动端操作体验。
- 推荐纠正方案：为搜索按钮补充与清除按钮一致的 `hitSlop`，并优先从主题 token 或统一交互尺寸常量推导，不硬编码新数值；补充测试或结构断言，覆盖 `Input.Search` 搜索按钮具备点击区域配置。

## 需要人工确认

- 无
