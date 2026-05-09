import type React from 'react';

export type PortalMountPoint = 'auto' | 'local' | 'portal';

export interface PortalProviderProps {
  children?: React.ReactNode;
}

export interface PortalProps {
  children?: React.ReactNode;
}
