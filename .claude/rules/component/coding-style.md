---
paths:
  - "packages/component/src/**/*.ts"
  - "packages/component/src/**/*.tsx"
---

# 组件编码风格

> 本文件针对共享 React Native 组件扩展 [typescript/coding-style.md](../typescript/coding-style.md)。

## 适用范围

- 本文件适用于 `packages/component/src/**/*.{ts,tsx}` 中的共享 React Native 组件。
- 组件实现必须继承 TypeScript/JavaScript 编码风格、通用编码风格和项目宪章中的样式约束。
- 组件应优先复用 `packages/component/src` 中已有能力。
- 创建、修改、重构组件时，应优先在独立 git worktree 中进行。

## 目录与导出

- 组件目录：`packages/component/src/组件名称`，样式文件：`style/index.ts`。
- 非组件目录：`packages/component/src/_{name}`。
- 公共 props 与导出的样式类型放在组件目录的 `types.ts`。
- 组件由目录内 `index.ts` 导出，并同步从包级 `packages/component/src/index.ts` 导出。

## 公共 API

- 使用具名 `interface XxxProps` 定义组件 props。
- 不要暴露仅供实现内部使用的 props。
- 只有存在明确尺寸语义的组件才应提供 `size?: ComponentSize`。
- 优先使用明确的语义 props，而不是让调用方重写内部样式。
- 输入类组件必须显式支持 `placeholder`、`readonly` 和 `disabled`。

## 状态与回调 API

- 可见状态统一使用 `open`、`onOpenChange` 和 `defaultOpen`。需要同时支持可控和非可控模式。
- 关闭或取消动作统一使用 `onCancel`。禁止新增 `onClose`、`onDismiss` 等同义 props。
- 完成或确认动作统一使用 `onOk`。禁止新增 `onFinished`、`onConfirm`、`onSubmit` 等同义 props。
- 值或主要值统一使用 `value`、`onChange` 和 `defaultValue`。需要同时支持可控和非可控模式。
- 可控和非可控判断由统一 hook 处理：`const [value, onChange, isControlled] = useControllableValue(props.defaultValue, props.value, props.onChange)`。
- 当一次操作涉及触发多个回调时，语义动作回调先发生。例如取消弹窗时先调用 `onCancel`，再调用 `onOpenChange(false)`。

## 数据与类型 API

- 组件外部传入的数据相关 props 必须具备完整 TypeScript 类型推导。
- 内部选项和子项必须通过数据驱动渲染，不使用复合子组件声明子项。
- 禁止使用 `<A><A.Item /></A>` 形式声明子项。
- 推荐使用 `<A data={[]} renderItem={(data, index, opt) => ({})} />`。

## 内部渲染节点

- 内部节点同时支持文本和自定义节点时，文本 prop 使用 `xxxText`，节点 prop 使用 `xxx`。
- 禁止使用 `{ title: string | ReactNode }` 或 `{ title: string, titleNode: ReactNode }`。
- 推荐使用 `{ titleText: string, title: ReactNode }`。
- 文本样式只作用于内部文本，例如 `styles.titleText` 仅作用于 `titleText` 渲染出的文本。
- 如需包裹节点，使用 `titleContainer` 承载 `title ?? titleText`，不要用 `title` 表示容器。

## 尺寸 API

- 交互控件、展示控件、表单控件、反馈控件等存在明确尺寸语义的组件应提供 `size`。
- `size` 只支持 `small`、`normal`、`large` 三个值；默认值必须是 `normal`。
- 组件应在内部完整实现受支持尺寸，不要要求调用方通过 `style` 或 `styles` 拼出尺寸差异。
- 交互控件的 `size` 应影响高度、内边距、图标尺寸、文字尺寸或圆角等与尺寸语义相关的 token 样式。
- 尺寸样式必须使用 `AliasToken`，并通过 `createUseSheetStyle<TOptions>` options 传入 `size`。

## 样式 API

- 有可见根元素且调用方存在布局定位或外观覆盖需求的组件应提供 `style`，用于表示根元素样式。
- 当组件包含多个内部元素需要独立自定义时，额外提供 `styles?: XxxStyles`。
- 当组件提供 `style` 时，`styles` 不需要包含根元素部分；根元素样式统一由 `style` 表达。
- 不要在同一组件上同时混用 `styles` 和零散插槽 props（如 `containerStyle`、`labelStyle`）。
- `styles` 是内部插槽级覆盖对象，每个 key 必须映射到稳定且有文档说明的组件内部插槽。
- 插槽名称应匹配组件结构，使用 `content`、`label`、`con`、`track`、`indicator`、`leftActions`、`rightActions` 等名称。
- 嵌套组件应通过将子组件样式归组到子组件名称下，保留所有权边界。
- 通过 `xxxProps` 配置或透传内部复用组件 props 时，`xxxProps` 只承载非样式行为配置。
- `xxxProps` 中必须移除内部组件的 `style`、`styles`，例如使用 `Omit<InnerProps, 'style' | 'styles'>`。
- 内部复用组件的样式插槽必须映射到当前组件顶层 `styles.xxx` 下，禁止通过 `xxxProps.styles` 暴露第二套样式入口。

## 样式实现

- 组件必须在内部提供完整的、由 token 驱动的默认外观。
- 外部样式是对布局和受支持视觉调整的覆盖，不是对组件基础设计的替代。
- 不要暴露会让正确性依赖调用方样式的插槽。
- 行为关键的布局、动画、无障碍和测量样式应由组件自身持有。
- 当 active、inactive、disabled、pressed、selected、focused 和 loading 等标准视觉状态存在时，组件必须自行持有这些状态。
- 默认按以下顺序合并样式：token 样式、组件运行时样式、外部样式。
- Token 样式严格遵循 `theme-tokens` 技能规范。

## Z 轴层级

- 弹出层 `zIndex` 必须基于 `AliasToken`，禁止硬编码任意大数字。
- 普通弹窗、Picker 和其他同级浮层默认使用 `token.zIndexPopupBase`。
- Popup 类组件默认使用 `token.zIndexPopupBase + 100`。
- Dialog 类组件默认使用 `token.zIndexPopupBase + 200`，并且必须高于 Popup 与 Picker 等其他组件弹窗。
- 非弹出层组件仅在需要处理局部覆盖关系时使用 `token.zIndexBase` 或 `token.zIndexBase + n`，不得超过 `token.zIndexPopupBase`。
