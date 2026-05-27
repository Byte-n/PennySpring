# Icon 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. `size` 公共 API 允许任意数字，超出组件尺寸规范 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Icon/types.ts:7`
- 违反规范：`.claude/rules/component/coding-style.md` 尺寸 API；`.claude/rules/common/component-visual-layout.md` Size 与间距 Token
- 不符合点：`IconSize` 定义为 `ComponentSize | number`，而组件规范要求提供 `size` 时只支持 `small`、`normal`、`large` 三个值，默认值为 `normal`。实现中也直接接受数字并透传为图标尺寸：`packages/pennyspring-ui/src/Icon/Icon.tsx:101` 到 `packages/pennyspring-ui/src/Icon/Icon.tsx:104`。
- 影响：调用方可以绕过 token 尺寸语义传入任意硬编码数字，导致图标尺寸和文本、按钮、列表等组件的尺寸体系漂移，增加视觉一致性和维护成本。
- 推荐纠正方案：将公开 `size` 收敛为 `ComponentSize`，保留 `small`、`normal`、`large` 且默认 `normal`；如果确有自定义图标尺寸需求，应重新评估是否需要独立语义 prop，并通过 token 或受控映射实现，避免把任意数字作为标准 `size` API。

### 2. `IconColor` 与 `TextColor` 的语义取值不一致 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Icon/types.ts:9`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：组件规范要求 `Text` 组件的 `color` 取值必须与 `Icon` 组件的 `color` 取值保持一致。当前 `IconSemanticColor` 只包含 `default`、`primary`、`success`、`warning`、`danger`、`info`，而 `TextSemanticColor` 包含 `base`、`default`、`secondary`、`tertiary`、`quaternary`、`heading`、`label`、`description`、`disabled`、`placeholder`、`lightSolid`，两者公共语义色集合不一致；对应证据在 `packages/pennyspring-ui/src/Text/types.ts:22` 到 `packages/pennyspring-ui/src/Text/types.ts:34`。
- 影响：文本和图标作为常见相邻前景元素时，调用方无法用同一组语义值表达一致颜色意图，容易出现文本色和图标色语义漂移；组合组件也需要额外分支映射。
- 推荐纠正方案：按组件规范统一 `TextColor` 与 `IconColor` 的可接受语义取值，并同步调整 `useTextColor`、`useIconColor` 的映射；完成后更新 `packages/pennyspring-ui/docs/guide/component-color-design.md` 中 Text/Icon 颜色设计说明和相关类型测试。

### 3. `useIconColor` 会把无法识别的颜色字符串作为自定义颜色透传 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Icon/useIconColor.ts:29`
- 违反规范：`packages/pennyspring-ui/docs/guide/component-color-design.md` Text / Icon 类型
- 不符合点：颜色设计文档要求 `Text`、`Icon` 的 `AliasColorTokenKey` 使用 `getAliasColorTokenValue(token, color)` 解析，并且“不把无法识别的值作为自定义颜色字符串透传”；文档证据在 `packages/pennyspring-ui/docs/guide/component-color-design.md:225` 到 `packages/pennyspring-ui/docs/guide/component-color-design.md:227`。当前 `resolveIconColor` 的入参类型包含 `string`，并在 alias token 解析失败时返回原始 `color`：`return getAliasColorTokenValue(token, color) ?? color;`。
- 影响：TypeScript 调用方通常会被 `IconColor` 拦住，但 JS 调用方、类型绕过或内部误用仍可把 `'#123456'`、`'red'` 等自定义颜色透传到 Phosphor 图标，绕过 token 体系和深浅色适配。
- 推荐纠正方案：将 `useIconColor` 入参收敛为 `IconColor | undefined`，解析失败时回退到 `token.colorIcon` 或显式拒绝；同时为非法自定义字符串不透传补充类型或运行时测试。

### 4. Icon 测试未覆盖颜色与尺寸等关键用户可感知行为 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Icon.test.tsx:21`
- 违反规范：`CLAUDE.md` 测试约束；`.claude/rules/common/testing.md` Test Structure；`.claude/rules/typescript/testing.md`
- 不符合点：现有 `Icon.test.tsx` 只有两个渲染存在性断言，分别覆盖内置名称和直接传入 Phosphor 组件：`packages/pennyspring-ui/__tests__/Icon.test.tsx:21` 到 `packages/pennyspring-ui/__tests__/Icon.test.tsx:35`。但 Icon 的关键用户可感知行为包括默认尺寸、`small`/`normal`/`large` 尺寸映射、语义色和 alias token 颜色解析、`duotoneColor` 解析、`weight`/`mirrored` 等对底层图标的透传，目前没有行为断言覆盖。`componentColorTypes.test.tsx` 只覆盖部分类型边界，不能验证运行时渲染结果。
- 影响：尺寸和颜色映射是 Icon 最核心的视觉契约，缺少测试会让 token 映射、默认值或非法颜色兜底发生回归时难以及时发现。
- 推荐纠正方案：补充以用户可见输出为中心的测试，按 AAA 组织，至少覆盖默认 `normal` 尺寸、三档尺寸映射、语义色/alias token 解析、非法自定义颜色不透传、`duotoneColor` 与基础图标 props 的透传行为。

## 需要人工确认

- 无
