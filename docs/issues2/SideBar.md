# SideBar 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：1

## 问题列表

### 1. 列表与面板布局未优先使用共享布局原语 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/SideBar/SideBar.tsx:107`
- 违反规范：`.claude/rules/component/coding-style.md`、`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：根容器、wrap 模式列表和内容面板直接使用 `View`，见 `SideBar.tsx:107`、`SideBar.tsx:159`、`SideBar.tsx:205`；对应样式中以 `flexDirection: 'row'`、`flexWrap`、`alignItems`、`gap` 维护布局，见 `style/index.ts:54`。共享组件规范要求优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等布局原语表达组件结构。
- 影响：SideBar 的排列、间距和容器语义与组件库布局体系脱节，后续扩展滚动/换行/面板组合时需要维护额外私有布局规则。
- 推荐纠正方案：wrap 模式列表改用 `Row` 或支持换行语义的组件库布局原语；内容面板按实际结构改为 `Column` 或保留最小宿主节点；将可复用的横向间距、对齐能力从私有 style 收敛到布局组件 props。

## 需要人工确认

- 无
