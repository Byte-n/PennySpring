# app-navigation-structure Specification

## Purpose
TBD - created by archiving change organize-src-navigation. Update Purpose after archive.
## Requirements
### Requirement: Navigation is centralized under src/navigation
The app routing system SHALL be organized under `src/navigation`. `App.tsx` SHALL render the app-level providers and SHALL delegate navigation rendering to the navigation entry point exported from `src/navigation`.

#### Scenario: App delegates navigation rendering
- **WHEN** the app root renders
- **THEN** `App.tsx` SHALL render the navigation entry point from `src/navigation`
- **AND** `App.tsx` SHALL NOT define route param lists or register screens directly

#### Scenario: Navigation container has a single owner
- **WHEN** the app navigation tree is rendered
- **THEN** `NavigationContainer` SHALL be owned by a navigator module under `src/navigation`

### Requirement: Root stack registration is explicit
The root native stack SHALL be registered explicitly in a root stack navigator module under `src/navigation`. Root stack screens SHALL NOT be registered in screen component files.

#### Scenario: Root Home route is registered
- **WHEN** the root stack navigator renders
- **THEN** it SHALL register a `Home` route
- **AND** the `Home` route SHALL hide the native stack header

#### Scenario: Screen files do not own root registration
- **WHEN** a screen component under `src/screens` is inspected
- **THEN** it SHALL NOT create or export the root native stack navigator

### Requirement: Route names and params are centralized
Route name constants SHALL be defined in `src/navigation/routes.ts`. Navigation param lists and screen prop aliases SHALL be defined in `src/navigation/types.ts`.

#### Scenario: Root stack param list is available
- **WHEN** navigation modules need the root stack param list
- **THEN** they SHALL import it from `src/navigation/types.ts`

#### Scenario: Route names are stable constants
- **WHEN** a navigator registers a route
- **THEN** it SHALL use a route name from `src/navigation/routes.ts`

#### Scenario: Params are serializable and minimal
- **WHEN** a route accepts params
- **THEN** those params SHALL be explicitly typed in the relevant param list
- **AND** they SHALL consist of serializable values such as identifiers, modes, or source flags

### Requirement: Navigation access uses typed wrapper hook
Project code that needs a navigation object SHALL use the typed `useNavigation` hook exported from `src/navigation`. The raw React Navigation `useNavigation` hook SHALL only be called inside `src/navigation/useNavigation.ts`.

#### Scenario: Typed wrapper is exported
- **WHEN** project code imports navigation helpers from `src/navigation`
- **THEN** `useNavigation` SHALL be available as a named export

#### Scenario: Raw hook usage is isolated
- **WHEN** project code is inspected for direct React Navigation `useNavigation` imports
- **THEN** only `src/navigation/useNavigation.ts` SHALL directly import or call the raw hook from `@react-navigation/native`

#### Scenario: Wrapper uses root stack params
- **WHEN** `src/navigation/useNavigation.ts` calls the raw React Navigation hook
- **THEN** it SHALL apply the root stack navigation type derived from `RootStackParamList`

### Requirement: Home tabs are registered by a navigation module
The production home top tabs SHALL be registered in a dedicated home tabs navigator module under `src/navigation`. `HomeScreen` SHALL NOT own the production tab screen array.

#### Scenario: Home tabs navigator registers business tabs
- **WHEN** the home tabs navigator renders
- **THEN** it SHALL register the production home business tabs

#### Scenario: HomeScreen does not define tab registration
- **WHEN** `HomeScreen` renders
- **THEN** it SHALL NOT define the production tab screen registration array

### Requirement: Screens are organized by business area
Screen files SHALL be organized by business area under `src/screens`. Home tab screens SHALL live under `src/screens/home/tabs` and SHALL use a `Screen` suffix.

#### Scenario: Detail tab screen location
- **WHEN** the detail tab screen is implemented
- **THEN** it SHALL be located under `src/screens/home/tabs`
- **AND** its component name SHALL end with `Screen`

#### Scenario: Chart tab screen location
- **WHEN** the chart tab screen is implemented
- **THEN** it SHALL be located under `src/screens/home/tabs`
- **AND** its component name SHALL end with `Screen`

### Requirement: Development previews are separated from production navigation
Preview and demo screens SHALL NOT be registered as production home tabs. If preview screens remain available, they SHALL be organized separately from production home business screens.

#### Scenario: Production home tabs exclude previews
- **WHEN** the production home tabs are registered
- **THEN** they SHALL NOT include theme preview or text preview tabs

#### Scenario: Preview screens have a separate location
- **WHEN** preview screens are exposed by navigation
- **THEN** they SHALL be registered through a dev-only route or placed under a dev-specific screen area

