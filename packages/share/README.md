# @pennyspring/share

PennySpring 的共享基础工具包，不依赖 React Native 或其他运行时。

## 内容

- `enumOf`：带类型推导的枚举工厂。每个枚举项可同时携带稳定的 `value`、展示用 `label` 与 `description`，并生成 `values()`、`labels()`、`options()` 等查询方法。
- `isPlainObject`、`toRawType`、`callOrReturn` 等轻量类型/取值工具。

`enumOf` 改编自 [varletjs/rattail](https://github.com/varletjs/rattail) 的 `enumOf` 实现。

## 使用

```ts
import { enumOf, type EnumOf } from '@pennyspring/share';

export const VISIBILITY = enumOf({
  visible: { value: 'visible', label: '显示' },
  hidden: { value: 'hidden', label: '隐藏' },
});

export type VisibilityValue = EnumOf<typeof VISIBILITY>;

VISIBILITY.values(); // ['visible', 'hidden']
VISIBILITY.label(VISIBILITY.hidden); // '隐藏'
VISIBILITY.options(); // [{ value: 'visible', label: '显示' }, ...]
```

约定：`value` 是稳定标识，用于查表、选中态、持久化与测试；`label` 只用于展示，不能参与逻辑判断。

## 开发

```bash
yarn workspace @pennyspring/share typecheck
yarn workspace @pennyspring/share test
```

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
