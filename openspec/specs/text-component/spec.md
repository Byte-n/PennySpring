## ADDED Requirements

### Requirement: Text component renders with size-based font tokens
The `Text` component SHALL accept a `size` prop that maps to the corresponding `fontSize` and pixel `lineHeight` tokens from the theme. The component SHALL use `createUseSheetStyle` to build styles. The component SHALL set `fontFamily` to `token.fontFamily` and `color` to `token.colorText` by default.

#### Scenario: Default size renders base font
- **WHEN** `<Text>` is rendered without a `size` prop
- **THEN** the component SHALL use `token.fontSize` (16px default) for `fontSize` and `token.lineHeight` (pixel value) for `lineHeight`

#### Scenario: Small size
- **WHEN** `<Text size="sm">` is rendered
- **THEN** the component SHALL use `token.fontSizeSM` for `fontSize` and `token.lineHeightSM` for `lineHeight`

#### Scenario: Large size
- **WHEN** `<Text size="lg">` is rendered
- **THEN** the component SHALL use `token.fontSizeLG` for `fontSize` and `token.lineHeightLG` for `lineHeight`

#### Scenario: Extra large size (computed lineHeight)
- **WHEN** `<Text size="xl">` is rendered
- **THEN** the component SHALL use `token.fontSizeXL` for `fontSize` and `token.lineHeightXL` for `lineHeight`

#### Scenario: Heading sizes (computed lineHeight)
- **WHEN** `<Text size="h1">` through `<Text size="h5">` is rendered
- **THEN** the component SHALL use `token.fontSizeHeading1`–`token.fontSizeHeading5` for `fontSize` and `token.lineHeightHeading1`–`token.lineHeightHeading5` for `lineHeight`

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
