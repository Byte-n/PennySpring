# PennySpring 项目宪章

## 项目概览

### Architecture

Monorepo（Yarn workspaces）：根目录是 React Native App，`packages/*` 是内部共享包。

```
packages/pennyspring-theme/ → 设计系统：token、算法、ThemeProvider、createUseSheetStyle
packages/pennyspring-ui/    → 共享 React Native UI 组件与 examples
packages/data/          → Drizzle schema、relations、SQLite runtime、migrations
packages/share/         → 跨包共享工具
__tests__/              → 根应用测试
scripts/                → 本地工具脚本
```

- 数据层路径：`packages/data/src/schema` 定义表，`relations` 定义关联，`runtime/client/createDatabase()` 通过
  op-sqlite connection 创建 Drizzle DB，`runtime/migrations/runMigrations()` 执行打包迁移。
- 数据库表结构的修改不需要走迁移脚本，因为目前此项目应用并为投入正式使用，直接破坏性修改即可。

## 开发命令

### 常用命令

- Metro：`yarn start`
- iOS：`yarn ios`
- Android：`yarn android`
- Tests：`yarn test`
- Lint：`yarn lint`
- Init Codex：`yarn init:codex`
- Clean：`yarn clean`

### 类型与数据

- Type check：`yarn workspace @pennyspring/theme typecheck`，`yarn workspace @pennyspring/ui typecheck`，
  `yarn workspace @pennyspring/data typecheck`，`yarn workspace @pennyspring/share typecheck`
- DB check / generate：`yarn workspace @pennyspring/data db:check`，`yarn workspace @pennyspring/data db:generate`

## 代码规范

### Accessibility

- 不需要支持无障碍、可访问性设计或相关属性

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

## 质量保障

### 代码任务收尾检查

- 涉及代码修改时，`yarn run lint` 与 `yarn run typecheck` 是强制收尾检查，不得省略、跳过；纯文档修改除外。
- 必须在声明完成前执行，且仅当两项结果均无 error 时才允许宣称完成或进入交付。
- 若因环境、依赖、脚本或其他外部因素导致无法执行或未通过，必须明确报告阻塞原因与当前结果；问题消除前不得表述为「已完成」。

## Git / Workspace

- 提交使用 conventional commit 风格，常见 scope 如 `data`、`theme`、`components`。
- commit message 使用中文，保留 `feat:`、`fix:`、`docs:`、`chore:` 等前缀。
- 工作空间 `.worktrees/*`，分支名 `feature/worktrees-*`；分支命令不允许使用 `-f` / `--force`。
- workspace 分支任务完成后立即 commit，并通过 Ask User 工具询问是否合并到主分支；合并时压缩 commit 为一条记录。

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
