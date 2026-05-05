import {
  useNavigation as useReactNavigation,
  type NavigationProp,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';

export function useNavigation(): NavigationProp<RootStackParamList> {
  return useReactNavigation<NavigationProp<RootStackParamList>>();
}
