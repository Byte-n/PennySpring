# Stepper 自定义能力评估

## 现状

- 支持可控/非可控、min/max/step、disabled/readonly、尺寸和输入/按钮样式。
- 内部固定使用 `Text` 渲染按钮和值。

## 需要完善

- 增减按钮缺少 `minusIcon`、`plusIcon`、`renderButton` 或 button props，不能替换按钮区块。
- 输入区缺少 parser/formatter，无法展示单位、千分位等格式。
- 回调只有 `onChange`，缺少超出边界、按住连续变化、focus/blur 等交互扩展点。
