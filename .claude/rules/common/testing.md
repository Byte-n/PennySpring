# Testing Requirements

- 最低覆盖率 80%；关键用户流需 E2E 覆盖。
- 默认只断言用户可感知行为；按 AAA（Arrange-Act-Assert）组织。
- 测试名直接描述被验证行为，例如 `returns empty array when no markets match query`。
- 缺陷修复时，新增用例只覆盖此前未被保护的行为；原有正确用例须按原行为继续通过，禁止为迁就实现反向改测试。

## TDD（`packages/**` 强制）

1. **RED**：先写失败测试。
2. **GREEN**：最小改动使其通过，不附带无关重构或范围扩张。
3. **REFACTOR**：全绿后清理，再重跑相关 workspace 测试确保无回归。

豁免 TDD 与新增测试（仍需完成后 `yarn test` 全绿）：

- `packages/pennyspring-ui/examples/` 的修改（预览/样例，不进入产物行为）。
- 文档、依赖/工程化配置、静态资产新增或替换。
- 删除类「减」任务：同步移除被删行为关联的测试；剩余用例须全部通过。
- lint、typecheck

## 失败排查

- 先定位真因（实现 / 用例 / 环境），再做最小修改。
- 修正实现而非测试，除非测试本身写错；不得借修 bug 之名改动原需求逻辑或增减预期行为。
