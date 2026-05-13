import { FloatingPanel } from './FloatingPanel';
import { Popup as PopupRoot } from './Popup';

export const Popup = Object.assign(PopupRoot, {
  FloatingPanel,
});

export { FloatingPanel };
export type {
  PopupFloatingPanelPosition,
  PopupFloatingPanelProps,
  PopupFloatingPanelStyles,
  PopupAnimation,
  PopupCancelParams,
  PopupCancelReason,
  PopupOpenChangeParams,
  PopupOpenChangeReason,
  PopupPosition,
  PopupProps,
  PopupStyles,
} from './types';
