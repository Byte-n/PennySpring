---
paths:
  - "packages/components/src/**/*.ts"
  - "packages/components/src/**/*.tsx"
---
# Components Coding Style

> This file extends [typescript/coding-style.md](coding-style.md) for shared React Native components.

## Public API

- Keep public component props and exported style types in the component directory `types.ts`.
- Define component props with a named `interface XxxProps`.
- Do not expose implementation-only props. Public props should describe component behavior or supported customization points.
- Prefer explicit semantic props for supported variants, states, sizes, and behavior over making callers restyle internals.

## Style Props

- Use `style` only for simple components that render one primary native element or intentionally mirror a React Native primitive API.
- Use `styles?: XxxStyles` only when a component has multiple internal elements whose styles may need independent customization.
- Do not add `styles` preemptively. If there is only one meaningful style target, use `style` or no style override at all.
- Do not mix `styles` with scattered slot props such as `containerStyle`, `labelStyle`, or `iconStyle` on the same component.

## `styles` Shape

- `styles` is a slot-level override object. Each key must map to a stable, documented component slot.
- Slot names should match component structure and use names such as `container`, `content`, `label`, `icon`, `track`, `indicator`, `leftActions`, or `rightActions`.
- Use React Native `StyleProp<ViewStyle | TextStyle | ImageStyle>` as appropriate for each slot.
- Nested components should preserve ownership boundaries by grouping child component styles under the child component name.

```ts
export interface SegmentedControlStyles {
  container?: StyleProp<ViewStyle>;
  track?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface TopTabNavigatorStyles {
  headerBar?: HeaderBarStyles;
  segmentedControl?: SegmentedControlStyles;
  sceneContainer?: StyleProp<ViewStyle>;
}
```

## Style Ownership

- Components must provide a complete token-driven default appearance internally.
- External styles are overrides for layout and supported visual adjustments, not a replacement for the component's base design.
- Do not expose slots that would make correctness depend on caller styling.
- Keep behavior-critical layout, animation, accessibility, and measurement styles owned by the component unless there is a concrete customization requirement.
- Components must own standard visual states such as active, inactive, disabled, pressed, selected, focused, and loading when those states exist.

## Style Merge Order

- Merge styles in this order by default: token styles, component runtime styles, external styles.
- For stateful text or view styles, use this order: base token style, shared external style, internal state style, state-specific external style.
- Runtime styles required for behavior may be placed after external styles when caller overrides would break the component. Add a short comment when this is non-obvious.

```tsx
<View style={[tokenStyles.container, runtimeStyle, styles?.container]} />

<Text
  style={[
    tokenStyles.label,
    styles?.label,
    isSelected ? tokenStyles.activeLabel : tokenStyles.inactiveLabel,
    isSelected ? styles?.activeLabel : styles?.inactiveLabel,
  ]}
/>
```

## Token Styles

- Build internal styles only with `createUseSheetStyle` from `@pennyspring/theme`.
- Do not use `StyleSheet.create`.
- Do not use inline style object literals in JSX.
- Do not use color literals, named colors, or non-exempt numeric literals in style values.
- Use `AliasToken` values for colors, spacing, typography, radius, borders, shadows, and motion.
- Use `token.fontHeight*` values for React Native `lineHeight`; do not use ratio-style `token.lineHeight*` values.
- Use `toShadowStyle(token.boxShadow*)` for shadows.
- Pass dynamic style inputs through `createUseSheetStyle<TOptions>` options instead of composing ad hoc object styles at render call sites.
