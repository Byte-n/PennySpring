# DisplayInput 自定义能力评估

## 现状

- 作为展示型输入框，支持 label、placeholder、helper/error、prefix/suffix、children、状态、disabled/readonly 和样式插槽。
- 内部复用 `Input` 的视觉结构并使用 `Text` 展示值。

## 需要完善

- 缺少 `inputProps` 或底层 `Input` 非样式能力透传，不能复用 Input 的清除、加载等交互能力。
- value 展示只有 `valueText` 或 children，缺少 `renderValue`，无法根据 display/status/disabled 生成复杂展示。
- suffix/prefix 只能传节点，缺少容器 props 和按状态渲染函数。
