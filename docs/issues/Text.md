# Text 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Text/Text.tsx:86`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Text` 在组件实现文件内直接定义 `useStyles`，组件目录实际只包含 `Text.tsx`、`index.ts`、`types.ts`、`useTextColor.ts`，缺少规范要求的 `style/index.ts`。
- 影响：字号、行高、字重和颜色样式映射与渲染逻辑耦合，后续维护 typography token 或样式规范时容易影响组件行为实现。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Text/style/index.ts`，将 `SIZE_MAP`、`WEIGHT_MAP`、`SIZE_DEFAULT_WEIGHT_MAP` 与 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。

## 需要人工确认

- 无
