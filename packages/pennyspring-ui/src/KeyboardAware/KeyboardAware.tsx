import { KeyboardAwareScreen as KeyboardAwareScreenRoot } from './KeyboardAwareScreen';
import { KeyboardAwareFormScroll as KeyboardAwareFormScrollRoot } from './KeyboardAwareFormScroll';
import { KeyboardStickyFooter as KeyboardStickyFooterRoot } from './KeyboardStickyFooter';
import { useKeyboardInsets } from './useKeyboardInsets';

export const KeyboardAwareScreen = KeyboardAwareScreenRoot;
export const KeyboardAwareFormScroll = KeyboardAwareFormScrollRoot;
export const KeyboardStickyFooter = KeyboardStickyFooterRoot;
export const useKeyboardAwareInsets = useKeyboardInsets;

export const KeyboardAware = Object.assign(KeyboardAwareScreenRoot, {
  FormScroll: KeyboardAwareFormScrollRoot,
  StickyFooter: KeyboardStickyFooterRoot,
  useInsets: useKeyboardInsets,
});
