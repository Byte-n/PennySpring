# PennySpring 项目宪章

读取本文件时，必须立即同步读取 [CLAUDE.md](CLAUDE.md)，并将其作为基础项目宪章继承执行。

## `.claude/rules` 使用说明

- 修改或新增任意代码时：遵循 `.claude/rules/common/coding-style.md`
- 编写、修改或补充任意测试时：遵循 `.claude/rules/common/testing.md`
- 组件视觉、布局、交互或可访问性时遵循 `.claude/rules/component/component-visual-layout.md`
- 修改 `*.ts`、`*.tsx`、`*.js`、`*.jsx` 时：额外遵循 `.claude/rules/typescript/coding-style.md`
- 修改 `packages/pennyspring-ui/src/**/*.{ts,tsx}` 时：额外遵循 `.claude/rules/component/coding-style.md`
- 修改 `packages/data/src/**/*.ts` 时：额外遵循 `.claude/rules/data/coding-style.md`
- 为 `*.ts`、`*.tsx`、`*.js`、`*.jsx` 编写或修改测试时：额外遵循 `.claude/rules/typescript/testing.md`
- 修改 `*.swift` 或 `Package.swift` 时：额外遵循 `.claude/rules/swift/coding-style.md`
- 为 `*.swift` 或 Swift Package 编写或修改测试时：额外遵循 `.claude/rules/swift/testing.md`
- 修改 `*.kt`、`*.kts` 时：额外遵循 `.claude/rules/kotlin/coding-style.md`
- 为 `*.kt`、`*.kts` 编写或修改测试时：额外遵循 `.claude/rules/kotlin/testing.md`

## ‘继承*’ 规则阅读说明

- 加载、阅读 `*.md` 文件时，若遇到 “继承自*” 等描述，你应该立即以读取文档同等优先级加载、阅读引用的内容
