## Requirements

### Requirement: Textarea exposes a multiline text input API
Textarea SHALL render a multiline plain-text input with stable form slots for label, field, input, footer, helper or error text, and count.

#### Scenario: Rendering basic field structure
- **WHEN** a caller renders Textarea with label, placeholder, and helper text
- **THEN** the component renders the label, a multiline TextInput with the placeholder, and the helper text near the field

### Requirement: Textarea supports controlled and uncontrolled values
Textarea SHALL use `value` as the source of truth when provided, and SHALL otherwise track text internally from `defaultValue` and user input.

#### Scenario: Controlled value drives display and count
- **WHEN** Textarea receives `value`, `onChangeText`, and `showCount`
- **THEN** the displayed value and count reflect the controlled `value`, and text changes call `onChangeText`

#### Scenario: Uncontrolled input updates internal text
- **WHEN** Textarea receives `defaultValue` and the user changes text
- **THEN** the component updates the displayed text and count from its internal state

### Requirement: Textarea presents helper, error, status, and required semantics
Textarea SHALL display helper text by default, SHALL display `errorText` instead of helper text when `status` is `error`, and SHALL render required semantics when requested without performing validation.

#### Scenario: Error status prioritizes error text
- **WHEN** Textarea receives `status="error"`, `helperText`, and `errorText`
- **THEN** the component displays the error text and does not display the helper text

#### Scenario: Required label is visible
- **WHEN** Textarea receives `required` and a label
- **THEN** the component renders a required marker adjacent to the label

### Requirement: Textarea supports editable, disabled, readonly, loading, and accessibility states
Textarea SHALL make the input non-editable when `disabled` or `readonly` is true, SHALL expose disabled, busy, and invalid accessibility state when applicable, and SHALL keep readonly visually distinct from disabled.

#### Scenario: Disabled input is not editable
- **WHEN** Textarea receives `disabled`
- **THEN** the TextInput is not editable and its accessibility state includes disabled

#### Scenario: Readonly input is not editable without disabled state
- **WHEN** Textarea receives `readonly`
- **THEN** the TextInput is not editable and its accessibility state does not include disabled

#### Scenario: Loading state is exposed
- **WHEN** Textarea receives `loading`
- **THEN** the component exposes a busy accessibility state and visible loading feedback

### Requirement: Textarea supports row-based height and content size changes
Textarea SHALL use `minRows` and `maxRows` to derive minimum and maximum heights from theme typography and spacing tokens, and SHALL clamp content-driven height within those bounds.

#### Scenario: Content size grows within row bounds
- **WHEN** Textarea receives minRows and maxRows and its content size changes
- **THEN** the field height updates without going below the min row height or above the max row height

### Requirement: Textarea supports count and length display
Textarea SHALL display character count when `showCount` is true and SHALL include `maxLength` when provided without truncating text itself.

#### Scenario: Count displays current length and max length
- **WHEN** Textarea receives `showCount`, text content, and `maxLength`
- **THEN** the count displays the current character count and maximum length

### Requirement: Textarea uses token-driven styles and stable style overrides
Textarea SHALL build default visual styles from `@pennyspring/theme` AliasToken and SHALL only allow root style through `style` and internal slot overrides through `styles`.

#### Scenario: Placeholder color uses theme token
- **WHEN** Textarea renders a placeholder
- **THEN** the TextInput receives `placeholderTextColor` from the current theme token
