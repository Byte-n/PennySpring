## ADDED Requirements

### Requirement: Text component renders with size-based font tokens
The `Text` component SHALL accept a `size` prop that maps to the corresponding `fontSize` and pixel `lineHeight` tokens from the theme. The component SHALL use `createUseSheetStyle` to build styles. The component SHALL set `fontFamily` to `token.fontFamily` and `color` to `token.colorText` by default. If no `weight` prop is provided, the component SHALL derive the default `fontWeight` from `size`.

#### Scenario: Default size renders base font
- **WHEN** `<Text>` is rendered without a `size` prop
- **THEN** the component SHALL use `token.fontSize` (16px default) for `fontSize` and `token.lineHeight` (pixel value) for `lineHeight`

#### Scenario: Small size
- **WHEN** `<Text size="sm">` is rendered
- **THEN** the component SHALL use `token.fontSizeSM` for `fontSize` and `token.lineHeightSM` for `lineHeight`

#### Scenario: Large size
- **WHEN** `<Text size="lg">` is rendered
- **THEN** the component SHALL use `token.fontSizeLG` for `fontSize` and `token.lineHeightLG` for `lineHeight`

#### Scenario: Extra large size
- **WHEN** `<Text size="xl">` is rendered
- **THEN** the component SHALL use `token.fontSizeXL` for `fontSize` and `token.lineHeightXL` for `lineHeight`

#### Scenario: Heading sizes
- **WHEN** `<Text size="h1">` through `<Text size="h5">` is rendered
- **THEN** the component SHALL use `token.fontSizeHeading1`–`token.fontSizeHeading5` for `fontSize` and `token.lineHeightHeading1`–`token.lineHeightHeading5` for `lineHeight`

### Requirement: Text component renders with weight-based font tokens
The `Text` component SHALL accept a `weight` prop that maps semantic short names to theme font weight tokens. If no `weight` prop is provided, the component SHALL use `token.fontWeightRegular` for body sizes (`sm`, `md`, `lg`, `xl`) and `token.fontWeightStrong` for heading sizes (`h1`, `h2`, `h3`, `h4`, `h5`).

#### Scenario: Default body weight renders regular font weight
- **WHEN** `<Text size="md">` is rendered without a `weight` prop
- **THEN** the component SHALL use `token.fontWeightRegular` for `fontWeight`

#### Scenario: Default heading weight renders strong font weight
- **WHEN** `<Text size="h2">` is rendered without a `weight` prop
- **THEN** the component SHALL use `token.fontWeightStrong` for `fontWeight`

#### Scenario: Explicit weight overrides size-derived default
- **WHEN** `<Text size="h2" weight="regular">` is rendered
- **THEN** the component SHALL use `token.fontWeightRegular` for `fontWeight`

#### Scenario: Light weight
- **WHEN** `<Text weight="light">` is rendered
- **THEN** the component SHALL use `token.fontWeightLight` for `fontWeight`

#### Scenario: Regular weight
- **WHEN** `<Text weight="regular">` is rendered
- **THEN** the component SHALL use `token.fontWeightRegular` for `fontWeight`

#### Scenario: Medium weight
- **WHEN** `<Text weight="medium">` is rendered
- **THEN** the component SHALL use `token.fontWeightMedium` for `fontWeight`

#### Scenario: Semi-bold weight
- **WHEN** `<Text weight="semibold">` is rendered
- **THEN** the component SHALL use `token.fontWeightSemiBold` for `fontWeight`

#### Scenario: Bold weight
- **WHEN** `<Text weight="bold">` is rendered
- **THEN** the component SHALL use `token.fontWeightBold` for `fontWeight`

#### Scenario: Strong weight
- **WHEN** `<Text weight="strong">` is rendered
- **THEN** the component SHALL use `token.fontWeightStrong` for `fontWeight`

### Requirement: Text component renders with text color tokens
The `Text` component SHALL accept a `color` prop that maps semantic short names to every `colorText*` token available through AliasToken. If no `color` prop is provided, the component SHALL use `token.colorText`.

#### Scenario: Default color renders base text color
- **WHEN** `<Text>` is rendered without a `color` prop
- **THEN** the component SHALL use `token.colorText` for `color`

#### Scenario: Base text color
- **WHEN** `<Text color="base">` is rendered
- **THEN** the component SHALL use `token.colorTextBase` for `color`

#### Scenario: Secondary text color
- **WHEN** `<Text color="secondary">` is rendered
- **THEN** the component SHALL use `token.colorTextSecondary` for `color`

#### Scenario: Tertiary text color
- **WHEN** `<Text color="tertiary">` is rendered
- **THEN** the component SHALL use `token.colorTextTertiary` for `color`

#### Scenario: Quaternary text color
- **WHEN** `<Text color="quaternary">` is rendered
- **THEN** the component SHALL use `token.colorTextQuaternary` for `color`

#### Scenario: Heading text color
- **WHEN** `<Text color="heading">` is rendered
- **THEN** the component SHALL use `token.colorTextHeading` for `color`

#### Scenario: Label text color
- **WHEN** `<Text color="label">` is rendered
- **THEN** the component SHALL use `token.colorTextLabel` for `color`

#### Scenario: Description text color
- **WHEN** `<Text color="description">` is rendered
- **THEN** the component SHALL use `token.colorTextDescription` for `color`

#### Scenario: Disabled text color
- **WHEN** `<Text color="disabled">` is rendered
- **THEN** the component SHALL use `token.colorTextDisabled` for `color`

#### Scenario: Placeholder text color
- **WHEN** `<Text color="placeholder">` is rendered
- **THEN** the component SHALL use `token.colorTextPlaceholder` for `color`

#### Scenario: Light solid text color
- **WHEN** `<Text color="lightSolid">` is rendered
- **THEN** the component SHALL use `token.colorTextLightSolid` for `color`

### Requirement: Text component forwards native Text props
The `Text` component SHALL accept all standard React Native `Text` props (such as `numberOfLines`, `onPress`, `ellipsizeMode`, `selectable`, `accessibilityLabel`, etc.) and forward them to the underlying RN `Text` via rest spread.

#### Scenario: numberOfLines is forwarded
- **WHEN** `<Text size="md" numberOfLines={2}>` is rendered
- **THEN** the underlying RN `Text` SHALL receive `numberOfLines={2}`

#### Scenario: onPress is forwarded
- **WHEN** `<Text size="md" onPress={handler}>` is rendered
- **THEN** the underlying RN `Text` SHALL receive the `onPress` callback

### Requirement: Text component supports style overrides
The `Text` component SHALL accept the standard React Native `style` prop for external style overrides. The component SHALL merge token-derived styles with user-provided overrides, with user styles taking precedence.

#### Scenario: User overrides fontSize
- **WHEN** `<Text size="md" style={{ fontSize: 20 }}>` is rendered
- **THEN** the final `fontSize` SHALL be 20 (user override wins)

#### Scenario: User provides additional style properties
- **WHEN** `<Text size="md" style={{ color: '#333' }}>` is rendered
- **THEN** the final style SHALL include both token-derived font properties and the user-provided `color`

### Requirement: Text component accepts children
The `Text` component SHALL accept `children` as a prop and render them inside the styled RN `Text`.

#### Scenario: String children
- **WHEN** `<Text size="md">Hello</Text>` is rendered
- **THEN** the text "Hello" SHALL be displayed

#### Scenario: Nested elements
- **WHEN** `<Text size="md"><Text style={{ fontWeight: 'bold' }}>Bold</Text> normal</Text>` is rendered
- **THEN** both nested elements SHALL render correctly
