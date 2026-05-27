# Drawer 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：high
- 问题数量：3

## 问题列表

### 1. Web 平台实现使用了 React Native Animated ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Drawer/AnimatedPressable.web.ts:1`
- 违反规范：`CLAUDE.md:112` 动画约束；`CLAUDE.md:114` 仅允许使用 `react-native-reanimated`；`CLAUDE.md:115` 禁止在组件实现中使用 `react-native` 的 `Animated`
- 不符合点：`AnimatedPressable.web.ts` 从 `react-native` 导入 `Animated`，并在第 3 行通过 `Animated.createAnimatedComponent(Pressable)` 创建动画组件。该文件属于 Drawer 组件实现的一部分，与项目动画规范中“仅允许使用 react-native-reanimated、禁止 React Native Animated”的要求冲突。
- 影响：Web 端 Drawer 的动画基础设施与原生端实现不一致，会绕过统一的 reanimated/token 动画约束，增加跨端行为漂移和维护成本。
- 推荐纠正方案：Web 端也应使用 `react-native-reanimated` 的 `createAnimatedComponent`，与 `packages/pennyspring-ui/src/Drawer/AnimatedPressable.ts:2` 的实现保持一致；如存在 Web 兼容性问题，应封装在 reanimated 兼容层中，而不是退回 React Native `Animated`。

### 2. 公开导出的 Drawer 未同步维护组件目录与文档 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/index.ts:8`
- 违反规范：`.claude/rules/component/coding-style.md:24` 要求新增共享组件或重大能力调整时同步维护 component catalog，确保组件选型目录与实际能力一致；`CLAUDE.md:99` 要求共享组件由包级入口导出
- 不符合点：Drawer 已从包级入口导出，`packages/pennyspring-ui/src/index.ts:8` 导出 `Drawer`，第 9-15 行导出 Drawer 相关类型。但 `rg -n "Drawer" .codex/skills/component-composer/references/component-catalog.md packages/pennyspring-ui/docs/api/index.md packages/pennyspring-ui/docs/index.md` 无任何命中；同时 component catalog 的“浮层与反馈”段落仅列出 `Dialog`、`Popup`、`Portal` 等条目（`.codex/skills/component-composer/references/component-catalog.md:79` 到 `:83`），没有 Drawer。
- 影响：调用方无法从组件选型目录发现 Drawer，也无法在 UI 文档中确认 Drawer 的公开 API、使用场景、与 `Popup`/`Dialog` 的边界，容易导致重复造轮子或误用浮层组件。
- 推荐纠正方案：在 `.codex/skills/component-composer/references/component-catalog.md` 的“浮层与反馈”中补充 `Drawer` 条目，并在 `packages/pennyspring-ui/docs/api/index.md` 或对应组件文档中说明 `open`、`defaultOpen`、`onOpenChange`、`onCancel`、`drawerPosition`、`drawerType`、`Drawer.Layout` 等公开能力。

### 3. 测试未覆盖 Drawer 的核心用户可感知行为 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Drawer.test.tsx:70`
- 违反规范：`CLAUDE.md:138` 要求测试文件覆盖组件行为；`CLAUDE.md:139` 要求按 AAA 组织且测试名直接描述行为；`CLAUDE.md:140` 要求测试默认只编写用户可感知行为断言；`.claude/rules/common/testing.md:31` 要求按 AAA 组织
- 不符合点：现有 Drawer 测试从第 70 行开始只有 3 个用例，分别覆盖 Portal 挂载、`mountPoint="local"` 和缺少 `PortalProvider` 时抛错（`packages/pennyspring-ui/__tests__/Drawer.test.tsx:71`、`:95`、`:120`）。但 Drawer 的核心用户可感知行为在实现中包括点击遮罩关闭并触发 `onCancel` / `onOpenChange(false)`（`packages/pennyspring-ui/src/Drawer/Drawer.tsx:303` 到 `:305`、`:337` 到 `:353`）、可控/非可控 `open` 状态（`:119` 到 `:139`）、以及 `Drawer.Layout` 的场景遮罩关闭（`:428` 到 `:435`），这些都没有测试保护。
- 影响：浮层关闭回调顺序、受控状态同步、默认打开状态、遮罩点击关闭、`Drawer.Layout` 组合行为和用户交互回归都可能在未来改动中失效而不被测试发现。
- 推荐纠正方案：补充用户可感知行为测试，并按 AAA 结构覆盖至少以下场景：点击 `drawer-overlay` 时先触发 `onCancel` 再触发 `onOpenChange(false)`；受控 `open` 不由内部直接改变展示状态；`defaultOpen` 可初始化打开；`Drawer.Layout` 点击 back mask 时触发关闭；`swipeEnabled={false}` 时手势关闭不生效或手势禁用配置被传递。

## 需要人工确认

- 无
