## Purpose

Define the app home screen composition, its production tabs, and the navigation integration needed to render it at launch.
## Requirements
### Requirement: HomeScreen uses TopTabNavigator with two tabs
The production home experience SHALL render a `TopTabNavigator` with two business screens: `DetailTab` (label: '明细') and `ChartTab` (label: '图表'). The production home tab registration SHALL be owned by a navigation module outside `HomeScreen`.

#### Scenario: Renders two production tabs
- **WHEN** the production home tabs mount
- **THEN** they SHALL display a TopTabNavigator with tabs labeled '明细' and '图表'

#### Scenario: HomeScreen does not own tab registration
- **WHEN** HomeScreen renders
- **THEN** it SHALL NOT define the production tab screen registration array

#### Scenario: Production tabs exclude preview screens
- **WHEN** the production home tabs mount
- **THEN** they SHALL NOT display theme preview or text preview tabs

### Requirement: DetailTab and ChartTab are placeholder components
DetailTab and ChartTab SHALL be minimal placeholder screen components that render identifiable content. Each SHALL be independently scrollable.

#### Scenario: Placeholder content renders
- **WHEN** user views the Detail tab
- **THEN** it SHALL display placeholder content identifying it as the Detail tab

#### Scenario: Placeholder content for Chart tab
- **WHEN** user switches to the Chart tab
- **THEN** it SHALL display placeholder content identifying it as the Chart tab

### Requirement: App.tsx integrates NavigationContainer and NativeStack
App.tsx SHALL wrap the app in the existing global providers and delegate `NavigationContainer` and `NativeStack.Navigator` rendering to `src/navigation`. HomeScreen SHALL remain reachable as the root production route with `headerShown: false`.

#### Scenario: App renders navigation structure
- **WHEN** the app launches
- **THEN** it SHALL render `SafeAreaProvider` → `ThemeProvider` → navigation entry point from `src/navigation`

#### Scenario: Native stack header is hidden
- **WHEN** HomeScreen is displayed through the root stack
- **THEN** the native stack header SHALL NOT be visible

### Requirement: Components package exports TopTabNavigator
`@pennyspring/component` SHALL export `TopTabNavigator` and its types from the package entry point. `package.json` SHALL declare `@react-navigation/material-top-tabs`, `react-native-pager-view`, and `react-native-reanimated` as peerDependencies.

#### Scenario: Package exports are available
- **WHEN** a consumer imports `TopTabNavigator` from `@pennyspring/component`
- **THEN** the import SHALL resolve successfully

### Requirement: HomeScreen provides a drawer navigation entry

HomeScreen SHALL render the existing production home tabs inside a controlled `Drawer`. The Drawer SHALL be opened from a left-side menu action in the home header and SHALL contain a selectable `Test Screen` navigation option.

#### Scenario: HomeScreen renders production tabs inside drawer container
- **WHEN** HomeScreen renders
- **THEN** it SHALL still display the production home tabs labeled `明细` and `图表`

#### Scenario: Menu action opens drawer
- **WHEN** the user presses the home header menu action
- **THEN** the Drawer SHALL open

#### Scenario: Drawer close events update state
- **WHEN** the Drawer emits a close event
- **THEN** HomeScreen SHALL update its controlled open state so the Drawer is closed

### Requirement: Home header exposes a left menu action

The home tab header SHALL show an icon-only menu action in its left action slot. The action SHALL use theme-token styles and SHALL expose an accessibility label identifying it as the menu control.

#### Scenario: Menu action is visible
- **WHEN** HomeScreen renders the home tabs
- **THEN** the header SHALL include a visible menu icon button on the left side

#### Scenario: Menu action is accessible
- **WHEN** assistive technology inspects the menu action
- **THEN** the action SHALL be exposed as a button with an accessibility label for opening the menu

### Requirement: Drawer Test option navigates to Test route

The Drawer content SHALL render a `Test Screen` option. Pressing that option SHALL navigate to the root stack Test route and close the Drawer.

#### Scenario: Drawer initially shows Test Screen option
- **WHEN** the Drawer content is displayed
- **THEN** it SHALL show a selectable option labeled `Test Screen`

#### Scenario: Test Screen option requests Test route navigation
- **WHEN** the user presses the `Test Screen` option
- **THEN** HomeScreen SHALL request navigation to the Test root route

#### Scenario: Test Screen option closes drawer
- **WHEN** the user presses the `Test Screen` option
- **THEN** the Drawer SHALL close

### Requirement: Root stack registers Test screen

The root stack navigator SHALL register a Test route that renders the independent Test screen component. The Test route SHALL be separate from HomeScreen local state.

#### Scenario: Test root route is registered
- **WHEN** the root stack navigator mounts
- **THEN** it SHALL register a route named `Test`

#### Scenario: Test route renders independent screen component
- **WHEN** the root stack navigator registers the Test route
- **THEN** it SHALL use the independent Test screen component

### Requirement: Test screen displays previews in tabs

The Test screen SHALL display `ThemePreview` from `@pennyspring/theme` and `TextPreview` from `@pennyspring/component` behind tabs so only one preview category is selected at a time.

#### Scenario: Test screen renders title
- **WHEN** the Test screen is displayed
- **THEN** it SHALL show the title `Test`

#### Scenario: Test screen provides preview tabs
- **WHEN** the Test screen is displayed
- **THEN** it SHALL show tabs labeled `Theme` and `Text`

#### Scenario: Theme tab displays ThemePreview
- **WHEN** the user selects the `Theme` tab
- **THEN** the Test screen SHALL render `ThemePreview`

#### Scenario: Text tab displays TextPreview
- **WHEN** the user selects the `Text` tab
- **THEN** the Test screen SHALL render `TextPreview`

### Requirement: Home drawer preview does not change home tab registration

The Test screen SHALL NOT be registered as a production home tab.

#### Scenario: Test is not a home tab
- **WHEN** the production home tabs mount
- **THEN** they SHALL continue to register only `DetailTab` and `ChartTab`

