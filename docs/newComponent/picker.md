# Picker 组件设计

## 设计目标

`Picker` 是一套完全独立于业务的 React Native 选择器组件，用于呈现底部弹层中的多列滚轮选择界面。

组件只负责布局、视觉层级、子组件组合、通用可控/非可控状态、滚轮选择行为和样式开放点，不包含级联计算、错误重试、业务校验或国际化文案。

## 设计原则

- **无业务逻辑**：组件内部只处理 `open/defaultOpen/onOpenChange` 与 `value/defaultValue/onChange` 这类通用状态，不理解业务含义。
- **确认语义明确**：`onChange` 表示弹层内草稿值变化，`onOk` 表示用户确认当前草稿值，`onCancel` 表示内部取消入口触发。
- **业务无关**：不内置级联、不内置错误重试、不内置业务校验、不内置国际化文案。
- **节点命名一致**：内部节点同时支持文本和自定义节点时，文本使用 `xxxText: string`，节点使用 `xxx: ReactNode`，不使用 `string | ReactNode` 或 `xxxNode`。
- **组合优先**：参考 Ant Design Mobile Picker 的层级，将触发区、底部弹层、头部、主体滚轮和安全区拆分为稳定子组件。
- **React Native 优先**：使用 RN 视图结构表达层级，不依赖 Web DOM、CSS class、鼠标滚轮或浏览器容器概念。
- **样式稳定**：样式 slot 只描述真实存在的内部节点；默认样式由主题 token 驱动。

## 组件层级

参考 Ant Design Mobile Picker 的 `Popup + Picker 面板 + children trigger` 结构，React Native 版本建议拆为以下层级：

```tsx
<Picker>
  <PickerTrigger />
  <PickerPopup>
    <PickerPanel>
      <PickerHeader>
        <PickerHeaderButton slot="cancel" />
        <PickerTitle />
        <PickerHeaderButton slot="ok" />
      </PickerHeader>
      <PickerBody>
        <PickerView>
          <PickerColumn>
            <PickerColumnItem />
          </PickerColumn>
        </PickerView>
      </PickerBody>
      <PickerSafeArea />
    </PickerPanel>
  </PickerPopup>
</Picker>
```

实际实现时，`Picker` 做结构编排、通用可控/非可控状态托管、草稿值托管和 props 透传；`children` 作为触发区内容，由 `PickerTrigger` 承载。

## 子组件职责

### Picker

顶层组合组件，对外提供统一入口。

- 通过 `open`、`defaultOpen`、`onOpenChange` 支持弹层可控和非可控。
- 通过 `value`、`defaultValue`、`onChange` 支持主要值可控和非可控。
- 打开时以当前主要值初始化弹层内草稿值。
- 滚动或点击选项时更新草稿值，并调用 `onChange(draftValue, params)`。
- 点击完成时调用 `onOk(draftValue, params)`。
- 点击取消按钮或遮罩时调用 `onCancel(params)`。
- 接收 `columns`、`loading`、`emptyText`、`empty` 等展示数据并透传给 `PickerView`。
- 标题、按钮、加载内容和空状态遵循 `xxxText/xxx` 命名。
- 不创建 ref actions，不提供 `open`、`close`、`toggle`。
- 不在内部组合禁用条件，例如不计算 `okDisabled || loading`。

### PickerTrigger

触发区容器。

- 承载 `children`。
- 点击时请求打开 Picker，并触发 `onOpenChange(true, { reason: 'trigger' })`。
- `disabled` 为 `true` 时不允许打开。
- 不负责把 `value` 转成回显文案。

### PickerPopup

底部弹层容器。

- 根据最终 `open` 状态决定是否展示。
- 承载遮罩、底部定位、动画容器和外层圆角。
- 可基于项目已有 `Modal`、`Portal`、`BottomSheet` 或基础 RN 组件实现。
- 遮罩点击走 `mask` 关闭原因，只派发通用事件，不在组件内部执行业务逻辑。

### PickerPanel

Picker 的主面板容器。

- 承载头部、主体和安全区。
- 提供背景色、顶部圆角、隐藏溢出等视觉样式。
- 不感知业务数据。

### PickerHeader

顶部操作栏。

- 左侧取消按钮。
- 中间标题。
- 右侧完成按钮。
- 只负责三段式水平布局。

### PickerHeaderButton

头部按钮展示组件。

- 由 `Picker` 传入 `cancelText/cancel` 或 `okText/ok` 解析后的节点。
- 通过 `disabled` 展示禁用态。
- 通过 `onPress` 暴露点击事件。
- 不内置取消或完成之外的业务语义。

### PickerTitle

标题展示组件。

- 通过 `titleText` 展示普通文本，通过 `title` 展示自定义节点。
- 保持单行居中。
- 不参与按钮布局计算之外的逻辑。

### PickerBody

主体区域容器。

- 包裹 `PickerView`。
- 提供固定高度、分割线、滚轮遮罩区域等结构承载。
- 不处理业务级联。

### PickerView

多列滚轮展示区域。

- 根据 `columns` 渲染多个 `PickerColumn`。
- 根据草稿 `value` 标记当前选中项。
- 接收 `loading` 时展示 `loadingIndicator`、`loadingIndicatorText` 或占位内容。
- 接收空数据时展示 `empty`、`emptyText` 或占位内容。
- 不根据列之间的依赖关系生成新列。

### PickerColumn

单列滚轮区域。

- 渲染当前列的 `PickerColumnItem`。
- 打开时滚动到当前列选中项。
- 滚动结束后吸附到最近的有效选项。
- 将滚动结果通过通用事件向上派发。
- 不处理业务级联。

### PickerColumnItem

单个选项展示节点。

- 展示 `labelText`、`label` 或 `renderLabel(item)` 的结果。
- 根据 `selected`、`disabled` 控制视觉态。
- 点击或滚轮命中有效选项时触发外部传入的通用事件。
- 不负责修改业务值。

### PickerSafeArea

底部安全区占位。

- 适配 iOS Home Indicator 区域。
- 可使用 `react-native-safe-area-context` 的 inset，或使用项目已有安全区组件。
- 只提供布局占位，不处理业务逻辑。

## Props 设计

### PickerProps

```ts
interface PickerProps<TData = unknown> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: PickerOpenChangeParams
  ) => void;
  columns: Array<PickerColumn<TData>>;
  value?: PickerValue[];
  defaultValue?: PickerValue[];
  onChange?: (
    value: PickerValue[],
    params: PickerChangeParams<TData>
  ) => void;
  onOk?: (
    value: PickerValue[],
    params: PickerOkParams<TData>
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;
  titleText?: string;
  title?: React.ReactNode;
  cancelText?: string;
  cancel?: React.ReactNode;
  okText?: string;
  ok?: React.ReactNode;
  loading?: boolean;
  loadingIndicatorText?: string;
  loadingIndicator?: React.ReactNode;
  emptyText?: string;
  empty?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  okDisabled?: boolean;
  itemHeight?: number;
  visibleItemCount?: number;
  children?: React.ReactNode;
  renderLabel?: (item: PickerColumnItemData<TData>) => React.ReactNode;
  styles?: PickerStyles;
}
```

### 数据类型

```ts
type PickerValue = string | number;

interface PickerColumnItemData<TData = unknown> {
  labelText?: string;
  label?: React.ReactNode;
  value: PickerValue;
  disabled?: boolean;
  data?: TData;
}

type PickerColumn<TData = unknown> = Array<PickerColumnItemData<TData>>;

type PickerOpenChangeReason = 'trigger' | 'cancel' | 'mask' | 'ok';

interface PickerOpenChangeParams {
  reason: PickerOpenChangeReason;
}

interface PickerOkParams<TData = unknown> {
  items: Array<PickerColumnItemData<TData> | undefined>;
}

type PickerCancelReason = 'cancel' | 'mask';

interface PickerCancelParams {
  reason: PickerCancelReason;
}

interface PickerChangeParams<TData = unknown> {
  item: PickerColumnItemData<TData>;
  value: PickerValue;
  columnIndex: number;
  itemIndex: number;
  items: Array<PickerColumnItemData<TData> | undefined>;
}
```

### 样式类型

```ts
interface PickerStyles {
  trigger?: ViewStyle;
  popup?: ViewStyle;
  mask?: ViewStyle;
  panel?: ViewStyle;
  header?: ViewStyle;
  cancelButton?: ViewStyle;
  cancelButtonText?: TextStyle;
  titleText?: TextStyle;
  titleContainer?: ViewStyle;
  okButton?: ViewStyle;
  okButtonText?: TextStyle;
  body?: ViewStyle;
  view?: ViewStyle;
  column?: ViewStyle;
  item?: ViewStyle;
  itemText?: TextStyle;
  selectedItem?: ViewStyle;
  selectedItemText?: TextStyle;
  disabledItem?: ViewStyle;
  disabledItemText?: TextStyle;
  indicator?: ViewStyle;
  loading?: ViewStyle;
  empty?: ViewStyle;
  safeArea?: ViewStyle;
}
```

## 节点命名规则

Picker 内部可渲染节点遵循统一命名：

| 含义 | 文本属性 | 自定义节点属性 |
| --- | --- | --- |
| 标题 | `titleText?: string` | `title?: React.ReactNode` |
| 取消按钮 | `cancelText?: string` | `cancel?: React.ReactNode` |
| 完成按钮 | `okText?: string` | `ok?: React.ReactNode` |
| 加载内容 | `loadingIndicatorText?: string` | `loadingIndicator?: React.ReactNode` |
| 空状态 | `emptyText?: string` | `empty?: React.ReactNode` |
| 选项标签 | `labelText?: string` | `label?: React.ReactNode` |

禁止使用 `title: string | ReactNode`、`titleNode: ReactNode`、`cancelText: ReactNode` 这类混合或后缀命名。

## 插槽样式规则

- `styles.xxxText` 只作用于组件内部创建的文本节点，例如 `styles.titleText` 仅作用于 `titleText`。
- 自定义节点 `title`、`cancel`、`ok`、`empty`、`label` 的内部样式由调用方自己控制。
- 如需包裹标题节点，使用 `titleContainer` 承载 `title ?? titleText`，不要用 `title` 表示容器。
- 样式 slot 只描述真实存在的内部节点，不为了样式 API 额外制造无职责节点。

## 事件顺序

组件只派发通用事件，不解释事件结果。

| 交互 | 调用顺序 |
| --- | --- |
| 点击触发区打开 | `onOpenChange?.(true, { reason: 'trigger' })` |
| 点击取消按钮关闭 | `onCancel?.({ reason: 'cancel' })` → `onOpenChange?.(false, { reason: 'cancel' })` |
| 点击遮罩关闭 | `onCancel?.({ reason: 'mask' })` → `onOpenChange?.(false, { reason: 'mask' })` |
| 点击完成关闭 | `onOk?.(draftValue, okParams)` → `onOpenChange?.(false, { reason: 'ok' })` |
| 滚动或点击选项 | `onChange?.(draftValue, changeParams)` |

特别说明：

- 外部把 `open` 从 `true` 改为 `false` 时，Picker 只同步展示状态，不触发 `onCancel`、`onOk`、`onOpenChange`。
- `onCancel` 只表示 Picker 内部取消/关闭入口触发，例如取消按钮、遮罩关闭。
- 点击完成虽然也会关闭，但不触发 `onCancel`，只触发 `onOk` 和 `onOpenChange(false, { reason: 'ok' })`。

## 值语义

- `value` / `defaultValue` 表示 Picker 的主要值。
- 打开弹层时，Picker 用当前主要值初始化草稿值 `draftValue`。
- `onChange` 表示 Picker 内当前草稿选择变化，不等于业务最终提交。
- `onOk` 表示用户确认当前草稿值。
- `onCancel` 表示用户通过 Picker 内部取消/关闭入口关闭弹层，不提交草稿值。
- 如果调用方希望“选择即生效”，可以在外部 `onChange` 中直接同步 `value`。
- 可控 `value` 在弹层打开期间从外部变化时，Picker 应以新的 `value` 重新同步草稿值。

## 通用状态规则

所有组件都需要支持可控和非可控。Picker 使用以下通用规则：

- `open` 存在时，可见状态由外部控制；组件只通过 `onOpenChange(nextOpen, params)` 发出可见状态变更请求。
- `open` 不存在时，组件使用 `defaultOpen` 作为初始可见状态，并在触发、取消、完成等通用交互后更新内部可见状态。
- `value` 存在时，主要值由外部控制；非确认交互只更新草稿值并触发 `onChange`。
- `value` 不存在时，组件使用 `defaultValue` 作为初始主要值；点击完成后可将草稿值作为新的内部主要值。
- 非可控 `open` 下，取消和完成会关闭弹层；可控 `open` 下，只发出 `onOpenChange(false, params)` 请求。

## 滚轮行为规则

- 打开时应滚动到当前草稿值对应的选项。
- 选中项应位于中间高亮区域。
- 滚动结束后吸附到最近的有效选项。
- `itemHeight` 控制单个选项高度。
- `visibleItemCount` 控制可见选项数量，建议为奇数，方便中间选中态展示。
- 禁用项不应作为用户滚动或点击后的最终新选中项。
- 滚动或点击遇到禁用项时，不触发 `onChange`；实现可保持原选中项或吸附到最近可用项，但不得隐式提交业务值。
- `PickerColumn` 可以承载滚动容器，但滚动结果只通过通用事件向上派发，不处理业务级联。

## 异常值和空数据规则

- `columns` 为空时展示空状态。
- 所有列都没有选项时展示空状态。
- 某一列为空时，该列展示列内占位，不生成该列选中值；全局 `emptyText` / `empty` 只用于整体无数据场景。
- `value` 长度少于 `columns` 时，缺失列不选中，不默认选中第一个可用项。
- `value` 长度多于 `columns` 时，多余值忽略展示，不参与渲染和回调 `items`。
- `value` 中的值在对应列不存在时，该列不选中，不自动回退到第一个可用项。
- `value` 命中禁用项时，可以展示禁用选中态，但不允许用户再次选择该禁用项，不自动回退。
- `columns` 变化后，组件不做业务级修正，只根据新 `columns` 和当前值重新渲染。

## 禁用和只读规则

- `disabled` 为 `true` 时，不允许打开、不允许滚动、不允许点击选项、不允许点击完成。
- `readOnly` 为 `true` 时，可以展示当前值和打开查看，但不允许修改选择。
- `okDisabled` 只控制完成按钮，不代表整个 Picker 禁用。
- `loading` 只控制加载态展示，不自动禁止滚动、完成或取消。
- 如需加载时禁用滚动或完成，由调用方传入最终的 `disabled`、`readOnly` 或 `okDisabled`。
- 不在组件内部组合 `okDisabled || loading` 这类展示状态。

## 空状态规则

- `emptyText` 用于普通文本空状态。
- `empty` 用于完全自定义空状态节点。
- 当 `columns` 为空，或所有列都没有选项时展示空状态。
- 接口失败、重试按钮、错误提示由调用方通过 `empty` 自定义表达，Picker 不理解错误和重试语义。

## 选项数据扩展

`PickerColumnItemData<TData>` 通过 `data?: TData` 保留原始数据：

```ts
interface AccountData {
  accountId: string;
  accountNo: string;
  bankName: string;
}

const columns: Array<PickerColumn<AccountData>> = [
  [
    {
      labelText: '招商银行储蓄卡',
      value: 'account_1',
      data: {
        accountId: 'account_1',
        accountNo: '**** 1234',
        bankName: '招商银行',
      },
    },
  ],
];
```

- Picker 不理解 `data` 的业务含义，只负责原样透传。
- 业务方可以在 `onOk`、`onChange` 的 `params.items` 中拿到原始数据。
- 不把账户号、地区编码、门店地址等业务字段加到通用组件类型里。
- 不强制提供 `labels`，调用方可从 `items` 的 `labelText` 或 `label` 自行生成展示文案。

## 触发区回显规则

Picker 本体不负责表单 label、placeholder、回显拼接。

回显逻辑由外部 `PickerField`、业务组件或 controller 处理。Picker 通过 `onOk` 返回 `items` 后，外部可以自行生成展示文案。

```tsx
<Picker
  columns={columns}
  value={value}
  onOk={(nextValue, params) => {
    setValue(nextValue);
    setDisplayText(
      params.items
        .map(item => item?.labelText)
        .filter(Boolean)
        .join(' / ')
    );
  }}
/>
```

## 禁止内置的业务逻辑

以下能力必须放在调用方、业务 hook、外部 `PickerField` 或独立 controller 中，不能放入 `Picker` 本体：

- `useImperativeHandle` 暴露 `open`、`close`、`toggle`。
- `okDisabled || loading` 等展示状态组合判断。
- 根据当前选中值动态生成级联列。
- 生成业务级 `labels`、回显文案或 placeholder。
- 内置接口错误、重试按钮、错误提示语义。
- 内置确认、取消、空状态或加载文案的国际化逻辑。
- 内置业务校验、权限判断或埋点。

## 使用示例

### 点击完成后提交

```tsx
function AccountPickerField() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<PickerValue[]>([]);

  return (
    <Picker
      open={open}
      onOpenChange={setOpen}
      columns={columns}
      value={value}
      titleText="选择账户"
      cancelText="取消"
      okText="确定"
      onOk={nextValue => setValue(nextValue)}
    >
      <Text>打开选择器</Text>
    </Picker>
  );
}
```

### 选择即生效

```tsx
<Picker
  columns={columns}
  value={value}
  onChange={nextValue => setValue(nextValue)}
  onOk={nextValue => setValue(nextValue)}
/>
```

以上示例只说明边界：业务提交、业务关闭、级联和业务文案都在外部。

## 渲染结构建议

```tsx
function Picker<TData = unknown>(props: PickerProps<TData>) {
  return (
    <>
      <PickerTrigger
        disabled={props.disabled}
        styles={props.styles}
        onPress={handleTriggerPress}
      >
        {props.children}
      </PickerTrigger>
      <PickerPopup
        open={mergedOpen}
        styles={props.styles}
        onMaskPress={handleMaskPress}
      >
        <PickerPanel styles={props.styles}>
          <PickerHeader styles={props.styles}>
            <PickerHeaderButton
              styles={props.styles}
              variant="cancel"
              onPress={handleCancelPress}
            >
              {props.cancel ?? props.cancelText}
            </PickerHeaderButton>
            <PickerTitle styles={props.styles}>
              {props.title ?? props.titleText}
            </PickerTitle>
            <PickerHeaderButton
              disabled={props.disabled || props.okDisabled}
              styles={props.styles}
              variant="ok"
              onPress={handleOkPress}
            >
              {props.ok ?? props.okText}
            </PickerHeaderButton>
          </PickerHeader>
          <PickerBody styles={props.styles}>
            <PickerView
              columns={props.columns}
              value={draftValue}
              loading={props.loading}
              loadingIndicatorText={props.loadingIndicatorText}
              loadingIndicator={props.loadingIndicator}
              emptyText={props.emptyText}
              empty={props.empty}
              disabled={props.disabled}
              readOnly={props.readOnly}
              itemHeight={props.itemHeight}
              visibleItemCount={props.visibleItemCount}
              renderLabel={props.renderLabel}
              styles={props.styles}
              onChange={handleDraftChange}
            />
          </PickerBody>
          <PickerSafeArea styles={props.styles} />
        </PickerPanel>
      </PickerPopup>
    </>
  );
}
```

## 与 Ant Design Mobile 参考实现的差异

| Ant Design Mobile Picker | React Native Picker |
| --- | --- |
| 内部维护 `visible` | 使用 `open/defaultOpen/onOpenChange` 支持可控和非可控 |
| 内部维护 `value` 与 `innerValue` | 使用主要值和草稿值区分提交语义 |
| 暴露 ref actions | 不暴露 imperative actions |
| `children(items, actions)` | `children` 作为触发区内容，不负责回显拼接 |
| `Popup` 负责 Web 弹层 | `PickerPopup` 适配 RN 底部弹层 |
| `PickerView` 可参与临时值更新 | `PickerView` 只派发通用草稿值变化事件 |
| 内置 locale 默认文案 | 文案完全由外部提供 |
| 支持 mouse wheel | 不设计 Web 鼠标滚轮能力 |

## 文件结构建议

如果后续落地到共享组件包，建议结构如下：

```text
packages/pennyspring-ui/src/Picker/
  index.ts
  Picker.tsx
  PickerTrigger.tsx
  PickerPopup.tsx
  PickerPanel.tsx
  PickerHeader.tsx
  PickerHeaderButton.tsx
  PickerTitle.tsx
  PickerBody.tsx
  PickerView.tsx
  PickerColumn.tsx
  PickerColumnItem.tsx
  PickerSafeArea.tsx
  types.ts
  usePickerStyles.ts
```

其中 `types.ts` 放公共类型，`usePickerStyles.ts` 只放 token 驱动样式，不放业务逻辑。

## 验收标准

- 支持 `open/defaultOpen/onOpenChange` 可控和非可控可见状态。
- 支持 `value/defaultValue/onChange` 可控和非可控主要值。
- `onChange`、`onCancel`、`onOk`、`onOpenChange` 调用顺序与文档一致。
- 弹层内选择使用草稿值，点击完成才通过 `onOk` 表达确认。
- 滚轮打开定位、滚动吸附、中间选中态、禁用项处理规则明确。
- 异常值、空列、空数据、禁用、只读、加载和空状态都有稳定展示规则。
- `data?: TData` 只做原样透传，不引入业务字段。
- Picker 本体不负责表单回显、placeholder、错误重试、级联计算或业务校验。
- 默认样式不出现颜色、间距、字号、圆角等裸字面量，应由主题 token 或语义化常量提供。
