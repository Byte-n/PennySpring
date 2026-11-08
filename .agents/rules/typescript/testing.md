---
paths:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---

# TypeScript/JavaScript Testing

> 扩展 [common/testing.md](../common/testing.md)。

- 测试框架：Jest + React Native preset。
- 文件命名 `*.test.ts` / `*.test.tsx`，置于根 `__tests__/` 或各包 `__tests__/`。
- 断言用户可感知行为；组件渲染用 `react-test-renderer`。
