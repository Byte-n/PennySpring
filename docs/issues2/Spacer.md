# Spacer 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 样式实现未放在组件约定的 style/index.ts

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Spacer/Spacer.tsx:25`
- 违反规范：`.claude/rules/component/coding-style.md`
- 不符合点：组件目录下不存在 `packages/pennyspring-ui/src/Spacer/style/index.ts`，`SpacerStyleOptions`、`getGap` 与 `useStyles` 均定义在 `Spacer.tsx` 内，见 `Spacer.tsx:7`、`Spacer.tsx:13`、`Spacer.tsx:25`。组件编码规范的目录与导出章节要求共享组件样式文件使用 `style/index.ts`。
- 影响：Spacer 的 token 映射与样式工厂不在统一样式目录中，后续巡检、token 调整和布局组件维护时需要对该组件做特殊处理。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Spacer/style/index.ts`，将 `SpacerStyleOptions`、`getGap` 与 `useStyles` 迁移进去；`Spacer.tsx` 仅保留渲染逻辑并导入样式工厂。

## 需要人工确认

- 无
