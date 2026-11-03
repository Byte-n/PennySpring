import { strToU8 } from 'fflate';

import {
  buildNetworkBooksPackage,
  createNetworkBooksFileName,
  mergeNetworkBooks,
  NETWORK_BOOKS_FORMAT,
  NETWORK_BOOKS_FORMAT_VERSION,
  parseNetworkBooksPackage,
  zipNetworkBooksPackage,
  type NetworkBooksSnapshot,
} from '../../src/features/transfer/networkBooks';
import { zipFiles, type PackageFiles } from '../../src/features/transfer/zip';

const SERVER_A = 'http://192.168.1.10:8787';
const SERVER_B = 'http://192.168.1.11:8787';

const SNAPSHOT: NetworkBooksSnapshot = {
  servers: [
    { serverUrl: SERVER_A, token: 'token-a' },
    { serverUrl: SERVER_B, token: '' },
  ],
  refs: [
    { serverUrl: SERVER_A, bookId: 1 },
    { serverUrl: SERVER_B, bookId: 2 },
  ],
};

function createPackageFiles(
  snapshot: unknown,
  formatVersion = NETWORK_BOOKS_FORMAT_VERSION,
): PackageFiles {
  return {
    'manifest.json': strToU8(
      JSON.stringify({
        format: NETWORK_BOOKS_FORMAT,
        formatVersion,
        appVersion: '0.0.1',
        createdAt: 1_800_000_000_000,
        serverCount: 2,
        bookCount: 2,
        tokenCount: 1,
      }),
    ),
    'network-books.json': strToU8(JSON.stringify(snapshot)),
  };
}

describe('network books package', () => {
  it('round-trips servers, tokens and refs through a zip package', async () => {
    const built = buildNetworkBooksPackage(SNAPSHOT, {
      createdAt: 1_800_000_000_000,
    });

    const parsed = await parseNetworkBooksPackage(
      await zipNetworkBooksPackage(built.files),
    );

    expect(parsed.manifest).toMatchObject({
      serverCount: 2,
      bookCount: 2,
      tokenCount: 1,
    });
    expect(parsed.snapshot).toEqual(SNAPSHOT);
    expect(createNetworkBooksFileName(built.manifest.createdAt)).toBe(
      'PennySpring_网络账本_2027-01-15.psn',
    );
  });

  it('merges new servers, tokens and refs without deleting existing entries', () => {
    const merged = mergeNetworkBooks(
      {
        refs: [{ serverUrl: SERVER_A, bookId: 1 }],
        tokens: { [SERVER_A]: 'old-token' },
      },
      SNAPSHOT,
    );

    expect(merged.serversAdded).toBe(1);
    expect(merged.tokensUpdated).toBe(1);
    expect(merged.refsAdded).toBe(1);
    expect(merged.refs).toEqual([
      { serverUrl: SERVER_A, bookId: 1 },
      { serverUrl: SERVER_B, bookId: 2 },
    ]);
    expect(merged.tokens).toEqual({ [SERVER_A]: 'token-a' });
  });

  it('rejects a package from a newer format version', async () => {
    const data = await zipFiles(
      createPackageFiles(SNAPSHOT, NETWORK_BOOKS_FORMAT_VERSION + 1),
    );

    await expect(parseNetworkBooksPackage(data)).rejects.toThrow(
      '网络账本列表包版本过高，请升级 PennySpring 后再导入',
    );
  });
});
