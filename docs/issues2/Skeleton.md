# Skeleton 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. Shimmer 动效位移数值硬编码 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Skeleton/Skeleton.tsx:19`
- 违反规范：`.claude/rules/common/component-visual-layout.md`、`.codex/skills/theme-tokens/SKILL.md`
- 不符合点：`SHIMMER_TRANSLATE_START = -100` 和 `SHIMMER_TRANSLATE_END = 200` 直接定义动效位移数值，并在 `withTiming(SHIMMER_TRANSLATE_END, { duration, easing })` 与 `transform: [{ translateX: ... }]` 中使用，见 `Skeleton.tsx:19`、`Skeleton.tsx:20`、`Skeleton.tsx:70`、`Skeleton.tsx:75`。组件视觉规范要求不得硬编码动效数值；theme-tokens 规范要求动效时长和缓动使用 motion token，动效相关数值也不应绕过 token/语义配置。
- 影响：Skeleton 的 shimmer 运动距离无法随主题、组件尺寸或动效策略统一调整，后续如果 token 中关闭或弱化动效，只能单独修改组件实现。
- 推荐纠正方案：将 shimmer 位移范围收敛为基于组件自身尺寸/宽度的运行时计算，或通过主题 motion/组件语义配置传入；保留现有 `token.motionDurationSlow` 与 `token.motionEaseInOut` 的使用，不再在组件顶部硬编码动效距离常量。

## 需要人工确认

- 无
