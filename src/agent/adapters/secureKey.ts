import * as Keychain from 'react-native-keychain';

import { AgentError } from '../core/protocol/errors';

const AGENT_KEYCHAIN_SERVICE = 'pennyspring.agent';
const AGENT_KEYCHAIN_USERNAME = 'agent';

export async function saveApiKey(apiKey: string): Promise<void> {
  const trimmed = apiKey.trim();

  if (!trimmed) {
    await clearApiKey();
    return;
  }

  try {
    await Keychain.setGenericPassword(AGENT_KEYCHAIN_USERNAME, trimmed, {
      service: AGENT_KEYCHAIN_SERVICE,
    });
  } catch {
    throw new AgentError(
      'not-configured',
      '无法保存 API Key，请检查系统钥匙串权限。',
    );
  }
}

export async function loadApiKey(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: AGENT_KEYCHAIN_SERVICE,
    });
    return credentials ? credentials.password : null;
  } catch {
    throw new AgentError(
      'not-configured',
      '无法读取已保存的 API Key，请检查系统钥匙串权限。',
    );
  }
}

export async function clearApiKey(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: AGENT_KEYCHAIN_SERVICE });
  } catch {
    throw new AgentError(
      'not-configured',
      '无法清除已保存的 API Key，请检查系统钥匙串权限。',
    );
  }
}
