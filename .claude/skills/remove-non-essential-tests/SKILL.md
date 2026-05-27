---
name: remove-non-essential-tests
description: 移除 `packages/pennyspring-ui/__tests__/` 中非用户视角的测试用例。当需要清理测试、移除不必要用例、精简测试覆盖范围时使用此技能。仅移除黑名单中的测试类型，不新增或修改任何测试。
---

# 移除非必要测试用例

## 核心原则

测试仅覆盖用户可感知的行为和入口导出的内容。以下黑名单中的测试类型不属于这个范畴，应当移除。

## 黑名单（5 类）

### 1. TypeScript 类型约束测试

**检测特征**：测试代码块中包含 `@ts-expect-error` 注释。

**典型文件**：`componentColorTypes.test.tsx`（整文件）、`DisplayInput`、`FloatingPanel`、`Input`、`Picker`、`SelectionList`、`Textarea` 中的局部用例。

**处理方式**：
- 若整个文件都是类型测试（如 `componentColorTypes.test.tsx`），删除整个文件。
- 若是文件中的个别用例，仅移除包含 `@ts-expect-error` 的 `it(...)` 块。

**示例**：
```typescript
// 移除此 it 块
it('rejects alias tokens and custom strings for surface colors', () => {
  // @ts-expect-error Button color does not accept alias token keys.
  const buttonAlias: ButtonColor = 'colorPrimary';
  // ...
});
```

### 2. 注册表/源码结构测试

**检测特征**：测试文件名为 `componentPreviewRegistry.test.ts`，或测试内部注册表数据结构。

**处理方式**：删除整个文件。

### 3. 动画生命周期测试

**检测特征**：用例名称或代码中包含以下模式之一：
- `afterOpenChange`
- `keeps the body mounted while closing`
- `unmounts after exit completes`
- `exit completes`
- `animates in from hidden state`
- `animates out when closed`

**典型文件**：`Message.test.tsx`、`Notification.test.tsx`、`Toast.test.tsx` 中的动画相关用例。

**处理方式**：移除匹配的 `it(...)` 块。

### 4. 定时器/延迟测试

**检测特征**：用例代码中使用了 `jest.advanceTimersByTime(...)` 来测试延迟行为。

**排除**：`jest.useFakeTimers().setSystemTime(...)` 用于固定日期的场景（如 Calendar 测试）不属于此类，不应移除。

**典型文件**：`Button.test.tsx`（loading delay）、`Message.test.tsx`、`Notification.test.tsx`。

**处理方式**：移除匹配的 `it(...)` 块。

### 5. 纯函数/工具函数测试

**检测特征**：从组件源文件中导入并直接测试内部工具函数，不涉及组件渲染。判断标准：
- import 来源是组件实现文件（如 `../src/Progress/Progress`），而非入口 `index.ts`
- 测试中直接调用函数并断言返回值，无 `render` 或 `create`

**典型文件**：`Progress.test.tsx`（`clampPercent`、`resolveCircleRotation`）、`Avatar.test.tsx`（`formatAvatarText`）。

**处理方式**：移除匹配的 `it(...)` 块。若整个文件剩余用例为空，删除文件。

## 执行流程

1. 扫描 `packages/pennyspring-ui/__tests__/` 下所有测试文件
2. 对每个文件，逐个检查 `it(...)` 块是否命中黑名单
3. 用 Edit 工具移除命中的 `it(...)` 块（保留 describe 外壳和其他用例）
4. 若文件中所有用例被移除，删除整个文件
5. 运行 `yarn workspace @pennyspring/ui test` 验证剩余用例全部通过
6. 输出移除报告

## 注意事项

- 仅移除，不新增、不修改任何测试
- 若黑名单用例与正常用例共享 setup 代码（`beforeEach`、helper 函数），保留 setup 代码，仅移除 `it(...)` 块
- 移除后若 `describe` 块为空，一并移除空的 `describe` 块
