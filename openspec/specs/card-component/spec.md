# card-component Specification

## Purpose

提供基础信息容器组件，负责 Card 的标题区、主体区、底部区、点击状态、加载状态、尺寸变体和样式覆盖。

## Requirements

### Requirement: Card renders structured content regions

The component library SHALL provide a `Card` component that renders a token-driven information container with optional Header, required Body container, and optional Footer regions.

#### Scenario: Header body and footer content render in order

- **WHEN** `Card` receives `title`, `extra`, `children`, and `footer`
- **THEN** it renders title content before extra content, body content after the header, and footer content after the body

#### Scenario: Card has no built-in outer margin

- **WHEN** `Card` renders with default props
- **THEN** the root token style does not define outer margin

### Requirement: Card handles primitive and custom titles

The component SHALL render `string` and `number` titles with the component library `Text` and SHALL leave custom ReactNode titles under caller control.

#### Scenario: Primitive title uses internal Text

- **WHEN** `Card` receives a `string` or `number` title and a `styles.title` override
- **THEN** it renders the title through internal `Text` and applies the title style override

#### Scenario: Custom title is rendered directly

- **WHEN** `Card` receives a custom ReactNode title and a `styles.title` override
- **THEN** it renders the custom title node without applying `styles.title` to that node

### Requirement: Card supports interactive root states

The component SHALL use a `Pressable` root when `onPress` is provided and SHALL only invoke `onPress` when the card is not disabled and not loading.

#### Scenario: Pressable root invokes onPress when interactive

- **WHEN** `Card` receives `onPress` and neither `disabled` nor `loading` is true
- **THEN** it renders a `Pressable` root and invokes `onPress` when pressed

#### Scenario: Disabled card blocks press and uses disabled style

- **WHEN** `Card` receives `onPress` and `disabled` is true
- **THEN** it keeps a `Pressable` root, does not invoke `onPress`, and applies disabled root styling

#### Scenario: Loading card blocks press and suppresses pressed style

- **WHEN** `Card` receives `onPress` and `loading` is true
- **THEN** it keeps a `Pressable` root, does not invoke `onPress`, and does not apply pressed root styling

### Requirement: Card supports loading body replacement

The component SHALL replace body content with `loadingNode` only when `loading` is true and `loadingNode` exists.

#### Scenario: Loading node replaces children

- **WHEN** `Card` receives `loading`, `loadingNode`, and `children`
- **THEN** Body renders `loadingNode` instead of `children`

#### Scenario: Loading without loadingNode keeps children

- **WHEN** `Card` receives `loading` and `children` but no `loadingNode`
- **THEN** Body renders `children` and applies loading body styling

### Requirement: Card maps size and variant through tokens

The component SHALL support `small`, `normal`, and `large` sizes and `plain`, `elevated`, and `summary` variants using `AliasToken`-derived styles.

#### Scenario: Size changes card density

- **WHEN** `Card` renders with each supported size
- **THEN** root padding and content spacing reflect the selected size

#### Scenario: Variant changes token-driven root visual style

- **WHEN** `Card` renders with each supported variant
- **THEN** root background, border, or shadow styling reflects the selected variant without business-specific colors

### Requirement: Card exposes stable slot style overrides

The component SHALL support `style` for the root and `styles` for declared internal slots only.

#### Scenario: Root and slot styles are merged after token styles

- **WHEN** `Card` receives `style` and slot styles for header, title, extra, body, footer, rootPressed, rootDisabled, and bodyLoading
- **THEN** the supplied styles are applied after token styles for their corresponding slots and states
