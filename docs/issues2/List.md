# List 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 列表项结构使用 View 手写布局容器

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/List/List.tsx:238`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`ListItem` 内部 selectedMarker、left、content、right、divider 以及 `ListRoot` 的 header/loading/empty/footer 都使用 `View`；样式中还通过绝对定位手写 divider（`List.tsx:136` 到 `List.tsx:143`）。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件，避免用 `View` 手写等效布局结构。
- 影响：List 是高复用结构组件，布局语义分散在原始 View 中会影响与其他列表、表单行、设置项组件的一致性。
- 推荐纠正方案：列表项主体使用 `Row`/`Column` 组合，header/footer/loading/empty 容器使用 `Column`；分隔线优先复用 `Divider` 或语义化分隔插槽。

### 2. 标题与描述文本仍通过 style 携带颜色状态

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/List/List.tsx:172`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`renderTextNode` 虽然传入了 `Text color` 和 `size`，但仍合并 `tokenStyles.title`、`tokenStyles.description`、disabled 样式；这些样式在 `List.tsx:122` 到 `List.tsx:133` 中包含 `color`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：文本禁用态和描述色同时由 `TextProps` 与 style 控制，容易出现优先级混乱和语义漂移。
- 推荐纠正方案：将 title/description/disabled 的颜色全部通过 `Text color` 映射；保留样式插槽仅用于外部额外文本样式。

## 需要人工确认

- 无
