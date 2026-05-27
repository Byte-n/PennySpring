# Popup 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：high
- 问题数量：4

## 问题列表

### 1. Popup 根组件使用 React Native Animated 实现动画

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Popup/Popup.tsx:3`
- 违反规范：`CLAUDE.md` 动画约束、`.claude/rules/common/component-visual-layout.md` Token 边界、`.codex/skills/theme-tokens/SKILL.md` RN 踩坑
- 不符合点：`Popup.tsx` 从 `react-native` 导入 `Animated`，并在 `Animated.createAnimatedComponent`、`Animated.Value`、`Animated.timing` 与 `<Animated.View>` 中使用。可定位代码包括 `packages/pennyspring-ui/src/Popup/Popup.tsx:25`、`packages/pennyspring-ui/src/Popup/Popup.tsx:181`、`packages/pennyspring-ui/src/Popup/Popup.tsx:210`、`packages/pennyspring-ui/src/Popup/Popup.tsx:220`、`packages/pennyspring-ui/src/Popup/Popup.tsx:304`。项目宪章明确禁止组件实现使用 React Native `Animated`、`Animated.timing/spring/decay`，动画只能使用 `react-native-reanimated`。
- 影响：Popup 是浮层基础组件，RN Animated 会让动画实现与项目统一的 reanimated 动画体系不一致，也绕开 `Easing.bezier(...token.motionEase*)` 的统一动效手感要求。
- 推荐纠正方案：将 `progress` 改为 `useSharedValue`，使用 `withTiming`、`useAnimatedStyle` 和 `Easing.bezier(...token.motionEase*)` 实现遮罩透明度和 body 位移；移除 `react-native` 的 `Animated` 导入与 `<Animated.View>`。

### 2. Popup 动画样式以内联对象拼接，未通过样式工厂或 reanimated 动态样式承载

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Popup/Popup.tsx:282`
- 违反规范：`CLAUDE.md` 样式约束、`.claude/rules/component/coding-style.md` 样式实现、`.codex/skills/theme-tokens/SKILL.md` API
- 不符合点：`fadeStyle` 和 `bodyAnimatedStyle` 在组件渲染过程中以 `{ opacity: progress }`、`{ ...fadeStyle, ...(slideTransform ? { transform: slideTransform } : null) }` 字面量对象创建，并直接拼入 `style` 数组（`packages/pennyspring-ui/src/Popup/Popup.tsx:282`、`packages/pennyspring-ui/src/Popup/Popup.tsx:287`、`packages/pennyspring-ui/src/Popup/Popup.tsx:300`、`packages/pennyspring-ui/src/Popup/Popup.tsx:305`）。项目样式约束要求样式通过 `createUseSheetStyle` 构建，动态样式通过 `createUseSheetStyle<TOptions>` options 传入；动画动态样式则应由 reanimated 的 `useAnimatedStyle` 承载。
- 影响：动态视觉样式散落在渲染体内，后续 token 化、主题一致性与动画替换都更难维护，也扩大了调用处样式拼接的不可控面。
- 推荐纠正方案：静态布局继续放入 `createUseSheetStyle`；动画相关样式用 `useAnimatedStyle` 返回，并只与 token 样式、外部 `style/styles` 按规范顺序合并。

### 3. Popup 默认 zIndex 表达式不符合 Popup 类组件层级约定

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Popup/Popup.tsx:131`
- 违反规范：`.claude/rules/component/coding-style.md` Z 轴层级
- 不符合点：Popup 布局使用 `zIndex: token.zIndexPopupBase + token.zIndexBase + 100`。规范明确要求 Popup 类组件默认使用 `token.zIndexPopupBase + 100`，普通同层级覆盖关系由 `Portal` 挂载顺序决定。当前表达式额外叠加 `token.zIndexBase`，当主题覆盖 `zIndexBase` 时会改变 Popup 默认浮层层级。
- 影响：浮层层级语义不稳定，可能破坏 Popup、Dialog、Picker 等同层级组件间通过 Portal 顺序建立覆盖关系的约定。
- 推荐纠正方案：将默认层级改为 `token.zIndexPopupBase + 100`；如果存在局部覆盖需求，应在更具体的场景中用明确 token 派生，而不是改变 Popup 基础默认层级。

### 4. Popup 测试未覆盖公开的 FloatingPanel 子组件行为

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Popup.test.tsx:13`
- 违反规范：`CLAUDE.md` 测试约束、`.claude/rules/common/testing.md` Test Structure、`.claude/rules/typescript/testing.md`
- 不符合点：Popup 通过 `Object.assign(PopupRoot, { FloatingPanel })` 公开 `Popup.FloatingPanel`（`packages/pennyspring-ui/src/Popup/index.ts:3`），且 `PopupFloatingPanelProps` 暴露 `open/defaultOpen/onOpenChange`、`value/defaultValue/onChange`、`onCancel/onOk`、`keyboardAvoiding`、`size`、`height/minHeight/maxHeight` 等用户可感知行为（`packages/pennyspring-ui/src/Popup/types.ts:78`）。但 `Popup.test.tsx` 只包含 `describe('Popup', ...)` 的根组件测试，未出现 `FloatingPanel`、`floating-panel-*`、`onOk` 或 `value/defaultValue` 相关断言。
- 影响：公开子组件的受控/非受控打开、确认/取消、拖拽高度、按钮禁用/加载、标题/页脚渲染等关键行为缺少回归保护，后续改动可能破坏 API 而测试仍通过。
- 推荐纠正方案：在 `Popup.test.tsx` 中补充 `Popup.FloatingPanel` 的用户可感知行为测试，按 AAA 组织，至少覆盖默认打开/关闭、受控 `open`、取消与确认回调顺序、`closeOnCancel/closeOnOk`、`value/defaultValue/onChange` 高度控制、默认 footer 按钮状态，以及必要的遮罩关闭行为。

## 需要人工确认

- 无
