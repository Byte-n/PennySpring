## Context

`packages/component` 已有 Card、Avatar、List 等基础展示组件，但没有统一的加载占位组件。现有组件模式要求每个组件独立目录、`types.ts` 暴露公共类型、`size` 限定为 `small | normal | large`，视觉样式必须通过 `createUseSheetStyle` 消费 `AliasToken`。

Skeleton 需要覆盖最常见的加载占位：单块内容、头像圆形内容、标题与段落组合，以及加载态包裹真实内容。它是展示型组件，不引入业务文案，也不新增不必要的 accessibility props。

## Goals / Non-Goals

**Goals:**

- 提供 `Skeleton` 组件和 `SkeletonSize` 类型，默认 `size="normal"`。
- 支持 `variant="block" | "avatar" | "text"`，分别对应基础块、圆形/头像、标题与多行段落。
- 支持 `active` 控制骨架闪烁动画，动画参数使用 theme token。
- 支持 `loading={false}` 时直接渲染 `children`，用于包裹内容。
- 支持 `style` 根样式和 `styles` 内部插槽覆盖。
- 使用测试覆盖结构渲染、尺寸映射、加载包裹、动画开关和样式覆盖。

**Non-Goals:**

- 不提供业务专用模板，例如账单行、预算卡片或账户摘要骨架。
- 不新增外部依赖。
- 不提供 accessibility props 或业务文案。
- 不修改 theme token、共享基础组件或其他组件目录。

## Decisions

1. 单组件通过 `variant` 表达形态，而不是拆分 `Skeleton.Avatar`、`Skeleton.Text` 子组件。这样符合当前组件库偏向数据/props 驱动的 API 风格，也能保持导出面简单。替代方案是复合子组件，但会增加 API 面并与组件规则中“不使用复合子组件声明子项”的倾向不一致。

2. `variant="text"` 通过 `title?: boolean` 和 `rows?: number` 控制标题与段落。默认渲染标题和三行段落，`rows` 做正整数归一化，避免调用方传入无效行数造成空布局。

3. `active` 使用 React Native `Animated` 循环 opacity 动画。`motion:false` 时 theme token 动效时长应归零；组件只消费 `token.motionDurationSlow` 和 `token.motionEaseInOut`，不硬编码动画数值。

4. 样式插槽命名为 `avatar`、`title`、`paragraph`、`paragraphRow`、`block`、`content`。根元素统一使用 `style`，不在 `styles` 中提供 root/container 插槽。

5. 默认视觉使用 `colorFillSecondary` 作为占位底色、`colorFillTertiary` 作为 active 过渡色，尺寸、间距、圆角、字体行高和动画均从 `AliasToken` 派生。

## Risks / Trade-offs

- [Risk] RN 测试环境无法真实推进动画帧 → Mitigation：测试只断言 active 时使用 `Animated.View` 和静态结构，不依赖时间推进。
- [Risk] `variant="text"` 无法覆盖复杂业务模板 → Mitigation：业务可组合多个 Skeleton 或用 `styles` 覆盖稳定插槽，本组件只覆盖通用占位。
- [Risk] 归一化 `rows` 可能与调用方输入不一致 → Mitigation：将无效值归一为默认行数，并用测试覆盖。
