# CalculatorInput 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. `CalculatorInput.Popup` 遮罩或返回关闭时会重复触发 `onCancel`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/CalculatorInput/CalculatorInputPopup.tsx:30`
- 违反规范：`.claude/rules/component/coding-style.md` 的状态与回调 API 约定，要求关闭或取消动作统一使用 `onCancel`，且一次操作涉及多个回调时语义动作回调先发生，再触发 `onOpenChange`；`.claude/rules/common/testing.md` 要求测试默认覆盖用户可感知行为断言
- 不符合点：`CalculatorInput.Popup` 把用户传入的 `onCancel` 直接传给底层 `Popup`（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInputPopup.tsx:33`），同时又在传给 `Popup` 的 `onOpenChange` 中，当 `nextOpen` 为 `false` 时再次调用同一个 `onCancel`（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInputPopup.tsx:34`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInputPopup.tsx:38`）。底层 `Popup` 在遮罩关闭路径会先调用 `onCancel`，再调用 `onOpenChange(false, { reason })`（`packages/pennyspring-ui/src/Popup/Popup.tsx:244`-`packages/pennyspring-ui/src/Popup/Popup.tsx:248`，遮罩入口在 `packages/pennyspring-ui/src/Popup/Popup.tsx:270`-`packages/pennyspring-ui/src/Popup/Popup.tsx:275`），返回键路径也同样先 `onCancel` 后 `onOpenChange`（`packages/pennyspring-ui/src/Popup/Popup.tsx:256`-`packages/pennyspring-ui/src/Popup/Popup.tsx:263`）。因此一次遮罩或返回关闭会让调用方收到两次 `onCancel`。
- 影响：调用方如果在 `onCancel` 中写埋点、回滚临时输入、清理状态或展示反馈，会被重复执行；现有测试只直接调用 `popup.props.onCancel` 并断言一次（`packages/pennyspring-ui/__tests__/CalculatorInput.test.tsx:231`-`packages/pennyspring-ui/__tests__/CalculatorInput.test.tsx:247`），没有覆盖真实 `Popup` 关闭链路。
- 推荐纠正方案：保留底层 `Popup` 的 `onCancel={onCancel}`，`onOpenChange` 中只同步 open 状态，不再二次调用 `onCancel`；补充测试通过触发 `popup.props.onOpenChange(false, { reason: 'mask' })` 或真实 mask press 断言一次关闭只产生一次取消语义回调。

### 2. Backspace 图标把已解析颜色值强制转换成 `IconColor`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:581`
- 违反规范：`packages/pennyspring-ui/docs/guide/component-color-design.md` 的 Text / Icon 类型边界与映射职责，要求 `Icon` 的 `color` 只接受组件语义色和 `AliasColorTokenKey`，不接受自定义颜色字符串，也不把无法识别的值作为自定义颜色字符串透传；`.claude/rules/component/coding-style.md` 要求 `Text` 组件的 `color` 取值必须与 `Icon` 组件的 `color` 取值保持一致
- 不符合点：`backspaceIcon.color` 在样式中已经被解析成实际 token 颜色值（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:181`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:184`），渲染时又通过 `color={tokenStyles.backspaceIcon.color as IconColor}` 强制绕过类型边界（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:580`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:584`）。`IconColor` 的公开类型是 `SemanticAliasColor<IconSemanticColor>`（`packages/pennyspring-ui/src/Icon/types.ts:9`-`packages/pennyspring-ui/src/Icon/types.ts:16`），组件颜色设计文档也明确 `Icon` 使用语义色或 alias token key，而不是已解析颜色字符串（`packages/pennyspring-ui/docs/guide/component-color-design.md:171`-`packages/pennyspring-ui/docs/guide/component-color-design.md:227`）。
- 影响：类型断言掩盖了颜色 API 的真实输入范围，使 `Icon` 与 `Text` 的颜色语义无法统一检查；如果后续 `Icon` 收紧实现，不再容忍原始颜色字符串，该图标颜色会失效。
- 推荐纠正方案：传入语义色或 alias token key，例如 disabled 时传 `color="colorTextDisabled"`，普通态传 `color="colorTextSecondary"`；需要尺寸时仍可用 token 数值传 `size`，但不要把 resolved color cast 成 `IconColor`。

### 3. 默认文本视觉优先通过 `style` 设置，绕过 `Text` 的尺寸、颜色和字重 API

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:589`
- 违反规范：`CLAUDE.md` 要求文本展示统一使用 `@pennyspring/ui` 的 `Text`，且 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再用 `style`，禁止优先使用 `style`
- 不符合点：键盘文本默认样式在 `tokenStyles.keyText` 中直接设置 `color`、`fontSize`、`lineHeight` 和 `fontWeight`（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:143`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:149`），渲染时将这些默认视觉通过 `style` 传给 `Text`（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:589`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:595`）。确认键同样通过 `tokenStyles.okKeyText` 设置颜色、字号、行高和字重（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:168`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:174`），并通过 `Text style` 应用（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:746`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:752`）。结果文本也通过 `style` 设置颜色、字号、行高（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:114`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:121`，渲染在 `packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:709`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:711`）。
- 影响：`Text` 的 `size`、`weight`、`color` 语义 API 没有成为默认文本视觉的主路径，后续统一调整 Text 语义映射时 CalculatorInput 的键盘和结果文本不会自然跟随。
- 推荐纠正方案：将能用 `TextProps` 表达的默认视觉迁移到 `size`、`weight`、`color`，只把 `fontFamilyCode`、`textAlign` 或调用方覆盖样式保留在 `style` 中。

### 4. 样式实现没有按组件规范拆到 `style/index.ts`

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:91`
- 违反规范：`.claude/rules/component/coding-style.md` 的目录与导出要求，规定组件样式文件为 `style/index.ts`
- 不符合点：CalculatorInput 目录当前只有 `CalculatorInput.tsx`、`CalculatorInputPopup.tsx`、`types.ts` 和 `index.ts`（可定位片段：`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx`、`packages/pennyspring-ui/src/CalculatorInput/CalculatorInputPopup.tsx`、`packages/pennyspring-ui/src/CalculatorInput/types.ts`、`packages/pennyspring-ui/src/CalculatorInput/index.ts`），没有 `packages/pennyspring-ui/src/CalculatorInput/style/index.ts`。默认样式直接定义在组件实现文件内的 `useStyles`（`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:91`-`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:186`）。
- 影响：样式、计算逻辑、渲染和表达式求值集中在同一实现文件中，弱化了组件目录约定，也增加后续视觉调整时误触行为逻辑的风险。
- 推荐纠正方案：将 `createUseSheetStyle` 相关样式与样式 options 拆到 `packages/pennyspring-ui/src/CalculatorInput/style/index.ts`，组件文件只消费样式 hook。

## 需要人工确认

无
