## Why

组件库目前缺少标准骨架屏，加载列表、卡片、头像和摘要内容时只能由业务侧各自拼装占位，容易造成尺寸、颜色、动画和布局不一致。
新增 Skeleton 组件可以提供统一的 token 驱动加载占位能力，降低业务页面重复实现成本。

## What Changes

- 新增 `Skeleton` 组件目录，提供基础块状占位、圆形/头像占位、标题与多行段落组合。
- 支持 `size?: SkeletonSize`（`small | normal | large`，默认 `normal`）、`style` 和稳定内部插槽样式覆盖。
- 支持 `active` 动画开关，动画颜色、时长、缓动和尺寸全部由 `AliasToken` 驱动。
- 支持 `loading` 包裹内容行为：加载中显示骨架，加载结束渲染 `children`。
- 从 `packages/component/src/index.ts` 暴露组件和类型。

## Capabilities

### New Capabilities

- `skeleton-component`: 定义 Skeleton 骨架屏组件的 API、布局形态、尺寸、动画、加载包裹行为和样式覆盖要求。

### Modified Capabilities

无。

## Impact

- 新增 `packages/component/src/Skeleton/**`。
- 新增 Skeleton 相关组件测试。
- 修改 `packages/component/src/index.ts` 增加公共导出。
- 新增 `openspec/specs/skeleton-component/spec.md` 并在归档时同步。
