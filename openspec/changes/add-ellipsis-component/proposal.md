## Why

组件库缺少面向长文本摘要的 Ellipsis 组件，业务在列表、卡片和详情摘要中需要稳定地截断、展开和收起文本。

React Native 不能复用 Web DOM 测量与二分裁剪实现，需要提供符合 RN 文本能力和 PennySpring 组件规范的原生实现。

## What Changes

- 新增 `Ellipsis` 组件，支持 `content`、`direction`、`rows`、`expandText`、`collapseText`、`defaultExpanded`、`onExpand` 和 `onContentClick`。
- 基于 React Native `Text` 的 `numberOfLines` 与 `ellipsizeMode` 实现 start/end/middle 截断。
- 使用 `Pressable` 渲染展开/收起动作节点，并通过内部状态管理展开与收起。
- 新增组件目录导出和包级 `@pennyspring/component` 导出。
- 新增 Ellipsis 专属测试覆盖默认截断、方向映射、展开收起和回调行为。

## Capabilities

### New Capabilities
- `ellipsis-component`: 覆盖 Ellipsis 组件的公共 API、截断行为、展开收起交互、样式与导出要求。

### Modified Capabilities

## Impact

- 影响 `packages/component/src/Ellipsis/**/*`。
- 影响 `packages/component/src/index.ts` 包导出入口。
- 新增 `packages/component/__tests__/Ellipsis.test.tsx`。
- 新增 OpenSpec 规格 `openspec/specs/ellipsis-component/spec.md`（归档同步后）。
