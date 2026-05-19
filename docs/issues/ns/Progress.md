# Progress 自定义能力评估

## 现状

- 提供 Bar/Circle，支持 percent、size、status、showInfo、format 和样式插槽。
- 内部使用 `Text` 渲染信息。

## 需要完善

- `format` 只能替换 info 文案/节点，缺少 `renderInfo` 状态参数和 info 容器替换。
- Bar/Circle 的轨道和指示器样式可覆盖，但缺少渐变、分段、成功进度等语义 API。
- Circle 缺少中心内容整体替换能力，复杂进度展示需要自行实现。
