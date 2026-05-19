# Segmented 自定义能力评估

## 现状

- 支持 options、可控/非可控、图标、禁用、block、尺寸和样式插槽。
- 内部固定使用 `Text` 渲染 label。

## 需要完善

- option 缺少 `renderOption`，无法根据 active/pressed/disabled 完整替换选项内容。
- 指示器为内部固定结构，缺少 `renderIndicator` 或动画参数配置。
- option 级样式/props 不足，不能单独控制某个分段项。
