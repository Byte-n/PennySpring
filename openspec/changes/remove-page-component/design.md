## Context

`Page` 当前同时存在于组件包源码、包级导出、组件预览、组件测试、根应用测试，以及 `ConfigProvider` 的 `page.onBack` 配置规格中。`page` 配置只服务于 `Page` 默认返回行为；移除 `Page` 后继续保留会把无使用方的 Page-only API 留在公共类型中。

## Goals / Non-Goals

**Goals:**

- 删除 `Page` 源码、测试和公共导出。
- 从预览列表和注册测试中移除 `Page`。
- 从 `ConfigProvider` 实现、类型、测试和规格中移除 `page` / `PageConfig` 相关行为。
- 调整根应用测试，避免继续 mock 或断言 `Page` 默认返回行为。

**Non-Goals:**

- 不新增替代页面容器组件。
- 不修改其他导航组件的行为或视觉实现。
- 不清理 `todo.md` 中的非代码备忘，除非后续规格同步要求。

## Decisions

- 将 `ConfigProvider.page` 作为 Page-only API 移除。
  - 原因：`page.onBack` 的唯一明确消费者是 `Page` 默认返回行为；保留它会让公共 API 继续承诺已移除组件的配置能力。
  - 备选方案：保留 `page` 类型但无消费者。该方案减少 breaking 面，但会留下无行为保障的死 API。
- 直接删除 `Page` 目录和测试，而不是保留 deprecated shim。
  - 原因：用户目标是移除组件；shim 会继续允许导入 `Page`，与移除目标冲突。
  - 备选方案：保留运行时报错组件。该方案仍维持公共导出，不符合 API 收敛目标。
- 预览导航分组仅移除 `Page` item，保留 `Drawer`、`TopTabNavigator`、`Portal` 预览。
  - 原因：这些组件独立存在，不应被 Page 移除影响。

## Risks / Trade-offs

- [Risk] 现有消费者导入 `Page`、`PageProps`、`PageStyles` 或 `PageConfig` 会编译失败。→ 这是预期 breaking change；通过 OpenSpec 和测试明确公共 API 已移除。
- [Risk] `ConfigProvider` 移除 `page` 后当前配置测试需要重写，测试覆盖可能变少。→ 保留“无 Provider 返回空配置”和“Provider 支持 config 透传”的行为测试，覆盖 ConfigProvider 仍可作为通用配置容器使用。
- [Risk] 规格归档时若未同步主规格，会继续要求 Page 行为。→ 归档前按要求选择 `Sync now`，将 delta spec 同步到 `openspec/specs/component-config-provider/spec.md`。
