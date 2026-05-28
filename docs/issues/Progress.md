# Progress 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 动态样式在渲染处以内联对象拼接 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Progress/Progress.tsx:237`
- 违反规范：`CLAUDE.md` 样式约束；`.claude/rules/component/coding-style.md` 样式实现；`.codex/skills/theme-tokens/SKILL.md` API
- 不符合点：`ProgressBar` 在 `style` 数组中拼接 `{ width: `${normalizedPercent}%` }`，`ProgressCircle` 也在 `packages/pennyspring-ui/src/Progress/Progress.tsx:293` 和 `packages/pennyspring-ui/src/Progress/Progress.tsx:303` 拼接 `{ transform: [{ rotate: rotation.left }] }` / `{ transform: [{ rotate: rotation.right }] }`。项目宪章要求动态样式通过 `createUseSheetStyle<TOptions>` 的 options 传入，不在调用处拼 `[styles.a, { ... }]`。
- 影响：样式来源分散，绕过主题样式工厂的统一约束；后续若需要把进度、旋转或动效接入 token/options，会更容易出现样式合并顺序和状态表现不一致。
- 推荐纠正方案：把 `normalizedPercent`、左右半圆旋转值作为 `createUseSheetStyle` options 输入，在样式工厂内生成 `barIndicator` 宽度和半圆 `transform`；外部 `styles?.indicator` 仍按“token 样式、组件运行时样式、外部样式”的顺序合并。

### 2. 进度文字通过 `style` 设置颜色和字号，未优先使用项目 Text 的语义 props ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Progress/Progress.tsx:119`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`renderInfo` 使用 `<Text style={style}>` 渲染展示文本，而 `style` 来自 `tokenStyles.info` 和 `tokenStyles.indicatorText`；这些样式在 `packages/pennyspring-ui/src/Progress/Progress.tsx:150` 至 `packages/pennyspring-ui/src/Progress/Progress.tsx:155`、`packages/pennyspring-ui/src/Progress/Progress.tsx:207` 至 `packages/pennyspring-ui/src/Progress/Progress.tsx:209` 中直接设置 `color`、`fontSize`、`fontWeight`、`lineHeight`。规范要求展示文本使用项目 `Text` 组件，且 `Text` 字号、颜色等优先使用 `TextProps`，禁止优先使用 `style`。
- 影响：Progress 自行维护文本字号、行高、字重和颜色映射，容易与 `Text` 组件的语义尺寸、颜色和默认字重漂移；外部覆盖 `styles.info` 时也更难判断哪些是 Text 语义能力，哪些是 Progress 内部样式。
- 推荐纠正方案：将 Progress 的 `size` 映射到 `Text` 的 `size`（例如 small -> `sm`、normal -> `md`、large -> `lg`），将普通/状态颜色映射到 `Text` 的 `color` 语义或 `AliasColorTokenKey`，必要时只把布局相关或插槽覆盖样式留在 `style`。

### 3. 目录级导出与包级入口导出不同步 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Progress/index.ts:1`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出；`CLAUDE.md` 组件约束
- 不符合点：目录级入口导出了 `Progress`、`ProgressBar`、`ProgressCircle`，并在 `packages/pennyspring-ui/src/Progress/index.ts:2` 至 `packages/pennyspring-ui/src/Progress/index.ts:9` 导出了 `ProgressComponent` 等类型；但包级入口 `packages/pennyspring-ui/src/index.ts:295` 至 `packages/pennyspring-ui/src/index.ts:302` 只导出 `Progress` 和部分 props/styles/status 类型，未同步导出 `ProgressBar`、`ProgressCircle`、`ProgressComponent`。规范要求组件由目录内 `index.ts` 导出，并同步从包级入口导出。
- 影响：从 `@pennyspring/ui` 消费时无法直接使用目录级已经公开的 `ProgressBar` / `ProgressCircle` 命名导出，公共 API 暴露面在深路径和包级入口之间不一致；`ProgressComponent` 类型也无法从包级入口取得。
- 推荐纠正方案：明确 Progress 的公共导出面。如果 `ProgressBar` / `ProgressCircle` / `ProgressComponent` 是公开 API，应在 `packages/pennyspring-ui/src/index.ts` 同步导出；如果不是公开 API，应收窄目录级 `index.ts` 导出并避免测试或外部依赖深路径。

### 4. 测试直接验证内部 helper，未以用户可感知行为覆盖边界值和环形进度 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/__tests__/Progress.test.tsx:5`
- 违反规范：`CLAUDE.md` 测试约束；`.claude/rules/common/testing.md` Test Structure / Test Naming；`.claude/rules/typescript/testing.md`
- 不符合点：测试从 `../src/Progress/Progress` 直接导入 `clampPercent`、`resolveCircleRotation`，并在 `packages/pennyspring-ui/__tests__/Progress.test.tsx:21` 至 `packages/pennyspring-ui/__tests__/Progress.test.tsx:27`、`packages/pennyspring-ui/__tests__/Progress.test.tsx:42` 至 `packages/pennyspring-ui/__tests__/Progress.test.tsx:50` 断言内部计算结果。规范要求测试默认只编写用户可感知的行为断言；当前边界值和环形进度旋转覆盖落在实现细节上，而不是通过 `ProgressBar` / `ProgressCircle` 的可观察渲染结果验证。实现文件还在 `packages/pennyspring-ui/src/Progress/Progress.tsx:329` 导出了这些 helper，进一步扩大了内部实现的可见面。
- 影响：测试会锁定内部算法形状，重构环形进度实现时容易产生无意义失败；同时缺少对用户实际看到的百分比、条形宽度、环形状态和边界值渲染结果的直接保护。
- 推荐纠正方案：移除面向测试暴露的内部 helper，改为通过组件公开 API 断言用户可感知行为，例如默认百分比文本、`showInfo={false}`、`format` 输出、负数/超过 100 的渲染归一化结果、`status="success" | "exception"` 的状态样式，以及环形进度在关键百分比下的可观察结构或样式。

## 需要人工确认

- 无
