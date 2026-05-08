## ADDED Requirements

### Requirement: Ellipsis component public API
The `Ellipsis` component SHALL accept `content: string`, `direction?: 'start' | 'end' | 'middle'`, `rows?: number`, `expandText?: ReactNode`, `collapseText?: ReactNode`, `defaultExpanded?: boolean`, `onExpand?: (expanded, info) => void`, `onContentClick?: callback`, `size?: EllipsisSize`, `style`, and `styles`. `EllipsisSize` SHALL be exported as `'small' | 'normal' | 'large'`. The default `direction` SHALL be `'end'`, the default `rows` SHALL be `1`, the default `expandText` and `collapseText` SHALL render no action, the default `defaultExpanded` SHALL be `false`, and the default `size` SHALL be `'normal'`.

#### Scenario: Defaults render collapsed end ellipsis
- **WHEN** `<Ellipsis content="Long text" />` is rendered
- **THEN** the content text SHALL receive `numberOfLines={1}` and `ellipsizeMode="tail"`

#### Scenario: Size type is available
- **WHEN** package consumers import `EllipsisSize`
- **THEN** the exported type SHALL allow `'small'`, `'normal'`, and `'large'`

### Requirement: Native React Native truncation
The `Ellipsis` component SHALL use React Native text truncation instead of DOM measurement. In collapsed state, it SHALL pass the normalized `rows` value to `numberOfLines` and map `direction='end'` to `ellipsizeMode='tail'`, `direction='start'` to `ellipsizeMode='head'`, and `direction='middle'` to `ellipsizeMode='middle'`. In expanded state, it SHALL render the full content without `numberOfLines`.

#### Scenario: Start direction
- **WHEN** `<Ellipsis content="Long text" direction="start" rows={2} />` is rendered collapsed
- **THEN** the content text SHALL receive `numberOfLines={2}` and `ellipsizeMode="head"`

#### Scenario: Middle direction
- **WHEN** `<Ellipsis content="Long text" direction="middle" rows={3} />` is rendered collapsed
- **THEN** the content text SHALL receive `numberOfLines={3}` and `ellipsizeMode="middle"`

#### Scenario: Expanded content
- **WHEN** `<Ellipsis content="Long text" defaultExpanded />` is rendered
- **THEN** the content text SHALL render without a `numberOfLines` limit

#### Scenario: Invalid rows
- **WHEN** `<Ellipsis content="Long text" rows={0} />` is rendered collapsed
- **THEN** the component SHALL fall back to `numberOfLines={1}`

### Requirement: Expand and collapse actions
The `Ellipsis` component SHALL render `expandText` in collapsed state and `collapseText` in expanded state when the corresponding node is not empty. The action node SHALL be wrapped in `Pressable`. Pressing the action SHALL toggle the internal expanded state and invoke `onExpand(nextExpanded, info)` where `info.action` is `'expand'` or `'collapse'`.

#### Scenario: Expand action
- **WHEN** collapsed `<Ellipsis content="Long text" expandText="More" onExpand={handler} />` has its action pressed
- **THEN** the component SHALL render expanded content and call `handler(true, { action: 'expand' })`

#### Scenario: Collapse action
- **WHEN** expanded `<Ellipsis content="Long text" collapseText="Less" defaultExpanded onExpand={handler} />` has its action pressed
- **THEN** the component SHALL render collapsed content and call `handler(false, { action: 'collapse' })`

#### Scenario: Empty action text
- **WHEN** `<Ellipsis content="Long text" />` is rendered without `expandText` or `collapseText`
- **THEN** no action `Pressable` SHALL be rendered

### Requirement: Content click callback
The `Ellipsis` component SHALL call `onContentClick` when the rendered content text is pressed. Pressing the expand or collapse action SHALL NOT call `onContentClick`.

#### Scenario: Content press
- **WHEN** `<Ellipsis content="Long text" onContentClick={handler} />` has its content text pressed
- **THEN** `handler` SHALL be called

#### Scenario: Action press does not call content handler
- **WHEN** `<Ellipsis content="Long text" expandText="More" onContentClick={handler} />` has its action pressed
- **THEN** `handler` SHALL NOT be called

### Requirement: Component styling and exports
The `Ellipsis` component SHALL follow the PennySpring component package pattern with `index.ts`, `types.ts`, an implementation file, and package-level exports. The component SHALL use `createUseSheetStyle` for all default visual styles and SHALL render display text through the package `Text` component.

#### Scenario: Package export
- **WHEN** package consumers import from `@pennyspring/component`
- **THEN** `Ellipsis`, `EllipsisProps`, `EllipsisSize`, `EllipsisStyles`, `EllipsisDirection`, `EllipsisExpandAction`, and `EllipsisExpandInfo` SHALL be exported

#### Scenario: Style slots
- **WHEN** `styles.content`, `styles.action`, `styles.actionText`, or `styles.actionPressed` are provided
- **THEN** the component SHALL merge those slot styles with token-derived defaults for the corresponding internal elements
