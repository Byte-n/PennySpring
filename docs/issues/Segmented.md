# Segmented 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：5

## 检查覆盖摘要

- 目录与导出：已检查 `packages/pennyspring-ui/src/Segmented/`、目录内 `index.ts`、包级 `src/index.ts`、组件目录条目。
- TypeScript 与 API 设计：已检查 `types.ts`、可控/非可控 API、选项数据类型、文本/节点 API。
- 组件职责与组合方式：已检查 `Segmented` 的紧凑分段选择职责、数据驱动渲染、内部文本与图标渲染。
- 样式与主题 token：已检查 `createUseSheetStyle`、token 使用、硬编码颜色/数字、样式覆盖顺序。
- 视觉、布局与交互：已检查 selected、pressed、disabled、block、size 和 option disabled 状态。
- 动画与手势：未发现 `Animated`、`LayoutAnimation`、Reanimated 动画或手势实现。
- 测试与文档：已检查 `Segmented.test.tsx`、`SegmentedControl.test.tsx` 中公开能力相关内容、`component-catalog.md`；未审查 examples/previews/demos。

## 问题列表

### 1. 组件目录缺少规范要求的 `style/index.ts` ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Segmented/`，当前仅包含 `Segmented.tsx`、`index.ts`、`types.ts`
- 违反规范：`.claude/rules/component/coding-style.md:18-23`
- 不符合点：组件编码规范在“目录与导出”中要求组件样式文件为 `style/index.ts`，但 `Segmented` 目录没有 `style/` 子目录或 `style/index.ts`，样式实现集中在 `Segmented.tsx:101-174` 的 `useStyles` 内。
- 影响：目录结构与组件规范不一致，样式实现与组件逻辑耦合在同一文件，后续按统一组件结构维护、迁移或巡检样式时需要特殊处理。
- 推荐纠正方案：将 `useStyles`、`SIZE_STYLE_MAP` 和相关样式类型迁移到 `packages/pennyspring-ui/src/Segmented/style/index.ts`，组件文件只消费导出的样式 hook 与必要类型。

### 2. 选项文本和自定义节点共用 `label?: ReactNode` ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Segmented/types.ts:15-20`；`packages/pennyspring-ui/src/Segmented/Segmented.tsx:85-99`；`packages/pennyspring-ui/src/Segmented/Segmented.tsx:256-264`
- 违反规范：`.claude/rules/component/coding-style.md:50-61`
- 不符合点：`SegmentedLabeledOption` 使用 `label?: ReactNode` 同时承载字符串、数字和自定义节点，实现中 `renderLabel` 再按运行时类型决定是否套用内部 `Text`。规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，且 `xxxText` 只能是 `string`。
- 影响：调用方无法从类型层明确区分“内部文本”与“自定义节点”，`styles.label` 只会稳定作用于字符串/数字分支，自定义节点分支不会获得同样的文本样式语义，API 行为依赖运行时类型判断。
- 推荐纠正方案：为 option 增加 `labelText?: string` 与 `label?: ReactNode | null` 的分离 API；文本分支只消费 `labelText`，自定义节点分支消费 `label`。如需兼容现有 `label?: ReactNode`，应标记兼容路径并补充迁移测试。

### 3. 内部文本优先用 `style` 控制字号、颜色和字重 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Segmented/Segmented.tsx:158-170`；`packages/pennyspring-ui/src/Segmented/Segmented.tsx:90-94`
- 违反规范：`CLAUDE.md:101-105`
- 不符合点：项目组件约束要求展示文本统一使用 `@pennyspring/ui` 的 `Text`，且 `Text` 字号、颜色等优先使用 `TextProps`，其次才是 `style`。`Segmented` 虽然使用了项目 `Text`，但 `label` 样式直接包含 `fontSize`、`lineHeight`、`color`、`fontWeight`，并通过 `<Text size="sm" style={style}>` 传入，固定 `size="sm"` 后再由样式覆盖不同 `Segmented.size` 的字体。
- 影响：Segmented 文本绕过了 `Text` 组件自身的字号、字重和颜色语义 API，容易与 `Text` 的 token 映射和组件色彩边界产生漂移；后续 `Text` 语义调整也不会自动反映到 Segmented 标签。
- 推荐纠正方案：为 `small`、`normal`、`large` 建立到 `Text` `size`/`weight`/`color` 的显式映射，外部 `styles.label` 仅作为补充覆盖；selected/disabled 等状态优先通过 `Text` 的 `color` 和 `weight` 语义表达。

### 4. 外部 `styles` 插槽早于运行时状态样式合并 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Segmented/Segmented.tsx:235-241`；`packages/pennyspring-ui/src/Segmented/Segmented.tsx:246-251`；`packages/pennyspring-ui/src/Segmented/Segmented.tsx:258-263`
- 违反规范：`.claude/rules/component/coding-style.md:85-93`
- 不符合点：规范要求默认按“token 样式、组件运行时样式、外部样式”的顺序合并。当前 `styles?.item` 位于 selected/pressed/disabled 状态之前，`styles?.icon` 位于 selected/disabled 状态之前，`styles?.label` 位于 selected/disabled 文本状态之前，导致外部语义插槽会被后续运行时状态样式覆盖。
- 影响：调用方通过 `styles.item`、`styles.icon` 或 `styles.label` 做受支持视觉覆盖时，在 selected、pressed、disabled 等状态下可能失效，实际样式优先级与公共样式 API 约定不一致。
- 推荐纠正方案：将状态样式视为组件运行时样式，统一放在 token 样式之后、外部插槽样式之前，例如 `tokenStyles.item -> itemSelected/itemPressed/itemDisabled -> styles?.item`。

### 5. 选中态通过字重变化表达，可能造成布局尺寸跳动 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Segmented/Segmented.tsx:158-168`
- 违反规范：`.claude/rules/common/component-visual-layout.md:62-68`
- 不符合点：视觉交互规范要求状态变化不得导致布局尺寸跳动，hover、press、focus 反馈不得改变组件占位尺寸。当前默认标签使用 `fontWeightRegular`，选中态切到 `fontWeightStrong`；在非 `block` 场景下 item 宽度由内容和 padding 决定，选中项字体变粗会改变文本测量宽度，从而可能推动相邻分段或改变整体宽度。
- 影响：用户切换分段时控件宽度或相邻选项位置可能发生抖动，尤其在中英文混排、长标签或 `block={false}` 的筛选栏场景中更明显。
- 推荐纠正方案：避免用会影响测量宽度的字重变化表达 selected 状态，改用不改变占位尺寸的 token 化背景、颜色或指示器；如必须保留字重差异，应为 item 预留稳定宽度或在布局层固定测量结果，并补充覆盖非 block 长标签切换的测试。

## 需要人工确认

- 无
