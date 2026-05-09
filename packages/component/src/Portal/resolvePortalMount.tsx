import React from 'react';
import { Portal } from './Portal';
import type { PortalMountPoint } from './types';

const PORTAL_PROVIDER_ERROR =
  'Portal mount point requires a PortalProvider.';

export function resolvePortalMount(
  children: React.ReactNode,
  mountPoint: PortalMountPoint,
  hasPortalProvider: boolean,
): React.ReactNode {
  if (mountPoint === 'local') {
    return children;
  }

  if (hasPortalProvider) {
    return React.createElement(Portal, undefined, children);
  }

  if (mountPoint === 'portal') {
    throw new Error(PORTAL_PROVIDER_ERROR);
  }

  return children;
}
