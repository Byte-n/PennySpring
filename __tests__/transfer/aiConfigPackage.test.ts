import type { AiConfigSnapshot } from '@pennyspring/api';
import { strToU8 } from 'fflate';

import {
  AI_CONFIG_FORMAT,
  AI_CONFIG_FORMAT_VERSION,
  buildAiConfigPackage,
  createAiConfigFileName,
  parseAiConfigPackage,
  zipAiConfigPackage,
} from '../../src/features/transfer/aiConfig';
import { zipFiles, type PackageFiles } from '../../src/features/transfer/zip';

const SNAPSHOT: AiConfigSnapshot = {
  providers: [
    {
      id: 1,
      descriptorId: 'openai-compatible',
      name: '主提供商',
      baseUrl: 'https://api.example.com/v1',
      defaultModelId: 'gpt-4.1',
      models: [
        {
          modelId: 'gpt-4.1',
          contextWindow: 200_000,
          reasoningEffort: 'off',
          multimodal: true,
        },
      ],
      storeResponses: true,
    },
  ],
  agentSelection: { providerId: 1, modelId: 'gpt-4.1' },
  quickBookSelection: { providerId: 1, modelId: 'gpt-4.1' },
};

function createPackageFiles(
  snapshot: unknown,
  formatVersion = AI_CONFIG_FORMAT_VERSION,
): PackageFiles {
  return {
    'manifest.json': strToU8(
      JSON.stringify({
        format: AI_CONFIG_FORMAT,
        formatVersion,
        appVersion: '0.0.1',
        createdAt: 1_800_000_000_000,
        providerCount: 1,
      }),
    ),
    'ai-config.json': strToU8(JSON.stringify(snapshot)),
  };
}

describe('AI config package', () => {
  it('round-trips provider definitions and selections through a zip package', async () => {
    const built = buildAiConfigPackage(SNAPSHOT, {
      createdAt: 1_800_000_000_000,
    });

    const parsed = await parseAiConfigPackage(
      await zipAiConfigPackage(built.files),
    );

    expect(parsed.manifest.providerCount).toBe(1);
    expect(parsed.snapshot).toEqual(SNAPSHOT);
    expect(createAiConfigFileName(built.manifest.createdAt)).toBe(
      'PennySpring_AI配置_2027-01-15.psa',
    );
  });

  it('rejects a package from a newer format version', async () => {
    const data = await zipFiles(
      createPackageFiles(SNAPSHOT, AI_CONFIG_FORMAT_VERSION + 1),
    );

    await expect(parseAiConfigPackage(data)).rejects.toThrow(
      'AI 配置包版本过高，请升级 PennySpring 后再导入',
    );
  });

  it('rejects an invalid provider model payload', async () => {
    const data = await zipFiles(
      createPackageFiles({
        ...SNAPSHOT,
        providers: [
          {
            ...SNAPSHOT.providers[0],
            models: [{ modelId: 'gpt-4.1', contextWindow: 0 }],
          },
        ],
      }),
    );

    await expect(parseAiConfigPackage(data)).rejects.toThrow(
      'AI 配置包内容格式不正确',
    );
  });
});
