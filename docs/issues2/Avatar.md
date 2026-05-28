# Avatar 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 头像组横向布局直接使用 View 手写

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Avatar/AvatarGroup.tsx:70`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 适用范围与组件复用要求；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`AvatarGroup` 在样式中直接声明 `flexDirection: 'row'`，并在 `AvatarGroup.tsx:133` 使用 `View` 作为横向根布局。项目规范要求布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader`，禁止用 `View` 手写等效布局结构。
- 影响：头像组的对齐、间距和横向布局语义脱离共享布局组件，后续尺寸、gap 或方向策略调整时更容易出现实现漂移。
- 推荐纠正方案：使用 `Row` 作为头像组根布局，保留必要的重叠样式到 item 插槽；若需要负 margin 实现重叠，应让根布局语义仍由 `Row` 承载。

### 2. Text 展示样式优先通过 style 控制字号和颜色

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Avatar/Avatar.tsx:171`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`AvatarRoot` 使用 `<Text style={[tokenStyles.text, styles?.text]}>`，而 `tokenStyles.text` 在 `Avatar.tsx:77` 到 `Avatar.tsx:83` 中包含 `color`、`fontSize`、`lineHeight` 等文本视觉属性。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次再使用 `style`。
- 影响：文本色彩与字号语义绕过 `Text` 组件自身 API，容易与 `Icon`/`Text` 的颜色和尺寸语义产生漂移，也增加外部覆盖成本。
- 推荐纠正方案：优先将颜色、字号和字重映射到 `Text` 的公开 props；仅将 `TextProps` 无法表达的局部样式保留在 `style` 中。

## 需要人工确认

- 无
