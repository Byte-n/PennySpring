# Tag 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4
- 修复数量：4

## 问题列表

### 1. 样式实现未放入组件样式文件 [已修复]

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Tag/Tag.tsx:198`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Tag` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `Tag.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、颜色变体映射与渲染逻辑耦合，后续维护视觉规范时容易扩大修改范围。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Tag/style/index.ts`，将 `SIZE_STYLE_MAP`、颜色/变体样式解析和 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。

### 2. 使用 `View` 手写等效布局结构 [已修复]

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Tag/Tag.tsx:296`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：非交互态根节点使用 `View`，并通过 `flexDirection: 'row'`、`alignItems: 'center'`、`justifyContent: 'center'` 手写水平居中布局；项目要求共享组件布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件。
- 影响：标签内容布局无法复用统一布局组件的语义，后续间距、对齐和尺寸语义可能与其它组件漂移。
- 推荐纠正方案：非交互态根布局改用 `Row` 或现有布局原语；交互态若必须保留 `Pressable`，可在 `Pressable` 内用布局原语承载内容，并将外层只用于事件响应。

### 3. `Text` 字号、颜色和字重优先通过 `style` 设置 [已修复]

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Tag/Tag.tsx:243`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：字符串/数字内容渲染为 `Text` 时，将颜色、字号、行高、字重全部放在 `tokenStyles.content` 中通过 `style` 传入；项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本排版和颜色语义绕过 `Text` 组件 API，容易与其它组件的文本和图标色彩语义漂移。
- 推荐纠正方案：将 `Tag.size`、`variant`、`color`、`disabled` 映射到 `Text` 的 `size`、`weight`、`color` props；外部 `styles?.content` 仅作为补充覆盖。

### 4. `TagStyles` 插槽命名未表达可见根节点 [已修复]

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Tag/types.ts:23`
- 违反规范：`.claude/rules/component/coding-style.md` 样式 API
- 不符合点：`TagStyles` 只暴露 `content`，没有为内部可见根节点提供统一命名的 `root` 插槽；规范要求可见内部根节点统一使用 `root`，`style` 控制组件外层布局，`styles` 控制语义化内部插槽。
- 影响：调用方只能通过顶层 `style` 覆盖根节点视觉与布局，无法区分外层布局覆盖和组件内部根节点语义覆盖。
- 推荐纠正方案：在 `TagStyles` 中补充 `root?: StyleProp<ViewStyle>`，并按 token 样式、组件运行时样式、外部 `styles.root`、外层 `style` 的职责边界合并；保留 `style` 仅用于组件外层布局。

## 需要人工确认

- 无
