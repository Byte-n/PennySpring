# portal-component Specification

## Purpose
TBD - created by archiving change add-component-drawer-portal. Update Purpose after archive.
## Requirements
### Requirement: Portal provider renders mounted portal content
The component package SHALL provide a `PortalProvider` that renders content mounted by descendant `Portal` components at the provider layer. The provider layer SHALL include a viewport overlay host that fills the provider area and SHALL render each portal entry inside an entry wrapper that also fills the provider area. The overlay host and entry wrappers MUST use `pointerEvents="box-none"`.

#### Scenario: Portal content appears at provider overlay layer
- **WHEN** a descendant renders `<Portal>` with child content
- **THEN** the child content is rendered by the nearest `PortalProvider` inside an overlay host with `absoluteFill` layout and `pointerEvents="box-none"`

#### Scenario: Portal entry wrapper fills provider viewport
- **WHEN** a descendant renders `<Portal>` with child content
- **THEN** the provider renders that portal entry inside a wrapper with `absoluteFill` layout and `pointerEvents="box-none"`

#### Scenario: Multiple portals render in mount order
- **WHEN** multiple descendant `Portal` components are mounted
- **THEN** the provider renders all mounted portal entries in their mount order

### Requirement: Portal lifecycle follows React component lifecycle
The `Portal` component SHALL update and remove its provider entry as its React lifecycle changes.

#### Scenario: Portal content updates
- **WHEN** a mounted `Portal` receives different children
- **THEN** the provider renders the updated children for that portal entry

#### Scenario: Portal content unmounts
- **WHEN** a mounted `Portal` unmounts
- **THEN** the provider removes that portal entry from the rendered output

### Requirement: Portal requires provider context
The `Portal` component SHALL fail clearly when used without a `PortalProvider`.

#### Scenario: Portal rendered without provider
- **WHEN** `<Portal>` is rendered outside `PortalProvider`
- **THEN** it throws an error describing that a provider is required
