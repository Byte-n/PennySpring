# PennySpring 项目宪章

## 项目概览

### Tech Stack

| Layer           | Technology                           | Version           |
|-----------------|--------------------------------------|-------------------|
| Language        | TypeScript                           | ^5.8.3            |
| Framework       | React Native                         | 0.85.2            |
| React           | React                                | 19.2.3            |
| Navigation      | React Navigation                     | ^7.x              |
| Database        | SQLite (`@op-engineering/op-sqlite`) | ^9                |
| ORM             | Drizzle ORM / drizzle-kit            | ^0.38.4 / ^0.30.5 |
| Testing         | Jest + React Native preset           | ^29.6.3           |
| Package Manager | Yarn workspaces                      | -                 |
| Node            | Node.js                              | >= 22.13.0        |

### Architecture

Monorepo（Yarn workspaces）：根目录是 React Native App，`packages/*` 是内部共享包。

```
App.tsx                 → 应用根：SafeArea、StatusBar、ThemeProvider、AppNavigator
index.js                → React Native AppRegistry 入口
src/navigation/         → NavigationContainer、RootStack、HomeTabs、路由常量与类型
src/screens/            → 业务页面
src/constants/          → 业务常量、资产分类、类型图标树
packages/theme/         → 设计系统：token、算法、ThemeProvider、createUseSheetStyle
packages/component/     → 共享 React Native UI 组件
packages/data/          → Drizzle schema、relations、SQLite runtime、migrations
packages/share/         → 跨包共享工具
__tests__/              → 根应用测试
scripts/                → 本地工具脚本
```

### 关键设计约定

- 数据层路径：`packages/data/src/schema` 定义表，`relations` 定义关联，`runtime/client/createDatabase()` 通过
  op-sqlite connection 创建 Drizzle DB，`runtime/migrations/runMigrations()` 执行打包迁移。

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

- Type check：`yarn workspace @pennyspring/theme typecheck`，`yarn workspace @pennyspring/component typecheck`，
  `yarn workspace @pennyspring/data typecheck`，`yarn workspace @pennyspring/share typecheck`
- DB check / generate：`yarn workspace @pennyspring/data db:check`，`yarn workspace @pennyspring/data db:generate`

## 通用工程约束

### Code Style

- 遵循 KISS、DRY、YAGNI；优先小文件、高内聚、低耦合。
- 数据更新保持不可变；禁止隐藏式原地 mutation。
- 导出的函数、共享工具、公共组件 props 必须有明确类型；避免 `any`，外部输入用 `unknown` 后收窄。
- 组件 props 使用命名 `interface XxxProps`，不要默认使用 `React.FC`。
- 文件、变量、函数使用 `camelCase`；类型、接口、组件使用 `PascalCase`；常量使用 `UPPER_SNAKE_CASE`。
- 生产代码不保留 `console.log`。

### Accessibility

- 不需要支持无障碍、可访问性设计或相关属性

## UI / 样式约束

### 样式（React Native）

**唯一构建方式**：`createUseSheetStyle`（来自 `@pennyspring/theme`）。

**禁止**：

- `StyleSheet.create(...)`
- 组件内联 `style={{ ... }}` 字面量对象
- 样式值中的颜色字面量（`'#xxx'`、`'rgb/rgba(...)'`、命名色）
- 样式值中的数字字面量

**唯一例外（数字字面量）**：`0`、`flex: 1`、`'100%'`、`'50%'`、`'transparent'`。

**无合适 token 时**：允许用语义化命名常量或动态计算值作为局部例外，禁止用无关 token 相乘凑数值。

**Token 选择**：必须参考 `theme-tokens` 技能；阴影必须经 `toShadowStyle(...)`；React Native `lineHeight` 用
`token.fontHeight*`（像素），不用 `token.lineHeight*`（倍数）。

**动态样式**：通过 `createUseSheetStyle<TOptions>` 的泛型参数传入，不在调用处拼 `[styles.a, { ... }]`。

**主题注入**：全局 `<ThemeProvider>` 位于应用根；禁止在组件内判断 light/dark 分支，token 已自适配。

### Components

- 共享组件放在 `packages/component/src/<ComponentName>/`，由目录内 `index.ts` 和包级 `src/index.ts` 导出。
- 公共 props 与导出的样式类型放在组件目录的 `types.ts`。
- 优先使用 `@pennyspring/component` 中的组件
- 业务与共享组件中的文本展示统一使用 `@pennyspring/component` 导出的 `Text` 组件；禁止直接使用 `react-native` 的 `Text`
  做展示文本。

### Navigation

- 需要访问导航对象时，统一使用 `src/navigation` 导出的 `useNavigation` 封装 hook。禁止直接从
  `@react-navigation/native` 导入原始 `useNavigation`。

### 动画

- 动画实现仅允许使用 `react-native-reanimated` 实现，禁止使用 React Native 的动画。
- **禁止** 在组件实现中使用 `react-native` 的 `Animated`、`LayoutAnimation`、`Animated.timing/spring/decay`。
- 动画时长、缓动曲线、延迟必须优先使用主题 token（`motionDuration*`、`motionEase*`）；禁止硬编码魔法数。
- 缓动曲线统一使用 `Easing.bezier(...token.motionEase*)`（来自 `react-native-reanimated`），避免不同组件动画手感漂移。
- 进入/退出动画必须成对设计（含 mount/unmount 生命周期），避免只进不出、闪烁或残留占位。

## 测试约束

### Testing

- 最低覆盖率目标为 80%；关键用户流需要 E2E 覆盖，规则建议使用 Playwright。

### 测试用例编写要求

- 测试文件使用 `*.test.ts` / `*.test.tsx`，集中在根 `__tests__/` 或各包 `__tests__/`。
- 按 AAA（Arrange-Act-Assert）组织测试；测试名必须直接描述被验证的行为。
- 测试默认只编写用户可感知的行为断言。
- 缺陷修复场景中，新增用例只能覆盖本次缺陷此前未被保护的行为；原有正确用例必须继续按原行为通过，禁止为迁就实现而反向修改正确测试。

### TDD 测试驱动开发

本项目所有功能开发与 Bug 修复必须严格遵循 TDD 流程：

1. **RED**：先按照“测试用例编写要求”为新行为或缺陷编写失败测试。
2. **GREEN**：以最小改动使目标测试通过，不附带无关重构或范围扩张。
3. **REFACTOR**：在全部测试通过的前提下清理实现，完成后重跑相关测试。
4. **验证**：对应 workspace 的测试脚本运行，确保无回归。
5. **失败归因与纠偏**：测试失败时先定位真因（实现 / 用例 / 环境），再做最小修改。修复**仅针对缺陷本身纠错**，不得借修 bug
   之名改动原需求逻辑、扩大或收窄原定预期行为，避免出现“修 bug
   导致需求不符”。

**以下任务豁免 TDD 流程与新增测试**（仍需在完成后运行 `yarn test`，保证存量用例全绿）：

- `packages/component-preview/**` 的任何修改（预览/样例专用，不进入产物行为）。
- 文档修改。
- `android/**`、`ios/**` 原生工程配置、构建脚本与资源图标等非业务逻辑改动。
- 依赖、项目工程化配置
- 静态资产新增或替换
- 删除、移除等「减」任务：需同步移除被删行为关联的测试；若剩余用例仍覆盖保留行为，必须全部通过。

## 代码任务收尾检查

- 仅涉及代码修改时，`yarn run lint` 与 `yarn run typecheck` 是强制收尾检查，不得省略、不得跳过。
- 代码任务执行完成后、声明完成前，必须先执行 `yarn run lint` 与 `yarn run typecheck`。
- 纯文档修改不需要执行 `yarn run lint` 与 `yarn run typecheck`。
- 仅当上述两项检查结果均无 error 时，才允许宣称代码任务完成或进入交付。
- 若代码任务因环境、依赖、脚本或其他外部因素导致无法执行或未通过，必须明确报告阻塞原因与当前结果；在问题消除前，不得将代码任务表述为“已完成”。

## Git / workspace

- 近期提交使用 conventional commit 风格，常见 scope 如 `data`、`theme`、`components`。
- commit message 使用中文，但保持 `feat:`、`fix:`、`docs:`、`chore:` 等前缀。
- 工作空间：`.worktrees/*`
- 分支名称：`feature/worktrees-*`
- 合并时需要压缩 commit 为一条记录。
- 分支的命令不允许使用 `-f` / `-force` 参数强行执行操作
- workspace 分支的任务完成后立即 commit, 并通过 Ask User 工具询问是否合并到主分支
