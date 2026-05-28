# Radio 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 单选控件和内容容器使用 View 手写布局 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Radio/Radio.tsx:104`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：`renderControl` 使用 `View` 绘制 control/indicator，`RadioComponent` 和 `RadioGroup` 的内容容器也使用 `View`（`Radio.tsx:184`、`Radio.tsx:275`），样式中 `option`、`content` 在 `style/index.ts:60` 到 `style/index.ts:66`、`style/index.ts:123` 到 `style/index.ts:127` 手写横向布局。项目规范要求普通布局优先使用 `Row`、`Column` 等已有布局组件。
- 影响：Radio 与 Checkbox 的控件布局实现容易漂移，内容对齐和 gap 语义不统一。
- 推荐纠正方案：组选项继续使用 `Row`/`Column`，单项内部内容使用 `Row`；仅保留绘制圆点所必需的底层 View。

### 2. Label 选中/禁用颜色仍通过 style 覆盖 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Radio/Radio.tsx:66`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：`renderLabel` 虽然传入了 `Text color`，但仍合并 `tokenStyles.labelSelected` 和 `tokenStyles.labelDisabled`；这些样式在 `style/index.ts:131` 到 `style/index.ts:135` 中包含 `color`。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：单选文本状态色同时由 props 和 style 控制，容易导致优先级混乱。
- 推荐纠正方案：根据 selected/disabled 直接计算 `Text color`，移除状态颜色样式，仅保留字体族或外部样式覆盖。

## 需要人工确认

- 无
