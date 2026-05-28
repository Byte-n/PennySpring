# Toast 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 进入/退出位移动效比例硬编码

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Toast/Toast.tsx:27`
- 违反规范：`.claude/rules/common/component-visual-layout.md`、`.codex/skills/theme-tokens/SKILL.md`
- 不符合点：`HIDDEN_OFFSET_RATIO = 0.6` 被用于计算 Toast 进入/退出的 `translateY` 距离，见 `Toast.tsx:27`、`Toast.tsx:108`、`Toast.tsx:111`。组件视觉规范要求不得硬编码动效数值；theme-tokens 规范要求动效参数通过 motion token 或主题语义提供。
- 影响：Toast 的位移动效幅度无法通过主题统一调整，也无法随组件 size、placement 或运动偏好集中收敛。
- 推荐纠正方案：将隐藏偏移距离改为基于组件实际高度或 placement 的运行时测量；如确需固定比例，应先补充主题 motion/overlay token，再通过 `AliasToken` 消费。

## 需要人工确认

- 无
