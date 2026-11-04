import type { LinkingOptions } from '@react-navigation/native';

import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const APP_LINK_PREFIX = 'pennyspring://';
const AGENT_DEEP_LINK_URL = `${APP_LINK_PREFIX}agent`;

/** `pennyspring://agent` 由 AgentRoot 打开助手抽屉，不进入导航深链。 */
export function isAgentDeepLinkUrl(url: string): boolean {
  return url === AGENT_DEEP_LINK_URL || url === `${AGENT_DEEP_LINK_URL}/`;
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [APP_LINK_PREFIX],
  filter: url => !isAgentDeepLinkUrl(url),
  config: {
    initialRouteName: ROOT_ROUTES.Home,
    screens: {
      [ROOT_ROUTES.Home]: '',
      [ROOT_ROUTES.QuickBookDraft]: 'draft/:draftId',
    },
  },
};
