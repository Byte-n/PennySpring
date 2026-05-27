# DisplayInput 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：5

## 问题列表

### 1. ✅ 公开 prop 依赖的 `DisplayInputOverflow` 类型没有从组件入口和包级入口导出

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/DisplayInput/index.ts:2`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md`「目录与导出」
- 不符合点：`DisplayInputProps` 在 `packages/pennyspring-ui/src/DisplayInput/types.ts:24` 暴露 `overflow?: DisplayInputOverflow`，且 `DisplayInputOverflow` 在 `packages/pennyspring-ui/src/DisplayInput/types.ts:7` 是导出的公共类型；但目录入口 `packages/pennyspring-ui/src/DisplayInput/index.ts:2-6` 只导出了 `DisplayInputDisplay`、`DisplayInputProps`、`DisplayInputStyles`，包级入口 `packages/pennyspring-ui/src/index.ts:93-98` 也没有导出 `DisplayInputOverflow`。
- 影响：调用方可以使用 `overflow` prop，但无法从组件公共入口导入其枚举类型，公共 API 类型不完整，影响类型复用和文档一致性。
- 推荐纠正方案：从 `packages/pennyspring-ui/src/DisplayInput/index.ts` 与 `packages/pennyspring-ui/src/index.ts` 同步导出 `DisplayInputOverflow`。

### 2. ✅ `label` 同时承担文本和节点语义，未按文本/节点插槽规范拆分

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DisplayInput/types.ts:26`
- 违反规范：`.claude/rules/component/coding-style.md`「内部渲染节点」
- 不符合点：规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，并禁止使用类似 `{ title: string | ReactNode }` 的混合语义。`DisplayInputProps` 仅定义 `label?: ReactNode`，实现又在 `packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:94` 将 `label` 放入项目 `Text` 组件中渲染，导致 `label` 既像文本 prop，又被类型声明为可传自定义节点。
- 影响：调用方传入自定义 label 节点时会被包进 `Text` 内，节点语义不清晰；同时无法用 `label={null}` 明确关闭默认标签结构，也不符合组件库统一的插槽 API 规则。
- 推荐纠正方案：将文本标签改为 `labelText?: string`，自定义节点保留为 `label?: ReactNode | null`；渲染时按 `label ?? labelText` 选择，并避免把自定义节点包裹进 `Text`。

### 3. ✅ 组件内部用 `View` 手写等效布局，没有优先复用布局组件

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:91`
- 违反规范：`CLAUDE.md`「组件约束」；`.codex/skills/component-composer/SKILL.md`「工作流程」
- 不符合点：项目宪章要求界面布局优先使用 `Row`、`Column`、`Spacer`、`GeometryReader`、`Grid` 等已有布局组件，禁止用 `View` 手写等效布局结构。DisplayInput 在 `packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:91-100` 使用 `View` 组合根容器和标签行，并在 `packages/pennyspring-ui/src/DisplayInput/style/index.ts:69-73` 通过 `flexDirection: 'row'`、`alignItems: 'center'`、`gap` 手写行布局；前缀、后缀和值容器也在 `packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:113-143` 直接使用 `View` 承载布局。
- 影响：DisplayInput 绕过共享布局组件，容易与 `Row`、`Column`、`Space` 的 size、gap 和布局语义漂移，降低组件库组合一致性。
- 推荐纠正方案：用 `Column` 表达根部垂直结构，用 `Row` 表达 label 行、field 内前缀/值/后缀排列；仅在确实需要非布局承载节点时保留 `View`，并让间距和尺寸语义通过现有布局组件或 token options 统一表达。

### 4. ✅ field.gap 使用 size tokens 代替 spacing tokens

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/DisplayInput/style/index.ts:69`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`field.gap` 使用 `sizeXXS`/`sizeXS`/`sizeSM`（size tokens），而非规范要求的 `marginXXS`/`marginXS`/`marginSM`（spacing tokens）。
- 影响：field 内部间距使用了错误的 token 类型，与组件库统一的 Layout Gap 映射不一致。
- 推荐纠正方案：将 `field.gap` 改为 spacing tokens：small→`marginXXS`、normal→`marginXS`、large→`marginSM`。

### 5. ✅ 测试缺少 disabled 和 readonly 关键用户行为覆盖

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/DisplayInput.test.tsx:81`
- 违反规范：`CLAUDE.md`「测试约束」；`.claude/rules/common/testing.md`「Test Structure」；`.claude/rules/typescript/testing.md`
- 不符合点：DisplayInput 的公共 API 明确包含 `disabled?: boolean` 和 `readonly?: boolean`（`packages/pennyspring-ui/src/DisplayInput/types.ts:37-38`），实现中这两个状态会决定是否可点击（`packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:67-69`）和是否应用禁用视觉样式（`packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:103-109`、`packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:136`）。但现有测试只覆盖普通 `onPress`（`packages/pennyspring-ui/__tests__/DisplayInput.test.tsx:81-97`），没有断言 disabled 或 readonly 时不会触发 `onPress`，也没有覆盖 disabled 视觉状态。
- 影响：输入展示组件的只读/禁用是用户可感知的核心行为，缺少测试会使回归难以及时发现，例如 disabled 仍可触发选择流程、readonly 语义被破坏或禁用态样式丢失。
- 推荐纠正方案：补充 AAA 结构测试，分别断言 `disabled` 和 `readonly` 时不会触发 `onPress`；同时断言 disabled 状态应用禁用边框、背景或文本颜色的 token 样式。测试名应直接描述被验证行为。

## 需要人工确认

- 无
