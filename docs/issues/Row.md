# Row 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. Row 组件样式未按组件目录规范放入 `style/index.ts`

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Row/Row.tsx:49`
- 违反规范：`.claude/rules/component/coding-style.md`「目录与导出」；`CLAUDE.md`「样式约束」
- 不符合点：组件编码规则要求共享组件目录内的样式文件为 `style/index.ts`，项目样式约束要求 React Native 样式统一通过 `createUseSheetStyle` 构建。当前 Row 目录只有 `Row.tsx`、`index.ts`、`types.ts`，样式 hook `useStyles` 直接定义在 `packages/pennyspring-ui/src/Row/Row.tsx:49-59`，没有按组件目录规范拆分到 `packages/pennyspring-ui/src/Row/style/index.ts`。
- 影响：Row 作为基础布局组件，其样式组织方式与组件目录规范不一致，后续自动化巡检、样式复用、样式类型扩展或组件维护时缺少稳定的样式入口，也会和已要求的组件目录结构产生偏移。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Row/style/index.ts`，将 `RowStyleOptions`、gap 解析和 `createUseSheetStyle` 定义迁入该文件，并从 Row 实现中导入使用；保留 `RowProps` 在 `types.ts`、组件入口在 `index.ts`、包级入口在 `src/index.ts` 的现有导出关系。

## 需要人工确认

- `packages/pennyspring-ui/src/Row/types.ts:18` 与 `packages/pennyspring-ui/__tests__/RowColumn.test.tsx:67-79` 允许并测试 `gap?: number | ComponentSize` 的任意数字 gap。规范明确了 `small`、`normal`、`large` 到布局 gap token 的映射，并禁止样式值中的硬编码数字；但当前代码没有说明数字 gap 是受控设计例外、动态计算值入口，还是应收敛到 token 语义。需要维护者确认 Row 是否仍允许任意 numeric gap；若不允许，建议将公共 API 收敛为 `gap?: ComponentSize` 或受控 token 语义；若允许，建议在组件文档中标注这是布局原语的显式例外，并避免测试用裸数字表达非 token 间距。

