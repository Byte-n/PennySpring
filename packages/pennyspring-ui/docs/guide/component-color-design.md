# Component Color 类型设计

## 背景

`Icon`、`Text`、`Button`、`Tag`、`Badge`、`SwipeActionAction` 都暴露了 `color` 属性，但它们对颜色的消费方式不同：

- `Icon`：消费单一前景色。
- `Text`：消费单一文本前景色，并拥有文本专属语义。
- `Button`：消费一组内部颜色，用于背景、边框、文字、按压态等。
- `Tag`：消费一组内部颜色，用于不同 variant 的背景、边框、文字、按压态等。
- `Badge`：主要消费徽标底色，内容文字色由组件内部控制。
- `SwipeActionAction`：消费一组 action 内部颜色，用于背景、文字、禁用态等。

因此，`color` 类型按组件消费方式分成两类：

- `Badge`、`Tag`、`Button`、`SwipeActionAction`：`color` 范围是组件语义色 + `PresetColorKey`。
- `Text`、`Icon`：`color` 范围是组件语义色 + `AliasColorTokenKey`。

语义色不是 token key，也不是颜色字符串；它由组件内部映射到特定 token 值或内部颜色配置。`PresetColorKey` 在
`Badge`、`Tag`、`Button`、`SwipeActionAction` 中同样由组件内部映射到特定 token 值或内部颜色配置，而不是作为普通 alias token
直接解析。

## 设计目标

- 按颜色消费方式区分组件 `color` 类型边界。
- `Badge`、`Tag`、`Button`、`SwipeActionAction` 只接受语义色与 `PresetColorKey`。
- `Text`、`Icon` 只接受语义色与 `AliasColorTokenKey`。
- 语义色映射保留在组件内部，不在公共层固定跨组件映射。
- `PresetColorKey` 只用于 `Badge`、`Tag`、`Button`、`SwipeActionAction` 的内部状态色映射。
- `AliasColorTokenKey` 只用于 `Text`、`Icon` 的单色 token 解析。
- `color` API 不以自定义颜色字符串作为目标类型范围。

## 类型分层

公共层只提供类型组合能力，不提供颜色解析逻辑。

```ts
// packages/pennyspring-ui/src/shares/color.ts
import type { AliasColorTokenKey, PresetColorKey } from '@pennyspring/ui';

export type SemanticPresetColor<TSemantic extends string> =
  TSemantic | PresetColorKey;

export type SemanticAliasColor<TSemantic extends string> =
  TSemantic | AliasColorTokenKey;
```

### 类型边界

| 组件                | `color` 范围                  | 解析方式                                                    |
| ------------------- | ----------------------------- | ----------------------------------------------------------- |
| `Badge`             | 语义色 + `PresetColorKey`     | 语义色与 preset 都映射为 Badge 内部颜色配置                 |
| `Tag`               | 语义色 + `PresetColorKey`     | 语义色与 preset 都映射为 Tag 内部颜色配置                   |
| `Button`            | 语义色 + `PresetColorKey`     | 语义色与 preset 都映射为 Button 内部颜色配置                |
| `SwipeActionAction` | 语义色 + `PresetColorKey`     | 语义色与 preset 都映射为 SwipeAction action 内部颜色配置    |
| `Text`              | 语义色 + `AliasColorTokenKey` | 语义色映射为文本 token，alias token key 直接解析为 token 值 |
| `Icon`              | 语义色 + `AliasColorTokenKey` | 语义色映射为图标 token，alias token key 直接解析为 token 值 |

## Badge / Tag / Button / SwipeActionAction 类型

`Badge`、`Tag`、`Button`、`SwipeActionAction` 属于会派生组件状态色的表面组件。它们的 `color` 不接受完整
`AliasColorTokenKey`，也不接受自定义颜色字符串。

### Button

```ts
// Button/types.ts
import type { PresetColorKey } from '@pennyspring/ui';

export type ButtonSemanticColor = 'default' | 'primary' | 'danger';
export type ButtonColor = ButtonSemanticColor | PresetColorKey;
```

### Tag

```ts
// Tag/types.ts
import type { PresetColorKey } from '@pennyspring/ui';

export type TagSemanticColor =
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type TagColor = TagSemanticColor | PresetColorKey;
```

### Badge

```ts
// Badge/types.ts
import type { PresetColorKey } from '@pennyspring/ui';

export type BadgeSemanticColor =
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type BadgeColor = BadgeSemanticColor | PresetColorKey;
```

### SwipeActionAction

```ts
// SwipeAction/types.ts
import type { PresetColorKey } from '@pennyspring/ui';

export type SwipeActionSemanticColor =
  'light' | 'weak' | 'primary' | 'success' | 'warning' | 'danger';

export type SwipeActionColor = SwipeActionSemanticColor | PresetColorKey;

export interface SwipeActionAction {
  color?: SwipeActionColor;
}
```

### 表面组件映射职责

`Button`、`Tag`、`Badge`、`SwipeActionAction` 内部负责把 `color` 映射为组件需要的颜色配置。

- 语义色映射到组件自己的 token 组合。
- `PresetColorKey` 映射到 preset 梯度中的固定阶梯。
- 不通过 `getAliasColorTokenValue` 解析完整 alias token key。
- 不把无法识别的值作为自定义颜色字符串透传。

例如 `Button` 和 `Tag` 的 `blue` 可以映射为：

```ts
{
  base: token.blue6,
  active: token.blue7,
  background: token.blue1,
  border: token.blue3,
  text: token.blue6,
}
```

`Badge` 的 `blue` 可以映射为：

```ts
{
  base: token.blue6,
}
```

`SwipeActionAction` 的 `blue` 可以映射为 action 背景与文字颜色：

```ts
{
  background: token.blue6,
  text: token.colorTextLightSolid,
}
```

具体阶梯由组件内部决定；公共类型只声明 `PresetColorKey` 可以作为输入。

## Text / Icon 类型

`Text`、`Icon` 属于单一前景色组件。它们的 `color` 接受组件语义色和
`AliasColorTokenKey`，不接受 `PresetColorKey` 专属映射配置，也不做组件状态色派生。

### Text

```ts
// Text/types.ts
import type { AliasColorTokenKey } from '@pennyspring/ui';

export type TextSemanticColor =
  | 'base'
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'heading'
  | 'label'
  | 'description'
  | 'disabled'
  | 'placeholder'
  | 'lightSolid';

export type TextColor = TextSemanticColor | AliasColorTokenKey;
```

`TextSemanticColor` 仅描述文本前景色，不开放给 `Button`、`Tag`、`Badge`、`SwipeActionAction` 的 `color` 类型。

### Icon

```ts
// Icon/types.ts
import type { AliasColorTokenKey } from '@pennyspring/ui';

export type IconSemanticColor =
  | 'base'
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'heading'
  | 'label'
  | 'description'
  | 'disabled'
  | 'placeholder'
  | 'lightSolid';

export type IconColor = IconSemanticColor | AliasColorTokenKey;
```

### 前景组件映射职责

`Text`、`Icon` 内部负责把语义色映射为单一前景色。

- `TextSemanticColor` 映射到文本相关 token，例如 `colorText`、`colorTextSecondary`、
  `colorTextHeading`。
- `IconSemanticColor` 与 `TextSemanticColor` 使用同一组语义 key，映射到对应文本前景 token，便于文本和图标相邻时使用一致颜色语义。
- `AliasColorTokenKey` 使用 `getAliasColorTokenValue(token, color)` 解析。
- 未传 `color` 时，`Text` fallback 到 `token.colorText`，`Icon` fallback 到 `token.colorIcon`。
- 不把无法识别的值作为自定义颜色字符串透传。

## 映射边界

公共层只定义类型边界，不提供如下逻辑：

- `primary -> token.colorPrimary`
- `danger -> token.colorError`
- `default -> token.colorText`
- `blue -> token.blue6`
- `background / border / text / active` 等状态色派生

这些映射全部保留在组件内部。同一个语义 key 在不同组件中可以对应不同视觉表现；同一个组件内也可以把一个语义 key
映射到多个内部颜色值。

## 迁移结果

保留并明确支持：

- `<Button color="primary" />`
- `<Button color="blue" />`
- `<Tag color="warning" />`
- `<Tag color="gold" />`
- `<Badge color="success" />`
- `<Badge color="lime" />`
- `<SwipeAction rightActions={[{ key: 'delete', color: 'danger' }]} />`
- `<SwipeAction leftActions={[{ key: 'archive', color: 'blue' }]} />`
- `<Text color="secondary" />`
- `<Text color="primaryText" />`
- `<Icon color="primary" />`
- `<Icon color="icon" />`

不作为目标 API 支持：

- `<Button color="colorPrimary" />`
- `<Tag color="colorSuccessText" />`
- `<Badge color="#123456" />`
- `<SwipeAction rightActions={[{ key: 'delete', color: 'colorError' }]} />`
- `<Text color="#123456" />`
- `<Icon color="#123456" />`

其中 `Badge`、`Tag`、`Button`、`SwipeActionAction` 的 preset 值会进入组件内部映射；`Text`、`Icon` 的 alias token key
只解析为单一 token 值。
