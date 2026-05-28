# Grid 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. Grid.Item 宽度通过动态百分比字符串写入样式

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Grid/Grid.tsx:49`
- 违反规范：`CLAUDE.md` 样式约束（React Native）
- 不符合点：`Grid.Item` 通过 `` `${(PERCENTAGE_BASE / columns) * span}%` `` 生成百分比宽度，并在 `Grid.tsx:55` 写入 `width`。项目样式约束只允许 `0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'` 作为字面量例外，动态百分比不在例外范围内。
- 影响：网格列宽算法以样式百分比字符串输出，难以通过 token 或明确布局原语约束，后续列宽策略变更时缺少语义边界。
- 推荐纠正方案：优先使用 flex basis/flex grow 或内部布局算法表达列宽；如 Grid 必须支持百分比列宽，应在组件规范中为 Grid 明确例外，并将计算封装为可测试的布局算法。

## 需要人工确认

- 无
