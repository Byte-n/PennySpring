# Slider 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：high
- 问题数量：4

## 问题列表

### 1. 拖拽手势使用 React Native responder，未接入 gesture-handler ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Slider/Slider.tsx:203`
- 违反规范：`CLAUDE.md` 手势约束，要求手势相关能力统一使用 `react-native-gesture-handler`；应用根已挂载 `<GestureHandlerRootView>`，组件内可直接使用手势组件。
- 不符合点：Slider 在轨道 `View` 上使用 `onStartShouldSetResponder`、`onResponderGrant`、`onResponderMove`、`onResponderRelease` 处理拖拽与点击（`packages/pennyspring-ui/src/Slider/Slider.tsx:203` 到 `packages/pennyspring-ui/src/Slider/Slider.tsx:206`），没有使用 `react-native-gesture-handler` 的 `Gesture` / `GestureDetector` 或对应手势组件。
- 影响：Slider 的拖拽行为绕过项目统一手势体系，和根部 `GestureHandlerRootView` 约定不一致；在嵌套滚动、手势竞争和原生手势协作场景中更容易出现行为漂移，也增加后续统一手势策略的维护成本。
- 推荐纠正方案：将轨道点击/拖动迁移到 `react-native-gesture-handler`，用 tap / pan 手势计算位置并触发 `setInternalValue`；保留 `disabled`、`readonly`、`min/max/step` 的现有语义，并补充手势更新与释放路径的测试。

### 2. 动态样式在渲染处拼接对象，绕过 `createUseSheetStyle` options ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Slider/Slider.tsx:167`
- 违反规范：`CLAUDE.md` 样式约束要求动态样式通过 `createUseSheetStyle<TOptions>` 的泛型参数传入，不在调用处拼 `[styles.a, { ... }]`；`.claude/rules/component/coding-style.md`「样式实现」要求默认合并顺序为 token 样式、组件运行时样式、外部样式；`.codex/skills/theme-tokens/SKILL.md` 要求组件样式通过 `createUseSheetStyle` 消费 token。
- 不符合点：Slider 在组件逻辑中创建 `trackFillStyle`，写入动态 `width: \`${clampedProgress * 100}%\``（`packages/pennyspring-ui/src/Slider/Slider.tsx:167` 到 `packages/pennyspring-ui/src/Slider/Slider.tsx:172`），并在渲染处合并到 `trackFill` 样式数组（`packages/pennyspring-ui/src/Slider/Slider.tsx:211`）。拇指位置也在 JSX 样式数组中直接拼入对象 `{ left: trackWidth * clampedProgress }`（`packages/pennyspring-ui/src/Slider/Slider.tsx:216` 到 `packages/pennyspring-ui/src/Slider/Slider.tsx:221`）。
- 影响：Slider 的进度宽度和拇指定位样式分散在渲染逻辑里，绕过统一样式工厂后更难检查 token 样式、运行时样式和外部样式的合并顺序；后续主题、尺寸和视觉状态调整也需要同时理解渲染逻辑与样式逻辑。
- 推荐纠正方案：把 `trackWidth`、`clampedProgress` 等动态参数纳入 `createUseSheetStyle<SliderStyleOptions>` options，统一生成 `trackFill` 与 `thumbContainer` 的运行时样式；保持合并顺序为 token 样式、组件运行时样式、外部 `styles` 覆盖。

### 3. 测试未覆盖 Slider 的主要公开行为 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Slider.test.tsx:27`
- 违反规范：`CLAUDE.md` 测试约束；`.claude/rules/common/testing.md` 要求按 AAA 组织测试并覆盖用户可感知行为，最低覆盖率目标为 80%；`.claude/rules/typescript/testing.md` 继承通用测试要求。
- 不符合点：现有测试只验证非受控轨道点击会触发一次 `onChange`（`packages/pennyspring-ui/__tests__/Slider.test.tsx:27` 到 `packages/pennyspring-ui/__tests__/Slider.test.tsx:44`）以及 `disabled` / `readonly` 不触发变更（`packages/pennyspring-ui/__tests__/Slider.test.tsx:45` 到 `packages/pennyspring-ui/__tests__/Slider.test.tsx:70`）。但 `SliderProps` 公开了 `value`、`defaultValue`、`min`、`max`、`step`、`size`、`styles` 等行为（`packages/pennyspring-ui/src/Slider/types.ts:14` 到 `packages/pennyspring-ui/src/Slider/types.ts:64`），实现也包含受控值归一化、步进吸附、反向 min/max 保护、轨道宽度计算和尺寸样式分支，这些主要用户可感知行为没有测试覆盖。
- 影响：受控模式、步进计算、边界归一化、尺寸语义和样式插槽后续发生回归时，当前测试仍可能通过；尤其迁移手势实现时，缺少 `value/defaultValue/onChange` 与 `min/max/step` 的保护会提高行为回归风险。
- 推荐纠正方案：补充 Slider 行为测试，优先覆盖受控 `value` 不被内部状态直接改写但会触发 `onChange`、`defaultValue` 初始化位置、`min/max/step` 的吸附和边界、`max < min` 的归一化、`size` 对高度/拇指尺寸的影响，以及 `styles` 插槽能按外部覆盖顺序合并。

## 需要人工确认

无
