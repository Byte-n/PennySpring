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

