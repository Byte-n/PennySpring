## ADDED Requirements

### Requirement: HomeScreen uses TopTabNavigator with two tabs
HomeScreen SHALL render a `TopTabNavigator` with two screens: `Detail` (label: '明细') and `Chart` (label: '图表').

#### Scenario: Renders two tabs
- **WHEN** HomeScreen mounts
- **THEN** it SHALL display a TopTabNavigator with tabs labeled '明细' and '图表'

### Requirement: DetailTab and ChartTab are placeholder components
DetailTab and ChartTab SHALL be minimal placeholder components that render identifiable content. Each SHALL be independently scrollable.

#### Scenario: Placeholder content renders
- **WHEN** user views the Detail tab
- **THEN** it SHALL display placeholder content identifying it as the Detail tab

#### Scenario: Placeholder content for Chart tab
- **WHEN** user switches to the Chart tab
- **THEN** it SHALL display placeholder content identifying it as the Chart tab

### Requirement: App.tsx integrates NavigationContainer and NativeStack
App.tsx SHALL wrap the app in `NavigationContainer` with a `NativeStack.Navigator`. HomeScreen SHALL be the sole screen with `headerShown: false`.

#### Scenario: App renders navigation structure
- **WHEN** the app launches
- **THEN** it SHALL render `SafeAreaProvider` → `ThemeProvider` → `NavigationContainer` → `NativeStack.Navigator` → `HomeScreen`

#### Scenario: Native stack header is hidden
- **WHEN** HomeScreen is displayed
- **THEN** the native stack header SHALL NOT be visible

### Requirement: Components package exports TopTabNavigator
`@pennyspring/components` SHALL export `TopTabNavigator` and its types from the package entry point. `package.json` SHALL declare `@react-navigation/material-top-tabs`, `react-native-pager-view`, and `react-native-reanimated` as peerDependencies.

#### Scenario: Package exports are available
- **WHEN** a consumer imports `TopTabNavigator` from `@pennyspring/components`
- **THEN** the import SHALL resolve successfully
