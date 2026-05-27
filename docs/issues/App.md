# App 组件规范巡检报告

## 结论

- 状态：需要人工确认
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. 公开导出的 App 根组件未出现在 component catalog 或相关组件文档中

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/index.ts:4`
- 违反规范：`.claude/rules/component/coding-style.md` 的“目录与导出”章节；`.codex/skills/component-composer/references/component-catalog.md`
- 不符合点：`packages/pennyspring-ui/src/index.ts:4-5` 将 `App` 与 `AppProps` 从包级入口公开导出，`packages/pennyspring-ui/src/App/index.ts:1-2` 也提供目录内导出；但 `component-catalog.md` 中没有 `App` 条目，当前 catalog 只列出了 `Portal` / `PortalProvider` 等相关基础能力，未说明 `App` 这个根包装组件会组合 `GestureHandlerRootView`、`ConfigProvider` 与 `PortalProvider`。
- 影响：调用方通过 component catalog 选型时无法发现应优先使用 `App` 作为 UI 包根容器，容易改为手动组合 `PortalProvider`、`ConfigProvider` 或手势根容器，增加根容器配置不一致的维护风险。
- 推荐纠正方案：如 `App` 是对外推荐的根包装组件，应在 `component-catalog.md` 的布局、浮层与反馈或单独“根容器 / Provider”章节补充 `App` 条目，说明其职责和与 `ThemeProvider`、`PortalProvider`、`ConfigProvider`、`GestureHandlerRootView` 的关系；如 `App` 不应被 catalog 推荐，则需要在相关文档中明确它是内部/基础设施组件，避免使用方误判。

## 需要人工确认

无
