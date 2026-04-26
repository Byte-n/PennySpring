# PennySpring 项目宪章

## 样式（RN）

**唯一构建方式**：`createUseSheetStyle`（来自 `@pennyspring/theme`）。

**禁止**：
- `StyleSheet.create(...)`
- 组件内联 `style={{ ... }}` 字面量对象
- 样式值中的颜色字面量（`'#xxx'`、`'rgb/rgba(...)'`、命名色）
- 样式值中的数字字面量

**唯一例外（数字字面量）**：`0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'`。

**Token 选择**：必须参考技能 `theme-tokens`；阴影必须经 `toShadowStyle(...)`；行高用 `token.fontHeight*`（像素），不用 `token.lineHeight*`（倍数）。

**动态样式**：通过 `createUseSheetStyle<TOptions>` 的泛型参数传入，不在调用处拼 `[styles.a, { ... }]`。

**主题注入**：全局 `<ThemeProvider>` 位于应用根；禁止在组件内判断 light/dark 分支——所有 token 已自适配。
