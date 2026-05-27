# SelectionList 组件规范巡检报告

状态：reported

范围：
- 组件目录：`packages/pennyspring-ui/src/SelectionList`
- 测试文件：`packages/pennyspring-ui/__tests__/SelectionList.test.tsx`
- 文档：`.codex/skills/component-composer/references/component-catalog.md` 中 SelectionList 相关条目
- 未审查：`examples/previews/demos`

## 问题 1：样式文件未按组件规范放置在 `style/index.ts`

文件路径：`packages/pennyspring-ui/src/SelectionList/styles.ts`

行号/片段：

```ts
packages/pennyspring-ui/src/SelectionList/styles.ts
```

违反规范来源：
- `.claude/rules/component/coding-style.md`：组件目录与导出要求中规定“样式文件：`style/index.ts`”。

违规原因：
- `SelectionList` 将样式实现放在组件目录根部的 `styles.ts`，没有使用规范要求的 `style/index.ts` 结构。

影响：
- 与共享组件目录约定不一致，降低组件间文件布局的一致性，也会增加后续批量迁移、脚本检查或新成员定位样式入口的成本。

推荐纠正方案：
- 将 `packages/pennyspring-ui/src/SelectionList/styles.ts` 移动为 `packages/pennyspring-ui/src/SelectionList/style/index.ts`。
- 同步更新 `SelectionList.tsx` 中的样式导入路径。
- 保持对外导出不变，不改变组件 API。

## 问题 2：根触发器把 `readonly` 和 `loading` 合并成 `disabled`，破坏只读语义

文件路径：`packages/pennyspring-ui/src/SelectionList/SelectionList.tsx`

行号/片段：

```tsx
507 const isInteractive = !disabled && !readonly && !loading;
572 <DisplayInput
573   {...displayInputProps}
574   disabled={!isInteractive}
...
617   onPress={() => setOpen(!mergedOpen)}
```

违反规范来源：
- `CLAUDE.md`：输入类组件必须显式支持 `placeholder`、`readonly` 和 `disabled`。
- `packages/pennyspring-ui/src/SelectionList/types.ts`：`readonly` 注释声明“只读状态下不可展开，但仍保持可读性”。
- `.claude/rules/component/coding-style.md`：输入类组件必须显式支持 `readonly` 和 `disabled`，标准状态必须由组件自身完整表达。

违规原因：
- 当前实现用 `disabled={!isInteractive}` 传给 `DisplayInput`。当 `readonly === true` 或 `loading === true` 时，触发器会被当作 disabled 渲染，而不是只读渲染。
- `DisplayInput` 本身支持独立的 `readonly` prop，但 `SelectionList` 没有透传。

影响：
- 调用方传入 `readonly` 时，视觉上可能呈现禁用态，削弱可读性，与类型注释承诺不一致。
- `loading` 状态也会复用 disabled 外观，导致加载态、禁用态、只读态的状态表达混淆。

推荐纠正方案：
- 将 `DisplayInput` 的状态拆开传递，例如 `disabled={disabled === true || loading === true}`、`readonly={readonly}`，并由 `onPress` 或 `setOpen` 保持不可展开逻辑。
- 如加载态需要阻止交互，应单独表达 loading 的视觉反馈，不要让只读态落入 disabled 样式。
- 补充测试覆盖 `readonly` 传入时 `DisplayInput.props.readonly === true` 且 `disabled` 不因 readonly 变为 true。

## 问题 3：样式中直接硬编码百分比尺寸

文件路径：`packages/pennyspring-ui/src/SelectionList/styles.ts`

行号/片段：

```ts
64 popup: {
65   padding: token.paddingSM,
66   maxHeight: '85%',
67 },
```

违反规范来源：
- `CLAUDE.md`：样式值中的数字字面量禁止硬编码，唯一例外包括 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'`。
- `.codex/skills/theme-tokens/SKILL.md`：样式通过 `createUseSheetStyle` 消费 token；无合适 token 时应使用语义化命名常量或动态计算值作为局部例外。

违规原因：
- `maxHeight: '85%'` 是未列入例外的硬编码样式值，也没有通过语义化常量或组件参数说明其设计含义。

影响：
- 弹层最大高度缺少可追踪的设计语义，后续主题、尺寸或弹层规范调整时不易统一治理。
- 静态规则如果检查样式字面量，会对该组件产生违规噪声。

推荐纠正方案：
- 优先确认 `Popup.FloatingPanel` 是否已有高度/最大高度配置可承载该约束。
- 若确需组件内保留百分比上限，提取为语义化常量，例如 `const POPUP_MAX_HEIGHT = '85%'`，并在注释中说明它是无 token 可映射的局部布局上限。
- 如主题层已有合适尺寸 token，应改用 token 或由调用方通过 `popupProps` 控制。

## 问题 4：内部文本字号和颜色优先通过 `style` 设置

文件路径：`packages/pennyspring-ui/src/SelectionList/SelectionList.tsx`、`packages/pennyspring-ui/src/SelectionList/styles.ts`

行号/片段：

```tsx
309 <Text
310   style={[
311     tokenStyles.optionLabel,
312     styles?.optionLabel,
313     isDisabled ? tokenStyles.optionLabelDisabled : null,
314   ]}
315 >
```

```ts
119 optionLabel: {
120   fontFamily: token.fontFamily,
121   fontSize: sizeConfig.fontSize(token),
122   lineHeight: sizeConfig.lineHeight(token),
123   color: token.colorText,
124 },
125 optionLabelDisabled: {
126   color: token.colorTextDisabled,
127 },
```

违反规范来源：
- `CLAUDE.md`：业务与共享组件中的文本展示统一使用 `@pennyspring/ui` 的 `Text` 组件；`Text` 字号、颜色等优先使用 `TextProps` 实现，其次再是 `style`，禁止优先使用 `style`。

违规原因：
- 虽然使用了组件库 `Text`，但选项主文本的字号、行高和颜色都由 `tokenStyles.optionLabel` 直接注入 `style`，没有优先使用 `Text` 的 `size`、`color`、`weight` 等语义 props。

影响：
- 文本语义分散在样式对象里，容易与 `Text` 组件内建排版体系漂移。
- 外部 `styles.optionLabel` 覆盖时更容易绕过组件的文本语义约束。

推荐纠正方案：
- 将可由 `TextProps` 表达的字号、颜色、字重迁移到 `Text` props，例如按 `resolvedSize` 传 `size`，按状态传 `color`。
- `styles.optionLabel` 仅保留确需对外暴露的文本样式覆盖。
- 对禁用态使用 `Text` 支持的颜色语义；若现有 `Text` 颜色枚举不足，先扩展或复用组件库已有语义，不直接绕过。

## 问题 5：内部布局大量使用 React Native `View` 手写等效布局，且 gap 使用 size tokens

文件路径：`packages/pennyspring-ui/src/SelectionList/SelectionList.tsx`、`packages/pennyspring-ui/src/SelectionList/styles.ts`

行号/片段：

```tsx
370 <View testID="selection-list-popup" style={tokenStyles.popupContent}>
372   <View style={tokenStyles.header}>
...
417   <View style={tokenStyles.list}>
419     <View key={group.key} style={tokenStyles.group}>
...
571 <View testID="selection-list-root" style={rootStyle}>
```

违反规范来源：
- `CLAUDE.md`：界面布局优先使用 `@pennyspring/ui` 中已有布局组件，禁止用 `View` 手写等效布局结构。
- `.codex/skills/component-composer/SKILL.md`：布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid` 或 `GeometryReader`，再考虑 `View`。
- `.claude/rules/component/coding-style.md`：组件应优先复用 `packages/pennyspring-ui` 中已有能力。
- `.claude/rules/common/component-visual-layout.md`：Layout Gap 映射应使用 spacing tokens。

违规原因：
- `SelectionList` 的根、弹层内容、header、列表、分组、选项内容等布局结构均直接使用 `View` 配合 flex/gap 样式实现。
- 这些结构大多可映射为 `Column`、`Row`、`Space` 或 `Divider` 等组件库布局能力，而不是必须使用原始 `View`。
- 所有 gap 值均使用 `size` tokens（`sizeXXS`/`sizeXS`/`sizeSM`），而非规范要求的 spacing tokens（`marginXXS`/`marginXS`/`marginSM`）。具体包括：`popupContent.gap: sizeSM`、`header.gap: sizeSM`、`list.gap: sizeXS`、`group.gap: sizeXXS`、`option.gap` 使用 size-dependent 的 size tokens、`optionContent.gap: sizeXXS`。

影响：
- 组件内部布局语义与组件库布局原语脱节，后续统一调整间距、方向、gap 或布局行为时需要单独维护。
- 新组件可能复制该模式，削弱 `component-composer` 对组件组合和布局一致性的约束力。
- 所有 gap 使用错误的 token 类型，间距值会与组件库统一的 Layout Gap 映射不一致。

推荐纠正方案：
- 将垂直容器逐步替换为 `Column` 或 `Space`，将横向 header/option 行替换为 `Row`。
- 选项分隔线优先使用 `Divider`，除非需要 SelectionList 专属行为。
- 保留确实承担测量、Pressable 子结构或低层承载职责的 `View`，但避免用它手写可由布局组件表达的结构。
- 将所有 gap 值从 size tokens 改为 spacing tokens：small→`marginXXS`、normal→`marginXS`、large→`marginSM`。
