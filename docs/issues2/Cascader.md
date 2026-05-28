# Cascader 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 触发器与选项文本优先通过 style 控制字号和颜色

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Cascader/Cascader.tsx:206`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：触发器文本使用 `<Text style={[tokenStyles.valueText, styles?.valueText]}>`，`tokenStyles.valueText` 在 `style/index.ts:88` 到 `style/index.ts:93` 中包含 `fontSize`、`lineHeight`、`color`。选项文本也在 `CascaderView.tsx:198` 使用 `tokenStyles.optionLabel`，其样式在 `style/index.ts:148` 到 `style/index.ts:153` 中包含文本视觉属性。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：Cascader 的文本尺寸和颜色绕过 `Text` 组件语义，可能与同类输入和选择组件的文本规范产生漂移。
- 推荐纠正方案：将 value、placeholder、optionLabel 的颜色、尺寸、字重优先映射为 `Text` props；样式插槽仅保留额外排版或无法通过 Text props 表达的属性。

### 2. 触发器和选项行使用 View 手写布局

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Cascader/Cascader.tsx:181`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：根、valueArea、marker、optionContent 等结构使用 `View`，样式中在 `style/index.ts:70`、`style/index.ts:120` 直接手写 `flexDirection: 'row'`。项目规范要求界面布局优先使用 `Row`、`Column`、`Space` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：触发器和选项行的横向布局语义分散在样式中，尺寸、gap 和对齐策略难以与其他选择组件保持统一。
- 推荐纠正方案：触发器和选项行使用 `Row`，面板与列表外层使用 `Column` 或现有布局组件；仅在 FlatList/Popup 等底层容器必须直接使用 RN 组件时保留 `View`。

## 需要人工确认

- 无
