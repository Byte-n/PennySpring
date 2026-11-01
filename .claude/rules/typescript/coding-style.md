---
paths:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
---

# TypeScript/JavaScript Coding Style

> 扩展 [common/coding-style.md](../common/coding-style.md)。

## 类型与接口

- 导出函数、共享工具、公共方法标注参数与返回类型；局部变量让 TS 推断。
- 重复的内联对象形状抽成具名类型。
- `interface` 用于可扩展/实现的对象形状；`type` 用于联合、交叉、元组、映射、工具类型。
- 优先字符串字面量联合，少用 `enum`。

## 避免 `any`

- 应用代码不用 `any`；外部/不可信输入用 `unknown` 后安全收窄。
- 值类型依赖调用方时用泛型。

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}
```

## React Props

- 用具名 `interface XxxProps` 定义；回调 props 显式标类型。
- 不用 `React.FC`，除非有明确理由。

## 不可变性

用展开运算符返回新对象，禁止原地 mutation。

```typescript
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name };
}
```

## 输入校验

- 在系统边界（外部数据、文件内容）校验后再使用，快速失败。
- 校验失败抛出明确中文错误。

## 日志

- 生产代码禁止 `console.log`。
