# ConfigProvider 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：3

## 问题列表

### 1. `ComponentConfig` 公共类型使用空对象类型，未形成明确 API 契约

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/ConfigProvider/types.ts:3`
- 违反规范：`CLAUDE.md` 通用工程约束 “导出的函数、共享工具、公共组件 props 必须有明确类型；避免 any”；`.claude/rules/typescript/coding-style.md` “Use types to make public APIs, shared models, and component props explicit, readable, and reusable” 与 “Use interface for object shapes”
- 不符合点：`export type ComponentConfig = {};` 将 `ConfigProviderProps.config` 和 `useComponentConfig()` 的公共数据契约定义为空对象类型。该类型没有声明任何可配置字段，也不是可扩展的具名 `interface` 对象形状；在 TypeScript 中 `{}` 还是过宽的非 nullish 类型，不能阻止调用方把非对象值当作 `config` 传入。
- 影响：`ConfigProvider` 是包级导出的公共 API，当前类型无法表达支持哪些组件配置，也无法为调用方提供有效补全和类型保护；后续新增配置项时容易出现无约束扩展，降低 API 可维护性和类型可信度。
- 推荐纠正方案：把 `ComponentConfig` 改为具名 `interface ComponentConfig`，并显式声明当前支持的配置字段；如果暂时没有任何配置字段，应考虑移除公开 `config` API，或使用更严格的空对象类型并补充类型测试，避免 primitive 值通过类型检查。

### 2. 已公开导出的组件缺少组件目录文档条目

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/index.ts:6`
- 违反规范：`.claude/rules/component/coding-style.md` “新增共享组件，或对现有组件进行重大功能调整时，必须同步新增或修改 ... component-catalog.md 中对应条目”；`.codex/skills/component-composer/references/component-catalog.md:1` 将该文件定义为 PennySpring 组件目录
- 不符合点：`ConfigProvider` 和 `useComponentConfig` 已从包级入口导出，但 `.codex/skills/component-composer/references/component-catalog.md` 以及指定的 `packages/pennyspring-ui/docs/api/index.md`、`packages/pennyspring-ui/docs/index.md` 中没有 `ConfigProvider` 条目或使用说明。
- 影响：`component-composer` 选型目录无法发现全局组件配置能力，调用方也缺少关于它与 `App`、`PortalProvider`、主题 provider 的组合关系说明，容易导致重复封装或错误使用。
- 推荐纠正方案：在组件目录中补充 `ConfigProvider` 的定位、典型使用场景和与 `App config` 的关系；如它属于内部基础设施而非推荐用户直接使用，应在文档中明确边界，避免公共导出和目录描述不一致。

### 3. 测试只使用空配置，未验证配置继承与合并行为

- 严重程度：medium
- 位置：`packages/pennyspring-ui/__tests__/ConfigProvider.test.tsx:29`
- 违反规范：`CLAUDE.md` 测试约束 “测试默认只编写用户可感知的行为断言”；`.claude/rules/common/testing.md` “Test Naming: Use descriptive names that explain the behavior under test” 与 AAA 结构要求
- 不符合点：测试名声明了 “provides config from the config prop” 和 “inherits outer config when nested providers have no config”，但测试输入与期望全都是 `{}`（第 34、40、48、56 行）。这些断言无法区分 provider 是否真的读取了 `config`、是否继承了父级配置，也无法覆盖实现中的对象合并逻辑（`ConfigProvider.tsx:14-17`）。
- 影响：`ConfigProvider` 的核心用户可感知行为没有被有效保护；即使实现忽略 `config` 或错误处理嵌套 provider，当前测试仍可能通过，降低回归测试可信度。
- 推荐纠正方案：先明确 `ComponentConfig` 的真实字段，然后用非空配置覆盖读取、继承和子级覆盖父级的行为；测试应按 Arrange-Act-Assert 组织，并让期望值能证明对应行为实际发生。

## 需要人工确认

- 无
