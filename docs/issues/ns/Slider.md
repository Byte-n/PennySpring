# Slider 自定义能力评估

## 现状

- 支持可控/非可控、min/max/step、disabled/readonly、尺寸和 track/thumb 样式。

## 需要完善

- 缺少 mark、tooltip、formatValue、range 双滑块等常见自定义能力。
- thumb 和 track 只能样式覆盖，缺少 `renderThumb`、`renderMark` 或状态化样式。
- 拖拽生命周期只暴露 `onChange`，缺少 `onChangeStart`/`onChangeEnd`。
