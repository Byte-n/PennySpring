## 1. 测试与公共契约

- [x] 1.1 新增 `packages/component/__tests__/Ellipsis.test.tsx`，覆盖默认折叠、方向映射、展开收起、内容点击和包级导出。
- [x] 1.2 运行 Ellipsis 专属测试并确认在实现前失败。

## 2. 组件实现

- [x] 2.1 创建 `packages/component/src/Ellipsis/types.ts`，定义并导出 `EllipsisProps`、`EllipsisSize`、`EllipsisStyles`、`EllipsisDirection`、`EllipsisExpandAction` 和 `EllipsisExpandInfo`。
- [x] 2.2 创建 `packages/component/src/Ellipsis/Ellipsis.tsx`，用包内 `Text`、`Pressable`、`numberOfLines`、`ellipsizeMode` 和 `createUseSheetStyle` 实现组件行为与 token 样式。
- [x] 2.3 创建 `packages/component/src/Ellipsis/index.ts`，导出组件和公共类型。
- [x] 2.4 更新 `packages/component/src/index.ts`，导出 `Ellipsis` 和公共类型。

## 3. 验证

- [x] 3.1 运行 Ellipsis 专属测试并确认通过。
- [ ] 3.2 运行 `yarn workspace @pennyspring/component typecheck` 并确认通过。
