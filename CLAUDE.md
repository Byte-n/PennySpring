# PennySpring 项目宪章

## 项目概览

### Architecture

Monorepo（Yarn workspaces）：根目录是 React Native App，`packages/*` 是内部共享包。

- 数据层路径：`packages/data/src/schema` 定义表，`relations` 定义关联，`runtime/client/createDatabase()` 通过
  op-sqlite connection 创建 Drizzle DB，`runtime/migrations/runMigrations()` 执行打包迁移。
- 数据库表结构的修改不需要走迁移脚本，因为目前此项目应用并为投入正式使用，直接破坏性修改即可。

## 开发命令

### 类型与数据

- Type check：`yarn workspace @pennyspring/theme typecheck`，`yarn workspace @pennyspring/ui typecheck`，
  `yarn workspace @pennyspring/data typecheck`，`yarn workspace @pennyspring/share typecheck`
- DB check / generate：`yarn workspace @pennyspring/data db:check`，`yarn workspace @pennyspring/data db:generate`

## 代码规范

### Accessibility

- 不需要支持无障碍、可访问性设计或相关属性

### 业务数据规则

- 数据库和业务数据中，数值类型值为 `0` 、字符类型值为空串 `''` 则代表空（无关联、未设置）。
- 例如：记录未关联资产时，`assetId` 设置为 `0`；转账记录的 `intoAssetId` 默认为 `0` 表示无转入资产。
- 业务逻辑需正确处理 `0` 值：写入时允许 `0`，读取时视为"无关联"，不做外键校验。

## React Native 实现约束

### 样式

**唯一构建方式**：`createUseSheetStyle`（来自 `@pennyspring/theme`）。

**禁止**：

- `StyleSheet.create(...)`
- 组件内联 `style={{ ... }}` 字面量对象
- 样式值中的颜色字面量（`'#xxx'`、`'rgb/rgba(...)'`、命名色）
- 样式值中的数字字面量

**数字字面量唯一例外**：`0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'`。

- 无合适 token 时：允许用语义化命名常量或动态计算值作为局部例外，禁止用无关 token 相乘凑数值。
- Token 选择必须参考 `theme-tokens` 技能；阴影必须经 `toShadowStyle(...)`；React Native `lineHeight` 用
  `token.fontHeight*`（像素），不用 `token.lineHeight*`（倍数）。
- 动态样式通过 `createUseSheetStyle<TOptions>` 的泛型参数传入，不在调用处拼 `[styles.a, { ... }]`。
- 主题注入：全局 `<ThemeProvider>` 位于应用根；禁止在组件内判断 light/dark 分支，token 已自适配。

### 组件

- 优先使用 `@pennyspring/ui` 中的组件。
- 共享组件放在 `packages/pennyspring-ui/src/<ComponentName>/`，由目录内 `index.ts` 和包级 `src/index.ts` 导出；
  公共 props 与导出的样式类型放在组件目录的 `types.ts`。
- 界面布局优先使用 `@pennyspring/ui` 已有布局组件（如 `Row`、`Column`、`Spacer`、`GeometryReader`、`Grid` 等），禁止用 `View` 手写等效布局结构。
- 文本展示统一使用 `@pennyspring/ui` 导出的 `Text`，禁止直接使用 `react-native` 的 `Text`；
  字号、颜色等优先用 `TextProps` 实现，其次才是 `style`。

### 导航

- 需要访问导航对象时，统一使用 `src/navigation` 导出的 `useNavigation` 封装 hook，禁止直接从
  `@react-navigation/native` 导入原始 `useNavigation`。

### 动画

- 仅允许使用 `react-native-reanimated`，禁止使用 `react-native` 的 `Animated`、`LayoutAnimation`、`Animated.timing/spring/decay`。
- 时长、缓动曲线、延迟必须优先使用主题 token（`motionDuration*`、`motionEase*`），禁止硬编码魔法数。
- 缓动曲线统一使用 `Easing.bezier(...token.motionEase*)`（来自 `react-native-reanimated`），避免手感漂移。
- 进入/退出动画必须成对设计（含 mount/unmount 生命周期），避免只进不出、闪烁或残留占位。

Reanimated 极简核心总结：
* 核心冲突：动画运行在 UI 线程，React 运行在 JS 线程。跨线程传递的对象会被底层深度冻结。
* 拍平对象：严禁在 useAnimatedStyle 内部读取外部复杂对象，必须在外部解构成基础类型（数字/字符串）传入，否则报错或值不更新。
* 禁用 Ref：内部严禁修改 React useRef，记录状态必须改用 useSharedValue。
* 干净返回：不要去覆写或删除样式的深层属性，条件改变时直接 return 一个全新的样式对象。

### 手势

- 统一使用 `react-native-gesture-handler`；应用根已挂载 `<GestureHandlerRootView>`，组件内可直接使用手势组件。

### 设计 / 布局

- 界面组成优先使用 `component-composer` 技能获取布局指导。
- 适配键盘弹出时必须优先使用 `@pennyspring/ui` 的 `KeyboardAware` 系列能力。

## 本地化与格式

### 语言

- 界面、组件展示文案用中文。

### 日期格式化工具（`src/utils/prototype.ts`）

通过扩展原生类型与 Dayjs 原型，提供统一的格式化方法，支持 `number`（时间戳）、`string`、`Date`、`Dayjs` 四种类型直接调用：

| 方法 | 格式 | 说明 |
|------|------|------|
| `.formatDate(relative?)` | `MM-DD` | `relative=true`（默认）时追加今天/昨天/前天/明天后缀 |
| `.formatDateTime()` | `YYYY-MM-DD HH:mm` | 精确到分钟 |
| `.formatDateBy(format)` | 自定义 | 透传 dayjs 格式字符串 |

类型声明位于 `src/types/prototype.d.ts`，Dayjs 扩展通过 `declare module 'dayjs'` 声明。

## 质量保障

### 代码任务收尾检查

若当前任务中有包含项目源代码的变更，则必须执行下列所有的检查：

- `yarn run lint`
- `yarn run typecheck`
- `yarn run test` 或 `jest --watchman=false {指定测试文件}`

必须在声明完成前执行，且仅当结果均无 error 时才允许宣称完成。若无法执行或未通过，必须明确报告阻塞原因与当前结果；问题消除前不得表述为「已完成」。

### 测试用例编写要求

- 最低覆盖率目标为 80%；
- 测试文件使用 `*.test.ts` / `*.test.tsx`，集中在根 `__tests__/` 或各包 `__tests__/`。
- 按 AAA（Arrange-Act-Assert）组织测试；测试名必须直接描述被验证的行为。
- 禁止为 Typescript 类型、源代码包含特定字符、模块导出导入、theme token、style value、常量值、样式等添加测试用例。
- 缺陷修复场景中，新增用例只能覆盖此前未被保护的行为；原有正确用例必须继续按原行为通过，禁止为迁就实现而反向修改正确测试。

### TDD 测试驱动开发

**`packages/**` 下的代码修改必须严格遵守 TDD 流程：**

1. **RED**：先按照“测试用例编写要求”为新行为或缺陷编写失败测试。
2. **GREEN**：以最小改动使目标测试通过，不附带无关重构或范围扩张。
3. **REFACTOR**：在全部测试通过的前提下清理实现，完成后重跑相关测试。
4. **验证**：对应 workspace 的测试脚本运行，确保无回归。
5. **失败归因与纠偏**：测试失败时先定位真因（实现 / 用例 / 环境），再做最小修改。修复**仅针对缺陷本身纠错**，不得借修 bug
   之名改动原需求逻辑、扩大或收窄原定预期行为，避免出现“修 bug
   导致需求不符”。

**以下任务豁免 TDD 流程与新增测试**（仍需在完成后运行 `yarn test`，保证存量用例全绿）：

- `packages/pennyspring-ui/examples/` 的任何修改（预览/样例专用，不进入产物行为）。
- 文档修改。
- 依赖、项目工程化配置
- 静态资产新增或替换
- 删除、移除等「减」任务：需同步移除被删行为关联的测试；若剩余用例仍覆盖保留行为，必须全部通过。

### Git

- commit 使用 conventional commit 风格，常见 scope 如 `data`、`theme`、`components`。
- commit message 使用中文，但保持 `feat:`、`fix:`、`docs:`、`chore:` 等前缀。
- commit 时需要将内容适当分组提交，禁止过度拆分。
- 命令不允许使用 `-f` / `--force`，否则会造成不可逆的数据丢失！

### workspace

复杂的任务优先在独立的 worktree 中进行。

- 工作空间：`.worktrees/*`
- 分支名称：`worktrees/{feature}`
- workspace 分支的任务完成后立即 commit, 并通过 Ask User 工具询问是否合并到主分支，合并时需要压缩 commit 为一条记录。
