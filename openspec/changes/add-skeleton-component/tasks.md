## 1. 行为测试

- [ ] 1.1 新增 `packages/component/__tests__/Skeleton.test.tsx`，覆盖默认块状占位、尺寸映射、variant 渲染、rows 归一化、active 静态/动画路径、loading 包裹内容和 slot style 合并
- [ ] 1.2 先运行 Skeleton 相关测试并确认因组件未实现而失败

## 2. 组件实现

- [ ] 2.1 新增 `packages/component/src/Skeleton/types.ts`，定义 `SkeletonSize`、`SkeletonVariant`、`SkeletonStyles` 和 `SkeletonProps`
- [ ] 2.2 新增 `packages/component/src/Skeleton/Skeleton.tsx`，实现 token 驱动样式、block/avatar/text variant、rows 归一化、active 动画和 loading 包裹行为
- [ ] 2.3 新增 `packages/component/src/Skeleton/index.ts`，导出组件与类型

## 3. 导出与验证

- [ ] 3.1 修改 `packages/component/src/index.ts` 暴露 Skeleton 组件和类型
- [ ] 3.2 运行 Skeleton 相关测试并通过
- [ ] 3.3 运行 `yarn workspace @pennyspring/component typecheck` 并通过
