# Calendar 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. 日历网格样式硬编码非例外百分比宽度 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:28`
- 违反规范：`CLAUDE.md` 样式约束（React Native）；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：组件定义 `GRID_CELL_PERCENT = '14.2857%'`，并在 `Calendar.tsx:81`、`Calendar.tsx:92` 用作周与日期单元宽度；同时 `Calendar.tsx:99`、`Calendar.tsx:102` 直接写入 `'33.3333%'` 和 `'25%'`。项目样式约束仅允许 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'` 作为字面量例外，这些百分比不在例外范围内。
- 影响：网格列数与宽度算法隐藏在硬编码样式中，后续调整模式列数、响应式布局或 token 体系时缺少语义入口。
- 推荐纠正方案：优先用 `Grid` 组件或 `flexBasis`/布局算法表达列数；确需百分比时应提取语义化布局算法并记录为局部例外，避免裸百分比写入样式。

### 2. 操作按钮 hitSlop 使用硬编码数值 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:29`
- 违反规范：`.claude/rules/common/component-visual-layout.md` 通用交互；`CLAUDE.md` 样式约束（React Native）
- 不符合点：`ACTION_HIT_SLOP = 8` 被用于 today、cancel、ok 等 `Pressable`（如 `Calendar.tsx:544`、`Calendar.tsx:554`、`Calendar.tsx:565`）。点击热区属于交互尺寸，规范要求可点击区域优先保证 `controlHeight` 或 `hitSlop`，同时不得硬编码间距/尺寸数值。
- 影响：操作按钮热区无法随组件尺寸或主题 token 调整，可能造成不同尺寸下交互体验不一致。
- 推荐纠正方案：通过 `useTheme().token` 或 `createUseSheetStyle` 使用 `paddingXXS`、`controlHeightSM` 等 token 计算 hitSlop。

### 3. Calendar 内部展示文本优先通过 style 控制颜色 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Calendar/Calendar.tsx:386`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：日期文本使用 `<Text style={[styles.dateText, slotStyles?.dateText]}>`，其中 `styles.dateText` 在 `Calendar.tsx:118` 到 `Calendar.tsx:120` 中写入 `color: token.colorText`；标题和周文本也使用相同方式。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：日历文本颜色语义绕过 `Text` 组件 API，和 Icon/Text 统一色彩语义容易漂移。
- 推荐纠正方案：将标题、周文本、日期文本颜色优先映射为 `Text` 的 `color` props；样式插槽仅保留 `TextProps` 无法表达的局部样式。

## 需要人工确认

- 无
