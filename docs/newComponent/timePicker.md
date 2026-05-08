# TimePicker 组件设计

## 设计目标

`TimePicker` 基于 `Picker` 构建时间选择能力，只负责把时间值转换为 `Picker` 的多列数据和多列值。

`TimePicker` 不重复实现弹层、滚轮、确认、取消、空状态、加载态、触发区和样式 slot，这些能力全部来自 `Picker`。

## 与 Picker 的关系

`TimePicker` 是 `Picker` 的领域封装层：

- 对外接收时间语义的 `value/defaultValue/onChange/onOk`。
- 内部生成小时、分钟、秒等 `columns`。
- 内部把 `Date` 转换为 `PickerValue[]`。
- 内部把 `PickerValue[]` 还原为 `Date`。
- 内部把 `formatLabel/renderLabel` 转换为 Picker 选项的 `labelText/renderLabel`。
- 透传 `open/defaultOpen/onOpenChange/onCancel` 等弹层通用属性。
- 透传 `titleText/title`、`cancelText/cancel`、`okText/ok`、`emptyText/empty`、`disabled/readOnly/okDisabled`、`children`、`styles` 等 Picker 展示属性。

`TimePicker` 不改变 `Picker` 的事件顺序，不重新定义取消、确认和打开关闭语义。

## Props 设计

```ts
type TimePickerPrecision = 'hour' | 'minute' | 'second';

type TimePickerColumnType = 'hour' | 'minute' | 'second';

interface TimePickerLabelParams {
  type: TimePickerColumnType;
  value: number;
  date: Date;
}

interface TimePickerValueParams {
  hours: number;
  minutes: number;
  seconds: number;
  date: Date;
}

interface TimePickerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: PickerOpenChangeParams
  ) => void;

  value?: Date;
  defaultValue?: Date;
  onChange?: (
    value: Date,
    params: TimePickerValueParams
  ) => void;
  onOk?: (
    value: Date,
    params: TimePickerValueParams
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;

  precision?: TimePickerPrecision;
  minuteStep?: number;
  secondStep?: number;
  min?: Date;
  max?: Date;
  formatLabel?: (
    value: number,
    params: TimePickerLabelParams
  ) => string;
  renderLabel?: (params: TimePickerLabelParams) => React.ReactNode;

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
  styles?: PickerStyles;
}
```

## 值类型规则

`TimePicker` 推荐使用 `Date` 作为对外 `value` 类型。

原因：

- `Date` 可以直接比较，适合处理 `min/max`。
- `Date` 可以保留调用方传入的日期部分，避免纯时间值缺少锚点。
- `Date` 不绑定展示格式，展示文案由组件列生成，接口格式由业务层转换。
- `string` 存在格式、解析、时区和非法值问题，不适合作为组件核心值。

`TimePicker` 只修改 `Date` 的时、分、秒；年、月、日来自当前值、默认值或内部基准日期。

## 内部值转换

`TimePicker` 内部使用 `PickerValue[]` 驱动 `Picker`：

| 精度 | Picker 值 |
| --- | --- |
| `hour` | `[hours]` |
| `minute` | `[hours, minutes]` |
| `second` | `[hours, minutes, seconds]` |

示例：

```ts
function dateToPickerValue(date: Date, precision: TimePickerPrecision): PickerValue[] {
  const values: PickerValue[] = [date.getHours()];

  if (precision === 'minute' || precision === 'second') {
    values.push(date.getMinutes());
  }

  if (precision === 'second') {
    values.push(date.getSeconds());
  }

  return values;
}
```

还原时保留原日期部分：

```ts
function pickerValueToDate(
  pickerValue: PickerValue[],
  baseDate: Date,
  precision: TimePickerPrecision
): Date {
  const nextDate = new Date(baseDate);
  const hours = Number(pickerValue[0] ?? 0);
  const minutes = precision === 'hour' ? 0 : Number(pickerValue[1] ?? 0);
  const seconds = precision === 'second' ? Number(pickerValue[2] ?? 0) : 0;

  nextDate.setHours(hours, minutes, seconds, 0);
  return nextDate;
}
```

## 列生成规则

`TimePicker` 根据精度生成对应列：

- `hour` 列：`0` 到 `23`。
- `minute` 列：`0` 到 `59`，按 `minuteStep` 递增。
- `second` 列：`0` 到 `59`，按 `secondStep` 递增。
- `minuteStep/secondStep` 只影响选项生成，不改变 Picker 滚轮行为。
- `labelText` 默认由 `TimePicker` 生成，例如 `00时`、`05分`、`09秒`。
- 传入 `formatLabel` 时，`labelText` 使用 `formatLabel` 的返回值。
- 原始标签参数放入 `data`，供 `renderLabel` 和回调 params 使用。

```ts
interface TimePickerItemData {
  type: TimePickerColumnType;
  value: number;
  date: Date;
}
```

## 选项标签规则

`TimePicker` 支持两层选项展示自定义：

- `formatLabel` 用于自定义文本格式，返回值写入 Picker 选项的 `labelText`。
- `renderLabel` 用于自定义选项节点，内部转换为 Picker 的 `renderLabel`。
- 同时传入 `renderLabel` 和 `formatLabel` 时，展示以 `renderLabel` 为准，`formatLabel` 仍可作为文本兜底。
- 推荐普通格式化优先使用 `formatLabel`，复杂节点再使用 `renderLabel`。
- `formatLabel/renderLabel` 只改变选项展示，不改变 `value`、`Date` 转换和事件顺序。

```tsx
<TimePicker
  formatLabel={(value, params) => {
    if (params.type === 'hour') {
      return `${String(value).padStart(2, '0')} h`;
    }
    return String(value).padStart(2, '0');
  }}
/>
```

## 边界限制规则

`min/max` 在 `TimePicker` 层处理，转换成 Picker 选项的 `disabled`：

- 以候选时间和当前基准日期组合成完整 `Date` 后比较。
- 小于 `min` 或大于 `max` 的选项标记为 `disabled`。
- 禁用项如何展示、是否可滚动命中，由 `Picker` 的禁用项规则处理。
- `TimePicker` 不在 `Picker` 内部增加业务校验。

当 `value` 不存在时，内部基准日期建议按以下顺序取得：

1. `defaultValue`
2. `min`
3. 当前本地时间

## 事件映射

`TimePicker` 保持 `Picker` 的事件顺序，只转换回调值：

| Picker 事件 | TimePicker 行为 |
| --- | --- |
| `onChange(pickerValue)` | 转成 `Date` 后调用 `onChange(date, params)` |
| `onOk(pickerValue)` | 转成 `Date` 后调用 `onOk(date, params)` |
| `onCancel(params)` | 原样透传 `onCancel(params)` |
| `onOpenChange(open, params)` | 原样透传 `onOpenChange(open, params)` |

`TimePickerValueParams` 来自转换后的时间值，不直接暴露 Picker 的列选项作为主要语义。

```ts
function buildTimeParams(date: Date): TimePickerValueParams {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    date,
  };
}
```

## 渲染结构建议

```tsx
function TimePicker(props: TimePickerProps) {
  const precision = props.precision ?? 'minute';
  const baseDate = getBaseDate(props);
  const pickerValue = props.value ? dateToPickerValue(props.value, precision) : undefined;
  const defaultPickerValue = props.defaultValue ? dateToPickerValue(props.defaultValue, precision) : dateToPickerValue(baseDate, precision);
  const columns = buildTimeColumns(props, baseDate, precision);

  return (
    <Picker<TimePickerItemData>
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      columns={columns}
      value={pickerValue}
      defaultValue={defaultPickerValue}
      onChange={(nextPickerValue) => {
        const nextDate = pickerValueToDate(nextPickerValue, baseDate, precision);
        props.onChange?.(nextDate, buildTimeParams(nextDate));
      }}
      onOk={(nextPickerValue) => {
        const nextDate = pickerValueToDate(nextPickerValue, baseDate, precision);
        props.onOk?.(nextDate, buildTimeParams(nextDate));
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
      renderLabel={
        props.renderLabel
          ? item => (item.data ? props.renderLabel?.(item.data) : item.labelText)
          : undefined
      }
      styles={props.styles}
    >
      {props.children}
    </Picker>
  );
}
```

## 不包含的能力

以下能力不放入 `TimePicker`：

- 接口字符串格式化和解析。
- 业务时区转换。
- 工作时间、营业时间、预约规则等业务校验。
- 表单 label、placeholder、错误提示、回显拼接。
- 独立弹层、滚轮或确认取消实现。
