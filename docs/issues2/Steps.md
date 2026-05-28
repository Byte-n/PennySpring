# Steps 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Text color 使用 any 绕过类型检查

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Steps/Steps.tsx:39`
- 违反规范：`.claude/rules/typescript/coding-style.md`、`.claude/rules/component/coding-style.md`
- 不符合点：`renderTitleContent` 和 `renderDescriptionContent` 将 `color` 参数声明为 `string`，再通过 `color={color as any}` 传给项目 `Text` 组件，见 `Steps.tsx:28`、`Steps.tsx:39`、`Steps.tsx:50`、`Steps.tsx:61`。TypeScript 规范要求避免 `any`；组件规范要求 `Text` 颜色取值与组件库语义色保持一致。
- 影响：任意字符串都可以绕过 `TextColor` 约束进入 Text，破坏文本色语义映射，类型系统无法阻止无效颜色值。
- 推荐纠正方案：将两个渲染函数的 `color` 参数类型改为 `TextColor`，从 `../Text/types` 导入类型；调用处继续传入 `'disabled'`、`'default'`、`'secondary'` 等合法语义值，不再使用 `as any`。

### 2. 已暴露的 titleText/descriptionText 样式槽未被消费

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Steps/types.ts:29`
- 违反规范：`.claude/rules/component/coding-style.md`
- 不符合点：`StepsStyles` 暴露了 `titleText` 与 `descriptionText` 样式槽，见 `types.ts:29`、`types.ts:30`，但 `Steps.tsx` 在渲染标题和描述时调用 `renderTitleContent`、`renderDescriptionContent` 只传入文本、尺寸、字重和颜色，未传入或应用 `styles?.titleText`、`styles?.descriptionText`，见 `Steps.tsx:189`、`Steps.tsx:196`。
- 影响：公共样式 API 与实际渲染行为不一致，调用方传入对应样式不会生效，降低 API 可信度并增加排查成本。
- 推荐纠正方案：给 `renderTitleContent` 和 `renderDescriptionContent` 增加 `style?: StyleProp<TextStyle>` 参数，并分别将 `styles?.titleText`、`styles?.descriptionText` 传入内部 `Text`；或如果不希望开放这两个槽，应从 `StepsStyles` 中移除。

## 需要人工确认

- 无
