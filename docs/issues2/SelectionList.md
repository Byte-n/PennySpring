# SelectionList 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. 弹层最大高度使用非 token 百分比常量

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SelectionList/style/index.ts:45`
- 违反规范：`.codex/skills/theme-tokens/SKILL.md`、`.claude/rules/common/component-visual-layout.md`
- 不符合点：`POPUP_MAX_HEIGHT = '85%'` 在 `style/index.ts:64` 作为 `maxHeight` 使用。样式 token 规范仅允许 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'` 等少量例外字面量；组件尺寸、间距和布局约束应来自 token 或明确的组件语义。
- 影响：弹层高度约束脱离 token 体系，深浅主题、设备尺寸和弹层组件统一调整时无法集中控制，容易形成视觉不一致。
- 推荐纠正方案：将弹层高度限制收敛到 Popup/FloatingPanel 的 size 或布局配置能力；如确需固定上限，应通过主题 token 或组件级语义配置提供，而不是在组件私有样式中写入百分比常量。

### 2. Text 颜色通过 style 注入而非 Text props

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SelectionList/style/index.ts:75`
- 违反规范：`.claude/rules/component/coding-style.md`、`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：`headerText`、`groupTitle`、`optionDescription`、`footerButtonText`、`footerPrimaryButtonText` 在样式中设置 `color`，并由 `Text style={tokenStyles.headerText}`、`Text style={[tokenStyles.groupTitle, ...]}`、`Text style={tokenStyles.optionDescription}` 等方式消费，证据见 `style/index.ts:75`、`style/index.ts:87`、`style/index.ts:117`、`style/index.ts:148`、`style/index.ts:151` 与 `SelectionList.tsx:377`、`SelectionList.tsx:426`、`SelectionList.tsx:324`。组件规范要求展示文本使用项目 `Text` 组件，并优先通过 `Text` 的 `color`、`size`、`weight` 等 props 承载语义，样式覆盖作为次要补充。
- 影响：文本语义颜色散落在样式对象里，调用方覆盖样式时容易破坏 `Text` 组件的语义映射，也削弱深浅主题和文本状态的一致性。
- 推荐纠正方案：将标题、分组标题、描述和按钮文字的颜色映射改为 `Text color="heading"`、`color="description"` 等语义 props；按钮内部文字样式优先通过 Button 已有 `type`、`styles` 或组件 API 映射处理，避免直接传颜色 style。

### 3. 结构布局大量直接使用 View

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SelectionList/SelectionList.tsx:296`
- 违反规范：`.claude/rules/component/coding-style.md`、`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：选项 marker、prefix/suffix meta、分隔线、弹层根、loading、empty、footer 等结构直接使用 `View`，例如 `SelectionList.tsx:296`、`SelectionList.tsx:305`、`SelectionList.tsx:348`、`SelectionList.tsx:372`、`SelectionList.tsx:412`、`SelectionList.tsx:438`、`SelectionList.tsx:446`，同时样式中以 `flexDirection: 'row'`、`gap`、`alignItems`、`justifyContent` 组织布局，见 `style/index.ts:69`、`style/index.ts:90`、`style/index.ts:135`。共享组件规范要求优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 进行布局组合。
- 影响：组件内部布局语义不统一，重复维护横向/纵向排列、间距和对齐逻辑，增加后续状态扩展和视觉统一成本。
- 推荐纠正方案：将 header、option、footer 等横向结构改为 `Row` 或 `Space`；将 popup content、list、group 等纵向结构继续使用或补齐 `Column`；纯分隔线可复用 `Divider`，减少私有 `View` 分隔实现。

## 需要人工确认

- 无
