## Context

`packages/component` 已有 Text、Avatar、Button、Card 等共享组件，组件样式统一通过 `@pennyspring/theme` 的 `createUseSheetStyle` 消费 token，并由组件目录内的 `types.ts` 暴露公共 props 与样式类型。Badge 是展示型基础组件，需要在不修改主题 token 或其他组件的前提下补齐独立徽标和 children 叠加两种使用方式。

## Goals / Non-Goals

**Goals:**

- 提供 `Badge` 组件，支持 `count`、`text`、`dot` 内容模式。
- 支持包裹 `children` 时右上角叠加徽标，无 children 时独立展示徽标。
- 支持 `size`、`status`、`color`、`maxCount`、`showZero`、`disabled` 与稳定样式覆盖点。
- 使用内部 `Text` 组件展示徽标文本，样式完全由 token 和 `createUseSheetStyle` 构建。
- 提供行为测试覆盖可见性、溢出、dot、叠加和样式插槽。

**Non-Goals:**

- 不提供动画、测量驱动定位或复杂 anchor 配置。
- 不新增无障碍 props。
- 不修改主题 token、Text 组件或其他已有组件。

## Decisions

1. **内容优先级采用 `dot > text > count`。**
   - 理由：`dot` 表示只需要状态点，启用后不应再显示数字或文案；`text` 是显式展示内容，应优先于 `count`。
   - 备选：让调用方同时传入时报错。该方案会让展示型组件使用成本变高，不符合现有组件简洁风格。

2. **可见性由组件内部解析。**
   - `dot` 为 `true` 时展示小点；`text` 为非空字符串时展示文本徽标；`count` 为正数时展示数字；`count` 为 `0` 时仅 `showZero` 为 `true` 展示；没有可显示内容时仅渲染 children 或空根节点。
   - 理由：避免业务层重复编写 `0`、空文本和溢出逻辑。

3. **尺寸通过 token 映射到高度、最小宽度、padding、fontSize、lineHeight 和 dot 尺寸。**
   - 理由：满足 `ComponentSize` 约定，同时让独立徽标和叠加徽标在三种尺寸下保持稳定占位。

4. **颜色语义通过 `status` 与 `color` 映射到 AliasToken。**
   - `status` 支持 `default`、`primary`、`success`、`warning`、`error`、`info`。
   - `color` 支持相同语义色与已有组件常用预设色名；当 `color` 存在时优先于 `status`。
   - 理由：优先语义 token，同时保留分类场景需要的稳定预设色。

5. **slot 覆盖点保持稳定。**
   - `style` 表示根元素样式；`styles` 支持 `root`、`children`、`badge`、`text`、`dot`、`badgeDisabled`、`textDisabled`、`dotDisabled`。
   - 理由：用户明确要求 `root`、`badge`、`text`、`dot`、`children` slot 命名稳定；同时保留仓库通用 `style` 根覆盖方式。

## Risks / Trade-offs

- **[Risk] 右上角叠加定位不做测量，徽标尺寸变化可能影响视觉偏移。** → 使用 token 驱动的静态 `translateX/translateY` 与 `position: 'absolute'`，覆盖主流角标场景；复杂定位交给后续需求扩展。
- **[Risk] 同时支持 `status` 与 `color` 可能产生语义重叠。** → 明确 `color` 优先级高于 `status`，测试覆盖颜色优先级。
- **[Risk] `styles.root` 与仓库根样式通常使用 `style` 的规则略有重叠。** → 因用户明确要求稳定 `root` slot，组件同时支持两者，合并顺序为 token root、`styles.root`、`style`。
