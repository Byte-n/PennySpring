# Drawer 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 默认抽屉宽度硬编码非例外百分比

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Drawer/Drawer.tsx:49`
- 违反规范：`CLAUDE.md` 样式约束（React Native）；`.codex/skills/theme-tokens/SKILL.md` Token 取值规则
- 不符合点：`DEFAULT_DRAWER_WIDTH = '70%'`，并作为 `DrawerComponent` 和 `DrawerLayout` 的默认 `width` 使用（如 `Drawer.tsx:174`、`Drawer.tsx:384`），最终进入样式 `width`（`style/index.ts:72`）。项目样式约束只允许 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'` 作为字面量例外，`'70%'` 不在例外范围内。
- 影响：抽屉默认宽度缺少 token 或语义依据，可能与不同屏幕断点、设计尺寸策略不一致。
- 推荐纠正方案：用 token/断点计算默认宽度，或以命名布局算法根据窗口宽度计算像素值；如必须保留百分比，应作为明确的局部例外记录并避免直接作为样式字面量透传。

## 需要人工确认

- 无
