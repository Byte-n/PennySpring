# Result 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. large 图标容器尺寸使用硬编码倍率 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Result/style/index.ts:50`
- 违反规范：`CLAUDE.md` 样式约束（React Native）；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`large` 尺寸下 `iconContainerSize` 使用 `token.sizeXXL * 1.25`，`iconBorderRadius` 也使用同一硬编码倍率。项目样式约束禁止样式值中的数字字面量；无合适 token 时允许语义化命名常量或动态计算值，但这里直接写入裸倍率。
- 影响：Result 大尺寸图标规格缺少明确 token 语义，后续主题或尺寸调整时不易统一。
- 推荐纠正方案：优先选择现有尺寸 token；确需 1.25 倍时提取为 `RESULT_LARGE_ICON_SCALE` 并说明这是组件级尺寸算法例外。

### 2. 标题和副标题颜色同时通过 TextProps 与 style 控制 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Result/Result.tsx:55`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：标题和副标题已传入 `Text color`，但仍合并 `tokenStyles.title`、`tokenStyles.subtitle`；对应样式在 `style/index.ts:97` 到 `style/index.ts:103` 中包含颜色。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：文本色彩来源重复，外部样式覆盖和默认语义可能出现优先级不清。
- 推荐纠正方案：颜色仅通过 `Text color` 表达，`tokenStyles.title/subtitle` 保留 `textAlign` 等非色彩属性。

## 需要人工确认

- 无
