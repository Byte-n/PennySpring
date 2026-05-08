# PennySpring 项目宪章

继承至基础项目宪章 [CLAUDE.md](CLAUDE.md)

## 项目规范

- 默认不要求额外的无障碍、可访问性设计或相关属性；除非已有实现依赖、平台强制要求或用户明确指定，不新增 accessibility props。

## `.claude/rules` 使用说明

- 修改或新增任意代码时：遵循 `.claude/rules/common/coding-style.md`
- 编写、修改或补充任意测试时：遵循 `.claude/rules/common/testing.md`
- 修改 `*.ts`、`*.tsx`、`*.js`、`*.jsx` 时：额外遵循 `.claude/rules/typescript/coding-style.md`
- 修改 `packages/component/src/**/*.{ts,tsx}` 时：额外遵循 `.claude/rules/typescript/components.md`
- 修改 `packages/component/src/**/*.{ts,tsx}` 的组件视觉、布局、交互或可访问性时：额外遵循 `.claude/rules/typescript/component-visual-layout.md`
- 为 `*.ts`、`*.tsx`、`*.js`、`*.jsx` 编写或修改测试时：额外遵循 `.claude/rules/typescript/testing.md`
- 修改 `*.swift` 或 `Package.swift` 时：额外遵循 `.claude/rules/swift/coding-style.md`
- 为 `*.swift` 或 Swift Package 编写或修改测试时：额外遵循 `.claude/rules/swift/testing.md`
- 修改 `*.kt`、`*.kts` 时：额外遵循 `.claude/rules/kotlin/coding-style.md`
- 为 `*.kt`、`*.kts` 编写或修改测试时：额外遵循 `.claude/rules/kotlin/testing.md`

## 测试驱动开发说明

- `packages/component-preview/*` 中的修改都不需要测试用例
- 当执行任务为删除、移除已有的代码时，需要移除相关的测试用例。且本次任务不需要编写测试任务，但需要确保已有相关测试用例运行通过。
