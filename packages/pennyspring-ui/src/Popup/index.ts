import { FloatingPanel } from './FloatingPanel';
import { Popup as PopupRoot } from './Popup';

export const Popup = Object.assign(PopupRoot, {
  FloatingPanel,
});

export type {
  PopupAnimation,
  PopupFloatingPanelPosition,
  PopupFloatingPanelProps,
  PopupFloatingPanelStyles,
  PopupCancelParams,
  PopupCancelReason,
  PopupOpenChangeParams,
  PopupOpenChangeReason,
  PopupPosition,
  PopupProps,
  PopupStyles,
} from './types';
