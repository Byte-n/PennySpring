# GeometryReader 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 测试未覆盖布局尺寸变化后的重新测量行为 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/__tests__/GeometryReader.test.tsx:21`
- 违反规范：`.claude/rules/common/testing.md`、`CLAUDE.md` 测试约束
- 不符合点：GeometryReader 的核心职责是布局尺寸测量，当前测试只验证首次 `onLayout` 后 `children` 收到 `{ width: 200, height: 100 }`，以及 `defaultGeometry` 的初始渲染。`packages/pennyspring-ui/src/GeometryReader/GeometryReader.tsx:23` 到 `packages/pennyspring-ui/src/GeometryReader/GeometryReader.tsx:25` 会在每次 `onLayout` 时写入新的 geometry，但测试没有触发第二次不同尺寸的 `onLayout` 并断言 `children` 收到更新后的尺寸。测试规范要求覆盖关键行为，项目宪章要求测试默认编写用户可感知行为断言；对 GeometryReader 来说，布局变化后的重新测量是调用方可观察到的核心测量行为。
- 影响：如果后续实现只保留首次测量、忽略尺寸变化，或在重复布局事件中传递旧 geometry，现有测试仍可能通过，导致依赖 GeometryReader 响应容器尺寸变化的组件出现布局错误且缺少回归保护。
- 推荐纠正方案：在 `GeometryReader.test.tsx` 中补充一个按 AAA 组织的用例，先渲染组件，再依次触发两次不同尺寸的 `onLayout`，最后断言 `children` 至少收到最新 `{ width, height }`。测试名应直接描述行为，例如 `updates children when layout size changes`。

## 需要人工确认

- 无
