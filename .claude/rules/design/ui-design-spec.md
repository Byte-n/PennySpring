---
paths:
  - "tmp-*/**/*.html"
  - "design-system/**/*.html"
  - "docs/ui-design/**/*.md"
---

# UI 设计稿与视觉规范

> 本文件定义 PennySpring 的视觉语言、HTML 设计稿结构、状态规则与提示词模板。
> **适用**：HTML 设计稿、视觉规范、设计评审、设计提示词。
> **落地继承自**：[common/component-visual-layout.md](../common/component-visual-layout.md)、`theme-tokens`、[component/coding-style.md](../component/coding-style.md)；RN 组件实现以它们为准。
> 本文件中的 px / hex 是**设计稿视觉基准**；落地 RN 时必须换成 `AliasToken`，禁止把 CSS 数值直接复制进组件样式。

## 1. 设计定位

- 工具型财务界面：克制、清晰、可信。先给结论，再给明细；数字优先于装饰。
- 设计稿是规格文档，不是营销页：手机屏 + 侧栏说明 + 状态矩阵 + 规格表是基本结构。
- 中文界面；金额、日期、分类使用真实业务数据，禁止 Lorem ipsum。
- 禁止：渐变主视觉、玻璃拟态、强拟物、霓虹发光、Emoji 图标、装饰性插画、无意义动效、纯黑正文、纯白正文压在浅色底上。

### 视觉签名（Effect Signature）

1. 冷灰页面底 + 白卡 + 发丝线；层级靠填充与留白，不靠重边框。
2. 金额是屏内最大字号、右对齐、`tabular-nums`；标签小而灰，退到辅助层。
3. 语义色只给收支、状态和主操作，不用来装饰整屏。
4. App 圆角只有 8 / 11 / 12 / 16 / 28–32 / 999 几档；doc shell 允许 14 / 16 / 48（文档卡片、手机外框）。不出现 7、13、19 这类随手值。
5. 底部浮层从底边起，带 grabber、顶部大圆角、向上投影；不做居中悬浮卡片。
6. 键盘、列表去描边；chip 默认无边框，选中用浅底（可加 1px 品牌浅描边）；触达 ≥ 44，按压只改变填充与轻微缩放。

## 2. Token 分层（HTML ↔ RN）

HTML 设计稿使用两层 CSS 变量，禁止在每个区块另造颜色：

- **Doc shell**：`--doc-page`、`--panel`、`--panel-line`、`--doc-text*`、`--accent*`、`--doc-shadow`，只服务设计文档的外壳。
- **App mirror**：`--ph-bg`、`--card`、`--text`、`--app-text-*`、`--line*`、`--app-fill*`、`--primary*`、`--exp*`、`--inc*`，是 `AliasToken` 的可视镜像，必须在 `html[data-theme="dark"]` 下整体切换。

Doc shell 基准值：

| 变量 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--doc-page` | `#eef1f6` | `#0b0d11` | 文档页底 |
| `--panel` | `#ffffff` | `#15181e` | 文档卡片 / 表格 |
| `--panel-line` | `#e4e8ef` | `#262b34` | 文档发丝线 |
| `--doc-text` | `#171b23` | `#e8ebf0` | 文档主文字 |
| `--doc-text-2` | `#5b6472` | `#98a1b0` | 文档正文 |
| `--doc-text-3` | `#8b94a3` | `#6b7484` | 文档注释 / 表头 |
| `--accent` | `#1677ff` | `#4c9aff` | 文档强调色 |
| `--accent-soft` | `rgba(22,119,255,.08)` | `rgba(76,154,255,.12)` | 文档浅底 |

App mirror 基准值（深色为设计稿观感值，落地以 token 查询结果为准）：

| HTML 变量 | AliasToken | 浅色 | 深色 | 用途 |
|---|---|---|---|---|
| `--ph-bg` | `colorBgLayout` | `#f5f5f5` | `#000000` | 手机屏 / 页面底 |
| `--card` | `colorBgContainer` | `#ffffff` | `#141414` | 卡片 / 浮层 |
| `--text` | `colorText` | `rgba(0,0,0,.88)` | `rgba(255,255,255,.85)` | 主文字 |
| `--app-text-2` | `colorTextSecondary` | `.65` 黑 | `.65` 白 | 次级文字 |
| `--app-text-3` | `colorTextTertiary` | `.45` 黑 | `.45` 白 | 辅助 / 占位 |
| `--line` | `colorSplit` | `.06` 黑 | `.09` 白 | 分隔线 |
| `--line-2` | `colorBorder` | `.12` 黑 | `.18` 白 | grabber / 强分隔 |
| `--app-fill` | `colorFillTertiary` | `.04` 黑 | `.08` 白 | 数字键 / 弱底 |
| `--app-fill-2` | `colorFillQuaternary` | `.022` 黑 | `.035` 白 | 显示器 / 功能键 |
| `--primary` | `colorPrimary` | `#1677ff` | 亮一档（稿内 `#3c89f8`） | 主操作 / 选中 |
| `--primary-soft` | `colorPrimaryBg` | `#e6f4ff` | 品牌 16% 透明 | 运算键 / 选中底 |
| `--exp` / `--exp-soft` | `colorErrorText` / `colorErrorBg` | `#cf1322` / `#fff1f0` | `#ff7875` / 12% 透明 | 支出 / 删除 |
| `--inc` / `--inc-soft` | `colorSuccessText` / `colorSuccessBg` | `#389e0d` / `#f6ffed` | `#73d13d` / 12% 透明 | 收入 |
| `--warn` / `--warn-soft` | `colorWarningText` / `colorWarningBg` | `#d46b08` / `#fff7e6` | `#ffc53d` / 14% 透明 | 提醒 / 可报销 |
| `--sheet-shadow` | `boxShadow`（近似） | 向上 44px | 向上 44px | 底部浮层 |

规则：

- 设计稿可以为了观感用“深一档语义色”（如 `#cf1322` / `#389e0d`）；RN 落地以 `colorErrorText` / `colorSuccessText` 或业务层覆盖值为准，组件不硬编码。
- 深色稿的强调色可以比实际 token 亮一档，用于审阅；落地仍取 `colorPrimary`，不复制 hex。
- 设计稿的 CSS 变量不是新 token 源。落地前必须用 `get-tokens.js` 查询实际 `AliasToken`，再决定是直接用 token 还是由业务层覆盖。
- 组件内禁止 `if (isDark)`；深浅色由 token 处理。HTML 稿用 `html[data-theme="dark"]` 模拟。
- AddRecord 的三类主色来自 `red10 / green10 / blue10`；组件只消费 `colorPrimary / colorPrimaryBg`。深色下品牌主色可能很暗，**不要把 `colorPrimary` 直接当浅底上的文字色**（运算符、标签用 `colorText`；只有实底确认键用 `colorTextLightSolid`）。

## 3. 排版

### App 字号（落地映射）

| 角色 | HTML 基准 | RN 映射 | 说明 |
|---|---|---|---|
| 金额 Hero / 页面主数字 | 42 / 52 | `h1`（`fontSizeHeading1` + `lineHeightHeading1`） | 卡片金额、首页汇总 |
| 页面标题 | 34 / 44 | `h2` | 常规大标题 |
| 计算结果 / 金额重点 | 34 / 38 | `fontSizeHeading2` + `lineHeightHeading3` | 允许跨级收紧行高 |
| 区块标题 | 28 / 38 | `h3` | 屏幕 / 分区标题 |
| 卡片标题 / 键位数字 | 22 / 32 | `h4` 或 `xl` | 键位、行标题 |
| 正文强调 | 18 / 28 | `lg` | 表达式、次级标题 |
| 正文 | 16 / 26 | `md` | 默认正文 |
| 次级正文 | 14 / 24 | `sm` | 说明、辅助信息 |
| 标签 / 说明 | 12 / 20 | `xs` | 最小正文 |
| 微标签（仅设计稿） | 10.5–11 | — | 设计文档侧栏、表头 |

### Doc shell 字号（仅设计稿）

| 角色 | 值 |
|---|---|
| 文档 H1 | 40 / 1.18 / 700 |
| 屏幕说明标题 | 26 / 1.28 / 700 |
| 文档导语 | 14.5 / 1.85 |
| 区块标题 | 16 / 600 |
| 侧栏与表格正文 | 12.5 / 1.72 |
| 表头 / eyebrow | 10.5–11 / 字距 .1–.14em / 大写 |

### 数字规则

- 所有金额、表达式、统计数字使用 `font-variant-numeric: tabular-nums`；RN 用 `fontVariant: ['tabular-nums']`。
- 大数字收紧字距：`letter-spacing: -.02em ~ -.03em`；小标签拉开字距：`.1em ~ .14em`。
- 金额符号（`¥`）比主数字小 2–4 档、透明度 .55–.72；列表金额可拆整数 / 小数两段，**输入框与计算结果不拆**。
- 中文正文行高 1.6–1.8；标题 1.15–1.3；不使用装饰字体，统一系统字体栈。
- App 内文字不小于 12；设计稿微标签不小于 10.5。

## 4. 颜色

- 中性优先：一屏 90% 是中性色；语义色只出现在收入、支出、转账、警告、主操作。
- 角色固定：`primary` = 操作 / 选中 / 转账；`error` = 支出 / 删除；`success` = 收入；`warning` = 提醒 / 可报销。
- 用填充表达层级，用发丝线表达分隔；键盘、列表行不加外边框；chip 默认无边框，选中用浅底 + 可选 1px 品牌浅描边。
- 不用颜色单独表达含义：金额配符号 / 文案，状态配文字或图标。
- 文字压在品牌浅底上时，优先 `colorText`；只有主色实底按钮才用 `colorTextLightSolid`。
- 深色模式：用 8% / 4% 白色填充分层，不把浅色反相；卡片 `#141414`、背景 `#000000`、遮罩 55%。
- 语义色不跨角色借用：支出红只给支出 / 删除，收入绿只给收入 / 成功，不拿来装饰其他模块。

## 5. 间距、尺寸、圆角、阴影

- 4px 网格；常用间距：4 / 8 / 12 / 16 / 20 / 24 / 32 / 40。
- 页面：设计稿最大宽 1052，左右 28；App 页面左右 16；卡片内边距 16。
- 手机：外框 395，屏幕 375×812，屏幕圆角 38，外框 48。
- 触达：可点击区域 ≥ 44（`controlHeight`）；键盘键高 52、间距 8。
- 圆角：chip 999；图标底板 11；卡片 / 输入 12；面板 / 键位 16；浮层顶部 28–32；电话外框 48。
- 阴影：卡片轻、浮层向上、主 CTA 可用品牌投影；键盘键、列表行不加阴影；深色下阴影减弱。
- 边框：仅发丝线 1px；卡片在填充不足时可用 `colorBorderSecondary`；选中态用色块或 2px 下划线，不靠加粗边框。

## 6. 组件配方

| 组件 | 规格 |
|---|---|
| 卡片 | `--card` 底 + `--line` 发丝线 + 12 圆角 + 16 内边距 + 轻阴影 |
| 区块标题 | 16 / 600 + 12.5 / `--doc-text-3` 副标题；计数标签 11 / 字距 .12em |
| Chip | 高 30、圆角 999、`--app-fill-2` 底；选中 `--primary-soft` 底 + 品牌文字 600（可加 1px 品牌浅描边） |
| Tab | 高 44、15px；选中主色 600 + 2px 下划线；未选中三级文字 |
| 列表行 | 图标底板 38 / 圆角 11；行内边距 11 16；标题 15/500；副标题 11 三级；金额 16/600 等宽；行间内缩发丝线 |
| FAB | 48×48、圆角 16、主色实底 + 品牌投影；次级 48 白底 + 发丝线 |
| 底部浮层 | 遮罩 40%（深色 55%）；顶部圆角 32；内边距 8 20 26；grabber 36×4；300ms 上滑 |
| 空态 | 虚线 1px + 12 圆角；40 圆形图标底；标题 13/600；说明 11 三级；一个 32 胶囊按钮 |
| Toast | `#1f2329` 底、12px、圆角 9、1.8s 自动消失；只出现一条 |
| 金额文本 | 右对齐、等宽；整数主字号、小数降 4–5px 并 .72 透明；符号 .55 透明 |
| 键盘（CalculatorInput） | 4 列 5 行；数字 / 运算 / 功能 / 确认四层；详见下方三行 |
| 显示器（CalculatorInput） | `--app-fill-2` 底 + 16 圆角 + 10/16/12 内边距 + 最小高 92；表达式 18/28 次级；结果 34/38 主文字 + 14px “=” 三级 |
| 键位（CalculatorInput） | 4 列；高 52、间距 8、圆角 16；数字 `colorFillTertiary` + `colorText` 22/500；运算 `colorPrimaryBg` + `colorText` 22/600；功能 `colorFillQuaternary` + `colorTextSecondary` 18；确认 `colorPrimary` + `colorTextLightSolid` 24/600（RN 取 `fontSizeHeading4`=22，按实际键高复核），跨两行，高约 112 |
| 状态（CalculatorInput） | 空态表达式占位 `0`、结果 `—`、确认键降级；不可求值同为空态；`disabled` 整体降到 `colorTextQuaternary`；`readonly` 给 keypad 加 `opacityLoading`，保留类型填充与可读文字 |

## 7. 状态与动效

- 每个交互组件至少表达：default / pressed / selected / disabled / readonly / loading / empty / invalid。
- 按压：填充深一档 + `scale(.97)`，90–140ms；不改变占位尺寸，不做弹性超调。
- 浮层：300ms `cubic-bezier(.2,.85,.25,1)` 上滑；遮罩淡入；进入 / 退出成对。
- 选中：色块或下划线表达，不靠单纯加粗；状态变化不引起布局跳动。
- 空态：不预填 `0.00`；用占位 + `—` + 降级按钮表达“还没开始”。
- 不可求值：显示 `—` 或一条内联说明；不显示 `NaN`、不弹系统 Alert、不 console 报错。
- `disabled` 与 `readonly` 必须区分：前者灰化降对比度；后者用 `opacityLoading` 降低键面存在感，但保留类型色与可读文字。
- Toast 只用于轻反馈；错误留在字段附近，不用 toast 代替表单错误。

## 8. 设计稿交付结构

- 路径：`tmp-<feature>-design/index.html`；长期设计系统页面放 `design-system/<system>/pages/`；组件规格文档放 `docs/ui-design/component-specs/`。
- 参考稿（若存在）：`tmp-home-list-design/index.html`（页面 + doc shell）、`tmp-calculator-input-design/index.html`（组件 + 状态）。
- 单文件、内联 CSS/JS、无外部依赖、无 CDN；系统字体栈；图标用内联 SVG，不用 Emoji。
- 必备章节（顺序固定）：
  1. Masthead：eyebrow / tag + 一句判断式 H1 + 问题与方案导语 + 主题切换 + 跳转导航。
  2. 设计取舍：3–4 张编号卡片，一张卡只讲一个取舍。
  3. 现状与改法：5–7 行 before / after 表。
  4. 2–3 块手机屏：395 外框 + 375×812 屏幕；左侧屏幕、右侧 sticky 说明；说明包含目标、结构、颜色、状态。
  5. 状态矩阵：空态 / 可确认 / 不可求值 / 禁用四张 mini 卡。
  6. 交互规则：按压、判定、数字、主题四张卡。
  7. 规格表：区域 / 规格 / 浅色 / 深色 / Token。
  8. 落地映射：区域 / 文件·slot / 改动 / 风险。
  9. Footer + toast。
- 交互要求：主题切换、键盘 / 筛选 / 表单演示必须可点击，且逻辑与真实组件一致；不允许用三张截图冒充三种状态。
- 深色要求：整页 `html[data-theme]` 切换；至少一块**固定深色对照屏**，在 `.screen-dark` 上局部声明 `--ph-bg` / `--card` / `--text` / `--app-fill*`，不改 `html[data-theme]`，这样才能与浅色屏同页对照。
- 响应式：≤960 单列、侧栏取消 sticky；≤430 手机占满宽度。
- 文件规模：通常 800–1200 行；用注释分区；不引入构建步骤。
- 验收：浏览器 1200 / 390 宽度、浅 / 深色、全部状态、无横向溢出；JS 与 HTML 结构无语法错误。

## 9. 提示词模板

> 使用时替换 `{{...}}` 占位，并先读取本文件与 `theme-tokens`；提示词只负责流程，视觉判断以本文件为准。

### A. 新设计稿

```text
你在 PennySpring 仓库中工作。先读取：
- .claude/rules/design/ui-design-spec.md
- .claude/rules/common/component-visual-layout.md
- .claude/skills/theme-tokens/SKILL.md

任务：为「{{功能/页面}}」出一版可交互 HTML 设计稿。
背景：{{现状与问题，3 句以内}}
目标：{{用户打开后 3 秒内要得到的结论或动作}}

约束：
1. 输出 tmp-{{slug}}-design/index.html，单文件，内联 CSS/JS，无外部依赖。
2. 沿用 PennySpring 设计语言：375×812 手机屏、395 外框、文档侧栏、light/dark、系统字体、内联 SVG。
3. 必须包含：masthead、3–4 条取舍、before/after 表、2–3 块手机屏、状态矩阵、交互规则、规格表、落地映射、footer。
4. 金额、日期、分类使用真实中文业务数据；禁止 Lorem ipsum。
5. 键盘 / 筛选 / 主题切换必须可交互，逻辑与真实组件一致；禁止用截图冒充状态。
6. 深色用 html[data-theme="dark"] 整体覆盖；至少一块固定深色对照屏。
7. 不额外设计无障碍属性；但触达 ≥44、文字可读、数字等宽。
8. 完成后用浏览器核对 1200 / 390 宽度、浅 / 深色、无横向溢出。

输出：文件路径 + 设计取舍摘要 + 验收自查结果。
```

### B. 组件视觉重设计

```text
先审计 {{Component}} 的现状：props / 结构 / style slot / 状态 / 现有 token。
列出 3–5 个具体视觉问题（不要泛泛说“不美观”）。
再按 .claude/rules/design/ui-design-spec.md 出一版 HTML 设计稿：
- before/after 表
- 默认 / 空 / 不可求值 / 禁用四态
- 深色对照
- 规格表（含 AliasToken 映射）
- 落地映射（文件 + slot + 改动 + 风险）
不要改业务逻辑，不要新增 props；颜色与尺寸必须能映射到现有 token。
```

### C. 设计评审

```text
以 .claude/rules/design/ui-design-spec.md 为唯一标准，评审 {{file}}。
按 P0 / P1 / P2 输出：
- P0：不可读、溢出、状态错误、触达 <44、token 无法落地
- P1：层级不清、语义色漂移、圆角 / 间距不成体系、深色失效
- P2：文案、对齐、细节 polish
每条给出：位置 + 问题 + 规则依据（章节 / token）+ 最小修复。
不要建议营销风、渐变、玻璃拟态；不要重写整个文件。
```

### D. 落地到 RN

```text
把 {{design.html}} 的视觉落到 {{Component}}。
约束：
- 必须使用 createUseSheetStyle + AliasToken；禁止颜色 / 数字字面量（CLAUDE.md 例外除外）。
- 不修改公共 API 与 styles slot 语义；不新增无关 props。
- Text / Icon 颜色语义保持一致；金额使用 tabular-nums。
- packages/** 走 TDD：先写失败测试，再最小实现，最后重构。
先输出映射表（设计值 → token → slot），再改代码；完成后运行 lint / typecheck / 相关测试。
```

### E. 视觉一致性与 Token 提取

```text
扫描 {{design.html}} 与 packages/pennyspring-theme。
输出三张表：
1) 设计变量 → 值 → 对应 AliasToken → 浅 / 深色
2) 不一致项：同一语义出现多种颜色 / 圆角 / 字号 / 间距
3) 最小修正建议（只列改动，不直接改代码）
不要发明新 token；无法映射的项标记为“业务层覆盖”。
```

## 10. 设计评审清单

| 检查项 | 通过标准 |
|---|---|
| 375 宽度 | 手机屏内容不溢出、不横向滚动 |
| 触达 | 可点击区域 ≥44；键间距 ≥8 |
| 数字 | 金额 / 表达式 `tabular-nums`；右对齐 |
| 层级 | 一屏只有一个主数字、一个主操作 |
| 描边 | 键盘 / 列表行无外边框；chip 默认无边框，选中例外 |
| 语义色 | 只用于收支 / 状态 / 主操作；颜色不单独承载含义 |
| 深色 | 整体 token 切换；固定深色屏不受页面主题影响 |
| 状态 | 空 / 按压 / 选中 / 禁用 / 只读 / 无效全部表达 |
| Token | 规格表每个值都有 token 或明确“业务层覆盖” |
| 交互 | 演示可点击且逻辑真实；无假状态、无死按钮 |
| 依赖 | 单文件、无 CDN、无外部字体 / 图片 |
| 文案 | 中文、真实数据、无 Lorem ipsum、无 Emoji 图标 |

## 11. 禁止项

- 紫色 / 彩虹渐变主视觉、玻璃拟态、霓虹、3D 立体按钮、装饰性插画。
- 每个卡片都描边、每个区块都阴影、键盘键带边框。
- 金额不使用等宽数字，导致输入 / 刷新时宽度跳动。
- 同一屏两个主色按钮；语义色当装饰色使用。
- 纯黑正文、纯白文字压在浅色 / 品牌浅底上。
- App 文字小于 12、触达小于 44、按钮高度小于 32。
- 设计稿使用 Lorem ipsum、Emoji 图标、外部 CDN 或截图冒充交互。
- 把 HTML 的 px / hex 直接复制进 RN 组件；新增 token 未经主题层确认。
