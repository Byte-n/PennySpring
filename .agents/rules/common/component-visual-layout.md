# 组件视觉与布局规范

> 本文件只规定组件形态、布局、交互。颜色、字号、间距、圆角、边框、阴影、动效数值遵循 `theme-tokens`，不在此重复。
> HTML 设计稿、视觉规范与设计提示词见 [design/ui-design-spec.md](../design/ui-design-spec.md)。

## 设计定位

- 克制、清晰、可信的工具型界面；财务信息优先保证可读性与可比较性。
- 不用营销感、强装饰、复杂渐变、重拟物、强阴影、大面积玻璃。
- 组件不内置业务文案（如「收入」「支出」「预算」「账户」）。

## Token 边界

- 组件只定义结构、状态、交互、组合；视觉样式一律通过 `createUseSheetStyle` 消费 `AliasToken`。
- 深色/浅色由 token 处理，组件内不写主题分支。
- 业务语义色由业务层 token 或 props 提供，基础组件不硬编码。

## Size 与间距 Token

- `size` 到 spacing 的映射按组件语义选择，不把 `small`/`normal`/`large` 固定为全场景同一组数值。
- 可点击区域优先保证 `controlHeight` 或 `hitSlop`。
- 需区分方向时，垂直值取水平 token 折半（`paddingVertical = paddingHorizontal / 2`）。

| 用途                                      | small                    | normal                 | large                  | 特殊升级    |
| ----------------------------------------- | ------------------------ | ---------------------- | ---------------------- | ----------- |
| Layout gap（Space/Grid/Row/Column 子项）  | `paddingXXS`/`marginXXS` | `paddingXS`/`marginXS` | `paddingSM`/`marginSM` | -           |
| Container padding（Card/面板/弹层内容区） | `paddingSM`              | `padding`              | `paddingMD`            | `paddingLG` |
| Section margin（页面区块外边距）          | `marginSM`               | `margin`               | `marginMD`             | `marginLG`  |

## 通用交互

- 小图标按钮提供足够 `hitSlop`。
- pressed / focused / disabled / loading / selected / error 状态由组件自身完整表达。
- 状态变化与 hover/press/focus 反馈不得改变占位尺寸；动效只用于反馈，不用于装饰。
