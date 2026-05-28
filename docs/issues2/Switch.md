# Switch 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 轨道宽度比例使用硬编码数值 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Switch/style/index.ts:5`
- 违反规范：`.claude/rules/common/component-visual-layout.md`、`.codex/skills/theme-tokens/SKILL.md`
- 不符合点：`DEFAULT_TRACK_WIDTH_SCALE = 2` 和 `TEXT_TRACK_WIDTH_SCALE = 3` 用于计算 `trackWidth`，见 `style/index.ts:5`、`style/index.ts:6`、`style/index.ts:39`。Switch 的轨道宽度属于组件视觉尺寸，规范要求颜色、字号、间距、圆角、边框、阴影或动效等视觉数值通过 token 或语义配置提供，不应在组件内写死比例常量。
- 影响：Switch 轨道比例无法随主题、尺寸策略或文本模式统一调整，后续若要调整控件密度需要修改组件实现。
- 推荐纠正方案：将不同 size 与文本模式下的轨道宽度纳入 `SIZE_STYLE_MAP`，通过 `AliasToken` 映射出明确尺寸；或在主题 token 中补充 Switch 轨道比例/宽度语义后消费。

## 需要人工确认

- 无
