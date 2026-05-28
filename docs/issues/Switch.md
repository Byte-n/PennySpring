# Switch 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：3
- 修复数量：3

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Switch/Switch.tsx:41`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Switch` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `Switch.tsx`、`index.ts`、`types.ts`，缺少规范要求的 `style/index.ts`。
- 影响：样式 token、尺寸计算与交互逻辑耦合，后续维护样式规范时更容易影响组件行为实现。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Switch/style/index.ts`，将 `SIZE_STYLE_MAP`、`SwitchStyleOptions` 与 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。
- 修复状态：已修复
- 修复方式：新建 `packages/pennyspring-ui/src/Switch/style/index.ts`，将 `SizeStyleConfig`、`SIZE_STYLE_MAP`、`SwitchStyleOptions` 和 `useStyles` 迁移至该文件；`Switch.tsx` 改为从 `./style` 导入 `useStyles` 和 `SwitchStyleOptions`。

### 2. 轨道圆角使用硬编码数字

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Switch/Switch.tsx:57`
- 违反规范：`CLAUDE.md` 样式约束；`.claude/rules/common/component-visual-layout.md` Token 边界；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`track.borderRadius` 直接写入 `999`，属于样式值中的数字字面量，未通过 `AliasToken` 或动态计算值表达。
- 影响：开关胶囊圆角不受主题 token 管理，审计时也无法判断该值是否与设计系统一致。
- 推荐纠正方案：使用由组件尺寸计算出的语义圆角，例如基于轨道高度/拇指尺寸派生半径，或在确认 token 足够表达时改用合适的 `borderRadius*` token。
- 修复状态：已修复
- 修复方式：在 `style/index.ts` 中计算 `trackHeight = thumbSize + inset * 2 + token.lineWidth * 2`，将 `borderRadius` 设为 `trackHeight / 2`，由组件尺寸派生胶囊圆角。

### 3. `Text` 颜色和字重优先通过 `style` 设置

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Switch/Switch.tsx:163`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：开关文本虽然使用了 `Text size="sm"`，但颜色、字重和行高在 `tokenStyles.text` 中通过 `style` 设置；项目要求 `Text` 字号、颜色等优先使用 `TextProps` 实现，其次才是 `style`。
- 影响：文本颜色与字重语义绕过 `Text` 公开 API，容易与其它组件的文本和图标色彩语义漂移。
- 推荐纠正方案：将禁用/选中状态映射到 `Text` 的 `color` prop，将字重映射到 `Text` 的 `weight` prop；只将定位相关样式和外部 `styles?.text` 作为 `style` 补充。
- 修复状态：已修复
- 修复方式：在 `Switch.tsx` 中根据状态计算 `textColor`（`'disabled'` / `'lightSolid'` / `'secondary'`），通过 `Text` 的 `color` 和 `weight="strong"` props 传递；`style/index.ts` 的 `text` 样式仅保留定位属性（`left`、`right`、`position`、`lineHeight`）。

## 需要人工确认

- 无
