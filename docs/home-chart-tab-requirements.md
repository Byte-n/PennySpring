# 首页图表 Tab 需求文档

生成日期：2026-05-31

## 背景

首页当前包含「明细」和「图表」两个 Tab，其中「图表」Tab 仍为占位内容。项目已决定使用 `@wuba/react-native-echarts` 作为 React Native 图表能力底座，用于展示记账业务中的收支、分类和资产分析数据。

本文档定义首页「图表」Tab 的首期产品需求，重点覆盖支出分类分析，并为后续收支趋势、收入分析、资产分析预留扩展方向。

## 目标

- 让用户快速理解本月钱主要花在哪里。
- 支持从一级支出分类下钻到二级支出分类，查看更细粒度的消费结构。
- 在同一分析区域内复用占比图和排行图，避免移动端同时展示过多重复图表。
- 图表视觉必须响应 `@pennyspring/theme` 主题 token，支持浅色和深色主题。
- 图表数据必须使用 `tb_record.final_amount` 作为统计金额，符合退款、报销吸收后的实际统计口径。

## 非目标

首期不实现以下能力：

- 预算达成率分析。
- 净资产历史趋势。
- 标签维度分析。
- 报销、退款专题分析。
- 多级分类下钻。当前只支持一级分类和二级分类。
- 点击二级分类后的明细筛选页跳转。该能力可在后续版本补充。

## 数据依据

### 涉及数据表

| 表 | 用途 |
| --- | --- |
| `tb_record` | 记账记录，提供金额、分类、账本、记账时间 |
| `tb_type` | 收入、支出、转账分类，提供分类层级和名称 |
| `tb_asset` | 资产信息，后续资产分析使用 |

### 关键字段

| 字段 | 说明 |
| --- | --- |
| `tb_record.type_id` | 记录分类 ID |
| `tb_record.books_id` | 所属账本 ID |
| `tb_record.final_amount` | 统计金额，单位为分 |
| `tb_record.record_time` | 记账时间 |
| `tb_type.id` | 分类 ID |
| `tb_type.parent_id` | 父分类 ID，`0` 表示一级分类 |
| `tb_type.name` | 分类名称 |
| `tb_type.type_category` | 分类大类，支出分析仅统计 `expense` |

### 统计口径

- 金额统一使用分为单位，在图表展示层格式化为人民币金额。
- 支出分析只统计 `tb_type.type_category = expense` 的记录。
- 支出金额使用 `tb_record.final_amount`，不使用 `amount`。
- `final_amount <= 0` 的记录不参与分类占比和排行。
- 默认时间范围为本月。
- 默认账本为当前选中的 `currentBook`。

## 页面结构

首期页面建议结构：

```text
图表

时间范围：本月

总览卡片
- 支出
- 收入
- 结余

支出分析
全部支出

支出分类占比图
支出分类排行图
```

首期 P0 可以只实现「支出分析」区域；总览卡片和时间范围控件可在同一阶段或下一阶段补齐。

## 支出分析

### 图表组成

支出分析区域固定展示两张图表：

1. 支出分类占比图
   - 图表类型：环形图。
   - ECharts series 类型：`pie`。
   - 主要表达：各分类支出占本层级总支出的比例。

2. 支出分类排行图
   - 图表类型：横向条形图。
   - ECharts series 类型：`bar`。
   - 主要表达：各分类支出金额排序。

不同时展示一级占比、一级排行、二级占比、二级排行四张图。图表区域根据当前下钻状态切换数据：

```text
默认状态：
- 一级分类支出占比
- 一级分类支出排行

点击一级分类后：
- 当前一级分类下的二级分类支出占比
- 当前一级分类下的二级分类支出排行
```

### 默认一级分类状态

默认进入支出分析时展示一级分类数据。

聚合规则：

```text
record.typeId -> type

if type.parentId > 0:
  groupKey = type.parentId
else:
  groupKey = type.id
```

说明：

- 如果记录记在二级分类上，金额归并到所属一级分类。
- 如果记录直接记在一级分类上，金额归到该一级分类。
- 找不到分类时，归入「未分类」。

### 二级分类下钻状态

点击某个一级分类后，进入该一级分类的二级分析状态。

筛选规则：

```text
selectedParentTypeId = 被点击的一级分类 ID

只统计：
- type.id === selectedParentTypeId
- 或 type.parentId === selectedParentTypeId
```

分组规则：

```text
if type.parentId === selectedParentTypeId:
  groupKey = type.id
else:
  groupKey = 未细分
```

说明：

- 直接记在一级分类上的记录，在二级状态下归入虚拟项「未细分」。
- 真实二级分类按各自 `type.id` 聚合。
- 如果一级分类下没有二级分类，但存在直接记账记录，则只展示「未细分」。

### 返回一级分类

使用面包屑和返回按钮，不依赖手势或点击图表空白区域。

默认一级状态：

```text
支出分析
全部支出
```

二级下钻状态：

```text
支出分析
全部支出 > 餐饮    返回上级
```

交互规则：

- 点击一级分类图表项：进入该分类二级状态。
- 点击「返回上级」：回到一级分类状态。
- 点击面包屑中的「全部支出」：回到一级分类状态。
- 点击二级分类图表项：首期只高亮或展示摘要，不继续下钻。

### 二级状态摘要

进入二级状态后，建议在图表上方展示当前一级分类摘要：

```text
餐饮  ¥1,280.00，占本月支出 32%
```

摘要字段：

| 字段 | 说明 |
| --- | --- |
| 分类名称 | 当前一级分类名称 |
| 分类金额 | 当前一级分类支出总额 |
| 总支出占比 | 当前一级分类金额 / 本月支出总额 |

## 图表数据模型

建议前端聚合后生成统一数据结构，供占比图和排行图复用。

```ts
interface ExpenseCategoryStat {
  key: string;
  typeId: number | null;
  parentTypeId: number | null;
  name: string;
  amount: number;
  count: number;
  percent: number;
  level: 1 | 2;
  virtual?: 'uncategorized' | 'unclassified';
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `key` | 图表项稳定 key |
| `typeId` | 真实分类 ID，虚拟项为 `null` |
| `parentTypeId` | 所属一级分类 ID |
| `name` | 展示名称 |
| `amount` | 聚合金额，单位分 |
| `count` | 记录笔数 |
| `percent` | 当前层级占比，取值 `0` 到 `1` |
| `level` | 当前展示层级 |
| `virtual` | 虚拟项标识 |

虚拟项定义：

| 虚拟项 | 含义 |
| --- | --- |
| `uncategorized` | 记录找不到分类，展示为「未分类」 |
| `unclassified` | 二级状态下直接记在一级分类上的金额，展示为「未细分」 |

## 排序和截断

### 占比图

- 默认按金额从高到低排序。
- 项目数量超过 6 个时，保留前 5 个，其余合并为「其他」。
- 「其他」不可下钻。
- 如果处于一级状态，被合并进「其他」的分类不响应点击。

### 排行图

- 默认按金额从高到低排序。
- 首期最多展示前 10 个分类。
- 不合并「其他」，排行图用于精确比较。
- 金额相同时按记录笔数从多到少排序，再按分类名称排序。

## 状态管理

支出分析需要维护下钻状态：

```ts
const [selectedParentTypeId, setSelectedParentTypeId] = useState<number | null>(null);
```

状态含义：

| 状态 | 含义 |
| --- | --- |
| `null` | 一级分类状态 |
| `number` | 二级分类状态，值为当前一级分类 ID |

交互方法：

```ts
function enterCategory(typeId: number) {
  setSelectedParentTypeId(typeId);
}

function backToRoot() {
  setSelectedParentTypeId(null);
}
```

## 空态和异常

| 场景 | 展示 |
| --- | --- |
| 当前账本为空 | 展示空态文案「暂无账本数据」 |
| 本月无支出记录 | 展示空态文案「本月暂无支出」 |
| 当前一级分类下无二级支出 | 展示空态文案「该分类暂无细分支出」 |
| 数据加载中 | 展示加载状态 |
| 数据加载失败 | 展示错误状态和重试入口 |

## 主题与视觉要求

- 图表颜色、文本、轴线、分割线、tooltip、背景必须从 `@pennyspring/theme` token 派生。
- 不允许在图表配置中直接写颜色字面量。
- 浅色和深色主题切换时，图表必须响应刷新。
- 支出色建议使用主题中的错误/支出语义色。
- 收入色建议使用主题中的成功/收入语义色。
- 中性文本、边框、网格线使用主题文本和边框 token。
- 图表容器样式遵循项目 React Native 样式约束，使用 `createUseSheetStyle`。

## 交互要求

### 点击占比图

一级状态：

- 点击真实一级分类：进入二级状态。
- 点击「其他」：不下钻。
- 点击「未分类」：不下钻。

二级状态：

- 点击真实二级分类：首期只高亮或展示摘要。
- 点击「未细分」：首期只高亮或展示摘要。

### 点击排行图

排行图和占比图使用相同交互规则。

一级状态：

- 点击真实一级分类：进入二级状态。

二级状态：

- 点击二级分类或「未细分」：首期只高亮或展示摘要。

## 首期验收标准

- 图表 Tab 能展示当前账本本月支出分类分析。
- 默认展示一级分类占比图和一级分类排行图。
- 点击一级分类后，两张图表刷新为该一级分类下的二级分类数据。
- 二级状态显示「全部支出 > 分类名」和「返回上级」。
- 点击「返回上级」或「全部支出」能回到一级分类状态。
- 直接记在一级分类上的金额，在二级状态下展示为「未细分」。
- 找不到分类的记录展示为「未分类」。
- 占比图和排行图使用相同统计口径，金额一致。
- 图表颜色和容器样式响应主题 token。
- 本月无支出时显示空态，不渲染空图表。

## 后续扩展

### P1

- 近 6 个月收支对比图。
- 收入分类排行。
- 时间范围切换：本月、近 3 月、近 6 月、今年。

### P2

- 资产结构图。
- 账户余额排行。
- 信用卡/信用付待还排行。

### P3

- 标签分析。
- 退款、报销吸收分析。
- 净资产趋势。该能力需要资产历史快照或严格的历史余额推导规则。

## 已确认决策（2026-05-31）

下列决策在需求评审后确认，作为首期实现依据。本期实现范围为「全部内容」，不再分阶段。

### 实现范围

- 实现完整图表 Tab：总览卡片（支出 / 收入 / 结余）、时间范围标识（固定「本月」）、支出分析区域（占比图 + 排行图 + 一级/二级下钻 + 面包屑返回 + 二级摘要）。
- 时间范围固定「本月」，切换能力仍属 P1，本期不做。
- 账本固定为 `useBookStore` 的 `currentBook`。

### 图表技术栈

- 图表库 `@wuba/react-native-echarts@^3.0.1` 与渲染后端 `@shopify/react-native-skia@^2.6.4` **均已安装**，无需新增依赖、无需 pod install / 重建。
- 渲染后端采用 **Skia 画布**：`import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts'`。
- echarts 按需注册：`echarts.use([SkiaRenderer, PieChart, BarChart, TooltipComponent, GridComponent, LegendComponent])`（从 `echarts/core`、`echarts/charts`、`echarts/components` 引入）。
- 初始化：`echarts.init(ref, undefined, { renderer: 'skia', width, height })` → `chart.setOption(option)`；卸载时 `chart.dispose()`。
- 画布尺寸由 `@pennyspring/ui` 的 `GeometryReader` 提供（`children: (geometry: { width; height }) => ...`）。

### 主题接入

- echarts option 为普通 JS 对象，颜色取值通过 `useTheme()`（来自 `@pennyspring/theme`，返回 `{ token }`）读取 token 十六进制值，禁止在 option 中写颜色字面量。
- 支出语义色用 `token.colorError`；中性文本用 `token.colorText` / `token.colorTextSecondary` / `token.colorTextTertiary`；轴线、分割线用 `token.colorBorder` / `token.colorBorderSecondary`；背景用 `token.colorBgContainer`。
- 多分类配色取主题预设色阶（如 `blueN` / `redN` / `goldN` 等），保证浅色 / 深色切换随 token 刷新。
- 容器与卡片样式仍用 `createUseSheetStyle`，不在画布外层写内联样式。

### 数据接入

- 记录：`api.record.getByBook(currentBook.id)`，返回 `RecordRow[]`（含 `finalAmount` 分、`typeId`、`recordTime` 毫秒时间戳）。
- 分类：`api.type.getAll()`（或 `api.type.getByCategory('expense')`），返回 `TypeRow[]`（含 `id`、`parentId`、`name`、`typeCategory`）。`tb_type` 已有真实分类数据，记录 `type_id` 指向真实分类，图表可真出数据。
- 复用 `src/screens/home/tabs/detail/detailData.ts` 的 `filterByMonth(records, month)`、`summarizeCashflow(records)`、`formatAmount(cents)`；`CENTS_PER_YUAN = 100`。
- 仅统计 `typeCategory === 'expense'` 且 `finalAmount > 0` 的记录。

### 占比与摘要口径

- 占比图与排行图的 `percent`、二级摘要「占本月支出 X%」的**分母统一为本月全部支出总额**（含被合并进「其他」及被排行图截断的项），可加总、与各项口径一致。
- 占比图保留前 5，其余合并「其他」（不可下钻）；排行图最多前 10、不合并；金额相同按笔数、再按名称排序。

### 布局

- 占比图（环形）与排行图（横向条形）在「支出分析」区域**上下堆叠同屏**，置于同一滚动容器，不使用分段切换。
- 总览卡片在分析区域上方；面包屑「全部支出 ＞ 分类名」与「返回上级」位于支出分析标题行。

### 空态文案（沿用需求正文）

- 当前账本为空：「暂无账本数据」。
- 本月无支出：「本月暂无支出」。
- 一级分类下无二级支出：「该分类暂无细分支出」。
- 加载中用 `@pennyspring/ui` 的 `Loading`，空态用 `Empty`。
