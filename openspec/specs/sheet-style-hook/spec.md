# sheet-style-hook Specification

## Purpose
TBD - created by archiving change infer-sheet-style-return-types. Update Purpose after archive.
## Requirements
### Requirement: createUseSheetStyle preserves exact style object type
The theme package SHALL provide `createUseSheetStyle` as a hook factory whose returned hook returns the exact style object type inferred from the generator return value. `StylesObject` SHALL be used as a constraint for valid style maps, not as the concrete returned hook type.

#### Scenario: Returned hook preserves style keys
- **WHEN** a developer creates a hook with a generator returning `{ root: { flex: 1 }, title: { fontSize: token.fontSize } }`
- **THEN** the returned hook result type SHALL expose `root` and `title` as known properties
- **AND** accessing an undeclared property on the hook result SHALL be a TypeScript error

#### Scenario: Returned hook preserves key-specific value types
- **WHEN** a developer reads `styles.root` from a hook whose generator returned a `root` style object
- **THEN** `styles.root` SHALL have the inferred type of the returned `root` value
- **AND** `styles.root` SHALL NOT be widened to the full `SheetStyle` union solely because it came from `createUseSheetStyle`

### Requirement: createUseSheetStyle validates generated style maps
The generator return type SHALL be constrained to `StylesObject`, where each value is assignable to `ViewStyle`, `TextStyle`, or `ImageStyle`.

#### Scenario: Invalid style value is rejected
- **WHEN** a generator returns a style map containing a value that is not assignable to `ViewStyle`, `TextStyle`, or `ImageStyle`
- **THEN** TypeScript SHALL reject the call to `createUseSheetStyle`

#### Scenario: Valid style map keeps inferred shape
- **WHEN** a generator returns a valid React Native style map
- **THEN** TypeScript SHALL accept the call
- **AND** the returned hook SHALL preserve the inferred key and value types from that style map

### Requirement: createUseSheetStyle supports generators without options
The hook factory SHALL support generators that accept only `tokens: AliasToken`. The returned hook for such generators SHALL require no options argument.

#### Scenario: No-options hook invocation
- **WHEN** a developer calls `createUseSheetStyle((token) => ({ root: { flex: 1 } }))`
- **THEN** the produced hook SHALL be callable with no arguments
- **AND** the produced hook SHALL return the inferred style object type

### Requirement: createUseSheetStyle supports typed options
The hook factory SHALL support generators that accept `tokens: AliasToken` and a typed options parameter. The returned hook for such generators SHALL require an options argument of the inferred options type.

#### Scenario: Options hook invocation
- **WHEN** a developer calls `createUseSheetStyle((token, selected: boolean) => ({ root: { opacity: selected ? 1 : 0.5 } }))`
- **THEN** the produced hook SHALL require a boolean argument
- **AND** the produced hook SHALL return the inferred style object type

#### Scenario: Object options hook invocation
- **WHEN** a developer calls `createUseSheetStyle((token, options: { size: number }) => ({ root: { width: options.size } }))`
- **THEN** the produced hook SHALL require an options object with a `size` number
- **AND** the produced hook result SHALL preserve the `root` key and its inferred value type

### Requirement: createUseSheetStyle runtime behavior remains unchanged
The produced hook SHALL read `token` from `useTheme()` and memoize the generated style object with React `useMemo()`.

#### Scenario: Generator receives current token and options
- **WHEN** a produced hook is invoked with options
- **THEN** the generator SHALL receive the current `AliasToken` from `useTheme()`
- **AND** the generator SHALL receive the provided options value

#### Scenario: Style result is memoized
- **WHEN** the theme token and options dependencies are unchanged across renders
- **THEN** the produced hook SHALL reuse the memoized style object according to React `useMemo()` behavior

