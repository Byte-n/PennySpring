# DateTimePicker 组件设计

## 设计目标

`DateTimePicker` 基于 `Picker` 构建日期时间选择能力，只负责把日期时间值转换为 `Picker` 的多列数据和多列值。

`DateTimePicker` 不重复实现弹层、滚轮、确认、取消、空状态、加载态、触发区和样式 slot，这些能力全部来自 `Picker`。

## 与 Picker 的关系

`DateTimePicker` 是 `Picker` 的日期时间封装层：

- 对外接收 `Date` 类型的 `value/defaultValue/onChange/onOk`。
- 内部生成年、月、日、时、分、秒列。
- 内部根据年月动态生成日期列。
- 内部把 `Date` 转换为 `PickerValue[]`。
- 内部把 `PickerValue[]` 还原为 `Date`。
- 内部把 `formatLabel/renderLabel` 转换为 Picker 选项的 `labelText/renderLabel`。
- 透传 `open/defaultOpen/onOpenChange/onCancel` 等弹层通用属性。
- 透传 `titleText/title`、`cancelText/cancel`、`okText/ok`、`emptyText/empty`、`disabled/readOnly/okDisabled`、`children`、`styles` 等 Picker 展示属性。

`DateTimePicker` 不改变 `Picker` 的事件顺序，不重新定义取消、确认和打开关闭语义。

## Props 设计

```ts
type DateTimePickerPrecision = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

type DateTimePickerColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

interface DateTimePickerLabelParams {
  type: DateTimePickerColumnType;
  value: number;
  date: Date;
}

interface DateTimePickerValueParams {
  date: Date;
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DateTimePickerProps {
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
    params: DateTimePickerValueParams
  ) => void;
  onOk?: (
    value: Date,
    params: DateTimePickerValueParams
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;

  precision?: DateTimePickerPrecision;
  min?: Date;
  max?: Date;
  minuteStep?: number;
  secondStep?: number;
  formatLabel?: (
    value: number,
    params: DateTimePickerLabelParams
  ) => string;
  renderLabel?: (params: DateTimePickerLabelParams) => React.ReactNode;

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

`DateTimePicker` 使用 `Date` 作为对外 `value` 类型。

原因：

- 日期时间天然是一个完整时间点，`Date` 比 `string` 更适合作为组件状态。
- `Date` 可以直接进行 `min/max` 比较。
- `Date` 避免把展示格式、接口格式、国际化格式混进组件核心值。
- `string` 的格式、解析和时区含义应由业务层或表单层处理。

`DateTimePicker` 内部展示不使用 `Date.toString()`，而是拆成多个 Picker 列展示。

## 精度和列规则

`precision` 决定展示到哪个最小单位：

| 精度 | 展示列 |
| --- | --- |
| `year` | 年 |
| `month` | 年、月 |
| `day` | 年、月、日 |
| `hour` | 年、月、日、时 |
| `minute` | 年、月、日、时、分 |
| `second` | 年、月、日、时、分、秒 |

默认建议使用 `minute`。

每列的 `value` 使用数字：

- 年：真实年份，例如 `2026`。
- 月：`1` 到 `12`，不使用 JS `Date` 的零基月份。
- 日：`1` 到当前年月最大天数。
- 时：`0` 到 `23`。
- 分：`0` 到 `59`，按 `minuteStep` 递增。
- 秒：`0` 到 `59`，按 `secondStep` 递增。
- `labelText` 默认由 `DateTimePicker` 生成，例如 `2026年`、`05月`、`08日`、`14时`、`30分`。
- 传入 `formatLabel` 时，`labelText` 使用 `formatLabel` 的返回值。
- 原始标签参数放入 `data`，供 `renderLabel` 和回调 params 使用。

```ts
interface DateTimePickerItemData {
  type: DateTimePickerColumnType;
  value: number;
  date: Date;
}
```

## 选项标签规则

`DateTimePicker` 支持两层选项展示自定义：

- `formatLabel` 用于自定义文本格式，返回值写入 Picker 选项的 `labelText`。
- `renderLabel` 用于自定义选项节点，内部转换为 Picker 的 `renderLabel`。
- 同时传入 `renderLabel` 和 `formatLabel` 时，展示以 `renderLabel` 为准，`formatLabel` 仍可作为文本兜底。
- 推荐普通格式化优先使用 `formatLabel`，复杂节点再使用 `renderLabel`。
- `formatLabel/renderLabel` 只改变选项展示，不改变 `value`、`Date` 转换和事件顺序。

```tsx
<DateTimePicker
  formatLabel={(value, params) => {
    if (params.type === 'month' || params.type === 'day') {
      return String(value).padStart(2, '0');
    }
    return String(value);
  }}
/>
```

## 内部值转换

`DateTimePicker` 内部使用 `PickerValue[]` 驱动 `Picker`：

```ts
function dateToPickerValue(
  date: Date,
  precision: DateTimePickerPrecision
): PickerValue[] {
  const values: PickerValue[] = [
    date.getFullYear(),
    date.getMonth() + 1,
  ];

  if (precision === 'day' || precision === 'hour' || precision === 'minute' || precision === 'second') {
    values.push(date.getDate());
  }

  if (precision === 'hour' || precision === 'minute' || precision === 'second') {
    values.push(date.getHours());
  }

  if (precision === 'minute' || precision === 'second') {
    values.push(date.getMinutes());
  }

  if (precision === 'second') {
    values.push(date.getSeconds());
  }

  return values.slice(0, getColumnTypes(precision).length);
}
```

还原为 `Date` 时，月需要减一：

```ts
function pickerValueToDate(
  pickerValue: PickerValue[],
  precision: DateTimePickerPrecision,
  baseDate: Date
): Date {
  const columnTypes = getColumnTypes(precision);
  const values = Object.fromEntries(
    columnTypes.map((type, index) => [type, Number(pickerValue[index])])
  );

  const year = values.year ?? baseDate.getFullYear();
  const month = values.month ?? baseDate.getMonth() + 1;
  const maxDay = getDaysInMonth(year, month);
  const day = Math.min(values.day ?? baseDate.getDate(), maxDay);
  const hours = values.hour ?? 0;
  const minutes = values.minute ?? 0;
  const seconds = values.second ?? 0;

  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}
```

## 动态日期列规则

日期列由当前草稿年月决定：

- 年月变化后，日列需要按新年月重新生成。
- 如果原草稿日超过新年月最大天数，需要在 `DateTimePicker` 层修正为当月最后一天。
- 修正后的值再传给 `Picker`，不要让 `Picker` 理解日期规则。
- 闰年、大小月只在 `DateTimePicker` 的列生成函数中处理。

示例：

```ts
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
```

## 年份范围规则

年份列由 `min/max` 或默认范围生成：

- 存在 `min` 时，起始年份使用 `min.getFullYear()`。
- 存在 `max` 时，结束年份使用 `max.getFullYear()`。
- 不存在 `min/max` 时，可使用组件约定的默认年份范围。
- 默认年份范围只影响可选项数量，不代表业务限制。

## 边界限制规则

`min/max` 在 `DateTimePicker` 层处理，转换成 Picker 选项的 `disabled`：

- 针对每个候选项，组合当前草稿上下文生成候选 `Date`。
- 小于 `min` 或大于 `max` 的候选项标记为 `disabled`。
- 跨列联动限制只影响 `columns` 的生成结果。
- 禁用项的视觉和交互遵循 `Picker` 的通用禁用项规则。

`DateTimePicker` 不向 `Picker` 注入日期校验逻辑。

## 事件映射

`DateTimePicker` 保持 `Picker` 的事件顺序，只转换回调值：

| Picker 事件 | DateTimePicker 行为 |
| --- | --- |
| `onChange(pickerValue)` | 根据当前草稿列转成 `Date` 后调用 `onChange(date, params)` |
| `onOk(pickerValue)` | 根据当前草稿列转成 `Date` 后调用 `onOk(date, params)` |
| `onCancel(params)` | 原样透传 `onCancel(params)` |
| `onOpenChange(open, params)` | 原样透传 `onOpenChange(open, params)` |

```ts
function buildDateTimeParams(date: Date): DateTimePickerValueParams {
  return {
    date,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}
```

## 渲染结构建议

```tsx
function DateTimePicker(props: DateTimePickerProps) {
  const precision = props.precision ?? 'minute';
  const baseDate = getBaseDate(props);
  const pickerValue = props.value ? dateToPickerValue(props.value, precision) : undefined;
  const defaultPickerValue = props.defaultValue ? dateToPickerValue(props.defaultValue, precision) : dateToPickerValue(baseDate, precision);
  const draftPickerValue = pickerValue ?? defaultPickerValue;
  const columns = buildDateTimeColumns(props, draftPickerValue, precision);

  return (
    <Picker<DateTimePickerItemData>
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      columns={columns}
      value={pickerValue}
      defaultValue={defaultPickerValue}
      onChange={(nextPickerValue) => {
        const nextDate = pickerValueToDate(nextPickerValue, precision, baseDate);
        props.onChange?.(nextDate, buildDateTimeParams(nextDate));
      }}
      onOk={(nextPickerValue) => {
        const nextDate = pickerValueToDate(nextPickerValue, precision, baseDate);
        props.onOk?.(nextDate, buildDateTimeParams(nextDate));
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

以下能力不放入 `DateTimePicker`：

- 接口日期字符串格式化和解析。
- 业务时区转换和服务端时间校准。
- 节假日、工作日、预约规则等业务校验。
- 表单 label、placeholder、错误提示、回显拼接。
- 独立弹层、滚轮或确认取消实现。
