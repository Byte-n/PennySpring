# Skeleton 组件规范巡检报告

- 组件：`Skeleton`
- 范围：`packages/pennyspring-ui/src/Skeleton`、包级导出、非 demos 文档与测试引用
- 未审查：`packages/pennyspring-ui/examples/previews/**/demos/**`
- 结论：通过
- 状态：通过

## 1. 包级导出未同步导出公开样式类型 ✅

- 文件路径：`packages/pennyspring-ui/src/index.ts`
- 行号/片段：321-322
  ```ts
  export { Skeleton } from './Skeleton';
  export type { SkeletonProps, SkeletonShape } from './Skeleton';
  ```
- 违反规范来源：`.claude/rules/component/coding-style.md`「目录与导出」：公共 props 与导出的样式类型放在组件目录 `types.ts`；组件由目录内 `index.ts` 导出，并同步从包级 `packages/pennyspring-ui/index.ts` 导出。
- 违规原因：`SkeletonStyles` 已在目录内 `index.ts` 公开导出，但包级入口未同步导出，导致 `@pennyspring/ui` 的公开 API 不完整。
- 影响：调用方无法从包级入口导入 `SkeletonStyles`，样式 API 类型在组件入口和包入口之间不一致。
- 推荐纠正方案：将包级导出改为同步导出 `SkeletonStyles`，例如 `export type { SkeletonProps, SkeletonShape, SkeletonStyles } from './Skeleton';`。

## 2. 样式实现未放入组件约定的 `style/index.ts` ✅

- 文件路径：`packages/pennyspring-ui/src/Skeleton/Skeleton.tsx`
- 行号/片段：71-90
  ```ts
  const useStyles = createUseSheetStyle(
    (token, { width, height, borderRadius }: SkeletonStyleOptions) => ({
      root: {
        backgroundColor: token.colorFillContent,
        ...
      },
      shimmer: {
        backgroundColor: token.colorFillContentHover,
        ...
      },
    }),
  );
  ```
- 违反规范来源：`.claude/rules/component/coding-style.md`「目录与导出」：样式文件为 `style/index.ts`。
- 违规原因：`Skeleton` 的样式 hook 和样式 options 定义在组件实现文件中，组件目录下不存在 `style/index.ts`。
- 影响：组件目录结构与共享组件约定不一致，后续维护者不容易按统一位置定位 token 样式和动态样式入参。
- 推荐纠正方案：新增 `packages/pennyspring-ui/src/Skeleton/style/index.ts`，将 `SkeletonStyleOptions` 与 `useStyles` 迁入该文件，并由 `Skeleton.tsx` 导入使用。

## 3. `styles` 插槽命名未使用可见根节点约定的 `root` ✅

- 文件路径：`packages/pennyspring-ui/src/Skeleton/types.ts`
- 行号/片段：7-9
  ```ts
  export interface SkeletonStyles {
    bone?: StyleProp<ViewStyle>;
  }
  ```
- 文件路径：`packages/pennyspring-ui/src/Skeleton/Skeleton.tsx`
- 行号/片段：118
  ```tsx
  <View style={[tokenStyles.root, externalStyles?.bone, style]}>
  ```
- 违反规范来源：`.claude/rules/component/coding-style.md`「样式 API」：`styles?: XxxStyles` 控制语义化内部插槽；插槽命名表达组件结构和职责；可见内部根节点统一使用 `root`。
- 违规原因：`Skeleton` 只有一个可见占位根节点，但公开样式插槽命名为 `bone`，没有使用统一的 `root`。
- 影响：样式 API 与其他共享组件的语义槽约定不一致，调用方需要记忆 Skeleton 的特殊命名。
- 推荐纠正方案：将公开样式类型调整为 `root?: StyleProp<ViewStyle>`，组件中按 `tokenStyles.root -> externalStyles?.root -> style` 合并；如需兼容旧调用方，可短期保留 `bone` 并标记迁移。

## 4. Shimmer 动画层未应用已定义的 token 样式，且使用内联样式对象 ✅

- 文件路径：`packages/pennyspring-ui/src/Skeleton/Skeleton.tsx`
- 行号/片段：80-89、117-123、149-152
  ```ts
  shimmer: {
    backgroundColor: token.colorFillContentHover,
    borderRadius,
    bottom: 0,
    left: 0,
    position: 'absolute' as const,
    right: 0,
    top: 0,
    width: '50%',
  },
  ```
  ```tsx
  <ShimmerAnimation
    borderRadius={tokenStyles.shimmer.borderRadius as number}
    duration={token.motionDurationSlow * token.lineWidthFocus}
  />
  ```
  ```tsx
  <Animated.View
    style={[{ borderRadius }, animatedStyle]}
  />
  ```
- 违反规范来源：`CLAUDE.md`「样式约束」：唯一构建方式是 `createUseSheetStyle`，禁止组件内联 `style` 字面量对象；`.claude/rules/component/coding-style.md`「样式实现」：组件必须在内部提供完整的、由 token 驱动的默认外观；默认合并顺序为 token 样式、组件运行时样式、外部样式。
- 违规原因：`tokenStyles.shimmer` 定义了背景色、绝对定位和宽度，但没有传给 `Animated.View`；实际动画层只收到内联 `{ borderRadius }` 和 transform，没有背景、尺寸或定位。
- 影响：`animated={true}` 时 shimmer 层不可见或布局不符合预期，`animated` API 的用户可感知行为失效；内联样式对象也绕过了项目样式约束。
- 推荐纠正方案：让 `ShimmerAnimation` 接收并合并 token 样式，或直接在 `Skeleton` 中渲染 `<Animated.View style={[tokenStyles.shimmer, animatedStyle]} />`；移除内联 `{ borderRadius }`，保留 `createUseSheetStyle` 产出的 `borderRadius`。

## 5. 动画参数未按 motion token 和统一 easing 约束实现 ✅

- 文件路径：`packages/pennyspring-ui/src/Skeleton/Skeleton.tsx`
- 行号/片段：122、136、143
  ```ts
  duration={token.motionDurationSlow * token.lineWidthFocus}
  ```
  ```ts
  const translateX = useSharedValue(-100);
  ```
  ```ts
  withTiming(200, { duration }),
  ```
- 违反规范来源：`CLAUDE.md`「动画约束」：动画实现仅允许 reanimated；动画时长、缓动曲线、延迟必须优先使用主题 token，禁止硬编码魔法数；缓动曲线统一使用 `Easing.bezier(...token.motionEase*)`。`.codex/skills/theme-tokens/SKILL.md`「Token 取值规则」：禁止用无关 token 相乘凑数值。
- 违规原因：动画时长通过 `motionDurationSlow * lineWidthFocus` 拼出派生数值，`lineWidthFocus` 与动画时长无语义关系；`withTiming` 未设置 `Easing.bezier(...token.motionEase*)`；位移起止值 `-100`、`200` 直接硬编码。
- 影响：Skeleton 动画节奏脱离项目统一 motion 体系，后续主题 motion 配置无法准确控制该动画；硬编码位移也降低可维护性。
- 推荐纠正方案：使用明确的 motion token 作为时长，例如 `token.motionDurationSlow`；引入 `Easing` 并传入 `easing: Easing.bezier(...token.motionEaseInOut)`；将位移边界提取为语义常量，或基于已知 shimmer 宽度计算。

## 6. 未发现 Skeleton 专属测试覆盖 ✅

- 文件路径：`packages/pennyspring-ui/__tests__/Skeleton.test.tsx`（缺失）
- 行号/片段：`rg -n "Skeleton|skeleton" __tests__ packages/pennyspring-ui/__tests__ packages/pennyspring-ui/src --glob '*.test.ts' --glob '*.test.tsx' --glob '!packages/pennyspring-ui/examples/previews/**/demos/**'` 无匹配；`find` 仅定位到源码文件 `packages/pennyspring-ui/src/Skeleton/Skeleton.tsx`。
- 违反规范来源：`CLAUDE.md`「测试约束」与 `.claude/rules/common/testing.md`：测试文件集中在根 `__tests__/` 或各包 `__tests__/`，组件/单元测试属于要求覆盖类型，按 AAA 组织并验证用户可感知行为。
- 违规原因：未发现 Skeleton 的专属测试文件或测试用例，当前 `loading`、`animated`、`shape`、`size`、`children` 回退和导出类型等行为没有测试保护。
- 影响：当前 shimmer 样式未应用这类用户可感知回归无法被自动化测试捕获；后续 API 或样式变更缺少防回归保护。
- 推荐纠正方案：新增 `packages/pennyspring-ui/__tests__/Skeleton.test.tsx`，至少覆盖 `loading=false` 渲染 children、`animated=false` 不渲染动画层、不同 `shape/size` 的基础占位样式、以及包级导出可用性。
