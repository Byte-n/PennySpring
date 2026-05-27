# 组件视觉与布局规范

> 本文件只规定组件形态、布局、交互和可访问性。颜色、字号、间距、圆角、边框、阴影、动效数值必须遵循 `theme-tokens`，不得在本文件重复定义。

## 设计定位

- 视觉风格采用克制、清晰、可信的工具型界面。
- 不要使用营销感、强装饰、复杂渐变、重拟物、强阴影或大面积玻璃效果。
- 财务信息优先保证可读性和可比较性。
- 组件不得内置业务文案，例如“收入”“支出”“预算”“账户”。

## Token 边界

- 组件只定义结构、状态、交互和组合方式。
- 组件不得硬编码颜色、字号、间距、圆角、边框、阴影或动效数值。
- 所有视觉样式必须通过 `createUseSheetStyle` 消费 `AliasToken`。
- 深色/浅色模式由 token 处理，组件内不得写主题分支。
- 业务语义色必须由业务层 token 扩展或 props 映射提供，不得在基础组件中硬编码。

## Size 与间距 Token

- 容器组件和布局组件的 `size` 到 spacing token 映射必须先按组件语义选择，不得把 `small`、`normal`、`large` 固定为所有场景共用的同一组数值。
- 布局 gap 用于 `Space`、`Grid`、`Row` 和 `Column` 的子项间距。
- 容器 padding 用于 `Card`、面板、列表分组、通知和弹层内容区。
- 页面 section margin 用于页面区块之间的外边距。
- 可点击区域优先保证 `controlHeight` 或 `hitSlop`，再选择 padding 或 margin。

### Layout Gap

- `small` 映射到 `paddingXXS` 或 `marginXXS`，仅用于紧凑视觉间距。
- `normal` 映射到 `paddingXS` 或 `marginXS`，作为默认子项间距。
- `large` 映射到 `paddingSM` 或 `marginSM`，用于较松的模块内排列。

### Container Padding

- `small` 映射到 `paddingSM`，用于小卡片、紧凑单行容器、列表内嵌容器。
- `normal` 映射到 `padding`，用于默认移动端卡片、普通内容容器。
- `large` 映射到 `paddingMD`，用于较松的卡片、内容容器和弹层内容区。
- 强调卡片、页面主容器、弹层大内容区等特殊场景可升级为 `paddingLG`。

### Section Margin

- `small` 映射到 `marginSM`，用于同组内轻分隔。
- `normal` 映射到 `margin`，用于页面默认区块间距。
- `large` 映射到 `marginMD`，用于较明显的区块分隔。
- 主区块分隔等特殊场景可升级为 `marginLG`。

## 通用交互

- 小图标按钮必须提供足够的 `hitSlop`。
- pressed、focused、disabled、loading、selected、error 状态必须由组件自身完整表达。
- 状态变化不得导致布局尺寸跳动。
- hover、press、focus 反馈只允许改变状态表现，不得改变组件占位尺寸。
- 动效只用于反馈，不得用于装饰。
