# KeyboardAware 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 聚焦输入框时使用 React Native ScrollView 原生滚动动画 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/KeyboardAware/KeyboardAwareFormScroll.tsx:101`
- 违反规范：`CLAUDE.md` 动画约束；`.claude/rules/common/component-visual-layout.md` Token 边界
- 不符合点：`KeyboardAwareFormScroll` 在聚焦输入框需要避让键盘时调用 `scrollView.scrollTo({ y: ..., animated: true })`。项目宪章要求动画实现仅允许使用 `react-native-reanimated`，禁止使用 React Native 动画能力；组件视觉规范要求动效数值遵循 `theme-tokens`。这里的原生滚动动画由 React Native `ScrollView` 触发，动画时长和缓动无法通过 `AliasToken` 的 `motionDuration*` / `motionEase*` 统一控制。
- 影响：键盘避让滚动的动效手感会游离于主题 motion token 之外，后续主题关闭或调整动效时该行为无法统一响应，也会让共享布局组件的动画实现方式与项目规范不一致。
- 推荐纠正方案：如果该滚动不需要动画，改为 `animated: false`，只保留布局避让行为；如果需要保留动效，应改用 `react-native-reanimated` 方案，并用 `token.motionDuration*` 与 `Easing.bezier(...token.motionEase*)` 统一配置时长和缓动，避免直接依赖 React Native `ScrollView` 的原生 `animated: true`。

## 需要人工确认

- 无
