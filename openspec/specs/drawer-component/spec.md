# drawer-component Specification

## Purpose
TBD - created by archiving change add-component-drawer-portal. Update Purpose after archive.
## Requirements
### Requirement: Drawer wraps react-native drawer layout
The component package SHALL provide a `Drawer` component that composes `react-native-drawer-layout` while preserving controlled open and close behavior.

#### Scenario: Controlled drawer receives open state
- **WHEN** business code renders `Drawer` with `open`, `onOpen`, and `onClose`
- **THEN** those values are passed to the underlying drawer layout component

#### Scenario: Drawer renders supplied content and children
- **WHEN** business code provides `renderDrawerContent` and `children`
- **THEN** the drawer renders both the drawer content and the main children

### Requirement: Drawer provides themed defaults
The `Drawer` component SHALL apply default drawer surface and overlay mask styling from theme tokens.

#### Scenario: Drawer uses tokenized surface defaults
- **WHEN** `Drawer` renders
- **THEN** its drawer surface uses token-derived background color and padding

#### Scenario: Drawer uses tokenized overlay defaults
- **WHEN** `Drawer` renders
- **THEN** its overlay uses a token-derived mask background color

#### Scenario: Drawer responds to theme changes
- **WHEN** the active theme token values change
- **THEN** the drawer surface and overlay mask styles update from the new token values

### Requirement: Drawer supports configurable width
The `Drawer` component SHALL accept `width?: string | number` and use it for the drawer surface width.

#### Scenario: Numeric width is applied
- **WHEN** `Drawer` receives a numeric `width`
- **THEN** the underlying drawer style uses that number as its width

#### Scenario: String width is applied
- **WHEN** `Drawer` receives a string `width`
- **THEN** the underlying drawer style uses that string as its width

#### Scenario: Default width is applied
- **WHEN** `Drawer` receives no `width`
- **THEN** the underlying drawer style uses `70%` as the component default width

### Requirement: Drawer exposes semantic style slots
The `Drawer` component SHALL expose style customization through a `styles` prop instead of raw third-party style prop names.

#### Scenario: Drawer style slot is applied
- **WHEN** business code provides `styles.drawer`
- **THEN** the underlying drawer style merges it after the token-derived drawer defaults

#### Scenario: Overlay style slot is applied
- **WHEN** business code provides `styles.overlay`
- **THEN** the underlying overlay style merges it after the token-derived overlay defaults

#### Scenario: Container style slot is applied
- **WHEN** business code provides `styles.container`
- **THEN** the underlying drawer layout container receives that style

