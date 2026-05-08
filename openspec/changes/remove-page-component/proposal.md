## Why

`Page` 组件已不再作为 `@pennyspring/component` 的公共组件保留，继续导出会让组件包、预览和配置规格维持一个已废弃的导航页面抽象。现在移除它可以收敛公共 API，并避免 `ConfigProvider` 继续暴露只服务于 `Page` 的默认返回配置。

## What Changes

- **BREAKING**: 从 `@pennyspring/component` 移除 `Page` 组件导出以及 `PageProps`、`PageStyles` 类型导出。
- 删除 `packages/component/src/Page` 源码和 `packages/component/__tests__/Page.test.tsx`。
- 清理 component preview 中的 `Page` 预览和注册项。
- 清理根应用测试中对 `Page` 默认返回行为的要求或 mock。
- **BREAKING**: 从 `ConfigProvider` 配置类型中移除只服务于 `Page` 的 `page` / `PageConfig` API。
- 更新 OpenSpec 中 `component-config-provider` 对 `Page` 默认返回行为和 `PageConfig` 导出的要求。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `component-config-provider`: 移除 `Page` 专属配置、默认返回行为和 `PageConfig` 类型导出的要求。

## Impact

- `packages/component/src/Page/**`
- `packages/component/src/index.ts`
- `packages/component/src/ConfigProvider/**`
- `packages/component/__tests__/Page.test.tsx`
- `packages/component/__tests__/ConfigProvider.test.tsx`
- `packages/component/src/ConfigProvider/typeExports.test-d.ts`
- `packages/component-preview/src/previews/NavigationPreviews.tsx`
- `packages/component-preview/src/previews/registry.tsx`
- `packages/component-preview/__tests__/registry.test.ts`
- 根应用测试中对 `Page` mock 或默认返回行为的依赖
- `openspec/specs/component-config-provider/spec.md`
