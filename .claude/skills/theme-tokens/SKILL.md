---
name: theme-tokens
description: PennySpring 主题 token（@pennyspring/theme）使用手册。**只要涉及创建或修改任何 React Native 组件的视觉样式、颜色、间距、圆角、边框、阴影、字体、typography、主题、深色/浅色模式、品牌色、hover/active 交互态，就必须使用此技能**。即使用户只说「改一下按钮颜色」「加个边框」「这个字体小了点」「UI 调整」，也要触发；样式里任何数字字面量（16、24、8）或十六进制颜色（#1677ff、#fff）都属于本技能管辖范围。
---

# PennySpring Theme Tokens

基于 Ant Design v5 三层 token（Seed → Map → Alias）的 RN 移植。组件里消费 **AliasToken**。Token 命名与 antd v5 一致，语义按 antd 约定推断即可——以下只列**项目独有 + RN 容易踩坑**的部分。

## API

```tsx
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle<TOptions>((token, opts) => ({ /* styles */ }));
// 无参数版本：TOptions = void，调用时 useStyles()
```

内部是 `useMemo` + hook，主题切换自动响应。**这是唯一合法的样式构建方式**（见 `CLAUDE.md`）。

## RN 踩坑（必记）

| 坑 | 正确做法 |
|---|---|
| RN `lineHeight` 字段要像素数值 | 直接用 `token.lineHeight*`（已是像素值） |
| `boxShadow*` 不是 ViewStyle | 必须 `...toShadowStyle(token.boxShadow)`，不能 `...token.boxShadow` |
| Easing 曲线是 `[x1,y1,x2,y2]` 元组 | `Easing.bezier(...token.motionEaseInOut)` |
| 动效时长是数值 ms（非字符串） | `duration: token.motionDurationMid`；`motion:false` 时自动归零，勿手写 if |
| Primary 按钮上的白字 | `token.colorTextLightSolid`（dark 下仍白），不是 `'#fff'` |
| `controlHeightXS=22` 仅装饰用 | 可点击控件最小 `controlHeightSM` |
| `TextInput.placeholderTextColor` 是 prop 不是 style | 从 `useTheme().token.colorTextPlaceholder` 取 |

## AliasToken 分类索引

字段名与 antd v5 对齐，完整注释见 [types.ts](packages/theme/src/types.ts)。拿不准的查这里。

- **中性色**：`colorText{,Secondary,Tertiary,Quaternary,Heading,Label,Description,Disabled,Placeholder,LightSolid}` / `colorBg{Layout,Container,Elevated,Spotlight,Mask,Blur,Solid,SolidHover,SolidActive}` / `colorFill{,Secondary,Tertiary,Quaternary,Alter,Content,ContentHover}` / `colorBorder{,Secondary,Disabled,Bg}` / `colorSplit` / `colorIcon{,Hover}` / `colorWhite`
- **语义色 6 种**：`colorPrimary` `colorSuccess` `colorWarning` `colorError` `colorInfo` `colorLink`，每种带 10 阶后缀 `Bg / BgHover / Border / BorderHover / Hover / (base) / Active / Text / TextHover / TextActive`（`Error` 额外有 `BgFilledHover` `BgActive`；`Link` 只 3 阶）
- **预设色**：`blue|purple|cyan|green|magenta|pink|red|orange|yellow|volcano|geekblue|gold|lime` × `1..10`（6 是基准）。**只用于稳定分类**（头像、分类 Tag、图表系列），不会随主题切换——跟品牌走的场景用语义色
- **间距**：`size{XXS..XXL}` / `padding{XXS,XS,SM,,MD,LG,XL}` / `margin{XXS..XXL}` / `controlPaddingHorizontal{,SM}` / `paddingContent{Horizontal,Vertical}{,SM,LG}`
- **控件高度**：`controlHeight{XS=22, SM=33, =44, LG=55}`
- **字体**：`fontSize{SM=14, =16, LG=17, XL=20}` / `fontSizeHeading{1..5}` / `lineHeight{,SM,LG,XL}`（像素）/ `lineHeightHeading{1..5}`（像素）/ `fontWeightStrong=600` / `fontFamily` / `fontFamilyCode`
- **圆角/线宽**：`borderRadius{XS=2, SM=4, =8, LG=12, Outer=6}` / `lineWidth{=1, Bold=2, Focus=3}`
- **阴影**（由重到轻）：`boxShadow` > `boxShadowSecondary` > `boxShadowTertiary`
- **动效**：`motionDuration{Fast=100, Mid=200, Slow=300}`（ms）/ `motionEase{InOut,OutCirc,InOutCirc,OutBack,InBack,InQuint,OutQuint,Out}`
- **控件状态**：`controlItemBg{Hover,Active,ActiveHover,ActiveDisabled}` / `controlOutline` / `controlOutlineWidth` / `colorBgContainerDisabled` / `colorBgText{Hover,Active}` / `opacityLoading`
- **Z 轴/断点**：`zIndex{Base=0, PopupBase=1000}` / `screen{XS..XXXL}{Min,Max}`

## 主题配置

```tsx
import { ThemeProvider, presets } from '@pennyspring/theme';

<ThemeProvider config={{ algorithm: 'dark', token: presets.april }}>
```

- 预设：`april` 春绿 / `kaori` 樱粉 / `penny` 暖金 / `spring` 青碧
- 算法：`'default' | 'dark'`，可数组组合
- `config.token` 同时接受 Seed 字段（触发梯度重算）和 Alias 字段（替换最终值）
- 组件内**不要** `if(isDark)` 分支，token 已自适配

## 当 token 不够用

90% 场景都能映射，拿不准先读 [types.ts](packages/theme/src/types.ts) 的字段注释。

确需业务语义色（如记账「收入/支出/余额」）时，走 **ThemeProvider 覆盖 AliasToken** 在业务层扩展，不在组件里硬编码：

```tsx
<ThemeProvider config={{ token: { ...presets.april, colorIncome: /*...*/ } as any }}>
```

## 源码入口

- 类型（所有字段带注释）：[types.ts](packages/theme/src/types.ts)
- 默认 Seed：[defaults.ts](packages/theme/src/defaults.ts)
- 样式工厂：[createUseSheetStyle.ts](packages/theme/src/createUseSheetStyle.ts)
- 阴影工具：[shadowStyle.ts](packages/theme/src/shadowStyle.ts)
- Provider：[ThemeProvider.tsx](packages/theme/src/ThemeProvider.tsx)
- 预设：[presets/](packages/theme/src/presets)
