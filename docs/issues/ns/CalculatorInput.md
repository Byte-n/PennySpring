# CalculatorInput 自定义能力评估

## 现状

- 支持可控/非可控表达式、确认回调、placeholder、disabled、readonly 和若干样式插槽。
- `CalculatorInputPopup` 组合 `Popup` 与 `CalculatorInput`。

## 需要完善

- 键盘布局、按键集合和运算规则均为内部固定，缺少 `keys`、`renderKey`、`operators` 或表达式解析器替换能力。
- 弹窗版本只暴露很少的 `Popup` 能力，缺少 `popupProps`、`title`、`footer` 或整体弹窗区块替换能力。
- 显示区只有 input/result 样式，缺少 `renderDisplay` 或结果格式化能力，业务无法自定义金额、单位、错误态展示。
