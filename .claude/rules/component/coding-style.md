---
paths:
  - "packages/component/src/**/*.ts"
  - "packages/component/src/**/*.tsx"
---

# 组件编码风格

> 本文件针对共享 React Native 组件扩展 [typescript/coding-style.md](../typescript/coding-style.md)。

## 目录约定

- 组件目录结构：
  - 组件目录 `packages/component/src/组件名称`
  - 组件样式 `packages/component/src/组件名称/style/index.ts` 子组件样式可单独文件。
- 非组件目录：`packages/component/src/_{name}`
- 公共 props 与导出的样式类型放在组件目录的 `types.ts`。

## 公共 API

- 将公共组件 props 和导出的样式类型保留在组件目录下的 `types.ts` 中。
- 使用具名 `interface XxxProps` 定义组件 props。
- 不要暴露仅供实现内部使用的 props。公共 props 应描述组件行为或受支持的自定义点。
- 每个组件都必须提供 `size?: XxxSize`，并导出对应的 `type XxxSize = 'small' | 'normal' | 'large'`。
- 对于受支持的变体、状态、尺寸和行为，优先使用明确的语义 props，而不是让调用方重写内部样式。
- 输入类组件必须显式支持 `placeholder`、`readonly` 和 `disabled`。

## 状态与回调 API

- 可见状态统一使用 `open`、`onOpenChange` 和 `defaultOpen`。需要同时支持可控和非可控模式；受控模式下由外部将 `open` 改为
  `false` 触发关闭时，不触发 `onCancel`。
- 关闭或取消动作统一使用 `onCancel`。禁止新增 `onClose`、`onDismiss` 等同义 props；除非组件已经提供 `onCancel`
  ，否则不得额外暴露这些别名。
- 完成或确认动作统一使用 `onOk`。禁止新增 `onFinished`、`onConfirm`、`onSubmit` 等同义 props；除非组件已经提供 `onOk`
  ，否则不得额外暴露这些别名。
- 值或主要值统一使用 `value`、`onChange` 和 `defaultValue`。需要同时支持可控和非可控模式。
- 可控和非可控判断由统一 hook 处理：
  `const [value, onChange, isControlled] = useControllableValue(props.defaultValue, props.value, props.onChange)`。
- 当一次操作涉及触发多个回调时，语义动作回调先发生。例如取消弹窗时先调用 `onCancel`，再调用 `onOpenChange(false)`。

## 数据与类型 API

- 组件外部传入的数据相关 props 必须具备完整 TypeScript 类型推导。例如 `options` 的选项类型必须能推导到 `value`、
  `onChange`、`onOk` 和 `renderItem` 等相关 API。
- 内部选项和子项必须通过数据驱动渲染，不使用复合子组件声明子项。
- 禁止：`<A><A.Item /></A>`。
- 推荐：`<A data={[]} renderItem={(data, index, opt) => ({})} />`，其中 `opt` 用于传入必要的 A 内部属性。

## 内部渲染节点

- 内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`。例如 `Card` 的标题、`List.Group`
  标题、选择器内部按钮文案等。
- 禁止：`{ title: string | ReactNode }`。
- 禁止：`{ title: string, titleNode: ReactNode }`。
- 推荐：`{ titleText: string, title: ReactNode }`。
- 文本样式只作用于内部文本，例如 `styles.titleText` 仅作用于 `titleText` 渲染出的文本。
- 如需包裹节点，使用 `titleContainer` 承载 `title ?? titleText`，不要用 `title` 表示容器。

## 尺寸

- `size` 只支持 `small`、`normal`、`large` 三个值，默认值必须是 `normal`。
- 组件应在内部完整实现三种尺寸，不要要求调用方通过 `style` 或 `styles` 拼出尺寸差异。
- 交互控件的 `size` 应影响高度、内边距、图标尺寸、文字尺寸或圆角等与尺寸语义相关的 token 样式。
- 布局组件的 `size` 应影响布局间隙、内边距、分隔距离或内容密度等布局语义，不应只改变视觉装饰。
- 尺寸样式必须使用 `AliasToken`，并通过 `createUseSheetStyle<TOptions>` options 传入 `size`。

## 样式 Props

- 每个组件都必须提供 `style`，用于表示根元素样式。
- 当组件包含多个内部元素，并且这些元素的样式需要独立自定义时，额外提供 `styles?: XxxStyles`。
- `styles` 不需要包含与 `style` 重叠的根元素部分；根元素样式统一由 `style` 表达。
- 不要在同一组件上同时混用 `styles` 和零散插槽 props，例如 `containerStyle`、`labelStyle` 或 `iconStyle`。

## `styles` 结构

- `styles` 是内部插槽级覆盖对象。每个 key 必须映射到稳定且有文档说明的组件内部插槽。
- 插槽名称应匹配组件结构，并使用 `content`、`label`、`icon`、`track`、`indicator`、`leftActions` 或 `rightActions` 等名称。
- 不要在 `styles` 中定义根元素插槽，例如 `container` 或 `root`；根元素样式使用组件的 `style`。
- 嵌套组件应通过将子组件样式归组到子组件名称下，保留所有权边界。

```ts
export interface SegmentedControlStyles {
  track?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelSelected?: StyleProp<TextStyle>;
  labelDisabled?: StyleProp<TextStyle>;
}

export interface TopTabNavigatorStyles {
  headerBar?: HeaderBarStyles;
  segmentedControl?: SegmentedControlStyles;
  sceneContainer?: StyleProp<ViewStyle>;
}
```

## 样式所有权

- 组件必须在内部提供完整的、由 token 驱动的默认外观。
- 外部样式是对布局和受支持视觉调整的覆盖，不是对组件基础设计的替代。
- 不要暴露会让正确性依赖调用方样式的插槽。
- 除非存在明确的自定义需求，否则行为关键的布局、动画、无障碍和测量样式应由组件自身持有。
- 当 active、inactive、disabled、pressed、selected、focused 和 loading 等标准视觉状态存在时，组件必须自行持有这些状态。

## 样式合并顺序

- 默认按以下顺序合并样式：token 样式、组件运行时样式、外部样式。
- 对于有状态的文本或视图样式，使用以下顺序：基础 token 样式、内部状态样式、共享外部样式。

## Token 样式

严格遵循 `theme-tokens` 技能规范

## Z 轴层级

- 弹出层 `zIndex` 必须基于 `AliasToken`，禁止硬编码任意大数字。
- 普通弹窗、Picker 和其他同级浮层默认使用 `token.zIndexPopupBase`。
- Popup 类组件默认使用 `token.zIndexPopupBase + 100`。
- Dialog 类组件默认使用 `token.zIndexPopupBase + 200`，并且必须高于 Popup 与 Picker 等其他组件弹窗。
- 非弹出层组件仅在需要处理局部覆盖关系时使用 `token.zIndexBase` 或 `token.zIndexBase + n`，不得超过
  `token.zIndexPopupBase`。

## 组件工作空间

- 在创建、修改、重构组件等场景，应优先在独立的 git-worktree 中进行。 
git-worktree 的操作见 using-git-worktrees 技能


## 组件复用

- 优先复用 `packages/component/src` 中已有的组件，例如：`Popup` / `Button`
