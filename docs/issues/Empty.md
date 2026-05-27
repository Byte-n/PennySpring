# Empty 组件规范巡检报告

## 结论

- 状态：通过
- 严重程度：medium
- 问题数量：4

## 问题列表

### 1. 插槽类 prop 不支持 `null` 明确关闭默认内容 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Empty/Empty.tsx:82`
- 违反规范：`.claude/rules/component/coding-style.md`「内部渲染节点」
- 不符合点：`message` 与 `icon` 都是插槽类 prop，但实现使用 `??` 回退默认内容：`const resolvedMessage = message ?? messageText ?? DEFAULT_MESSAGE_TEXT`，以及 `{icon ?? <Icon ... />}`。根据规范，`xxx` 插槽为 `null` 时表示调用方明确不渲染该部分，`undefined` 才表示走默认行为。当前 `message={null}` 会继续渲染默认文案，`icon={null}` 会继续渲染默认图标。
- 影响：调用方无法关闭 Empty 的默认图标或默认文案，公共 API 的空值语义与其他组件规范不一致，组合自定义空状态时会出现多余内容。
- 推荐纠正方案：区分 `null` 与 `undefined`。例如 `icon === undefined` 时渲染默认图标，`icon === null` 时不渲染图标；`message === undefined` 时再回退 `messageText` 和默认文案，`message === null` 时不渲染消息区域，并在所有可见内容为 `null` 时同步移除对应外层结构。

### 2. 基础布局使用 `View` 手写等效布局 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Empty/Empty.tsx:3`
- 违反规范：`CLAUDE.md`「组件约束」；`.codex/skills/component-composer/SKILL.md`「工作流程」
- 不符合点：组件直接从 `react-native` 导入 `View`，并在 `root` 上手写 `alignItems`、`justifyContent`、`gap` 等垂直居中布局。项目规范要求界面布局优先使用 `@pennyspring/ui` 中已有布局组件，如 `Row`、`Column`、`Space`、`Spacer`、`Grid`、`GeometryReader`，禁止用 `View` 手写等效布局结构。
- 影响：Empty 的布局行为脱离共享布局组件语义，后续 spacing、size 或布局策略调整时容易与组件库其他空状态、反馈组件不一致。
- 推荐纠正方案：将根部垂直布局改为复用 `Column` 或 `Space` 承载图标与消息；仅在确实无法由布局组件表达的测量或原生容器场景保留 `View`。

### 3. Layout Gap 级别偏移（各偏大一级） ✅

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Empty/Empty.tsx:26`
- 违反规范：`.claude/rules/common/component-visual-layout.md` Layout Gap
- 不符合点：`SIZE_STYLE_MAP` 中 `gap` 使用 `marginXS`（small）、`marginSM`（normal）、`marginMD`（large），比规范的 `marginXXS`（small）、`marginXS`（normal）、`marginSM`（large）各偏大一级。`paddingVertical` 已按 `/ 2` 处理，但 `gap` 级别选择错误。
- 影响：Empty 在不同 size 下的间距比规范预期偏大，与组件库统一的 Layout Gap 映射不一致。
- 推荐纠正方案：将 gap 级别下调一级：small→`marginXXS`、normal→`marginXS`、large→`marginSM`。

### 4. 缺少 Empty 组件测试文件 ✅

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/Empty.test.tsx:1`
- 违反规范：`CLAUDE.md`「测试约束」；`.claude/rules/common/testing.md`「Test Structure (AAA Pattern)」；`.claude/rules/typescript/testing.md`
- 不符合点：指定测试路径 `packages/pennyspring-ui/__tests__/Empty.test.tsx` 不存在，当前 `packages/pennyspring-ui/__tests__/` 下没有 Empty 专属测试。Empty 的默认文案、`messageText`、`message` 节点插槽、`icon` 插槽、`size` 映射、`null` 插槽语义等用户可感知行为缺少测试保护。
- 影响：公共 API 行为和空状态展示容易在后续修改中回归，尤其是默认内容与自定义插槽的优先级、显隐语义无法被自动验证。
- 推荐纠正方案：新增 `Empty.test.tsx`，按 AAA 覆盖默认空状态、文本 prop、节点插槽、`null` 显式不渲染、不同 size 传递到图标和文案等关键用户可感知行为，测试名直接描述被验证行为。

## 需要人工确认

- 无
