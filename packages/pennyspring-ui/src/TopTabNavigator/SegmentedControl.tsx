import React from 'react';
import { Segmented } from '../Segmented';
import type { SegmentedOption } from '../Segmented';
import type {
  DescriptorLike,
  RouteLike,
  SegmentedControlProps,
} from './types';

function getRouteLabel(
  route: RouteLike,
  descriptor?: DescriptorLike,
): string {
  const tabBarLabel = descriptor?.options?.tabBarLabel;
  if (typeof tabBarLabel === 'string') {
    return tabBarLabel;
  }

  return descriptor?.options?.title ?? route.name;
}

function toOptions(
  routes: readonly RouteLike[],
  descriptors: Record<string, DescriptorLike>,
): SegmentedOption[] {
  return routes.map(route => ({
    labelText: getRouteLabel(route, descriptors[route.key]),
    value: route.name,
  }));
}

export function SegmentedControl({
  descriptors,
  navigation,
  state,
  styles,
}: SegmentedControlProps) {
  return (
    <Segmented
      block
      onChange={value => navigation.navigate(String(value))}
      options={toOptions(state.routes, descriptors)}
      styles={{
        item: styles?.option,
        label: styles?.label,
        track: styles?.track,
      }}
      value={state.routes[state.index]?.name}
    />
  );
}
