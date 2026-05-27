# IndexBar 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：high
- 问题数量：3

## 问题列表

### 1. 公共 API 使用复合子组件声明子项，违反数据驱动组件规范 ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/IndexBar/types.ts:50`
- 违反规范：`.claude/rules/component/coding-style.md`「数据与类型 API」
- 不符合点：`IndexBarComponent` 暴露 `Panel: (props: IndexBarPanelProps) => ReactNode`，实现侧通过 `IndexBar.Panel` 收集子项；测试也以 `<IndexBar><IndexBar.Panel ... /></IndexBar>` 形式使用。规范明确要求“内部选项和子项必须通过数据驱动渲染，不使用复合子组件声明子项”，并禁止 `<A><A.Item /></A>` 形式声明子项。
- 影响：索引项和面板内容无法通过统一数据结构获得完整类型推导与渲染控制，后续扩展滚动定位、禁用态、渲染插槽或批量转换时更容易出现实现和 API 漂移。
- 推荐纠正方案：改为数据驱动 API，例如 `data: IndexBarItem[]` 与 `renderPanel` / `renderItem`，将 `IndexBarPanelProps` 收敛为数据项类型；目录内 `types.ts` 中保留具名接口，并同步调整测试覆盖数据驱动渲染。

### 2. 索引交互没有实现“导航”行为，只更新选中值 ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/IndexBar/IndexBar.tsx:150`
- 违反规范：`.codex/skills/component-composer/references/component-catalog.md`「IndexBar：索引列表导航」；`.claude/rules/component/coding-style.md`「组件必须在内部提供完整的、由 token 驱动的默认外观」「行为关键的布局、动画、无障碍和测量样式应由组件自身持有」
- 不符合点：索引项 `onPress` 只调用 `onPress?.(event, panel.index)` 和 `setSelectedValue(panel.index)`，组件没有 `ScrollView` / `scrollTo` / 面板测量或外部滚动容器衔接 API。与组件目录中“索引列表导航”的定位不一致，当前行为实际只是右侧索引选择状态。
- 影响：用户点击索引后内容区不会跳转到对应分组，IndexBar 的核心用户可感知导航能力缺失；调用方若自行拼接滚动逻辑，会让基础组件正确性依赖外部实现。
- 推荐纠正方案：在组件内持有滚动容器、分组测量和 `scrollTo` 逻辑，或明确设计受控的导航协议并暴露完整类型化 API；若需要拖拽索引选择，应使用 `react-native-gesture-handler` 处理手势，并为选择变化与滚动定位补充测试。

### 3. 测试未覆盖 IndexBar 的关键导航行为 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/IndexBar.test.tsx:76`
- 违反规范：`CLAUDE.md`「测试默认只编写用户可感知的行为断言」；`.claude/rules/common/testing.md`「Test Types」；`.claude/rules/typescript/testing.md`「Use Playwright as the E2E testing framework for critical user flows」
- 不符合点：现有测试只覆盖渲染、`onChange` / `onPress` 回调、受控值和禁用态，未验证点击索引后内容滚动或分组定位等 IndexBar 的关键用户可感知导航行为。
- 影响：即使索引点击不产生导航，当前测试仍会通过，无法保护组件目录所定义的“索引列表导航”能力，回归风险较高。
- 推荐纠正方案：在修正导航行为后新增用户可感知行为测试，覆盖点击索引定位到对应分组、禁用分组不触发定位、受控值变化与选中态同步；若该行为属于关键用户流，再补充 Playwright E2E 覆盖。

## 需要人工确认

- 无
