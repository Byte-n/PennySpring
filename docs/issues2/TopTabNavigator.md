# TopTabNavigator 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 重新实现 Segmented 能力而未复用现有组件

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/TopTabNavigator/SegmentedControl.tsx:118`
- 违反规范：`.claude/rules/component/coding-style.md`、`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：`SegmentedControl` 使用 `View`、`Pressable`、`Animated.View` 和 `Text` 自行实现分段选项、选中指示器、文字状态和横向布局，见 `SegmentedControl.tsx:118`、`SegmentedControl.tsx:120`、`SegmentedControl.tsx:121`、`SegmentedControl.tsx:130`、`SegmentedControl.tsx:137`；同一组件库已有 `Segmented` 组件负责分段选择能力。共享组件规范要求优先复用 `packages/pennyspring-ui` 中已有能力。
- 影响：TopTabNavigator 的分段导航视觉、状态、尺寸和交互逻辑与 `Segmented` 组件分叉，后续 `Segmented` 的 token、状态或可访问性修正不会同步到这里。
- 推荐纠正方案：将 `SegmentedControl` 改为组合 `Segmented`，把 routes 映射为 `SegmentedOption`，通过 `value`、`onChange` 驱动 `navigation.navigate`；如顶部导航需要特殊指示器，应先评估是否扩展 `Segmented` 的通用能力，而不是在 TopTabNavigator 内独立实现。

### 2. 内部实现组件从包级入口公开导出

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/TopTabNavigator/index.ts:2`
- 违反规范：`.claude/rules/component/coding-style.md`
- 不符合点：`HeaderBar` 和 `SegmentedControl` 是 `TopTabNavigator` 目录下的实现拆分文件，但被目录入口导出，并进一步从包级入口导出，见 `TopTabNavigator/index.ts:2`、`TopTabNavigator/index.ts:3` 与 `packages/pennyspring-ui/src/index.ts:290`。组件规范要求共享组件位于独立组件目录并从对应目录入口导出；内部实现不应作为独立公共组件泄漏。
- 影响：调用方可能直接依赖未按独立组件目录治理的内部实现，后续重构 TopTabNavigator 结构时会形成破坏性 API 变更。
- 推荐纠正方案：如果 `HeaderBar`、`SegmentedControl` 是内部实现，应从 `TopTabNavigator/index.ts` 和包级入口移除导出；如果它们需要成为公共组件，应拆到各自的组件目录，补齐独立 `index.ts`、`types.ts`、样式和组件目录治理。

## 需要人工确认

- 无
