## ADDED Requirements

### Requirement: Avatar renders image text icon and empty states
Avatar SHALL render a single visual identity surface using the priority image, text, icon, empty. Image SHALL be shown when `src` is present and has not errored. Text SHALL be shown when image is absent or errored and trimmed text is non-empty. Icon SHALL be shown when image and text are unavailable. Empty state SHALL render only the token-driven surface.

#### Scenario: Image has highest priority
- **WHEN** Avatar receives `src`, `text`, and `icon`
- **THEN** it renders the image and does not render the text or icon content

#### Scenario: Text falls back after missing image
- **WHEN** Avatar receives text without a usable image
- **THEN** it renders the first character of the trimmed text

#### Scenario: Icon falls back after missing image and text
- **WHEN** Avatar receives icon without a usable image or non-empty text
- **THEN** it renders the icon content

### Requirement: Avatar handles image error fallback
Avatar SHALL record image load failure, call the caller `onError`, and stop rendering the failed image until `src` changes. After failure it SHALL fall back to text first, then icon.

#### Scenario: Failed image falls back to text
- **WHEN** the rendered image triggers `onError` and Avatar has text
- **THEN** Avatar calls `onError`, hides the image, and renders formatted text

#### Scenario: Source change resets image error
- **WHEN** Avatar previously fell back because one `src` errored and then receives a different `src`
- **THEN** Avatar attempts to render the new image again

### Requirement: Avatar supports size shape disabled and slot styles
Avatar SHALL support `size?: ComponentSize`, `shape?: 'circle' | 'square'`, `disabled?: boolean`, `style`, and documented `styles` slots. Size and visual state styles MUST be token-driven through `createUseSheetStyle`. Circle shape SHALL use fully rounded dimensions; square shape SHALL use token radius.

#### Scenario: Size maps to stable dimensions
- **WHEN** Avatar is rendered with small, normal, and large sizes
- **THEN** each rendered root uses the corresponding token-derived stable width and height

#### Scenario: Shape changes border radius
- **WHEN** Avatar is rendered with `shape="square"`
- **THEN** it uses square avatar token radius rather than circular radius

#### Scenario: Disabled applies weak visual state
- **WHEN** Avatar is rendered with `disabled`
- **THEN** it applies disabled root styling and any `styles.rootDisabled` override

### Requirement: Avatar Group renders visible items and rest count
Avatar.Group SHALL render data-driven avatar items from `items`, pass group size to items without explicit size, preserve item explicit size, normalize `maxCount` to a positive integer, and render a rest count only when hidden item count is greater than zero.

#### Scenario: Group limits visible avatars and shows rest count
- **WHEN** Avatar.Group receives more items than `maxCount`
- **THEN** it renders the first `maxCount` avatars and a `+N` rest count for hidden items

#### Scenario: Invalid maxCount uses default
- **WHEN** Avatar.Group receives a non-positive, non-integer, NaN, or Infinity `maxCount`
- **THEN** it falls back to the default visible count

#### Scenario: Item size overrides group size
- **WHEN** Avatar.Group has a group size and an item has its own size
- **THEN** that item uses its own size while other items use the group size
