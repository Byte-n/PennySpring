## ADDED Requirements

### Requirement: Picker public API and exports

The package SHALL provide a `Picker` component for React Native with public props and event types matching the design in `docs/newComponent/picker.md`.

#### Scenario: Component and types are exported
- **Test**: `packages/component/__tests__/Picker.test.tsx::exports Picker component and public types`
- **WHEN** a consumer imports `Picker` and Picker public types from `@pennyspring/component`
- **THEN** the package exports `Picker`, `PickerProps`, `PickerValue`, `PickerColumn`, `PickerColumnItemData`, `PickerStyles`, `PickerOpenChangeParams`, `PickerChangeParams`, `PickerOkParams`, and `PickerCancelParams`.

#### Scenario: Text and node props use paired names
- **Test**: `packages/component/__tests__/Picker.test.tsx::renders paired text and custom node props`
- **WHEN** a consumer passes `titleText`, `cancelText`, `okText`, `loadingIndicatorText`, `emptyText`, `labelText`, or the matching custom node props `title`, `cancel`, `ok`, `loadingIndicator`, `empty`, `label`
- **THEN** the Picker renders the supplied content without using mixed `string | ReactNode` naming or `xxxNode` props.

### Requirement: Open state control

The Picker SHALL support controlled and uncontrolled visible state through `open`, `defaultOpen`, and `onOpenChange`.

#### Scenario: Uncontrolled trigger opens popup
- **Test**: `packages/component/__tests__/Picker.test.tsx::opens from trigger in uncontrolled mode`
- **WHEN** Picker is rendered with `defaultOpen={false}` and the trigger child is pressed
- **THEN** the popup becomes visible
- **AND** `onOpenChange(true, { reason: 'trigger' })` is called.

#### Scenario: Controlled trigger requests open without mutating visibility
- **Test**: `packages/component/__tests__/Picker.test.tsx::requests open in controlled mode`
- **WHEN** Picker is rendered with `open={false}` and the trigger child is pressed
- **THEN** `onOpenChange(true, { reason: 'trigger' })` is called
- **AND** the popup remains hidden until the caller changes `open`.

#### Scenario: External close does not emit internal close events
- **Test**: `packages/component/__tests__/Picker.test.tsx::does not emit cancel or open change for external close`
- **WHEN** Picker is rendered with `open={true}` and then rerendered with `open={false}`
- **THEN** Picker synchronizes visibility
- **AND** it does not call `onCancel`, `onOk`, or `onOpenChange`.

### Requirement: Draft value and main value semantics

The Picker SHALL separate main value from popup draft value through `value/defaultValue/onChange/onOk/onCancel`.

#### Scenario: Opening initializes draft from current main value
- **Test**: `packages/component/__tests__/Picker.test.tsx::initializes draft from current value when opened`
- **WHEN** Picker opens with `value={['b']}`
- **THEN** the item with value `b` is rendered as selected in its column.

#### Scenario: Option selection changes draft only
- **Test**: `packages/component/__tests__/Picker.test.tsx::changes draft value before confirmation`
- **WHEN** an enabled option is pressed while the popup is open
- **THEN** `onChange(nextDraftValue, params)` is called with `columnIndex`, `itemIndex`, `value`, `item`, and `items`
- **AND** `onOk` is not called.

#### Scenario: Uncontrolled main value updates on ok
- **Test**: `packages/component/__tests__/Picker.test.tsx::commits uncontrolled main value on ok`
- **WHEN** Picker is uncontrolled for `value`, an option is selected, and the ok button is pressed
- **THEN** `onOk(draftValue, { items })` is called
- **AND** the internal main value becomes the confirmed draft value for the next open.

#### Scenario: Controlled value resyncs draft while open
- **Test**: `packages/component/__tests__/Picker.test.tsx::resyncs draft when controlled value changes while open`
- **WHEN** Picker is open with a controlled `value` and the caller rerenders it with a different `value`
- **THEN** the selected item reflects the new controlled value.

### Requirement: Picker event order

The Picker SHALL dispatch internal events in the exact order defined by the design document.

#### Scenario: Cancel button closes in documented order
- **Test**: `packages/component/__tests__/Picker.test.tsx::calls cancel then open change for cancel button`
- **WHEN** the cancel button is pressed
- **THEN** `onCancel({ reason: 'cancel' })` is called before `onOpenChange(false, { reason: 'cancel' })`.

#### Scenario: Mask closes in documented order
- **Test**: `packages/component/__tests__/Picker.test.tsx::calls cancel then open change for mask press`
- **WHEN** the popup mask is pressed
- **THEN** `onCancel({ reason: 'mask' })` is called before `onOpenChange(false, { reason: 'mask' })`.

#### Scenario: Ok closes in documented order
- **Test**: `packages/component/__tests__/Picker.test.tsx::calls ok then open change for ok button`
- **WHEN** the ok button is pressed
- **THEN** `onOk(draftValue, { items })` is called before `onOpenChange(false, { reason: 'ok' })`
- **AND** `onCancel` is not called.

### Requirement: Columns and wheel interaction

The Picker SHALL render multiple independent columns and update draft selection from each column without business cascade logic.

#### Scenario: Multiple columns update only selected column value
- **Test**: `packages/component/__tests__/Picker.test.tsx::updates one column without cascading other columns`
- **WHEN** Picker has two columns and the user selects an item in the second column
- **THEN** `onChange` receives a draft value whose second entry changed
- **AND** the first entry remains unchanged.

#### Scenario: Disabled items cannot become new user selection
- **Test**: `packages/component/__tests__/Picker.test.tsx::ignores disabled item selection`
- **WHEN** a disabled item is pressed or reached as a scroll target
- **THEN** Picker does not call `onChange`
- **AND** the previous selected value remains selected.

#### Scenario: Readonly allows viewing but prevents changes
- **Test**: `packages/component/__tests__/Picker.test.tsx::opens readonly picker but prevents selection changes`
- **WHEN** Picker is rendered with `readOnly={true}`
- **THEN** the trigger can open the popup
- **AND** pressing options does not call `onChange`.

#### Scenario: Disabled prevents opening and completion
- **Test**: `packages/component/__tests__/Picker.test.tsx::disabled picker blocks trigger and ok`
- **WHEN** Picker is rendered with `disabled={true}`
- **THEN** pressing the trigger does not open the popup
- **AND** pressing ok while controlled open does not call `onOk`.

### Requirement: Empty, loading, and abnormal values

The Picker SHALL provide stable rendering for loading, empty data, empty columns, and abnormal value arrays.

#### Scenario: Global empty state renders for no columns
- **Test**: `packages/component/__tests__/Picker.test.tsx::renders empty state when all columns are empty`
- **WHEN** `columns` is empty or every column has no items
- **THEN** Picker renders `empty` or `emptyText` as the global empty state.

#### Scenario: Empty column renders a column placeholder
- **Test**: `packages/component/__tests__/Picker.test.tsx::renders empty column placeholder without selected value`
- **WHEN** one column is empty and at least one other column has items
- **THEN** Picker renders the empty column area
- **AND** callback `items` for that column is `undefined`.

#### Scenario: Loading renders supplied loading content without disabling behavior
- **Test**: `packages/component/__tests__/Picker.test.tsx::renders loading content without combining disabled state`
- **WHEN** `loading={true}` with loading content props
- **THEN** Picker renders `loadingIndicator` or `loadingIndicatorText`
- **AND** it does not internally combine `loading` with `okDisabled`, `disabled`, or `readOnly`.

#### Scenario: Abnormal values do not auto fallback
- **Test**: `packages/component/__tests__/Picker.test.tsx::does not auto fallback for missing or invalid values`
- **WHEN** `value` is shorter than columns, longer than columns, or contains a value missing from its column
- **THEN** Picker renders only matching selected items
- **AND** it does not auto select the first enabled item.

### Requirement: Styles and non-goals

The Picker SHALL expose style slots only for real internal nodes and SHALL avoid business features excluded by the design document.

#### Scenario: Style slots apply to internal nodes
- **Test**: `packages/component/__tests__/Picker.test.tsx::applies supported style slots`
- **WHEN** a consumer passes `styles` for trigger, popup, mask, panel, header, header buttons, body, view, column, item, selected item, disabled item, indicator, loading, empty, and safe area slots
- **THEN** those styles are applied to the matching rendered nodes.

#### Scenario: Business features are not built into Picker
- **Test**: `packages/component/__tests__/Picker.test.tsx::does not expose imperative business features`
- **WHEN** a consumer uses Picker
- **THEN** the component does not expose imperative `open`, `close`, or `toggle` ref actions
- **AND** it does not produce labels, placeholder text, cascade columns, retry UI, validation, or built-in locale text.
