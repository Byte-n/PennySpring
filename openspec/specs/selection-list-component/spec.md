# selection-list-component Specification

## Purpose
`SelectionList` provides a reusable option selection field for component package consumers, covering trigger display, popup list content, selected state, search entry, confirmation behavior and component state without embedding business data.

## Requirements

### Requirement: SelectionList Public API
`SelectionList` MUST expose a component, `SelectionList.Popup`, and public types from `packages/component/src/SelectionList/index.ts` and the package root export.

#### Scenario: Importing SelectionList
- **WHEN** a caller imports `SelectionList` and SelectionList types from `@pennyspring/component` or `packages/component/src/SelectionList`
- **THEN** the imports resolve to the component, `Popup` subcomponent, and public type definitions.

### Requirement: Selection Modes
`SelectionList` MUST support `single` and `multiple` selection modes with controlled and uncontrolled values.

#### Scenario: Uncontrolled single selection
- **GIVEN** a single-mode SelectionList with options
- **WHEN** the user opens it and selects an enabled option
- **THEN** the trigger displays the selected option label
- **AND** `onChange` receives the selected primitive value
- **AND** the popup closes.

#### Scenario: Uncontrolled multiple selection
- **GIVEN** a multiple-mode SelectionList with options
- **WHEN** the user selects enabled options
- **THEN** selected options are toggled in an array
- **AND** selected options expose visible structured selected markers
- **AND** the popup remains open until closed or confirmed.

#### Scenario: Controlled value
- **GIVEN** `value` is provided
- **WHEN** the user selects an enabled option
- **THEN** `onChange` is called with the next value
- **AND** displayed selection remains derived from `value`.

### Requirement: Open State
`SelectionList` MUST support controlled and uncontrolled open state.

#### Scenario: Uncontrolled open
- **WHEN** the user presses an interactive trigger
- **THEN** the popup toggles and the trigger exposes expanded accessibility state.

#### Scenario: Controlled open
- **GIVEN** `open` is provided
- **WHEN** the user presses an interactive trigger
- **THEN** `onOpenChange` is called
- **AND** the rendered open state remains derived from `open`.

### Requirement: Options And Groups
`SelectionList` MUST render flat options and grouped options, with groups taking precedence when both are supplied.

#### Scenario: Grouped options
- **GIVEN** grouped options are provided
- **WHEN** the popup is open
- **THEN** group titles and group options are visible.

#### Scenario: Disabled option
- **GIVEN** an option is disabled
- **WHEN** the user presses it
- **THEN** selection does not change
- **AND** the option exposes disabled accessibility state.

### Requirement: Search Entry
`SelectionList` MUST support a searchable entry with controlled and uncontrolled search text.

#### Scenario: Uncontrolled search
- **GIVEN** `searchable` is true
- **WHEN** the user enters search text
- **THEN** the option list is filtered by option text
- **AND** `onSearchChange` receives the entered text.

#### Scenario: Controlled search
- **GIVEN** `searchValue` is provided
- **WHEN** the user enters search text
- **THEN** `onSearchChange` is called
- **AND** the rendered query remains derived from `searchValue`.

### Requirement: Field States
`SelectionList` MUST render label, placeholder, helper, error, disabled, readonly and loading states according to component rules.

#### Scenario: Error text priority
- **GIVEN** `status` is `error` and `errorText` is provided
- **WHEN** helper text is also provided
- **THEN** error text is shown and helper text is hidden.

#### Scenario: Non-interactive states
- **GIVEN** `disabled`, `readonly`, or `loading` is true
- **WHEN** the user presses the trigger or an option
- **THEN** the selection list does not open or change selection.

### Requirement: Popup Subcomponent
`SelectionList.Popup` MUST render reusable bottom popup list content without requiring the default SelectionList trigger.

#### Scenario: Popup content
- **GIVEN** `SelectionList.Popup` is rendered open with options
- **WHEN** the popup is visible
- **THEN** header, option list and footer content are rendered in a bottom slide modal
- **AND** selecting an enabled option reports the selected primitive value.

### Requirement: Style Slots
`SelectionList` and `SelectionList.Popup` MUST support documented `style` and `styles` slots without requiring callers to restyle core behavior.

#### Scenario: Slot style override
- **WHEN** a caller passes documented slot styles
- **THEN** those styles are applied to the corresponding internal elements.
