# list-collapse-component Specification

## Purpose
TBD - created by archiving change add-list-collapse-component. Update Purpose after archive.
## Requirements
### Requirement: ListCollapse toggles content

`ListCollapse` SHALL render a pressable header and conditionally render content based on controlled or uncontrolled expanded state.

#### Scenario: Uncontrolled header press toggles content

- **WHEN** an uncontrolled `ListCollapse` header is pressed
- **THEN** it toggles content visibility and calls `onExpandedChange`

#### Scenario: Controlled header press only reports next state

- **WHEN** `expanded` is provided and the header is pressed
- **THEN** `ListCollapse` calls `onExpandedChange` with the next state without mutating internal visibility

### Requirement: ListCollapse blocks non-interactive states

`ListCollapse` SHALL prevent expansion changes when disabled, readonly, or loading.

#### Scenario: Disabled readonly and loading block toggles

- **WHEN** `disabled`, `readonly`, or `loading` is true
- **THEN** pressing the header does not call `onExpandedChange` and does not toggle content

### Requirement: ListCollapse exposes header and content semantics

`ListCollapse` SHALL expose button semantics, expanded/disabled state, token-driven styles, and documented slot style overrides.

#### Scenario: Header exposes accessibility state

- **WHEN** `ListCollapse` renders
- **THEN** its header has button role and expanded/disabled accessibility state

