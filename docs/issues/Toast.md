# Toast 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 样式实现未放入组件样式文件

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Toast/Toast.tsx:65`
- 违反规范：`.claude/rules/component/coding-style.md` 目录与导出（样式文件：`style/index.ts`）
- 不符合点：`Toast` 在组件实现文件内直接定义 `SIZE_TOKEN_MAP`（第 28-51 行）和 `useStyles`（第 65-90 行），组件目录缺少规范要求的 `style/index.ts`。
- 影响：字号、行高、字重和颜色样式映射与渲染逻辑耦合，后续维护 typography token 或样式规范时容易影响组件行为实现。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Toast/style/index.ts`，将 `SIZE_TOKEN_MAP` 与 `createUseSheetStyle` 样式定义迁移到该文件，组件实现只消费样式 hook。
- 修复状态：已修复
- 修复内容：新增 `packages/pennyspring-ui/src/Toast/style/index.ts`，将 `SIZE_TOKEN_MAP`、`getPlacementStyle` 和 `useStyles` 迁移至该文件；`Toast.tsx` 改为从 `./style` 导入。新增 `Toast.style.test.ts` 验证样式导出。

## 需要人工确认

- 无
