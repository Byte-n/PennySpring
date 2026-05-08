## 1. 行为测试

- [ ] 1.1 新增 `packages/component/__tests__/Badge.test.tsx`，覆盖 count、text、dot、maxCount、showZero 和 children 叠加行为。
- [ ] 1.2 在测试中覆盖 size、status/color、disabled 与 `root`、`children`、`badge`、`text`、`dot` 样式 slot。

## 2. Badge 组件实现

- [ ] 2.1 创建 `packages/component/src/Badge/types.ts`，定义 `BadgeProps`、`BadgeSize`、`BadgeStatus`、`BadgeColor` 和 `BadgeStyles`。
- [ ] 2.2 创建 `packages/component/src/Badge/Badge.tsx`，实现内容解析、可见性、溢出显示、children 叠加和 token 驱动样式。
- [ ] 2.3 创建 `packages/component/src/Badge/index.ts`，导出组件、辅助函数和类型。

## 3. 包导出与验证

- [ ] 3.1 修改 `packages/component/src/index.ts`，导出 Badge 组件与类型。
- [ ] 3.2 运行 Badge 相关测试和组件包 typecheck，确认实现与 OpenSpec artifacts 一致。
