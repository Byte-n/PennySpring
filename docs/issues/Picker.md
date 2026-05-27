# Picker 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. 包级入口未同步导出 Picker 目录内的全部公共类型

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/index.ts:207`
- 违反规范：`CLAUDE.md` 组件约束；`.claude/rules/component/coding-style.md`「目录与导出」
- 不符合点：`packages/pennyspring-ui/src/Picker/index.ts:2` 从组件目录导出了 `PickerChangeReason`、`PickerClearChangeParams`、`PickerPanelStyles`、`PickerSelectChangeParams` 等公共类型，但包级入口 `packages/pennyspring-ui/src/index.ts:207` 到 `packages/pennyspring-ui/src/index.ts:223` 只导出了一部分 Picker 类型，遗漏了上述目录入口已公开的类型。项目规范要求组件由目录内 `index.ts` 导出，并同步从包级入口导出。
- 影响：调用方通过 `@pennyspring/ui` 只能拿到部分 Picker 类型，公共 API 表面不一致；尤其 `PickerSelectChangeParams`、`PickerClearChangeParams` 和 `PickerChangeReason` 是 `onChange` 参数语义的一部分，无法从包级入口复用会削弱类型可用性。
- 推荐纠正方案：将 `packages/pennyspring-ui/src/Picker/index.ts` 中面向外部的类型清单同步到 `packages/pennyspring-ui/src/index.ts`，至少补齐 `PickerChangeReason`、`PickerClearChangeParams`、`PickerPanelStyles`、`PickerSelectChangeParams`；后续新增 Picker 公共类型时同步维护两处入口。

### 2. Picker 的 size 未传递给内部有尺寸语义的组件

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Picker/PickerTrigger.tsx:74`
- 违反规范：`.claude/rules/component/coding-style.md`「尺寸 API」；`.claude/rules/common/component-visual-layout.md`「Size 与间距 Token」
- 不符合点：`PickerProps` 在 `packages/pennyspring-ui/src/Picker/types.ts:172` 暴露 `size?: ComponentSize`，`Picker.tsx:123` 默认值为 `normal`，但外层只在 `Picker.tsx:128` 把 `size` 传入 `usePickerStyles`。内部触发器在 `PickerTrigger.tsx:74` 渲染 `DisplayInput` 时没有传递外层 `size`，而 `DisplayInputProps` 自身在 `packages/pennyspring-ui/src/DisplayInput/types.ts:22` 支持 `size`。头部操作在 `PickerHeaderButton.tsx:35` 渲染 `Button` 时也没有传递外层 `size`，而 `ButtonProps` 在 `packages/pennyspring-ui/src/Button/types.ts:49` 支持 `size`。规范要求组件内部使用的其他组件如果也有 `size`，必须随外层 `size` 传递或映射。
- 影响：`<Picker size="small" />` 或 `<Picker size="large" />` 只改变滚轮项高度等局部样式，触发输入框和确认/取消按钮仍使用各自默认尺寸，导致同一个 Picker 内外尺寸语义不一致，视觉和点击区域也可能不匹配。
- 推荐纠正方案：为 `PickerTriggerProps`、`PickerHeaderProps` 和 `PickerHeaderButtonProps` 补充内部尺寸参数，并由 `Picker` 将外层 `size` 传递或按语义映射给 `DisplayInput` 与 `Button`；如需允许局部覆盖，应通过明确的 Picker 语义 API 或 `displayInputProps` 的非样式配置设计覆盖优先级，并增加 small/normal/large 的行为测试。

### 3. Picker 头部使用 View 手写等效水平布局

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Picker/PickerHeader.tsx:35`
- 违反规范：`CLAUDE.md` 组件约束；`.codex/skills/component-composer/SKILL.md`「工作流程」；`.claude/rules/component/coding-style.md`「适用范围」
- 不符合点：`PickerHeader.tsx:2` 直接从 `react-native` 引入 `View`，并在 `PickerHeader.tsx:35`、`PickerHeader.tsx:36`、`PickerHeader.tsx:46`、`PickerHeader.tsx:54` 使用多个 `View` 组织取消区、标题区和确认区；对应样式在 `usePickerStyles.ts:62` 到 `usePickerStyles.ts:81` 使用 `flexDirection: 'row'`、`justifyContent`、`alignItems` 手写水平布局。项目规范要求界面布局优先使用 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader` 等已有布局组件，禁止用 `View` 手写等效布局结构。
- 影响：Picker 头部的布局语义与组件库既有布局原语脱节，后续统一调整 Row/Column 的间距、对齐或样式策略时，Picker 需要单独维护，增加视觉一致性和维护成本。
- 推荐纠正方案：将头部三段布局改为 `Row` 组合，并保留必要的语义插槽样式映射；如果某些外层容器必须保留 `View`，应限定在非等效布局职责上，并避免重复手写 Row 已覆盖的水平排列逻辑。

## 需要人工确认

- 无
