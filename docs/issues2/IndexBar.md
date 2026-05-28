# IndexBar 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 面板标题与索引文本优先通过 style 控制字号和颜色

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/IndexBar/IndexBar.tsx:32`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`renderTextNode` 将字符串/数字统一渲染为 `<Text style={style}>`；传入的 `panelTitleText` 和 `indexText` 样式在 `style/index.ts:75` 到 `style/index.ts:80`、`style/index.ts:105` 到 `style/index.ts:110` 中包含 `color`、`fontSize`、`lineHeight`、`fontWeight`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：索引导航文本的大小、颜色和选中态绕过 `Text` API，和 Text/Icon 语义统一规则不一致。
- 推荐纠正方案：为面板标题和索引项映射 `Text` 的 `color`、`size`、`weight` props；样式插槽仅保留额外覆盖。

### 2. IndexBar 根布局和侧边栏使用 View 手写

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/IndexBar/IndexBar.tsx:100`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根、panel、panelTitleContainer、sidebar 等结构使用 `View`，并在 `style/index.ts:57` 到 `style/index.ts:87` 手写横向布局、gap、对齐。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件。
- 影响：索引栏的横向内容区和侧边栏布局语义分散在样式中，难以与其他导航组件共享间距和对齐策略。
- 推荐纠正方案：根结构使用 `Row`，面板列表和侧边栏使用 `Column` 或 `Space`；ScrollView 本身保留滚动职责。

## 需要人工确认

- 无
