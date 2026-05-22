# @pennyspring/theme

PennySpring 的移动端主题引擎：ant-design v5 三层 token 模型（SeedToken → MapToken → AliasToken）的 React Native 移植，同包交付 PennySpring 的四套预设色板。

## 快速上手

```tsx
import { ThemeProvider, presets, useTheme } from '@pennyspring/theme';

function App() {
  return (
    <ThemeProvider config={{ token: presets.april }}>
      <Screen />
    </ThemeProvider>
  );
}

function Screen() {
  const { token } = useTheme();
  // token.colorPrimary / token.fontSize / token.boxShadow ...
}
```

切换暗色算法：

```tsx
<ThemeProvider config={{ algorithm: 'dark', token: presets.kaori }}>
  <App />
</ThemeProvider>
```

## 预设色板

命名空间 `presets` 下提供四套 PennySpring 主题，仅覆盖 seed 颜色字段，其余 token 走 `defaultSeedToken`。

| Preset | 意象 | colorPrimary |
|---|---|---|
| `presets.april` | 春绿 — 万物复苏 | `#52C41A` |
| `presets.kaori` | 樱粉 — 宫园薰 / 四月樱花 | `#EB7C8D` |
| `presets.penny` | 暖金 — 每一枚硬币 | `#D4A84B` |
| `presets.spring` | 青碧 — 源泉 / 水流之始 | `#2EC4B6` |

每个 preset 同时覆盖 `colorSuccess / colorWarning / colorError / colorInfo / colorLink`，具体色值参见 [`src/presets/`](./src/presets)。

业务层（如 income / expense / balance 等记账语义色）请按需覆盖 `AliasToken`，theme 包不提供业务语义 token。

## 与 ant-design v5 的差异

### 一、RN 平台硬约束（不可调整）

| 维度 | ant-design (Web) | @pennyspring/theme (RN) |
|---|---|---|
| 样式方案 | `@ant-design/cssinjs` useToken | React Context + `createUseSheetStyle` |
| 阴影 | CSS `box-shadow` 多层字符串 | 结构化 `ShadowToken` + `toShadowStyle()` |
| 动画曲线 | `cubic-bezier(...)` 字符串 | `CubicBezier` 元组 `[x1,y1,x2,y2]`（对接 `Easing.bezier`） |
| 动效时长 | `"0.3s"` 字符串 | `number` 毫秒 |
| 描边样式 | `lineType: solid/dashed` | 已删除（RN 无 border-style） |
| 链接装饰 | `linkDecoration` | 已删除（RN 无 text-decoration） |
| `wireframe` | V4 遗留 | 保留字段但不生效 |
| 断点 | 绑定 CSS media query | 仅数值，配合 `useWindowDimensions` |

### 二、移动端破坏性修正

| 字段 | ant-design Web 值 | @pennyspring/theme RN 值 | 理由 |
|---|---|---|---|
| `fontFamily` | CSS 字体栈 | `Platform.select({ ios: 'System', android: 'Roboto' })` | RN 不认 CSS 字体栈；Emoji 字体无效 |
| `fontFamilyCode` | `'SF Mono', ...` | `Platform.select({ ios: 'Menlo', android: 'monospace' })` | 同上 |
| `fontSize` | `14` | `16` | iOS HIG / Material 移动端正文最小 16 |
| `controlHeight` | `32` | `44` | Apple HIG 最小触控目标 44×44 |
| `borderRadius` | `6` | `8` | 现代移动端 UI 基准圆角 |
| 行高公式 | `(fontSize + 8) / fontSize` | `(fontSize + 10) / fontSize` | 中文视觉密度高于拉丁，+8 在 16px 下=1.5 偏紧 |
| `boxShadow` | offset=6 blur=16 opacity=0.08 | offset=4 blur=12 opacity=0.06 | iOS 无 spread 扩散，比 CSS 更硬更集中，需柔化 |
| `boxShadowSecondary` | offset=3 blur=6 opacity=0.06 | offset=2 blur=8 opacity=0.04 | 同上 |
| `boxShadowTertiary` | offset=1 blur=2 opacity=0.03 | offset=1 blur=4 opacity=0.02 | 同上 |
| `compact` 算法 | 提供 | **移除** | compact 会使 `controlHeight` 跌破 44×44 触达区；手机屏本身已紧凑，无信息密度红利 |

### 三、关于 compact

本包有意不提供 compact 算法。密集场景请直接在 seed 层覆盖相应字段：

```tsx
<ThemeProvider
  config={{
    token: {
      ...presets.spring,
      fontSize: 14,      // 信息密集列表场景
      controlHeight: 36, // 次级控件（仍 ≥ HIG 最小值 44 的宽松版）
    },
  }}
>
  <App />
</ThemeProvider>
```

## Token 层次

```
SeedToken  ──(derivative)──▶  MapToken  ──(formatToken)──▶  AliasToken
   ▲                              ▲                              ▲
   │                              │                              │
 种子输入                      颜色梯度 +                     语义化 + 断点 +
 (15~20 字段)                  尺寸/字体/阴影                 shadow / spacing
```

- **SeedToken** — 设计系统输入变量（colorPrimary、fontSize、controlHeight…）
- **MapToken** — 由 seed 派生出的 10 阶颜色梯度、尺寸/字体/高度梯度、动效时长、预设色调色板
- **AliasToken** — 组件直接消费的最终 token 层（paddingXS、marginSM、boxShadow、screenXS…）

## 算法组合

`ThemeConfig.algorithm` 支持：

- `'default'`（默认）— 浅色基线
- `'dark'` — 暗色调色板 + 预设色 hover/active 亮度调整
- 或数组：`['dark']`

示例：

```tsx
<ThemeProvider config={{ algorithm: 'dark' }}>
```

## 测试

```bash
npx jest packages/pennyspring-theme
```

覆盖：colorAlgorithms / derivative pipeline / formatToken / genFontSizes / genRadius / genSizeMapToken / genControlHeight / genCommonMapToken / genPresetColorPalettes / genColorMapToken / genFontMapToken / presets / ThemeProvider / useTheme / ThemePreview / shadowStyle / types.
