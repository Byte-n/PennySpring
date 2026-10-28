import * as Keychain from 'react-native-keychain';

import { AgentError } from '../core/protocol/errors';

const PROVIDER_KEYCHAIN_SERVICE_PREFIX = 'pennyspring.agent.provider';

function getProviderKeychainService(providerId: string): string {
  return `${PROVIDER_KEYCHAIN_SERVICE_PREFIX}.${providerId}`;
}

export async function saveProviderApiKey(
  providerId: string,
  apiKey: string,
): Promise<void> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    await clearProviderApiKey(providerId);
    return;
  }

  try {
    await Keychain.setGenericPassword(providerId, trimmed, {
      service: getProviderKeychainService(providerId),
    });
  } catch {
    throw new AgentError(
      'not-configured',
      '无法保存 API Key，请检查系统钥匙串权限。',
    );
  }
}

export async function loadProviderApiKey(
  providerId: string,
): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: getProviderKeychainService(providerId),
    });
    return credentials ? credentials.password : null;
  } catch {
    throw new AgentError(
      'not-configured',
      '无法读取已保存的 API Key，请检查系统钥匙串权限。',
    );
  }
}

export async function clearProviderApiKey(providerId: string): Promise<void> {
  try {
    await Keychain.resetGenericPassword({
      service: getProviderKeychainService(providerId),
    });
  } catch {
    throw new AgentError(
      'not-configured',
      '无法清除已保存的 API Key，请检查系统钥匙串权限。',
    );
  }
}

export async function hasProviderApiKey(providerId: string): Promise<boolean> {
  return Boolean(await loadProviderApiKey(providerId));
}
