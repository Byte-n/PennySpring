## ADDED Requirements

### Requirement: TopTabNavigator renders material-top-tabs with PagerView
TopTabNavigator SHALL create a `MaterialTopTabNavigator` with `swipeEnabled: true` and `lazy: true`, using `react-native-pager-view` as the pager. It SHALL accept a `screens` array and render each as a Tab screen.

#### Scenario: Renders all provided screens as tabs
- **WHEN** TopTabNavigator receives `screens` with entries `[{name: 'A', label: 'A', component: CompA}, {name: 'B', label: 'B', component: CompB}]`
- **THEN** the navigator SHALL render two tab screens named 'A' and 'B'

#### Scenario: Supports swipe gesture between tabs
- **WHEN** user swipes left on the first tab
- **THEN** the navigator SHALL transition to the second tab

### Requirement: HeaderBar renders three-segment layout
HeaderBar SHALL render a row with `leftActions`, `SegmentedControl`, and `rightActions`. It SHALL receive `MaterialTopTabBarProps` from the navigator and pass route/state info to SegmentedControl.

#### Scenario: Renders left and right action slots
- **WHEN** TopTabNavigator receives `leftActions` and `rightActions` ReactNode props
- **THEN** HeaderBar SHALL render them on the left and right sides of the SegmentedControl

#### Scenario: Renders without action slots
- **WHEN** TopTabNavigator receives no `leftActions` or `rightActions`
- **THEN** HeaderBar SHALL render only the SegmentedControl centered in the row

### Requirement: SegmentedControl displays iOS-style segmented tabs
SegmentedControl SHALL render a rounded track with tab labels. The selected tab SHALL have an elevated background indicator. All visual properties SHALL use theme tokens.

#### Scenario: Displays tab labels from routes
- **WHEN** SegmentedControl receives routes from the navigator state
- **THEN** it SHALL render a label for each route using the route's label text

#### Scenario: Highlights selected tab
- **WHEN** the navigator state indicates tab index 1 is selected
- **THEN** the indicator background SHALL be positioned over the second tab label

### Requirement: SegmentedControl animates indicator with Reanimated
The indicator position SHALL animate smoothly using `react-native-reanimated`. During swipe, the indicator SHALL follow the `position` value from tabBar props. During tap navigation, the indicator SHALL animate with `withTiming` using `motionDurationMid` token.

#### Scenario: Indicator follows swipe gesture
- **WHEN** user is mid-swipe between tab 0 and tab 1 at 50% progress
- **THEN** the indicator SHALL be positioned halfway between tab 0 and tab 1

#### Scenario: Indicator animates on tap
- **WHEN** user taps on tab 1 while tab 0 is selected
- **THEN** the indicator SHALL animate from tab 0 position to tab 1 position using `withTiming`

### Requirement: SegmentedControl uses theme tokens for all visual properties
All colors, spacing, border radii, shadows, and font sizes SHALL come from theme tokens. No hardcoded values.

#### Scenario: Token mapping
- **WHEN** SegmentedControl renders
- **THEN** it SHALL use `colorBgLayout` for track background, `colorBgElevated` for indicator, `colorText` for active label, `colorTextTertiary` for inactive label, `borderRadius` for track corners, `borderRadiusSM` for indicator corners, `paddingXXS` for track padding, `paddingSM` for option padding, `controlHeightSM` for height, `fontSize` for label text

### Requirement: TopTabNavigator supports style overrides via slots
TopTabNavigator SHALL accept a `styles` prop of type `TopTabNavigatorStyles` that allows overriding `headerBar`, `segmentedControl`, and `sceneContainer` styles. External styles SHALL be shallow-merged over theme-based defaults.

#### Scenario: Override headerBar container style
- **WHEN** caller passes `styles={{ headerBar: { container: { paddingHorizontal: token.paddingLG } } }}`
- **THEN** the HeaderBar container SHALL apply the override merged with default styles

### Requirement: Types exported from package
All type interfaces (`TopTabNavigatorProps`, `TabScreen`, `TopTabNavigatorStyles`, `HeaderBarStyles`, `SegmentedControlStyles`) SHALL be exported from `@pennyspring/components`.

#### Scenario: Types are importable
- **WHEN** a consumer imports from `@pennyspring/components`
- **THEN** all TopTabNavigator-related types SHALL be available as named exports
