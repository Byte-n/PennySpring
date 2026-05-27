# Checkbox 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：4

## 检查覆盖摘要

- 目录与导出：已检查 `packages/pennyspring-ui/src/Checkbox/`、目录内 `index.ts`、包级 `src/index.ts`、组件目录条目。
- TypeScript 与 API 设计：已检查 `types.ts`、可控/非可控 API、选项数据类型、文本/节点 API。
- 组件职责与组合方式：已检查独立 Checkbox 与 `Checkbox.Group` 的职责拆分、数据驱动渲染、内部文本渲染。
- 样式与主题 token：已检查 `createUseSheetStyle`、token 使用、硬编码颜色/数字、样式覆盖顺序。
- 视觉、布局与交互：已检查 checked、indeterminate、pressed、disabled、readonly、button display type、block/direction。
- 动画与手势：未发现 `Animated`、`LayoutAnimation` 或手势实现。
- 测试与文档：已检查 `Checkbox.test.tsx`、`checkbox.mdx`、颜色设计文档和组件目录；未读取 demo/examples/previews 内容。

## 问题列表

### 1. 组件目录缺少规范要求的 `style/index.ts`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Checkbox/`，当前仅包含 `Checkbox.tsx`、`index.ts`、`types.ts`
- 违反规范：`.claude/rules/component/coding-style.md:18-23`
- 不符合点：组件编码规范在“目录与导出”中要求组件样式文件为 `style/index.ts`，但 `Checkbox` 目录没有 `style/` 子目录或 `style/index.ts`，样式实现集中在 `Checkbox.tsx:93-192` 的 `useStyles` 内。
- 影响：目录结构与组件规范不一致，样式实现与组件逻辑耦合在同一文件，后续按统一组件结构维护、迁移或巡检样式时需要特殊处理。
- 推荐纠正方案：将 `useStyles`、尺寸样式配置和相关样式类型迁移到 `packages/pennyspring-ui/src/Checkbox/style/index.ts`，组件文件只消费导出的样式 hook 与必要类型。

### 2. 分组选项文本和自定义节点共用 `label?: ReactNode`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Checkbox/types.ts:36-40`；`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:74-83`；`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:407`
- 违反规范：`.claude/rules/component/coding-style.md:50-61`
- 不符合点：`CheckboxGroupOption` 只提供 `label?: ReactNode`，实现中 `renderLabel` 根据 `label` 的运行时类型区分文本和自定义节点，并在分组中以 `{option.label ?? option.value}` 传入。规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，并禁止把字符串和 `ReactNode` 混在同一个语义 prop 中。
- 影响：调用方无法从类型层明确区分“内部文本”与“自定义节点”，`styles.label` 只会作用于字符串/数字分支，自定义节点分支不会获得同样的文本样式语义，API 行为需要依赖运行时类型判断。
- 推荐纠正方案：为 option 增加 `labelText?: string` 与 `label?: ReactNode | null` 的分离 API；文本分支只消费 `labelText`，自定义节点分支消费 `label`。保留旧 API 时应标记兼容路径并补充迁移测试。

### 3. 多处外部 `styles` 插槽早于运行时状态样式合并

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:251-257`、`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:268-287`、`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:230-235`
- 违反规范：`.claude/rules/component/coding-style.md:85-93`
- 不符合点：规范要求默认按“token 样式、组件运行时样式、外部样式”的顺序合并。当前 `controlStyle` 位于 checked/pressed/disabled 之前，`optionStyle?.indicator` 和 `optionStyle?.mark` 位于 checked/readonly/disabled/indeterminate 状态之前，`optionStyle?.label` 位于 checked/disabled 文本状态之前。除外层 `rootStyle` 外，多个外部语义插槽会被后续状态样式覆盖。
- 影响：调用方通过 `styles.option`、`styles.indicator`、`styles.mark` 或 `styles.label` 做受支持视觉覆盖时，在 checked、disabled、readonly、indeterminate 等状态下可能失效，实际样式优先级与公共样式 API 约定不一致。
- 推荐纠正方案：将状态样式视为组件运行时样式，统一放在 token 样式之后、外部插槽样式之前，例如 `tokenStyles.indicator -> indicatorChecked/Readonly/Disabled -> optionStyle?.indicator`。

### 4. 内部文本优先用 `style` 控制字号和颜色

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:177-189`；`packages/pennyspring-ui/src/Checkbox/Checkbox.tsx:79-80`
- 违反规范：`CLAUDE.md:101-105`
- 不符合点：项目组件约束要求展示文本统一使用 `@pennyspring/ui` 的 `Text`，且 `Text` 字号、颜色等优先使用 `TextProps`，其次才是 `style`。`Checkbox` 虽然使用了项目 `Text`，但 `label` 样式直接包含 `color`、`fontSize`、`fontWeight`、`lineHeight`，并通过 `<Text style={style}>` 传入，没有优先映射到 `Text` 的 `size`、`weight`、`color` props。
- 影响：Checkbox 文本绕过了 `Text` 组件自身的字号、字重和颜色语义 API，容易与 `Text` 的 token 映射和组件色彩边界产生漂移；后续 `Text` 语义调整也不会自动反映到 Checkbox 标签。
- 推荐纠正方案：为 Checkbox 的 `small`、`normal`、`large` 建立到 `Text` `size`/`weight`/`color` 的显式映射，外部 `styles.label` 仅作为补充覆盖；checked/disabled 等状态优先通过 `Text` 的 `color` 语义表达。

## 需要人工确认

无
