# Column 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 公共 props 未放在 Column 组件目录的 types.ts ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Column/index.ts:2`、`packages/pennyspring-ui/src/Column/Column.tsx:6`、`packages/pennyspring-ui/src/Row/types.ts:24`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 的目录与导出；`.codex/skills/component-composer/SKILL.md` 的工作流程
- 不符合点：规范要求共享组件放在 `packages/pennyspring-ui/src/<ComponentName>/`，由目录内 `index.ts` 和包级 `src/index.ts` 导出，公共 props 与导出的样式类型放在组件目录的 `types.ts`；组件编码规则还要求组件目录内存在样式文件 `style/index.ts`。当前 `Column` 目录只有 `Column.tsx` 和 `index.ts`，`ColumnProps` 定义在 `packages/pennyspring-ui/src/Row/types.ts:24-30`，并由 `Column/index.ts:2` 通过 `../Row/types` 对外导出，`Column.tsx:6` 也从 `../Row/types` 导入 `ColumnProps`、`FlexAlign`、`FlexJustify`。
- 影响：`Column` 的公共 API 归属被耦合到 `Row` 目录，调用方和后续维护者无法按组件目录规范在 `Column/types.ts` 定位 `ColumnProps`；`component-composer` 明确要求编码前检查 `packages/pennyspring-ui/src/<ComponentName>/types.ts`，当前结构会让自动化巡检、文档生成或组件选型流程缺少稳定入口。
- 推荐纠正方案：在 `packages/pennyspring-ui/src/Column/types.ts` 定义并导出 `ColumnProps`。若 `FlexAlign`、`FlexJustify` 是 Row/Column 共享类型，可迁移到共享类型文件后由 Row 与 Column 各自的 `types.ts` 引用，避免 Column 从 Row 组件目录读取公共 API。同步调整 `Column/index.ts` 与 `Column.tsx` 的导入来源，并按组件目录规范补齐样式组织方式。

## 需要人工确认

- 无
