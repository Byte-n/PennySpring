# Dialog 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. ✅ Dialog 使用 View 手写布局结构，未优先复用布局组件

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Dialog/Dialog.tsx:177`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 组合规则
- 不符合点：Dialog 的面板、header、body、footer 均使用 `View` 组织布局，footer 还在样式中手写 `flexDirection: 'row'`。项目规范要求共享组件界面布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：Dialog 的布局语义和 spacing 规则分散在本组件样式内，后续与其他浮层、表单或反馈组件组合时更容易出现布局语义不一致。
- 推荐纠正方案：将面板、header、body 等纵向结构改为 `Column` 或 `Space`，将 footer 操作区改为 `Row` 或 `Space`，并把内部间距映射到布局组件的 `gap`/`size` 语义。

### 2. ✅ gap 使用 size tokens 代替 spacing tokens

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Dialog/Dialog.tsx:28`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`panel.gap` 使用 `token.sizeMD`、`header.gap` 使用 `token.sizeXS`、`body.gap` 和 `footer.gap` 使用 `token.sizeSM`。规范要求布局 gap 使用 spacing tokens（marginXXS/marginXS/marginSM 等），而非 size tokens（sizeXXS/sizeXS/sizeSM/sizeMD）。Dialog 无 `size` prop，默认为 "normal" 级别，应使用 `marginXS` 或 `paddingXS`。
- 影响：size tokens 和 spacing tokens 语义不同，Dialog 的间距会与其他使用正确 spacing tokens 的组件不一致。
- 推荐纠正方案：将所有 gap 值改为 spacing tokens，例如 `panel.gap: token.marginXS`、`header.gap: token.marginXXS`、`body.gap: token.marginXXS`、`footer.gap: token.marginXXS`（按 Layout Gap 规范 small→marginXXS, normal→marginXS, large→marginSM）。

### 3. ✅ titleText 默认视觉样式绕过 Text 组件的 size、color、weight 语义 props

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Dialog/Dialog.tsx:67`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：Dialog 通过 `styles.titleText` 给 `Text` 传入 `color`、`fontSize`、`lineHeight`、`fontWeight` 等默认文字视觉样式，而项目规范要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再使用 `style`。
- 影响：标题文本的默认语义没有复用 `Text` 的 `size="lg"`、`color="heading"`、`weight="strong"` 等统一映射，可能造成文字和图标/其他文本组件的色彩、字号语义漂移。
- 推荐纠正方案：默认标题改为通过 `Text` 的 `size`、`color`、`weight` props 表达，例如 `size="lg"`、`color="heading"`、`weight="strong"`；`styles.titleText` 仅作为外部样式覆盖入口保留。

### 4. ✅ Dialog 宽度使用硬编码百分比，未由 token 或受控布局语义承载

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Dialog/Dialog.tsx:17`
- 违反规范：`CLAUDE.md` 样式约束；`.claude/rules/common/component-visual-layout.md` Token 边界；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`DIALOG_WIDTH_PERCENT = '85%'` 被用于 `popupBody.width`。项目样式约束禁止样式值中的硬编码视觉数值，百分比例外仅列出 `'100%'` 和 `'50%'`；Dialog 的固定 `85%` 宽度没有来自 token，也没有由布局组件或明确的响应式规则承载。
- 影响：不同屏幕尺寸下 Dialog 宽度策略被固化在组件内部，难以和主题、断点或其他浮层宽度策略统一调整。
- 推荐纠正方案：优先通过布局组件或 Popup/Dialog 的尺寸语义实现默认宽度；如确需固定比例，应在规范允许的 token、断点或语义化尺寸 API 中承载，并在文档和测试中覆盖默认宽度行为。

## 需要人工确认

- 无
