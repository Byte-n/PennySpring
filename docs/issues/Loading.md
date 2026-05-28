# Loading 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 文案 API 使用 `text?: ReactNode`，未按文本/节点插槽规范拆分 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Loading/types.ts:13`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点；`CLAUDE.md` 组件约束
- 不符合点：`LoadingProps` 将文案声明为 `text?: ReactNode`，实现中也直接把 `text` 放入项目 `Text` 组件渲染。组件规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText` 且类型只能是 `string`，节点 prop 使用 `xxx?: ReactNode | null`，禁止用一个文本 prop 承载 `string | ReactNode` 语义。
- 影响：调用方无法从类型上区分“加载文案”和“自定义节点”，公共 API 语义不稳定，也会让后续样式、空值语义和文档说明难以保持一致。
- 推荐纠正方案：将公开 API 调整为明确语义，例如 `text?: string` 或 `loadingText?: string`；如需支持自定义节点，增加独立节点插槽如 `content?: ReactNode | null`，并按 `undefined` 走默认、`null` 明确不渲染的规则处理。

### 2. 使用 `View` 手写横向/纵向布局，未复用布局组件 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Loading/Loading.tsx:3`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程；`.claude/rules/component/coding-style.md` 适用范围
- 不符合点：Loading 从 `react-native` 导入 `View`，并在 `packages/pennyspring-ui/src/Loading/Loading.tsx:91`、`packages/pennyspring-ui/src/Loading/Loading.tsx:92` 用 `View` 组合指示器和文案；样式中 `packages/pennyspring-ui/src/Loading/Loading.tsx:61` 至 `packages/pennyspring-ui/src/Loading/Loading.tsx:63` 手写 `alignItems`、`flexDirection` 和 `gap`。项目宪章要求界面布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`GeometryReader`、`Grid` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：Loading 的布局语义与组件库布局原语脱节，横向/纵向间距、尺寸语义和后续布局能力容易与其他组件不一致。
- 推荐纠正方案：根布局按 `vertical` 映射为 `Column` 或 `Row`，通过布局组件的间距能力承载 indicator 与 text 的排列；仅保留 Loading 自身必要的语义样式和外部 `style` 合并。

### 3. `Text` 颜色优先通过 style 覆盖，而不是使用 `TextProps.color` ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Loading/Loading.tsx:104`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点；`.codex/skills/theme-tokens/SKILL.md`
- 不符合点：Loading 在 `packages/pennyspring-ui/src/Loading/Loading.tsx:69` 至 `packages/pennyspring-ui/src/Loading/Loading.tsx:70` 为文案样式设置 `color: token.colorTextSecondary`，再于 `packages/pennyspring-ui/src/Loading/Loading.tsx:104` 至 `packages/pennyspring-ui/src/Loading/Loading.tsx:107` 通过 `style` 传给项目 `Text`。但项目宪章明确要求 `Text` 字号、颜色等优先使用 `TextProps`，其次才是 `style`，且禁止优先使用 `style`；`TextProps` 已在 `packages/pennyspring-ui/src/Text/types.ts:36` 至 `packages/pennyspring-ui/src/Text/types.ts:40` 提供 `color?: TextColor`。
- 影响：绕过 `Text` 的颜色语义 API，增加文本和图标语义色漂移风险，也削弱了 `Text` 组件统一管理颜色 token 的能力。
- 推荐纠正方案：文案渲染时使用 `<Text color="secondary" size={...}>`，保留 `styles?.text` 仅作为调用方样式覆盖；默认颜色不应优先写入 Loading 的 `text` 样式槽。

### 4. 测试未覆盖多个公开且用户可感知的 Loading 状态 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/__tests__/Loading.test.tsx:13`
- 违反规范：`CLAUDE.md` 测试约束；`.claude/rules/common/testing.md` Test Structure；`.claude/rules/typescript/testing.md`
- 不符合点：测试当前只验证默认 `ActivityIndicator`、small/large 指示器尺寸为数字且 large 更大、传入文案时能渲染。Loading 的公开 API 还包含 `vertical`、`indicator`，并继承 `ActivityIndicatorProps` 中的 `animating`、`hidesWhenStopped` 等用户可感知状态；实现也在 `packages/pennyspring-ui/src/Loading/Loading.tsx:78` 至 `packages/pennyspring-ui/src/Loading/Loading.tsx:83` 处理这些状态，但现有测试没有断言纵向排列、自定义指示器替换、停止动画参数传递或默认 `normal` 尺寸等行为。
- 影响：Loading 的关键可见状态缺少回归保护，后续修改可能破坏布局方向、停止加载状态或自定义 indicator 行为而测试仍通过。
- 推荐纠正方案：按 AAA 结构补充用户可感知行为测试：默认 `size` 等同 `normal`、`vertical` 改变根布局方向或布局组件方向、自定义 `indicator` 替换默认 `ActivityIndicator`、`animating={false}` 与 `hidesWhenStopped` 正确传递。

## 需要人工确认

- 无
