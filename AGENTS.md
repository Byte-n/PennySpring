# PennySpring 项目宪章

继承至基础项目宪章 [CLAUDE.md](CLAUDE.md)

## 项目规范

- 默认不要求额外的无障碍、可访问性设计或相关属性；除非已有实现依赖、平台强制要求或用户明确指定，不新增 accessibility props。

## `.claude/rules` 使用说明

- 修改或新增任意代码时：遵循 `.claude/rules/common/coding-style.md`
- 编写、修改或补充任意测试时：遵循 `.claude/rules/common/testing.md`
- 修改 `*.ts`、`*.tsx`、`*.js`、`*.jsx` 时：额外遵循 `.claude/rules/typescript/coding-style.md`
- 修改 `packages/component/src/**/*.{ts,tsx}` 时：额外遵循 `.claude/rules/component/components.md`
- 修改 `packages/component/src/**/*.{ts,tsx}` 的组件视觉、布局、交互或可访问性时：额外遵循 `.claude/rules/component/component-visual-layout.md`
- 为 `*.ts`、`*.tsx`、`*.js`、`*.jsx` 编写或修改测试时：额外遵循 `.claude/rules/typescript/testing.md`
- 修改 `*.swift` 或 `Package.swift` 时：额外遵循 `.claude/rules/swift/coding-style.md`
- 为 `*.swift` 或 Swift Package 编写或修改测试时：额外遵循 `.claude/rules/swift/testing.md`
- 修改 `*.kt`、`*.kts` 时：额外遵循 `.claude/rules/kotlin/coding-style.md`
- 为 `*.kt`、`*.kts` 编写或修改测试时：额外遵循 `.claude/rules/kotlin/testing.md`

## TDD 测试驱动开发

本项目所有功能开发与 Bug 修复必须严格遵循 TDD 流程：

1. **RED**：先为新行为或缺陷编写用户可感知的失败测试；结构使用 AAA，命名描述行为（对齐 `CLAUDE.md#Testing` 与 `.claude/rules/common/testing.md`）。
2. **GREEN**：以最小改动使目标测试通过，不附带无关重构或范围扩张。
3. **REFACTOR**：在全部测试通过的前提下清理实现，完成后重跑相关测试。
4. **验证**：对应 workspace 的测试脚本运行，确保无回归。
5. **失败归因与纠偏**：测试失败时先定位真因（实现 / 用例 / 环境），再做最小修改。修复**仅针对缺陷本身纠错**，不得借修 bug 之名改动原需求逻辑、扩大或收窄原定预期行为，避免出现“修 bug 导致需求不符”；修复后原有用例仍应以原行为通过，新增用例仅可覆盖本次缺陷未保护的行为。禁止为迁就实现而反向修改正确测试。

**测试粒度要求**：只断言用户可感知的行为；不要为 props 形状、mock 调用结构、「组件是否 defined」等实现或类型形状编写持久用例。

**以下任务豁免 TDD 流程与新增测试**（仍需在完成后运行 `yarn test`，保证存量用例全绿）：

- `packages/component-preview/**` 的任何修改（预览/样例专用，不进入产物行为）。
- 文档修改。
- `android/**`、`ios/**` 原生工程配置、构建脚本与资源图标等非业务逻辑改动。
- 依赖、项目工程化配置
- 静态资产新增或替换
- 删除、移除等「减」任务：需同步移除被删行为关联的测试；若剩余用例仍覆盖保留行为，必须全部通过。