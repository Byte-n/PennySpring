# CascadePicker 组件设计

## 设计目标

`CascadePicker` 基于 `Picker` 构建级联选择能力，只负责把树形数据转换为 `Picker` 的多列数据和多列值。

`CascadePicker` 不重复实现弹层、滚轮、确认、取消、空状态、加载态、触发区和样式 slot，这些能力全部来自 `Picker`。

## 与 Picker 的关系

`CascadePicker` 是 `Picker` 的数据适配层：

- 对外接收树形 `options`。
- 内部根据当前路径生成多列 `columns`。
- 内部把路径值转换为 `PickerValue[]`。
- 内部在某一列变化时重新计算后续列。
- 透传 `open/defaultOpen/onOpenChange/onCancel` 等弹层通用属性。
- 透传 `titleText/title`、`cancelText/cancel`、`okText/ok`、`emptyText/empty`、`disabled/readOnly/okDisabled`、`children`、`styles` 等 Picker 展示属性。

级联计算只存在于 `CascadePicker`，不放入基础 `Picker`。

## Props 设计

```ts
interface CascadePickerOption<TData = unknown> {
  labelText?: string;
  label?: React.ReactNode;
  value: PickerValue;
  disabled?: boolean;
  children?: Array<CascadePickerOption<TData>>;
  data?: TData;
}

interface CascadePickerChangeParams<TData = unknown> {
  item: CascadePickerOption<TData>;
  value: PickerValue;
  columnIndex: number;
  itemIndex: number;
  path: Array<CascadePickerOption<TData>>;
  items: Array<CascadePickerOption<TData> | undefined>;
}

interface CascadePickerOkParams<TData = unknown> {
  path: Array<CascadePickerOption<TData>>;
  items: Array<CascadePickerOption<TData> | undefined>;
}

interface CascadePickerProps<TData = unknown> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: PickerOpenChangeParams
  ) => void;

  options: Array<CascadePickerOption<TData>>;
  value?: PickerValue[];
  defaultValue?: PickerValue[];
  onChange?: (
    value: PickerValue[],
    params: CascadePickerChangeParams<TData>
  ) => void;
  onOk?: (
    value: PickerValue[],
    params: CascadePickerOkParams<TData>
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
  renderLabel?: (item: CascadePickerOption<TData>) => React.ReactNode;
  styles?: PickerStyles;
}
```

## 值语义

`CascadePicker` 的 `value/defaultValue` 表示从根节点到当前节点的路径值：

```ts
['guangdong', 'shenzhen', 'nanshan']
```

- `value[0]` 对应第一列。
- `value[1]` 对应第二列。
- 后续值依次对应更深层级。
- `onChange` 返回当前草稿路径值。
- `onOk` 返回用户确认的路径值。

`CascadePicker` 不把路径 label 拼接成回显文案，回显由外部 `PickerField`、业务组件或 controller 处理。

## 树到列转换规则

`CascadePicker` 根据当前路径生成 `Picker` 的 `columns`：

```ts
function optionsToColumns<TData>(
  options: Array<CascadePickerOption<TData>>,
  value: PickerValue[]
): Array<PickerColumn<TData>> {
  const columns: Array<PickerColumn<TData>> = [];
  let currentOptions = options;

  for (const selectedValue of value) {
    columns.push(toPickerColumn(currentOptions));

    const selectedOption = currentOptions.find(option => option.value === selectedValue);
    if (!selectedOption?.children?.length) {
      return columns;
    }

    currentOptions = selectedOption.children;
  }

  if (currentOptions.length > 0) {
    columns.push(toPickerColumn(currentOptions));
  }

  return columns;
}
```

`toPickerColumn` 只做字段映射：

```ts
function toPickerColumn<TData>(
  options: Array<CascadePickerOption<TData>>
): PickerColumn<CascadePickerOption<TData>> {
  return options.map(option => ({
    labelText: option.labelText,
    label: option.label,
    value: option.value,
    disabled: option.disabled,
    data: option,
  }));
}
```

## 后续列重算规则

当第 `n` 列选择变化时，`CascadePicker` 需要丢弃第 `n` 列之后的旧路径，并根据新节点重新生成后续路径：

- 保留 `0...n-1` 的路径值。
- 使用第 `n` 列新值替换原值。
- 从新节点开始，后续列默认选择第一个可用子节点。
- 如果新节点没有子节点，路径在当前列结束。
- 如果没有可用子节点，不自动构造不存在的后续值。

```ts
function completePathFromColumn<TData>(
  options: Array<CascadePickerOption<TData>>,
  previousValue: PickerValue[],
  columnIndex: number,
  nextValue: PickerValue
): PickerValue[] {
  const prefix = previousValue.slice(0, columnIndex);
  const path = [...prefix, nextValue];
  let currentNode = findNodeByPath(options, path);

  while (currentNode?.children?.length) {
    const firstEnabledChild = currentNode.children.find(child => !child.disabled);
    if (!firstEnabledChild) {
      break;
    }
    path.push(firstEnabledChild.value);
    currentNode = firstEnabledChild;
  }

  return path;
}
```

这类路径补全属于级联组件逻辑，不属于基础 `Picker` 逻辑。

## 异常路径规则

`CascadePicker` 需要在自身层面处理树形路径异常：

- `value` 中某一级不存在时，路径在上一级有效节点处截断。
- `value` 多于实际深度时，多余值丢弃。
- `value` 命中禁用节点时，可以展示该路径，但用户后续变化不能再次选中禁用节点。
- 某一级没有子节点时，不继续生成后续列。
- `options` 为空时，将空列交给 `Picker` 展示空状态。

路径修正只服务于树到列转换，不改变 `Picker` 的异常值规则。

## 事件映射

`CascadePicker` 保持 `Picker` 的事件顺序，只转换回调参数：

| Picker 事件 | CascadePicker 行为 |
| --- | --- |
| `onChange(pickerValue, params)` | 根据变化列重算路径后调用 `onChange(pathValue, cascadeParams)` |
| `onOk(pickerValue, params)` | 根据最终路径调用 `onOk(pathValue, cascadeParams)` |
| `onCancel(params)` | 原样透传 `onCancel(params)` |
| `onOpenChange(open, params)` | 原样透传 `onOpenChange(open, params)` |

`CascadePicker` 的 `params.path` 返回完整选项路径，方便业务层读取 label 和原始 `data`。

```ts
function buildCascadeOkParams<TData>(
  options: Array<CascadePickerOption<TData>>,
  value: PickerValue[]
): CascadePickerOkParams<TData> {
  const path = getOptionPath(options, value);

  return {
    path,
    items: value.map((_, index) => path[index]),
  };
}
```

## 渲染结构建议

```tsx
function CascadePicker<TData = unknown>(props: CascadePickerProps<TData>) {
  const pickerValue = props.value ? normalizeCascadeValue(props.options, props.value) : undefined;
  const defaultPickerValue = normalizeCascadeValue(props.options, props.defaultValue ?? []);
  const draftPickerValue = pickerValue ?? defaultPickerValue;
  const columns = optionsToColumns(props.options, draftPickerValue);

  return (
    <Picker<CascadePickerOption<TData>>
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      columns={columns}
      value={pickerValue}
      defaultValue={defaultPickerValue}
      onChange={(nextPickerValue, pickerParams) => {
        const nextValue = completePathFromColumn(
          props.options,
          draftPickerValue,
          pickerParams.columnIndex,
          pickerParams.value
        );
        props.onChange?.(nextValue, buildCascadeChangeParams(props.options, nextValue, pickerParams));
      }}
      onOk={(nextPickerValue) => {
        const nextValue = normalizeCascadeValue(props.options, nextPickerValue);
        props.onOk?.(nextValue, buildCascadeOkParams(props.options, nextValue));
      }}
      onCancel={props.onCancel}
      titleText={props.titleText}
      title={props.title}
      cancelText={props.cancelText}
      cancel={props.cancel}
      okText={props.okText}
      ok={props.ok}
      loading={props.loading}
      loadingIndicatorText={props.loadingIndicatorText}
      loadingIndicator={props.loadingIndicator}
      emptyText={props.emptyText}
      empty={props.empty}
      disabled={props.disabled}
      readOnly={props.readOnly}
      okDisabled={props.okDisabled}
      itemHeight={props.itemHeight}
      visibleItemCount={props.visibleItemCount}
      renderLabel={props.renderLabel}
      styles={props.styles}
    >
      {props.children}
    </Picker>
  );
}
```

## 不包含的能力

以下能力不放入 `CascadePicker`：

- 异步加载子节点。
- 接口错误、重试按钮、错误提示语义。
- 业务筛选、权限过滤、地区编码转换。
- 表单 label、placeholder、错误提示、回显拼接。
- 独立弹层、滚轮或确认取消实现。

如果业务需要异步级联，应在外部 controller 中加载数据，再把最终 `options/loading/empty` 传给 `CascadePicker`。
