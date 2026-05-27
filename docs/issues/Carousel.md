# Carousel 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：high
- 问题数量：5

## 问题列表

### 1. 动画实现使用了 React Native Animated ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-position.ts:2`
- 违反规范：`CLAUDE.md` 的动画约束，要求动画实现仅允许使用 `react-native-reanimated`，禁止使用 React Native 的 `Animated`、`Animated.timing/spring/decay`
- 不符合点：`use-carousel-position.ts` 从 `react-native` 导入 `Animated` 和 `Easing`（`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-position.ts:2`），并通过 `new Animated.Value(0)` 创建位置值（`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-position.ts:19`），随后调用 `Animated.timing(...)` 执行动画（`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-position.ts:26`）。组件入口也从 `react-native` 导入 `Animated`（`packages/pennyspring-ui/src/Carousel/carousel.tsx:3`），并使用 `Animated.add`、`Animated.multiply` 与 `Animated.View` 驱动轨道位移（`packages/pennyspring-ui/src/Carousel/carousel.tsx:264`-`packages/pennyspring-ui/src/Carousel/carousel.tsx:327`）。
- 影响：Carousel 的核心切换动画绕过项目统一的 Reanimated 动画栈，后续动画手感、调试方式和跨组件动效一致性无法通过同一套约束维护。
- 推荐纠正方案：将位置值和轨道位移迁移到 `react-native-reanimated` 的 shared value、animated style 与 timing API；缓动曲线继续使用主题 token，并用 Reanimated 的 `Easing.bezier(...token.motionEaseOut)` 表达。

### 2. 手势实现使用了 React Native PanResponder ✅

- 严重程度：high
- 位置：`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-pan-responder.ts:4`
- 违反规范：`CLAUDE.md` 的手势约束，要求手势相关能力统一使用 `react-native-gesture-handler`
- 不符合点：`useCarouselPanResponder` 从 `react-native` 导入 `PanResponder` 与 `PanResponderInstance`（`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-pan-responder.ts:2`-`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-pan-responder.ts:6`），并通过 `PanResponder.create(...)` 构建拖动手势（`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-pan-responder.ts:120`）。组件入口再把 `panResponder?.panHandlers` 直接展开到 `Pressable`（`packages/pennyspring-ui/src/Carousel/carousel.tsx:321`-`packages/pennyspring-ui/src/Carousel/carousel.tsx:324`）。
- 影响：Carousel 的横向/纵向滑动没有接入项目统一的 gesture-handler 手势体系，和应用根已挂载的 `GestureHandlerRootView` 约定不一致，也增加与嵌套滚动、手势竞争和原生手势协作相关问题的维护成本。
- 推荐纠正方案：用 `react-native-gesture-handler` 的 Pan 手势能力重写拖动识别、移动更新、释放结算和终止逻辑；保留 `allowTouchMove`、`direction`、`blockNativeResponder` 等公共语义时，应映射到 gesture-handler 的手势启用和协作配置。

### 3. 当前索引 API 未按受控/非受控值规范设计 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Carousel/types.ts:27`
- 违反规范：`.claude/rules/component/coding-style.md` 的“状态与回调 API”章节，要求值或主要值统一使用 `value`、`onChange` 和 `defaultValue`，并同时支持可控和非可控模式；可控和非可控判断由 `useControllableValue` 处理
- 不符合点：Carousel 的主要状态是当前轮播索引，但公共 API 声明为 `defaultIndex?: number` 与 `onIndexChange?: (index: number) => void`（`packages/pennyspring-ui/src/Carousel/types.ts:22`-`packages/pennyspring-ui/src/Carousel/types.ts:63`），没有提供 `value` / `defaultValue` / `onChange` 受控组合，也没有使用 `useControllableValue`。同时注释说明 `defaultIndex` “是响应式的，当值变化时轮播会跳转到对应索引”（`packages/pennyspring-ui/src/Carousel/types.ts:23`-`packages/pennyspring-ui/src/Carousel/types.ts:24`），实现也在生命周期 effect 中监听 `defaultIndex` 并重置当前索引和位置（`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-lifecycle.ts:48`-`packages/pennyspring-ui/src/Carousel/hooks/use-carousel-lifecycle.ts:77`），这让 `default*` 命名承担了受控更新语义。
- 影响：调用方无法用项目统一的受控/非受控模型管理 Carousel 当前项，`defaultIndex` 的响应式行为也会让熟悉 `defaultValue` 语义的调用方误判它只在初始化生效，增加 API 学习和状态同步成本。
- 推荐纠正方案：将当前索引建模为统一值 API，例如 `value?: number`、`defaultValue?: number`、`onChange?: (index: number) => void`，内部通过 `useControllableValue` 管理；若为了兼容保留旧 API，应明确迁移策略，并避免让 `default*` 名称继续表达受控跳转语义。

### 4. 动态样式绕过 `createUseSheetStyle`，并在样式数组中直接拼对象 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Carousel/carousel-indicator.tsx:46`
- 违反规范：`CLAUDE.md` 的样式约束；`.claude/rules/component/coding-style.md` 的“样式实现”章节；`.codex/skills/theme-tokens/SKILL.md` 的 API 约定
- 不符合点：指示点颜色在渲染处直接拼入样式对象 `{ backgroundColor: isActive ? activeColor : inactiveColor }`（`packages/pennyspring-ui/src/Carousel/carousel-indicator.tsx:44`-`packages/pennyspring-ui/src/Carousel/carousel-indicator.tsx:47`），而不是通过 `createUseSheetStyle<TOptions>` 的 options 生成状态样式。滑块尺寸和虚拟占位也在组件逻辑中创建运行时样式对象，例如 `{ width: slidePixels, height: '100%' }`、`{ height: slidePixels, width: '100%' }`（`packages/pennyspring-ui/src/Carousel/carousel-slides.tsx:67`-`packages/pennyspring-ui/src/Carousel/carousel-slides.tsx:72`）以及 `{ width: leadingSize }` / `{ height: leadingSize }`（`packages/pennyspring-ui/src/Carousel/carousel-slides.tsx:82`-`packages/pennyspring-ui/src/Carousel/carousel-slides.tsx:90`）。项目宪章要求动态样式通过 `createUseSheetStyle<TOptions>` 泛型参数传入，不在调用处拼 `[styles.a, { ... }]`。
- 影响：Carousel 的状态色、测量尺寸和占位样式分散在渲染逻辑中，绕过统一样式工厂后更难保证 token 样式、运行时样式和外部样式的合并顺序，也增加后续主题和样式审查成本。
- 推荐纠正方案：把指示点 active/inactive 状态、滑块尺寸和虚拟占位样式迁移到 Carousel 的 `style/index.ts`，用 `createUseSheetStyle<TOptions>` 接收方向、尺寸、颜色和占位参数；保留合并顺序为 token 样式、组件运行时样式、外部样式。

### 5. 缺少直接覆盖 Carousel 的测试 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Carousel.test.tsx`
- 违反规范：`.claude/rules/common/testing.md` 要求 Unit Tests、Integration Tests、E2E Tests 全部需要，最低覆盖率目标为 80%，测试默认按 AAA 组织并覆盖用户可感知行为；`CLAUDE.md` 要求测试文件集中在根 `__tests__/` 或各包 `__tests__/`
- 不符合点：通过 `rg --files | rg '(^|/)Carousel|carousel|__tests__|\\.test\\.(ts|tsx)$'` 核实，当前存在 Carousel 源码与文档文件，但没有 `packages/pennyspring-ui/__tests__/Carousel.test.tsx` 或其他直接匹配的 Carousel 测试文件。Carousel 公开了 `data` / `renderItem`、`defaultIndex`、`onIndexChange`、`loop`、`autoplay`、`direction`、`indicator`、`slideSize`、`trackOffset`、`allowTouchMove`、`ref` 等行为（`packages/pennyspring-ui/src/Carousel/types.ts:21`-`packages/pennyspring-ui/src/Carousel/types.ts:132`），但这些用户可感知行为和命令式方法没有直接测试证据。
- 影响：Carousel 的索引同步、循环边界、自动轮播、指示器显示、空数据返回、禁用滑动、方向切换和 ref 方法都缺少回归保护；后续迁移动画或手势实现时更难判断是否保持既有行为。
- 推荐纠正方案：新增 `packages/pennyspring-ui/__tests__/Carousel.test.tsx`，优先覆盖空数据不渲染、多项渲染与指示器、初始索引、`onIndexChange`、`indicator={false}`、自定义 indicator、ref 的 `swipeTo/swipeNext/swipePrev`，并在可测试范围内覆盖 autoplay timer 与 loop 边界。

## 需要人工确认

无
