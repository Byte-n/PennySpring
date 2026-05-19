# Switch 自定义能力评估

## 现状

- 支持可控/非可控、disabled/readonly、尺寸和 track/thumb 样式。

## 需要完善

- 缺少 checked/unchecked 文案或图标区块，例如 `checkedChildren`、`uncheckedChildren`、`renderThumb`。
- 样式插槽没有状态化区分，不能分别覆盖 checked、disabled、readonly 状态。
- 缺少 loading 状态与异步切换保护能力。
