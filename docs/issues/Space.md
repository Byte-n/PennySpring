# Space 组件规范巡检报告

## 结论

- 状态：部分通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. Space 组件样式未按组件目录规范放入 `style/index.ts` ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Space/Space.tsx:101`
- 违反规范：`.claude/rules/component/coding-style.md`「目录与导出」；`CLAUDE.md`「样式约束」
- 不符合点：组件编码规则要求共享组件目录内的样式文件为 `style/index.ts`，项目样式约束要求 React Native 样式统一通过 `createUseSheetStyle` 构建。当前 Space 目录只有 `Space.tsx`、`index.ts`、`types.ts`，样式 hook `useSpaceStyles` 和 `useSpaceItemStyles` 直接定义在 `packages/pennyspring-ui/src/Space/Space.tsx:101-145`，没有按组件目录规范拆分到 `packages/pennyspring-ui/src/Space/style/index.ts`。
- 影响：Space 是基础布局组件，样式与组件渲染逻辑混在同一文件中，会让后续样式复用、样式类型扩展、自动化巡检或视觉调整缺少稳定的样式入口，也与组件目录约定不一致。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Space/style/index.ts`，将 `SpaceStyleOptions`、`SpaceItemStyleOptions`、gap 相关样式计算和 `createUseSheetStyle` 定义迁入该文件；组件实现只导入样式 hook 并保留 `SpaceProps`、`SpaceStyles` 在 `types.ts` 中导出。

### 2. 导出的 `Space` 公共组件函数缺少显式返回类型 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Space/Space.tsx:174`
- 违反规范：`.claude/rules/typescript/coding-style.md`「Public APIs」；`CLAUDE.md`「Code Style」
- 不符合点：TypeScript 规则要求导出的函数、共享工具和公共组件 props 具备明确类型，公共 API 的导出函数需要添加参数和返回类型。当前 `export function Space({...}: SpaceProps)` 只标注了 props 参数类型，缺少显式返回类型。
- 影响：公共组件 API 的返回契约依赖 TypeScript 推断，后续重构时更容易在不显式变更 API 的情况下改变返回形态，也降低组件公共 API 文档化程度。
- 推荐纠正方案：为 `Space` 添加显式返回类型，例如 `export function Space(...): React.ReactElement`；如团队对可空渲染有统一约定，则使用对应的显式 React 返回类型，并保持 `SpaceProps` 继续由 `types.ts` 导出。

### 3. 测试未覆盖多个公开且用户可感知的布局能力 ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/__tests__/Space.test.tsx:48`
- 违反规范：`CLAUDE.md`「测试约束」；`.claude/rules/common/testing.md`「Test Structure」；`.claude/rules/typescript/testing.md`
- 不符合点：现有测试覆盖了 `block`、不绑定 `Pressable`、`size` 到横向 gap token、纵向 half-gap 映射，但 `SpaceProps` 还公开了 `direction`、`align`、`justify`、`wrap`、`styles`、`style` 和空子节点过滤等用户可感知或组合相关能力（`packages/pennyspring-ui/src/Space/types.ts:23-31`）。其中 `align`、`justify`、`wrap` 的映射逻辑位于 `packages/pennyspring-ui/src/Space/Space.tsx:67-93` 与 `packages/pennyspring-ui/src/Space/Space.tsx:101-145`，当前测试没有断言根布局方向、对齐/分布映射、换行时的垂直间距或外部语义样式合并。
- 影响：Space 作为布局原语，公开布局 props 缺少回归保护；后续修改可能破坏对齐、分布、换行或样式覆盖能力，但现有测试仍可能通过。
- 推荐纠正方案：按 AAA 结构补充用户可感知行为测试：默认 `direction` 为 horizontal 且根为 row；`direction="vertical"` 改为 column；`align`/`justify` 正确映射到 `alignItems`/`justifyContent`；`wrap` 开启 `flexWrap` 且非最后项具备 half-gap 垂直间距；`style` 与 `styles.item` 能按 token 样式、运行时样式、外部样式的顺序合并。

### 4. Space 详细文档覆盖面需要人工确认 ⏭️（原因：文档内容需人工审查，无法通过代码修改自动修复）

- 严重程度：low
- 位置：`packages/pennyspring-ui/docs/components/foundation/space.mdx:1`
- 违反规范：本次巡检要求检查测试与文档；`.claude/rules/component/coding-style.md`「目录与导出」要求组件选型目录与实际能力一致；`.codex/skills/component-composer/references/component-catalog.md` 将 Space 描述为“为子元素提供一致间距”
- 不符合点：允许读取的 Space 文档中，`component-catalog.md` 只说明 `Space` 为子元素提供一致间距，`space.mdx` 仅通过 `<PreviewDocIntro id="space" />` 和 `<PreviewDocs id="space" />` 聚合预览文档。由于本次任务明确禁止审查 examples/previews/demos，无法确认最终文档是否覆盖 `size`、`direction`、`align`、`justify`、`wrap`、`block`、`style`、`styles.item` 等公开 API 与布局边界。
- 影响：如果 preview 聚合内容覆盖不足，调用方无法仅凭当前可审查文档了解 Space 的完整布局能力、默认值和组合限制，文档与实际 API 可能存在缺口。
- 推荐纠正方案：人工检查 `PreviewDocs id="space"` 实际聚合内容；若覆盖不足，在允许范围内补充 Space 文档，至少说明默认方向、三档 size 到布局 gap 的语义、垂直 gap 折半、换行行为、对齐/分布 props 以及外部样式插槽用途。

## 需要人工确认

无
