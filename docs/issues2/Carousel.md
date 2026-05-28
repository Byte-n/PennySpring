# Carousel 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. 受控索引 API 同时暴露两套命名

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Carousel/types.ts:17`
- 违反规范：`.claude/rules/component/coding-style.md` 状态与回调 API
- 不符合点：`CarouselProps` 同时暴露 `value`、`defaultValue`、`onChange` 和 `defaultIndex`、`onIndexChange` 两套主值 API；实现中又在 `carousel.tsx:58` 到 `carousel.tsx:60` 合并这两套命名。组件规范要求值或主要值统一使用 `value`、`onChange` 和 `defaultValue`。
- 影响：调用方会面对两套等价 API，受控/非受控语义变复杂，也增加类型文档和行为测试成本。
- 推荐纠正方案：保留 `value`、`defaultValue`、`onChange` 作为唯一主值 API；如果需要兼容旧命名，应在内部迁移期标记废弃并避免作为新公开规范继续扩展。

### 2. 轮播结构使用 View 手写布局容器

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Carousel/carousel.tsx:268`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程
- 不符合点：Carousel 根容器、track、indicator 和 slide wrapper 使用 `View`，并在 `style/index.ts:35` 到 `style/index.ts:46` 手写横向/纵向 `flexDirection`。项目规范要求布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件，避免手写等效布局结构。
- 影响：轮播布局与共享布局原语脱节，后续横纵向、间距和占位策略调整时更难统一。
- 推荐纠正方案：根结构与 indicator 优先使用 `Column`、`Row` 或 `Space`；slide 占位如需底层测量和动画，可保留必要的 Animated/View，但应将普通布局语义迁移到布局组件。

## 需要人工确认

- 无
