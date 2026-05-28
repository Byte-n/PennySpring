# CalculatorInput 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 样式中硬编码非例外百分比宽度

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/CalculatorInput/style/index.ts:98`
- 违反规范：`CLAUDE.md` 样式约束（React Native）；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`leftPad` 样式直接写入 `width: '75%'`。项目样式约束中仅将 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'` 列为数字/字面量例外，`'75%'` 不在例外范围内。
- 影响：键盘布局比例以硬编码形式固化，无法由组件语义或 token 体系解释，后续尺寸调整和主题一致性较差。
- 推荐纠正方案：使用 `flex` 布局表达三列与确认键关系，或提取语义化常量并说明这是布局算法例外；优先避免百分比硬编码。

### 2. 数字键 hitSlop 使用硬编码数值

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/CalculatorInput/CalculatorInput.tsx:41`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Token 边界与通用交互；`CLAUDE.md` 样式约束（React Native）
- 不符合点：`KEYPAD_HIT_SLOP = 4` 被用于 `Pressable` 的 `hitSlop`（`CalculatorInput.tsx:584`）。点击热区属于交互尺寸，规范要求可点击区域优先保证 `controlHeight` 或 `hitSlop`，且组件不得硬编码间距/尺寸数值，应通过 token 或可解释的语义化计算获得。
- 影响：点击热区与设计 token 脱节，可能在不同尺寸或密度策略下无法维持统一可点击体验。
- 推荐纠正方案：从 `token.paddingXXS`、`token.controlHeightSM` 等语义 token 计算 hitSlop，并通过 `createUseSheetStyle` 或 `useTheme` 注入；避免固定数字常量。

## 需要人工确认

- 无
