# DisplayInput 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 展示文本、标签和辅助文本优先通过 style 控制颜色与字号

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DisplayInput/DisplayInput.tsx:154`
- 违反规范：`CLAUDE.md` 组件约束
- 不符合点：值文本使用 `<Text style={[tokenStyles.value, ...]}>`，`tokenStyles.value` 在 `style/index.ts:104` 到 `style/index.ts:112` 中包含 `fontSize`、`lineHeight`、`color`；标签、必填标记、helper/error 也分别通过 `style/index.ts:72` 到 `style/index.ts:76`、`style/index.ts:130` 到 `style/index.ts:135` 控制颜色。项目规范要求 `Text` 字号、颜色等优先使用 `TextProps`。
- 影响：DisplayInput 是其他选择类组件常用触发器，文本语义绕过 `Text` API 会放大到 Picker、Cascader 等组合组件，增加颜色和尺寸一致性维护成本。
- 推荐纠正方案：将 label、value、placeholder、helper、error 的颜色与尺寸优先映射为 `Text` 的 `color`、`size` 等 props；样式插槽仅保留布局或 `TextProps` 无法表达的样式。

## 需要人工确认

- 无
