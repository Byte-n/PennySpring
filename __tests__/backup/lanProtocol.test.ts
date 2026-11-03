import {
  buildPackageUrl,
  buildPeerMessageUrl,
  createLanCode,
  createLanRequestId,
  createSessionToken,
  createVerificationCode,
  formatLanCode,
  isValidLanCode,
  parseLanMessage,
  type LanPeer,
} from '../../src/features/backup/lanProtocol';

const peer: LanPeer = {
  id: 'peer-1',
  name: '书房 iPad',
  platform: 'ios',
  nonce: 'nonce-peer',
  host: '192.168.1.8',
  port: 53210,
};

function message(value: unknown): string {
  return JSON.stringify(value);
}

describe('LAN protocol messages', () => {
  it('parses a valid pairing request', () => {
    const result = parseLanMessage(
      message({
        kind: 'pair',
        from: peer,
        requestId: 'pair-1',
        code: '123456',
      }),
    );

    expect(result).toEqual({
      kind: 'pair',
      from: peer,
      requestId: 'pair-1',
      code: '123456',
    });
  });

  it('rejects malformed pairing codes and unknown message kinds', () => {
    expect(
      parseLanMessage(
        message({
          kind: 'pair',
          from: peer,
          requestId: 'pair-1',
          code: '12345',
        }),
      ),
    ).toBeNull();
    expect(
      parseLanMessage(message({ kind: 'unknown', from: peer })),
    ).toBeNull();
    expect(parseLanMessage('{')).toBeNull();
  });

  it('parses an accepted pairing confirmation with session details', () => {
    const result = parseLanMessage(
      message({
        kind: 'pair-confirm',
        from: peer,
        requestId: 'pair-1',
        accepted: true,
        verificationCode: '7K3Q',
        sessionToken: 'a'.repeat(32),
      }),
    );

    expect(result).toMatchObject({
      kind: 'pair-confirm',
      accepted: true,
      verificationCode: '7K3Q',
      sessionToken: 'a'.repeat(32),
    });
  });

  it('requires a reason when pairing is rejected', () => {
    expect(
      parseLanMessage(
        message({
          kind: 'pair-confirm',
          from: peer,
          requestId: 'pair-1',
          accepted: false,
        }),
      ),
    ).toBeNull();
    expect(
      parseLanMessage(
        message({
          kind: 'pair-confirm',
          from: peer,
          requestId: 'pair-1',
          accepted: false,
          reason: 'code',
        }),
      ),
    ).toMatchObject({ accepted: false, reason: 'code' });
  });

  it('parses a transfer offer and keeps book summaries', () => {
    const result = parseLanMessage(
      message({
        kind: 'offer',
        from: peer,
        offerId: 'offer-1',
        sessionToken: 'b'.repeat(32),
        fileName: '日常账本.psb',
        sizeBytes: 31457280,
        totalRecords: 1628,
        books: [
          { name: '日常账本', records: 1286, assets: 12, images: 86 },
          { name: '旅行账本', records: 342, assets: 3, images: 24 },
        ],
      }),
    );

    expect(result).toMatchObject({
      kind: 'offer',
      fileName: '日常账本.psb',
      totalRecords: 1628,
      books: [
        { name: '日常账本', records: 1286, assets: 12, images: 86 },
        { name: '旅行账本', records: 342, assets: 3, images: 24 },
      ],
    });
  });

  it('rejects offers with invalid sizes or too many books', () => {
    const base = {
      kind: 'offer',
      from: peer,
      offerId: 'offer-1',
      sessionToken: 'b'.repeat(32),
      fileName: 'backup.psb',
      sizeBytes: 1,
      totalRecords: 1,
      books: [{ name: '账本', records: 1, assets: 0, images: 0 }],
    };

    expect(parseLanMessage(message({ ...base, sizeBytes: -1 }))).toBeNull();
    expect(
      parseLanMessage(
        message({
          ...base,
          books: Array.from({ length: 21 }, () => base.books[0]),
        }),
      ),
    ).toBeNull();
  });

  it('parses transfer completion with a result flag', () => {
    expect(
      parseLanMessage(
        message({
          kind: 'transfer-complete',
          from: peer,
          sessionToken: 'c',
          success: true,
        }),
      ),
    ).toMatchObject({
      kind: 'transfer-complete',
      sessionToken: 'c',
      success: true,
    });
    expect(
      parseLanMessage(
        message({ kind: 'transfer-complete', from: peer, sessionToken: 'c' }),
      ),
    ).toBeNull();
  });

  it('parses a disconnect message', () => {
    expect(
      parseLanMessage(message({ kind: 'disconnect', from: peer })),
    ).toEqual({ kind: 'disconnect', from: peer });
  });
});

describe('LAN pairing helpers', () => {
  it('creates and formats a six digit code', () => {
    const code = createLanCode(() => 0);
    expect(code).toBe('100000');
    expect(isValidLanCode(code)).toBe(true);
    expect(formatLanCode(code)).toBe('100 000');
    expect(isValidLanCode('12345')).toBe(false);
  });

  it('creates a verification code independent of nonce order', () => {
    expect(createVerificationCode('alpha', 'beta')).toBe(
      createVerificationCode('beta', 'alpha'),
    );
    expect(createVerificationCode('alpha', 'beta')).not.toBe(
      createVerificationCode('alpha', 'gamma'),
    );
  });

  it('creates unique request ids with the requested prefix', () => {
    const id = createLanRequestId('pair', () => 0.5);
    expect(id.startsWith('pair-')).toBe(true);
    expect(id.length).toBeGreaterThan(6);
  });

  it('creates a 32 character lowercase hex session token', () => {
    const token = createSessionToken(() => 0.25);
    expect(token).toHaveLength(32);
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it('builds peer message and package urls', () => {
    expect(buildPeerMessageUrl(peer)).toBe('http://192.168.1.8:53210/message');
    expect(buildPackageUrl(peer, 'a/b c')).toBe(
      'http://192.168.1.8:53210/package?token=a%2Fb%20c',
    );
  });
});
