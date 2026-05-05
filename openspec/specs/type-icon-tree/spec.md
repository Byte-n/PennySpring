## ADDED Requirements

### Requirement: App exposes type icon tree
系统 MUST 在 `src` 下暴露一个类型图标数组 tree，用于驱动按分组浏览和选择类型图标的业务流程。

#### Scenario: Tree groups follow document order
- **WHEN** 开发者导入类型图标 tree
- **THEN** tree 的第一层分组 SHALL 对应 `docs/type-icon-mapping.md` 中的 19 个分组
- **AND** 分组顺序 SHALL 与文档顺序一致

#### Scenario: Group children follow document order
- **WHEN** 调用方读取任意分组节点的 `children`
- **THEN** 返回的图标节点 SHALL 对应该分组表格中的图标
- **AND** 图标节点顺序 SHALL 与文档表格顺序一致

### Requirement: Icon nodes use ICON constants
类型图标 tree 的每个图标节点 MUST 使用 `packages/data/src/constants/index.ts` 中的 `ICON` 值作为节点 `value`，不得重复硬编码枚举字符串。

#### Scenario: Icon values stay aligned with constants
- **WHEN** 开发者检查任意图标节点
- **THEN** 节点 `value` SHALL 引用 `ICON`
- **AND** 节点 `label` SHALL 通过 `ICON.label(value)` 获取

#### Scenario: Group nodes are not ICON values
- **WHEN** 开发者检查 tree 的第一层分组节点
- **THEN** 分组节点 SHALL 使用稳定的本地分组 key 和 label
- **AND** 分组节点 SHALL NOT 使用 `ICON` value 表示分组

### Requirement: Icon nodes include renderable SVG components
每个类型图标节点 MUST 关联一个可由 React Native 渲染的 SVG 图标组件。

#### Scenario: Icon component is renderable
- **WHEN** UI 获取任意图标节点的 `icon`
- **THEN** `icon` SHALL 是兼容 `react-native-svg` `SvgProps` 的 React 组件
- **AND** UI SHALL 能通过 JSX 渲染该图标组件

#### Scenario: SVG module typing is available
- **WHEN** TypeScript 编译包含 `.svg` import 的类型图标 tree 模块
- **THEN** 编译器 SHALL 识别 `.svg` 默认导出为兼容 `SvgProps` 的组件类型

### Requirement: Type icon files are copied under src assets icon
系统 MUST 将 `docs/type-icon-mapping.md` 中使用的 SVG 从 `docs/icon` 复制到 `src/assets/icon` 下，并按 type 图标分组目录组织。

#### Scenario: Copied icons use semantic file names
- **WHEN** SVG 被复制到 `src/assets/icon`
- **THEN** 文件名 SHALL 去掉原始 `vector_type_` 前缀和 `_24` 尺寸后缀
- **AND** 文件名 SHALL 使用 snake_case 语义命名，例如 `vector_type_salary_24.svg` 复制为 `salary.svg`

#### Scenario: Source icons remain unchanged
- **WHEN** 实现复制 SVG 资源
- **THEN** `docs/icon` 下的原始 SVG 文件 SHALL 保持不变

### Requirement: Tree covers documented type icon mappings
类型图标 tree MUST 覆盖 `docs/type-icon-mapping.md` 中记录的全部分组和分组下全部图标条目。

#### Scenario: All documented groups are available
- **WHEN** 调用方读取类型图标 tree
- **THEN** tree SHALL 包含收入、转账、理财、餐饮、日常、购物、服饰、数码、娱乐、家庭、育儿、汽车、人情、交通、住房、医疗、校园、物业和其它分组

#### Scenario: Group counts match document tables
- **WHEN** 调用方统计每个分组的 `children` 数量
- **THEN** 每个分组数量 SHALL 与 `docs/type-icon-mapping.md` 对应表格中的条目数量一致

#### Scenario: Duplicate source SVGs can map to different ICON values
- **WHEN** 文档中同一个 SVG 源文件出现在多个语义图标条目中
- **THEN** tree SHALL 为每个语义条目提供独立节点
- **AND** 每个节点 SHALL 使用其对应的 `ICON` value
