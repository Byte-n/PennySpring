# asset-classification-tree Specification

## Purpose
TBD - created by archiving change add-asset-classification-tree. Update Purpose after archive.
## Requirements
### Requirement: App exposes asset classification tree
系统 MUST 在 `src` 下暴露一个资产分类数组 tree，用于驱动“选择资产大类 -> 二级分类 -> 可选具体明细分类”的业务流程。

#### Scenario: Tree root represents asset types
- **WHEN** 开发者导入资产分类 tree
- **THEN** tree 的第一层节点 SHALL 对应 `ASSET_TYPE` 中定义的资产大类
- **AND** 第一层节点 SHALL 保持 `docs/bank-icon-mapping.md` 中的资产大类顺序

#### Scenario: Children represent classification hierarchy
- **WHEN** 调用方读取某个资产大类节点的 `children`
- **THEN** 返回的子节点 SHALL 表示该大类下的二级分类
- **AND** 有具体明细分类的二级分类节点 SHALL 通过自身 `children` 暴露明细分类

### Requirement: Tree nodes use existing constants
资产分类 tree 节点 MUST 使用 `packages/data/src/constants/index.ts` 中的 `ASSET_TYPE` 和 `ASSET_CLASSIFICATION` 值作为节点 `value`，不得重复硬编码枚举字符串。

#### Scenario: Node values stay aligned with constants
- **WHEN** 开发者检查 tree 节点
- **THEN** 第一层节点的 `value` SHALL 引用 `ASSET_TYPE`
- **AND** 第二层及第三层节点的 `value` SHALL 引用 `ASSET_CLASSIFICATION`

#### Scenario: Labels come from constants
- **WHEN** tree 节点需要展示文案
- **THEN** 节点 `label` SHALL 通过对应常量的 `label(...)` 能力获取

### Requirement: Tree nodes include renderable SVG icons
每个资产分类 tree 节点 MUST 关联一个可由 React Native 渲染的 SVG 图标组件。

#### Scenario: Icon can be rendered by React Native Svg
- **WHEN** UI 获取任意 tree 节点的 `icon`
- **THEN** `icon` SHALL 是兼容 `react-native-svg` `SvgProps` 的 React 组件
- **AND** UI SHALL 能通过 JSX 渲染该图标组件

#### Scenario: SVG module typing is available
- **WHEN** TypeScript 编译包含 `.svg` import 的 tree 模块
- **THEN** 编译器 SHALL 识别 `.svg` 默认导出为兼容 `SvgProps` 的组件类型

### Requirement: Asset icon files are copied and organized under src assets
系统 MUST 将 `docs/bank-icon-mapping.md` 中 tree 需要使用的 SVG 从 `docs/icon` 复制到 `src/assets` 下，并按资产分类目录组织。

#### Scenario: Copied icons use semantic file names
- **WHEN** SVG 被复制到 `src/assets`
- **THEN** 文件名 SHALL 去掉原始 `vector_` 前缀和 `_24` 尺寸后缀
- **AND** 文件名 SHALL 使用 snake_case 语义命名，例如 `vector_cash_circle_24.svg` 复制为 `cash_circle.svg`

#### Scenario: Source icons remain unchanged
- **WHEN** 实现复制 SVG 资源
- **THEN** `docs/icon` 下的原始 SVG 文件 SHALL 保持不变

### Requirement: Tree covers documented asset mappings
资产分类 tree MUST 覆盖 `docs/bank-icon-mapping.md` 中记录的资产大类、二级分类、具体银行卡明细、具体信用付明细和具体网络钱包明细。

#### Scenario: Capital account hierarchy is available
- **WHEN** 调用方读取 `capital_account` 大类节点
- **THEN** 其二级分类 SHALL 包含现金、储蓄卡、网络钱包和其它资金
- **AND** 储蓄卡 SHALL 包含具体银行卡明细
- **AND** 网络钱包 SHALL 包含微信、支付宝和抖音明细

#### Scenario: Credit card hierarchy is available
- **WHEN** 调用方读取 `credit_card` 大类节点
- **THEN** 其二级分类 SHALL 包含信用卡、信用付和其他信用卡
- **AND** 信用卡 SHALL 包含具体银行卡明细
- **AND** 信用付 SHALL 包含花呗、京东白条和抖音月付明细

#### Scenario: Leaf asset categories are available
- **WHEN** 调用方读取储值卡、投资理财或债券债务大类节点
- **THEN** 这些大类 SHALL 暴露文档中列出的二级分类
- **AND** 没有具体明细的二级分类节点 SHALL 不要求提供 `children`

