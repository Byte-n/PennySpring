# Button 组件规范巡检报告（已修复）

## 结论

- 状态：已修复
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 默认 loading 指示器未使用 token 和 size 语义 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Button/Button.tsx:421`
- 违反规范：`CLAUDE.md` 样式约束；`.codex/skills/theme-tokens/SKILL.md` RN 踩坑；`.claude/rules/component/coding-style.md` 尺寸 API 与样式实现
- 不符合点：默认 loading 图标为 `<ActivityIndicator />`，没有传入 `color` 或 `size`，因此不受 Button 当前 `variantStyle.color`、`resolvedIconColor` 或 `size` 控制。相邻普通 icon 在 `packages/pennyspring-ui/src/Button/Button.tsx:437-440` 会使用 `color={resolvedIconColor as IconColor}` 与 `size={resolveIconSize(size, token)}`，但 loading 默认态没有等价 token 驱动。
- 影响：不同 `type` / `variant` / `color` / `disabled` / `size` 下，加载指示器可能使用平台默认颜色和尺寸，导致按钮 loading 状态与文本、图标、按钮尺寸语义不一致，也削弱深色/浅色主题下的视觉可靠性。
- 推荐纠正方案：为默认 `ActivityIndicator` 显式传入 token 派生的 `color` 与随 `size` 映射的尺寸，或用项目内 `Loading` / `Icon` 等已 token 化组件承载默认 loading 图标；自定义 `loading.icon` 仍可作为调用方覆盖能力。
- 修复状态：已修复（默认 `ActivityIndicator` 现已绑定 `resolvedIconColor` 与 `resolveIconSize(size, token)`）

## 需要人工确认

- 无
