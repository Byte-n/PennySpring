## 1. 测试期望调整

- [x] 1.1 删除 `packages/component/__tests__/Page.test.tsx`，移除继续要求 `Page` 存在的组件测试。
- [x] 1.2 更新 `packages/component/__tests__/ConfigProvider.test.tsx` 和 `packages/component/src/ConfigProvider/typeExports.test-d.ts`，移除 `PageConfig`、`page` shortcut 和 `page.onBack` 期望。
- [x] 1.3 更新根应用测试 `__tests__/App.test.tsx` 与 `__tests__/TestScreen.test.tsx`，移除默认 Page 返回行为断言和 Page mock 包裹。
- [x] 1.4 更新 `packages/component-preview/__tests__/registry.test.ts`，移除 Page 预览注册期望。

## 2. Page 组件与公共 API 移除

- [x] 2.1 删除 `packages/component/src/Page/**` 源码与类型入口。
- [x] 2.2 更新 `packages/component/src/index.ts`，移除 `Page`、`PageProps`、`PageStyles` 导出。
- [x] 2.3 更新 `packages/component/src/ConfigProvider/**`，移除 `PageConfig`、`page` 配置类型和 Page-only 合并逻辑。

## 3. 预览与规格同步

- [x] 3.1 更新 `packages/component-preview/src/previews/NavigationPreviews.tsx`，移除 `PagePreview` 和 `Page` import，并清理只服务于 Page 的样式。
- [x] 3.2 更新 `packages/component-preview/src/previews/registry.tsx`，移除 Page 预览注册项。
- [x] 3.3 更新主规格或准备归档同步，使 `openspec/specs/component-config-provider/spec.md` 不再要求 Page 默认返回行为或 PageConfig 导出。

## 4. 验证

- [ ] 4.1 运行最小相关测试，覆盖组件包 ConfigProvider、预览 registry 和根应用测试中受影响用例。
- [ ] 4.2 运行组件包 typecheck，确认公共导出和类型测试不再引用 Page。
- [ ] 4.3 使用 `rg` 检查代码和规格中不再存在需要保留 Page 组件的公开引用。
