# SwipeAction 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 预设色动作背景返回内联样式对象 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SwipeAction/style/index.ts:158`
- 违反规范：`.codex/skills/theme-tokens/SKILL.md`、`.claude/rules/common/component-visual-layout.md`
- 不符合点：`resolveActionBackgroundStyle` 在处理预设色时直接返回 `{ backgroundColor: presetBgFn(token) } as ViewStyle`，见 `style/index.ts:154`、`style/index.ts:157`、`style/index.ts:158`。theme-tokens 规范要求 `createUseSheetStyle` 是唯一合法的样式构建方式；组件视觉规范也要求所有视觉样式通过 `createUseSheetStyle` 消费 `AliasToken`。
- 影响：预设色背景样式绕过样式工厂，与其他 token 样式的创建路径不一致，增加主题切换、缓存和巡检维护成本。
- 推荐纠正方案：将预设色背景样式纳入 `useStyles` 返回值，或通过 `createUseSheetStyle` options 传入当前 action color 后生成对应 slot；避免在普通函数中返回新的样式字面量对象。

### 2. pressed 状态透明度硬编码 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/SwipeAction/style/index.ts:99`
- 违反规范：`.claude/rules/common/component-visual-layout.md`、`.codex/skills/theme-tokens/SKILL.md`
- 不符合点：`actionPressed` 使用 `opacity: 0.85` 表达按压状态，见 `style/index.ts:99`、`style/index.ts:100`。组件视觉规范要求不得硬编码颜色、字号、间距、圆角、边框、阴影或动效数值，状态反馈应使用 token 中已有状态色或透明度语义。
- 影响：按压反馈强度无法通过主题统一调整，不同组件之间的 pressed 视觉反馈可能出现不一致。
- 推荐纠正方案：优先使用 `token.controlItemBgActive`、`token.colorBgTextActive` 等状态 token 表达 pressed 状态；如确需透明度，应补充主题 token 后通过 `AliasToken` 使用。

## 需要人工确认

- 无
