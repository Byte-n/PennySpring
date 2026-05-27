# List 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. `title` / `description` 插槽允许字符串绕过项目 `Text` 组件

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/List/types.ts:48`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md` 内部渲染节点
- 不符合点：`ListItemProps` 将 `title?: ReactNode`、`description?: ReactNode` 作为节点插槽暴露，而 `ReactNode` 包含 `string`。实现中 `packages/pennyspring-ui/src/List/List.tsx:224` 和 `packages/pennyspring-ui/src/List/List.tsx:229` 优先直接渲染 `title` / `description`，只有 `titleText` / `descriptionText` 才会进入 `renderTextNode` 并使用项目 `Text` 组件。调用方传入 `title="Checking"` 时，字符串会作为原生文本节点进入 `View`，绕过 `Text` 的字号、颜色和主题语义。现有测试也在 `packages/pennyspring-ui/__tests__/List.test.tsx:43`、`packages/pennyspring-ui/__tests__/List.test.tsx:50`、`packages/pennyspring-ui/__tests__/List.test.tsx:60` 使用了 `title` / `description` 字符串，说明该违规路径已被测试固定。
- 影响：ListItem 的展示文本可能不走统一 `Text` 组件，导致字体、颜色、深浅色主题和文本语义与组件库其他展示文本不一致；同时公共 API 混淆了文本 prop 与节点插槽的边界。
- 推荐纠正方案：将文本调用方式统一迁移到 `titleText?: string`、`descriptionText?: string`；若保留 `title` / `description` 作为节点插槽，应在类型或运行时避免字符串直接作为插槽使用，或对字符串插槽统一包装为项目 `Text`。同步调整测试使用 `titleText` / `descriptionText` 覆盖文本路径。

### 2. ListItem 使用 `View` 手写等效行布局，未优先复用布局组件

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/List/List.tsx:107`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md` 工作流程；`.claude/rules/component/coding-style.md` 适用范围
- 不符合点：`ListItem` 的 `row` 样式在 `packages/pennyspring-ui/src/List/List.tsx:107` 至 `packages/pennyspring-ui/src/List/List.tsx:110` 手写 `flexDirection: 'row'`、`alignItems: 'center'`，并在 `packages/pennyspring-ui/src/List/List.tsx:238` 使用 `View` 承载行布局。左右插槽和内容区也在 `packages/pennyspring-ui/src/List/List.tsx:242` 至 `packages/pennyspring-ui/src/List/List.tsx:244` 通过多个 `View` 手动组合。项目规范要求界面布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`GeometryReader`、`Grid` 等已有布局组件，并禁止用 `View` 手写等效布局结构。
- 影响：ListItem 作为共享基础组件绕过布局原语，会让间距、对齐、尺寸语义和后续布局能力与组件库标准布局组件产生实现漂移，增加维护成本。
- 推荐纠正方案：将行级结构改为复用 `Row` 承载横向布局，内容区需要垂直排列标题和描述时复用 `Column`，插槽间距通过布局组件的 size/gap 语义或 token 化样式映射实现；保留必要的语义样式插槽映射，不把底层 `View` 结构暴露给调用方。

### 3. 外部 `style` 合并顺序早于运行时状态样式

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/List/List.tsx:251`
- 违反规范：`.claude/rules/component/coding-style.md` 样式实现
- 不符合点：规范要求默认按“token 样式、组件运行时样式、外部样式”合并。当前非交互分支在 `packages/pennyspring-ui/src/List/List.tsx:251` 至 `packages/pennyspring-ui/src/List/List.tsx:256` 使用 `[tokenStyles.item, style, isSelected ? tokenStyles.itemSelected : null, isDisabled ? tokenStyles.itemDisabled : null]`，交互分支在 `packages/pennyspring-ui/src/List/List.tsx:262` 至 `packages/pennyspring-ui/src/List/List.tsx:267` 使用 `[tokenStyles.item, style, pressed ? tokenStyles.itemPressed : null, isSelected ? tokenStyles.itemSelected : null]`。外部 `style` 被放在 selected、disabled、pressed 等运行时状态样式之前。
- 影响：调用方通过 `style` 对外层布局或视觉做受支持覆盖时，会被运行时状态样式覆盖，实际合并优先级与组件规范不一致；同一组件在状态切换时的外部覆盖行为不可预期。
- 推荐纠正方案：按规范将状态样式放在 token 样式之后、外部 `style` 之前，例如 `[tokenStyles.item, pressedState, selectedState, disabledState, style]`；同时保留状态不改变占位尺寸的约束，并补充测试覆盖 selected/disabled/pressed 与外部样式合并优先级。

## 需要人工确认

- 无
