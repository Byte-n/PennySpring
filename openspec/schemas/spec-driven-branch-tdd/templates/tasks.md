<!-- apply-strategy
worktree: auto            # auto | required | disabled
baseline: auto            # auto | full | typecheck-only | skip
branch: feature-openspec/<change-id>   # 可选覆盖；必须以 feature-openspec/ 开头
-->

## 0. Worktree & Baseline
<!-- 由 openspec-worktree-setup 执行的固定分组，切勿改名。 -->

- [ ] 0.1 Create isolated branch: `git worktree add ../<repo>-<change-id> -b feature-openspec/<change-id>`
- [ ] 0.2 Baseline green: `yarn && yarn typecheck && yarn test`

## 1. <!-- 任务组名称 -->

- [ ] 1.1 <!-- 任务描述 -->
  ### Files
  <!-- Create / Modify / Test：精确路径（修改时带行号区间） -->
  - Create: `packages/component/src/<Component>/index.tsx`
  - Test: `__tests__/<path>.test.tsx`
  ### Spec Refs
  <!-- 回链本任务实现的场景 -->
  - specs/<capability>/spec.md → Scenario: <name>
  ### Test First (RED)
  <!-- 完整的失败测试代码。禁止占位，禁止 "类似任务 N"。 -->
  ```ts
  // failing test
  ```
  ### Verify
  <!-- GREEN 之后必须 exit 0 的精确命令 -->
  - `yarn test __tests__/<path>.test.tsx`
  - `yarn typecheck`

- [ ] 1.2 <!-- 任务描述 -->
  ### Files
  - Modify: `exact/path/to/existing.ts:L10-L40`
  ### Spec Refs
  - specs/<capability>/spec.md → Scenario: <name>
  ### Test First (RED)
  ```ts
  // failing test
  ```
  ### Verify
  - `yarn test exact/path/to/existing`

## 2. <!-- 任务组名称 -->

- [ ] 2.1 <!-- 任务描述 -->
  ### Files
  - ...
  ### Spec Refs
  - ...
  ### Test First (RED)
  ```ts
  ```
  ### Verify
  - ...

<!--
  非 feature 示例（mode 豁免 RED）。若不需要请删除。

- [ ] 2.2 Remove deprecated <OldButton> [mode: removal]
  ### Files
  - Delete: `packages/component/src/OldButton/`
  - Remove: `__tests__/OldButton.test.tsx`
  ### Spec Refs
  - specs/button-component/spec.md → Requirement: single Button component
  ### Verify
  - `yarn test`
  - `yarn typecheck`
  - `rg -n "OldButton" src packages` (expect no matches)

- [ ] 2.3 Update usage doc for new API [mode: docs]
  ### Files
  - Modify: `docs/newComponent/picker.md`
  ### Verify
  - `yarn lint docs/newComponent/picker.md`

- [ ] 2.4 Add preview page for <Badge> [mode: preview]
  ### Files
  - Create: `packages/component-preview/src/Badge/index.tsx`
  ### Verify
  - `yarn typecheck`
-->

## N. Pre-Merge Verification
<!-- 由 openspec-pre-merge-verify 执行的固定分组，保持为最后一组。 -->

- [ ] N.1 Full suite: `yarn test && yarn typecheck && yarn lint`
- [ ] N.2 Run openspec-verify-change and export `.verification-report.md`
- [ ] N.3 Pick Merge / Open PR / Keep / Discard via openspec-finish-branch
