# DataList 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. ✅ 加载更多自定义节点使用了不符合规范的 `loadingMoreContent` 命名

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DataList/types.ts:24`
- 违反规范：`.claude/rules/component/coding-style.md` 内部渲染节点章节
- 不符合点：规范要求内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`，并禁止用其他同义命名承载插槽节点。当前公共 API 已提供 `loadingMoreText?: string`，但自定义节点使用 `loadingMoreContent?: ReactNode`；实现中也在 `packages/pennyspring-ui/src/DataList/DataList.tsx:59`、`packages/pennyspring-ui/src/DataList/DataList.tsx:107` 和 `packages/pennyspring-ui/src/DataList/DataListSection.tsx:59`、`packages/pennyspring-ui/src/DataList/DataListSection.tsx:109` 消费该命名。
- 影响：公开 API 与组件插槽命名规则不一致，调用方需要记忆 `xxxContent` 这个例外，后续组件间 API 难以保持一致。
- 修复结果：已将节点插槽调整为 `loadingMore?: ReactNode | null`，文本仍使用 `loadingMoreText?: string`。为避免一次性破坏调用方，`loadingMoreContent` 保留为废弃兼容字段，内部优先解析 `loadingMore`。
- 兼容说明：原布尔态 `loadingMore` 已调整为 `isLoadingMore`，以消除与插槽命名冲突并满足组件命名规范。

### 2. ✅ Footer 布局使用原始 `View` 手写等效布局

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/DataList/DataList.tsx:106`
- 违反规范：`CLAUDE.md` 组件约束、`.codex/skills/component-composer/SKILL.md` 工作流程第 6 条
- 不符合点：项目约束要求界面布局优先使用 `@pennyspring/ui` 中已有的 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等布局组件，禁止用 `View` 手写等效布局；component-composer 也要求布局优先使用这些组件。当前 `DataList` 在加载中 footer 和完成 footer 中直接使用 `react-native` 的 `View` 承载居中布局，并通过 token 样式设置 `alignItems`、`justifyContent`、`paddingVertical`；同样模式也出现在 `packages/pennyspring-ui/src/DataList/DataList.tsx:123`、`packages/pennyspring-ui/src/DataList/DataListSection.tsx:108` 和 `packages/pennyspring-ui/src/DataList/DataListSection.tsx:125`。
- 影响：共享组件绕过了项目布局原语，后续 size、间距和布局语义无法与组件库其他布局容器保持一致，也增加重复布局实现。
- 修复结果：已将 `DataList` 与 `DataList.Section` 的加载态 footer 和完成态 footer 容器从原始 `View` 替换为 `Column`，并保留现有 token 驱动样式合并顺序。

## 需要人工确认

- 无
