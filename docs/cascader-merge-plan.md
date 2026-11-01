# Cascader 合并进 ListPicker / Picker 重构方案

## 1. 结论

- 删除独立组件 `Cascader`、`CascadePicker`。
- 以子组件形式提供：
  - `ListPicker.Cascader`：承接 `Cascader` 的「层级 Tab + 列表」交互，触发器统一改为 `PickerTrigger`（与 `ListPicker` 一致）。
  - `Picker.Cascader`：承接 `CascadePicker` 的「分类 Tab + 多列滚轮」交互，底层继续复用 `Picker`。
- 类型按宿主组件前缀重命名：`ListPickerCascader*`、`PickerCascader*`。
- 旧类型与旧导入路径不保留兼容别名，一次性迁移所有消费者。

---

## 2. 现状盘点

| 维度      | Cascader                                             | CascadePicker                                     |
| --------- | ---------------------------------------------------- | ------------------------------------------------- |
| 交互载体  | Tabs（层级）+ FlatList（当前层选项）                 | Tabs（业务分类）+ WheelGroup 多列                 |
| 触发器    | 自建 `Pressable` + `Row`                             | 复用 `Picker`（`PickerTrigger` / `DisplayInput`） |
| 浮层      | `Popup.FloatingPanel`（position/height 可配）        | 复用 `Picker` 的 `PickerPopup`                    |
| 值模型    | `Array<string \| number>`（路径）                    | `Record<TTabKey, Array<string \| number>>`        |
| 打开回调  | `(open, { reason })`                                 | `(open, { reason })`（透传 `Picker`）             |
| 样式入口  | `styles.trigger / tabs / option / optionLabel / ...` | `styles.trigger / input / popup / panel / tabs`   |
| 消费者    | `AssetManageScreen`                                  | 仅预览与测试                                      |
| 独立 View | `Cascader.View`                                      | 无                                                |

主要问题：

1. 两个组件与 `Picker`、`ListPicker` 的触发器、浮层、状态模型高度重叠，单独导出会形成第二套语义。
2. `Cascader` 自带触发器样式，与 `ListPicker` 的 `DisplayInput` 触发器视觉不一致（边框、下划线、清除、校验态缺失）。
3. `styles.tabs` 直接复用底层 `TabsStyles`、`styles.popup/panel` 直接复用 `Picker` 样式类型，违反组件规范「styles 类型由当前组件对外语义定义」。
4. `Cascader.View` 无业务消费者，仅为测试与预览保留。

---

## 3. 目标 API

### 3.1 `ListPicker.Cascader`

#### 类型

```ts
export type ListPickerCascaderValue = ListPickerValue[];

export interface ListPickerCascaderOption<TData = unknown> {
  value: ListPickerValue;
  labelText?: string;
  label?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  children?: Array<ListPickerCascaderOption<TData>>;
  data?: TData;
}

export interface ListPickerCascaderSelectParams<TData = unknown> {
  reason: 'select';
  option: ListPickerCascaderOption<TData>;
  value: ListPickerValue;
  level: number;
  optionIndex: number;
  path: Array<ListPickerCascaderOption<TData>>;
  items: Array<ListPickerCascaderOption<TData> | undefined>;
  isLeaf: boolean;
}

export interface ListPickerCascaderRemoveParams<TData = unknown> {
  reason: 'remove';
  option: ListPickerCascaderOption<TData>;
  value: ListPickerValue;
  level: number;
  optionIndex: number;
  path: Array<ListPickerCascaderOption<TData>>;
  items: Array<ListPickerCascaderOption<TData> | undefined>;
  isLeaf: boolean;
}

export interface ListPickerCascaderClearParams {
  reason: 'clear';
  path: [];
  items: [];
}

export type ListPickerCascaderChangeParams<TData = unknown> =
  | ListPickerCascaderSelectParams<TData>
  | ListPickerCascaderRemoveParams<TData>
  | ListPickerCascaderClearParams;

export type ListPickerCascaderOpenChangeReason =
  'trigger' | 'select' | 'cancel';

export interface ListPickerCascaderOpenChangeParams {
  reason: ListPickerCascaderOpenChangeReason;
}
```

#### Props

```ts
export interface ListPickerCascaderProps<TData = unknown> {
  size?: ComponentSize;
  options: Array<ListPickerCascaderOption<TData>>;

  value?: ListPickerCascaderValue;
  defaultValue?: ListPickerCascaderValue;
  onChange?: (
    value: ListPickerCascaderValue,
    params: ListPickerCascaderChangeParams<TData>,
  ) => void;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: ListPickerCascaderOpenChangeParams,
  ) => void;
  onCancel?: () => void;

  activeLevel?: number;
  defaultActiveLevel?: number;
  onActiveLevelChange?: (level: number) => void;
  closeOnSelectLeaf?: boolean;

  allowClear?: boolean;
  onClear?: () => void;

  status?: ListPickerStatus;
  labelText?: string;
  label?: ReactNode;

  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  empty?: ReactNode;

  displayMode?: ListPickerDisplayMode;
  displayInputProps?: PickerDisplayInputProps;
  tagProps?: TagDisplayProps;

  texts?: ListPickerCascaderTexts;
  renderOptionLabel?: (
    option: ListPickerCascaderOption<TData>,
    level: number,
    optionIndex: number,
  ) => ReactNode;

  popupProps?: ListPickerCascaderPopupConfig;
  style?: StyleProp<ViewStyle>;
  styles?: ListPickerCascaderStyles;
}

export interface ListPickerCascaderTexts {
  headerText?: string;
  closeText?: string;
  tabPlaceholderText?: string;
  emptyText?: string;
  loadingText?: string;
}
```

#### Styles（自持语义，不直接复用 `TabsStyles` / `PickerStyles`）

```ts
export interface ListPickerCascaderStyles {
  /** 触发器槽位，root 对应 DisplayInput 根节点。 */
  input?: TriggerFieldStyles;
  /** 浮层内容容器。 */
  popup?: StyleProp<ViewStyle>;
  /** 层级 Tab。 */
  tabs?: ListPickerCascaderTabsStyles;
  /** 选项容器。 */
  option?: StyleProp<ViewStyle>;
  /** 选项主文本。 */
  optionLabel?: StyleProp<TextStyle>;
  /** 空态。 */
  empty?: StyleProp<ViewStyle>;
  /** 加载态。 */
  loading?: StyleProp<ViewStyle>;
}

export interface ListPickerCascaderTabsStyles {
  tabList?: StyleProp<ViewStyle>;
  tab?: StyleProp<ViewStyle>;
  tabActive?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelActive?: StyleProp<TextStyle>;
}
```

### 3.2 `Picker.Cascader`

承接 `CascadePicker`，行为不变，仅调整命名与宿主。

#### 类型

```ts
export type PickerCascaderTabKey = string | number;

export type PickerCascaderValue<TTabKey extends PickerCascaderTabKey = string> =
  Record<TTabKey, PickerValue[]>;

export interface PickerCascaderOption<TData = unknown> {
  labelText?: string;
  label?: ReactNode;
  value: PickerValue;
  disabled?: boolean;
  children?: Array<PickerCascaderOption<TData>>;
  data?: TData;
}

export interface PickerCascaderTab<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabKey: TTabKey;
  labelText?: string;
  label?: ReactNode;
  options: Array<PickerCascaderOption<TData>>;
  disabled?: boolean;
}

export interface PickerCascaderChangeParams<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabKey: TTabKey;
  tabIndex: number;
  tab: PickerCascaderTab<TData, TTabKey>;
  item: PickerCascaderOption<TData>;
  value: PickerValue;
  columnIndex: number;
  itemIndex: number;
  path: Array<PickerCascaderOption<TData>>;
  items: Array<PickerCascaderOption<TData> | undefined>;
}

export interface PickerCascaderOkParams<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabKey: TTabKey;
  tabIndex: number;
  tab: PickerCascaderTab<TData, TTabKey>;
  path: Array<PickerCascaderOption<TData>>;
  items: Array<PickerCascaderOption<TData> | undefined>;
}
```

#### Props

```ts
export interface PickerCascaderProps<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabs: Array<PickerCascaderTab<TData, TTabKey>>;

  value?: PickerCascaderValue<TTabKey>;
  defaultValue?: PickerCascaderValue<TTabKey>;
  onChange?: (
    value: PickerCascaderValue<TTabKey>,
    params: PickerCascaderChangeParams<TData, TTabKey>,
  ) => void;
  onOk?: (
    value: PickerCascaderValue<TTabKey>,
    params: PickerCascaderOkParams<TData, TTabKey>,
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;
  okDisabled?: boolean;

  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  loading?: boolean;
  loadingIndicatorText?: string;
  loadingIndicator?: ReactNode;
  emptyText?: string;
  empty?: ReactNode;

  labelText?: string;
  label?: ReactNode;
  displayInputProps?: PickerDisplayInputProps;
  readonly?: boolean;
  disabled?: boolean;
  size?: ComponentSize; // 新增：与 Picker 对齐
  renderLabel?: (option: PickerCascaderOption<TData>) => ReactNode;

  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PickerCascaderStyles;
}
```

#### Styles（自持语义）

```ts
export interface PickerCascaderStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: TriggerFieldStyles;
  popup?: PickerCascaderPopupStyles;
  panel?: PickerCascaderPanelStyles;
  tabs?: PickerCascaderTabsStyles;
}

export interface PickerCascaderPopupStyles {
  root?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  handle?: StyleProp<ViewStyle>;
  handleIndicator?: StyleProp<ViewStyle>;
}

export interface PickerCascaderPanelStyles {
  root?: StyleProp<ViewStyle>;
  header?: PickerCascaderHeaderStyles;
  body?: PickerCascaderBodyStyles;
  safeArea?: StyleProp<ViewStyle>;
}

export interface PickerCascaderHeaderStyles {
  cancelButton?: StyleProp<ViewStyle>;
  cancelText?: StyleProp<TextStyle>;
  titleContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  okButton?: StyleProp<ViewStyle>;
  okText?: StyleProp<TextStyle>;
}

export interface PickerCascaderBodyStyles {
  root?: StyleProp<ViewStyle>;
  view?: PickerCascaderViewStyles;
  loading?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerCascaderViewStyles {
  column?: PickerCascaderColumnStyles;
  indicator?: StyleProp<ViewStyle>;
}

export interface PickerCascaderColumnStyles {
  root?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerCascaderTabsStyles {
  tabList?: StyleProp<ViewStyle>;
  tab?: StyleProp<ViewStyle>;
  tabActive?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelActive?: StyleProp<TextStyle>;
}
```

---

## 4. 行为规范

### 4.1 `ListPicker.Cascader`

1. **值归一化**：沿 `options` 解析 `value` 路径，遇到非法层级立即截断；`value` 与 `path` 始终同长。
2. **受控/非受控**：`value/defaultValue/onChange`、`open/defaultOpen/onOpenChange`、`activeLevel/defaultActiveLevel/onActiveLevelChange` 均使用 `useControllableValue`。
3. **层级 Tab 数量**：`getVisibleLevelCount(path)`。已选叶子时为 `path.length`；尚未选到叶子时为 `path.length + 1`。
4. **选项点击**：
   - 非交互态（`disabled || readonly || loading`）或选项 `disabled` 时不响应。
   - `nextValue = value.slice(0, level) + option.value`。
   - 始终触发 `onChange(nextValue, { reason: 'select', ... })`。
   - 非叶子：切换到 `level + 1`，浮层保持打开。
   - 叶子且 `closeOnSelectLeaf !== false`：关闭浮层，`onOpenChange(false, { reason: 'select' })`。
5. **Tag 移除**：移除第 `level` 层 => `nextValue = value.slice(0, level)`；触发 `onChange(nextValue, { reason: 'remove', level, ... })`；不关闭浮层。
6. **清除**：`allowClear` 且已有值时展示清除按钮；清除后 `value=[]`，依次触发 `onChange([], { reason: 'clear' })`、`onClear()`。
7. **关闭原因**：
   - 点击触发器打开：`'trigger'`。
   - 选择叶子自动关闭：`'select'`。
   - 点击遮罩 / Header 关闭按钮：先 `onCancel?.()`，再 `onOpenChange(false, { reason: 'cancel' })`。
8. **触发器展示**：
   - `displayMode='text'`：`path` 的 `labelText` 用 `' / '` 连接。
   - `displayMode='tag'`：每层一个可移除 Tag；`tagProps` 透传 `TagDisplayProps`。
   - `overflow`：`displayMode='tag'` 时为 `visible`，否则 `hidden`。
9. **空态 / 加载态**：`loading` 优先；否则当前层无选项时渲染 `empty ?? texts.emptyText`。
10. **自定义选项标签**：`renderOptionLabel` 返回值经 `renderTextNode` 处理；字符串/数字套 `Text`，节点原样渲染。
11. **移除能力**：不再支持 `children` 自定义触发器内容、`Cascader.View`、`position/panelValue/minHeight/maxHeight` 等顶层 Popup props；统一通过 `popupProps` 透传 `Popup.FloatingPanel` 配置。

### 4.2 `Picker.Cascader`

保持 `CascadePicker` 现有行为：

1. 每个 tab 维护独立路径；`value` 归一化为 `Record<TTabKey, PickerValue[]>`，非法层级截断。
2. 当前 tab 的路径展开为多列 `PickerColumn`；切换 tab 只切换当前展示，不修改其他 tab 值。
3. 列变更时补齐后续层级（优先取每层第一个非禁用项），并同步 `draftValue` 与 `mainValue`。
4. `onChange` 在列滚动选择时触发；`onOk` 在确认时触发并携带完整 `Record` 与当前 tab 详情。
5. `renderLabel` 接收原始树节点（含 `data`），而非转换后的 `PickerColumnItemData`。
6. 空 tab / 空选项：Tabs 中禁用；当前 tab 无选项时展示 `empty ?? emptyText`。
7. `readonly` 阻止打开；`disabled` 透传 `Picker`。

---

## 5. 实现结构

### 5.1 目录变更

```text
packages/pennyspring-ui/src/
├── Picker/
│   ├── PickerCore.tsx            # 新增：现 Picker.tsx 主体，导出 PickerCore
│   ├── Picker.tsx                # 改为 Object.assign(PickerCore, { Cascader })
│   ├── Cascader/
│   │   ├── Cascader.tsx          # 迁移自 src/CascadePicker/CascadePicker.tsx
│   │   ├── types.ts
│   │   ├── utils.ts              # 树路径 / 列展开 / 路径补齐
│   │   └── index.ts
│   └── index.ts                  # 新增 PickerCascader* 类型导出
├── ListPicker/
│   ├── ListPicker.tsx            # 导出 ListPickerRoot，移除 ListPicker 常量
│   ├── Cascader/
│   │   ├── Cascader.tsx          # 触发器 + 浮层 + 层级 Tabs + 列表
│   │   ├── CascaderPopup.tsx     # 浮层内容（header/Tabs/list/empty）
│   │   ├── types.ts
│   │   ├── utils.ts              # 路径解析 / 可见层级 / 变更参数
│   │   └── index.ts
│   ├── style/index.ts            # 新增 cascader 样式槽
│   └── index.ts                  # Object.assign + 类型导出
```

### 5.2 避免循环依赖

`Picker.Cascader` 需要复用 `Picker` 的内部实现，而 `Picker` 需要挂载 `Cascader`：

- 抽出 `Picker/PickerCore.tsx`，`Picker.tsx` 只负责组合。
- `Picker/Cascader/Cascader.tsx` 从 `../PickerCore` 导入，不导入 `../Picker`。

`ListPicker.Cascader` 不直接复用 `ListPickerRoot`，而是复用：

- `_internal/PickerTrigger`（触发器）
- `ListPicker/style` 的 `useListPickerStyles`（视觉）
- `Popup.FloatingPanel`（浮层）

`ListPicker.tsx` 不再导出 `ListPicker` 常量，由 `index.ts` 组合，避免 `ListPicker.tsx -> Cascader -> ListPicker` 的环。

### 5.3 `ListPicker.Cascader` 渲染结构

```text
<>
  <PickerTrigger ... valueText / TagValueDisplay />
  <Popup.FloatingPanel
    bodyScrollable={false}
    footer={null}
    header={headerNode}
    onCancel={handleMaskCancel}
    ...
  >
    <Column popupRoot>
      <Column popupContent cascaderPanel>
        <Tabs block layout="scroll" ... />
        {loading ? loading : currentOptions.length ? <FlatList /> : empty}
      </Column>
    </Column>
  </Popup.FloatingPanel>
</>
```

### 5.4 `listPickerCascader` 样式槽

在 `ListPicker/style/index.ts` 内按 `size` 派生：

| 槽位                                                             | 说明                                          |
| ---------------------------------------------------------------- | --------------------------------------------- |
| `cascaderPanel`                                                  | `flex: 1` + 层级间距                          |
| `cascaderList` / `cascaderListContent`                           | 列表与行间距                                  |
| `cascaderOption`                                                 | 行容器，含 pressed / selected / disabled 三态 |
| `cascaderOptionRow` / `cascaderMarker` / `cascaderOptionContent` | 行内结构                                      |
| `cascaderEmpty` / `cascaderLoading`                              | 空态与加载态                                  |
| `cascaderFloatingPanelContent`                                   | 浮层内边距                                    |

约束：

- 所有垂直 padding 使用同语义水平 token `/ 2`。
- `minHeight` 按 `small/normal/large` 映射 `controlHeightSM / controlHeight / controlHeightLG`。
- 颜色只使用 `AliasToken`，不出现字面量。

---

## 6. 迁移与删除清单

### 6.1 删除

- `packages/pennyspring-ui/src/Cascader/`
- `packages/pennyspring-ui/src/CascadePicker/`
- `packages/pennyspring-ui/__tests__/Cascader.test.tsx`
- `packages/pennyspring-ui/__tests__/CascadePicker.test.tsx`
- `packages/pennyspring-ui/examples/previews/data-entry/cascader/`
- `packages/pennyspring-ui/examples/previews/data-entry/cascade-picker/`

### 6.2 修改

- `packages/pennyspring-ui/src/index.ts`
  - 移除 `Cascader`、`CascadePicker` 及其类型导出。
  - 在 `ListPicker` / `Picker` 导出块增加 `ListPickerCascader*`、`PickerCascader*`。
- `src/screens/assetManage/AssetManageScreen.tsx`
  - `Cascader` → `ListPicker.Cascader`
  - `CascaderOption` → `ListPickerCascaderOption`
  - `CascaderValue` → `ListPickerCascaderValue`
- `packages/pennyspring-ui/examples/previews/registry.tsx`
  - 预览 id：`cascader` → `list-picker-cascader`，`cascade-picker` → `picker-cascader`。
  - 标题：`ListPicker.Cascader`、`Picker.Cascader`。
- `.claude/skills/component-composer/references/component-catalog.md`
  - 删除独立条目，改为在 `ListPicker`、`Picker` 条目中描述子模式。
- `.claude/skills/component-composer/SKILL.md`
- `.codex/skills/component-composer/SKILL.md`
- `.codex/skills/component-composer/references/component-catalog.md`

### 6.3 新增预览与测试

- `examples/previews/data-entry/list-picker-cascader/`（demos：basic、size、state、trigger、tag）
- `examples/previews/data-entry/picker-cascader/`（demos：basic、controlled、state）
- `__tests__/ListPickerCascader.test.tsx`
- `__tests__/PickerCascader.test.tsx`

---

## 7. 测试计划（TDD）

### 7.1 `ListPickerCascader.test.tsx`

迁移旧 `Cascader` 用例并补充 ListPicker 能力：

1. 渲染层级 Tab 与首层选项。
2. 选中父节点后切换到下一层，`onChange` 携带完整路径。
3. 选中叶子节点后默认关闭浮层，`onOpenChange(false, { reason: 'select' })`。
4. `closeOnSelectLeaf={false}` 时保持打开。
5. `displayMode="tag"` 时渲染路径 Tag；移除第 N 个 Tag 返回截断路径并携带 `reason: 'remove'`。
6. `allowClear` 清除后值变为 `[]`，依次触发 `onChange` 与 `onClear`。
7. `disabled` / `readonly` 不打开浮层；选项 `disabled` 不可选。
8. `activeLevel` 受控时定位到指定层级。
9. 空选项与 `loading` 分别渲染空态与加载态。
10. 触发器使用 `DisplayInput`（`PickerTrigger`），`labelText` 与 `status` 正常展示。

### 7.2 `PickerCascader.test.tsx`

迁移旧 `CascadePicker` 用例：

1. 按当前 tab 路径构建多列并选中正确项。
2. 切换 tab 时各 tab 值相互独立。
3. 列变更只更新当前 tab，`params` 携带 `tabKey/tabIndex/columnIndex/itemIndex/path/items`。
4. `onOk` 回传完整 `Record` 与当前 tab 详情。
5. `onCancel` / `onOpenChange` 透传。
6. Tabs 位于 header 与滚轮之间。
7. `renderLabel` 接收原始树节点。
8. 非法值按层级截断。
9. 空 tab 展示 `emptyText`。
10. `readonly` 阻止打开。
11. 新增：`size` 透传 `Picker`，三档尺寸可渲染。

### 7.3 验收命令

```bash
yarn workspace @pennyspring/ui typecheck
yarn run lint
yarn run typecheck
yarn jest --watchman=false packages/pennyspring-ui/__tests__/ListPickerCascader.test.tsx packages/pennyspring-ui/__tests__/PickerCascader.test.tsx
yarn run test
```

---

## 8. 实施顺序

1. **准备实施环境**：已确认在当前 `main` 工作区直接实施。
2. **`Picker.Cascader`**
   - 抽出 `PickerCore.tsx`。
   - 迁移 `CascadePicker` 到 `Picker/Cascader/`，重命名类型。
   - 先写 `PickerCascader.test.tsx`（RED），再实现（GREEN）。
3. **`ListPicker.Cascader`**
   - 先写 `ListPickerCascader.test.tsx`（RED）。
   - 实现树工具、触发器、浮层与样式（GREEN）。
   - 迁移 `Cascader` 的 tag / activeLevel / 空态行为。
4. **组合导出**
   - `Picker.tsx` / `ListPicker/index.ts` 使用 `Object.assign` 挂载子组件。
   - 更新包级 `src/index.ts`。
5. **删除旧组件与旧测试**，迁移 `AssetManageScreen`。
6. **更新预览与文档**，运行全量检查。
7. **提交**：`refactor(components): 将 Cascader 合并为 ListPicker/Picker 级联子组件`。
8. 任务完成后按项目规范提交，并确认是否需要合并回远端。

---

## 9. 关键决策与风险

| 决策                                    | 结论                 | 理由                                                                                         |
| --------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `ListPicker.Cascader` 是否支持业务 tabs | 不支持，仅层级 Tab   | 层级 Tab 已占用导航语义；需要多棵树时使用 `Picker.Cascader` 或拆成多个 `ListPicker.Cascader` |
| `Picker.Cascader` 是否保留 tabs         | 保留                 | 承接 `CascadePicker` 现有能力，避免行为回归                                                  |
| 是否保留 `Cascader.View`                | 不保留               | 无业务消费者；纯面板场景可用 `Popup.FloatingPanel` + 未来按需补充                            |
| `ListPicker.Cascader` 触发器            | 统一 `PickerTrigger` | 与 `ListPicker` 视觉/状态/清除/校验能力一致                                                  |
| 旧类型别名                              | 不保留               | 一次性迁移，避免双份 API 长期共存                                                            |
| `styles` 类型                           | 自持语义类型         | 遵守组件规范，不直接复用底层 `TabsStyles` / `PickerStyles`                                   |

风险点：

1. **视觉变化**：`Cascader` 触发器由自建边框样式改为 `DisplayInput` 下划线样式，AssetManage 页面需目视确认。
2. **`children` 触发器丢失**：旧 `Cascader` 的 `children` 可完全替换触发器内容；新组件不再支持，预览 demo 需改用 `labelText`。
3. **Popup 能力收窄**：旧 `Cascader` 顶层 `position/maxHeight/minHeight/panelValue/defaultPanelValue/onPanelChange` 收敛到 `popupProps`，调用方需迁移。
4. **文件体积**：`ListPicker.tsx` 已 664 行；本次不继续增长该文件，新增逻辑全部放入 `ListPicker/Cascader/` 与 `style/index.ts`。

---

## 10. 交付物

- 本方案文档。
- 新组件 `ListPicker.Cascader`、`Picker.Cascader` 及类型导出。
- 旧组件、旧测试、旧预览完全移除。
- 迁移后的 `AssetManageScreen`、预览 registry、组件目录文档。
- 全量 `lint` / `typecheck` / `test` 通过。
