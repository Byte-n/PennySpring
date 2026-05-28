# FloatingActionGroup 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 隐藏操作项动画硬编码缩放数值

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/FloatingActionGroup/FloatingActionGroup.tsx:255`
- 违反规范：`CLAUDE.md` 动画约束；`.claude/rules/common/component-visual-layout.md` Token 边界；`.codex/skills/theme-tokens/SKILL.md` 动效
- 不符合点：隐藏操作项的动画样式直接写入 `{ scale: 0.8 + progress.value * 0.2 }`。项目规范要求动效时长、缓动等动效数值优先使用 motion token，并避免硬编码魔法数；视觉/动效数值应有 token 或语义来源。
- 影响：浮动操作组的展开缩放幅度不可由主题或设计规范统一调整，后续与其他动效组件的手感可能漂移。
- 推荐纠正方案：将缩放起止值提取为语义化常量并接入 motion/token 约定；如 token 体系暂缺缩放幅度，应在主题或组件规范中补充对应语义。

### 2. 浮动操作容器使用 View 手写布局

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/FloatingActionGroup/FloatingActionGroup.tsx:384`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：组件使用 `<View>` 作为操作容器和隐藏层，并在 `FloatingActionGroup.tsx:90` 到 `FloatingActionGroup.tsx:112` 手写 `gap`、`alignItems`、绝对定位等布局。项目规范要求布局优先使用 `Row`、`Column`、`Space` 等已有布局组件，避免用 `View` 手写等效布局结构。
- 影响：操作按钮排列与已有布局原语脱节，尺寸、gap 和方向策略不易复用。
- 推荐纠正方案：可见操作列表优先使用 `Column` 或 `Space`，隐藏层仅保留动画定位必要的 `Animated.View`；普通排列语义迁移到布局组件。

## 需要人工确认

- 无
