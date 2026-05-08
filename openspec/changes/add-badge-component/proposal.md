## Why

组件库缺少 Badge 徽标，业务界面无法用统一的 token 风格展示未读数、状态点或小型标签。新增基础 Badge 能补齐展示型组件能力，并避免各业务页面重复实现右上角叠加逻辑。

## What Changes

- 新增 `packages/component/src/Badge/` 组件，支持独立徽标与包裹 `children` 后右上角叠加徽标。
- 支持 `count`、`text`、`dot` 三种内容模式，并提供 `maxCount` 溢出显示与 `showZero` 控制。
- 支持 `size?: 'small' | 'normal' | 'large'`、语义 `status`、语义或预设 `color`，默认外观全部由 `@pennyspring/theme` token 驱动。
- 支持 `disabled`、根 `style` 和稳定 slot `styles` 覆盖点。
- 从 `packages/component/src/index.ts` 导出 Badge 组件与类型，并补充 Badge 行为测试。

## Capabilities

### New Capabilities

- `badge-component`: 定义 Badge 徽标组件的展示模式、叠加行为、尺寸、颜色语义、可见性规则和样式覆盖点。

### Modified Capabilities

无。

## Impact

- 新增 `packages/component/src/Badge/Badge.tsx`、`types.ts`、`index.ts`。
- 修改 `packages/component/src/index.ts` 增加 Badge 导出。
- 新增 `packages/component/__tests__/Badge.test.tsx` 覆盖用户可感知行为。
- 不新增运行时依赖，不修改主题 token、基础 Text 组件或其他共享组件实现。
