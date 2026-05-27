# Portal 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：low
- 问题数量：1

## 问题列表

### 1. PortalProvider 根浮层容器暴露无语义硬编码 id

- 严重程度：low
- 位置：`packages/pennyspring-ui/src/Portal/Portal.tsx:86`
- 违反规范：`CLAUDE.md` 通用工程约束 “生产代码不保留 console.log” 所属的生产代码清洁约束、`.claude/rules/common/coding-style.md` “No hardcoded values (use constants or config)”
- 不符合点：`PortalProvider` 渲染浮层承载视图时写入了 `<View id='aaaaaaaa' ...>`。该字符串没有语义命名，也未通过常量解释用途，表现为调试残留或临时标识；Portal 是共享基础组件，运行时视图树不应暴露这种无业务、无测试、无文档说明的硬编码值。
- 影响：会污染 Portal 的公开运行时结构，增加测试、调试和 react-native-web 输出中的噪音；如果调用方或文档工具误依赖该 id，会形成不可维护的隐式 API。
- 推荐纠正方案：移除该 `id`。若确实需要稳定定位能力，应使用有语义的内部常量或正式公开的测试/定位 prop，并补充类型、文档和测试说明。

## 需要人工确认

- 无
