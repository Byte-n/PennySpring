---
name: component-composer
description: 将 UI 需求匹配到 packages/component 中现有的 PennySpring React Native 组件；当单个组件无法满足界面时，组合多个组件完成。编写、修改、评审或规划 src 页面、共享 UI、component-preview 示例，或任何需要 @pennyspring/component 构建块、布局原语、表单控件、反馈界面、导航控件、数据展示或组件选型指导的 React Native TS/TSX 界面代码时使用。
---

# Component Composer

## 目标

默认使用 `@pennyspring/component` 已导出的组件作为 UI 词汇表。优先组合最少数量的现有组件，不要用 React Native 原始组件重写等价 UI。

## 工作流程

1. 先把界面需求复述为用户意图，而不是实现形态：布局、输入、展示、反馈、导航、状态或浮层。
2. 当所需组件集合不明显时，读取 `references/component-catalog.md`。
3. 编码前检查选中的组件：
   - `packages/component/src/<ComponentName>/types.ts`
   - `packages/component/src/<ComponentName>/<ComponentName>.tsx`
   - `packages/component/__tests__/<ComponentName>.test.tsx` 下的相关测试
4. 选择一个主组件。若没有单个组件覆盖完整需求，将 UI 拆成语义明确的部分后组合。
5. 应用或页面代码从 `@pennyspring/component` 导入组件。`packages/component` 内部代码遵循现有相对导入模式。
6. 展示文本使用 `@pennyspring/component` 的 `Text`。布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid` 或 `GeometryReader`，再考虑 `View`。
7. 样式通过 `createUseSheetStyle` 与项目主题 token 实现。涉及任何视觉样式工作时，同时使用 `theme-tokens` 技能。
8. 用相关测试或被修改 workspace 的 typecheck 验证行为。

## 组合规则

- 当需求能直接映射到某个组件的公开 API 时，使用单个组件。
- 当需求组合了多个独立关注点时，组合组件。例如：“在弹窗中选择账户” = `DisplayInput` 或 `Picker` 加 `Popup`/`SelectionList`；“右侧带开关的设置行” = `List.Item` 加 `Switch`。
- 保持组合浅层。若某个页面区域会跨页面复用，在业务功能区提取局部组件，不要过早扩展共享组件 API。
- 不要只为支持单个页面而给 `packages/component` 增加 props，除非该行为明确通用且有测试覆盖。
- 不要手写目录中已有的组件行为：按钮、列表行、标签页、选择器、开关、toast/message、dialog/popup、卡片、tag、badge、loading、empty state、progress、skeleton 和通用布局。

## 选型启发

- 布局：优先从 `Column`、`Row`、`Space`、`Spacer`、`Grid`、`GeometryReader` 开始。
- 文本与图标：使用 `Text` 和 `Icon`。
- 操作：使用 `Button`、`FloatingActionGroup`、`SwipeAction`、`ActionSheet`。
- 表单：使用 `Input`、`Textarea`、`DisplayInput`、`CalculatorInput`、`Stepper`、`Slider`、`Switch`、`Checkbox`、`Radio`。
- 选择：使用 `Picker`、`TimePicker`、`DateTimePicker`、`CascadePicker`、`Cascader`、`SelectionList`、`Segmented`。
- 列表与结构化数据：使用 `List`、`DataList`、`ListCollapse`、`Card`、`Divider`、`Grid`。
- 导航或分段：使用 `TabBar`、`Tabs`、`TopTabNavigator`、`SegmentedControl`、`SideBar`、`IndexBar`、`Steps`。
- 反馈与状态：使用 `Toast`、`Message`、`Notification`、`Dialog`、`Popup`、`Loading`、`Skeleton`、`Progress`、`Empty`、`Result`、`Badge`、`Tag`。
- 媒体、头像与展示辅助：使用 `Avatar`、`Carousel`、`Ellipsis`。

## 参考

打开 `references/component-catalog.md` 查看可用导出与常见组合的精简目录。
