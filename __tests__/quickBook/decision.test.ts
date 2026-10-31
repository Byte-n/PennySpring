import { decideScreenshotNudge } from '../../src/features/quickBook/decision';
import type { QuickBookImage } from '../../src/features/quickBook/types';

const image: QuickBookImage = {
  localPath: 'file:///tmp/quick-book/shot.jpg',
  base64: 'QUJD',
  mimeType: 'image/jpeg',
  fileName: 'shot.jpg',
  fileSize: 3,
  width: 1080,
  height: 2400,
};

const NOW = 1_800_000_000;

describe('decideScreenshotNudge', () => {
  it('prompts for a fresh screenshot that was not handled yet', () => {
    expect(
      decideScreenshotNudge(
        {
          status: 'ok',
          assetId: '42',
          dateAddedSeconds: NOW - 30,
          image,
        },
        null,
        60,
        NOW,
      ),
    ).toEqual({ shouldPrompt: true, assetId: '42', image });
  });

  it('skips a screenshot older than the window', () => {
    expect(
      decideScreenshotNudge(
        {
          status: 'ok',
          assetId: '42',
          dateAddedSeconds: NOW - 61,
          image,
        },
        null,
        60,
        NOW,
      ),
    ).toEqual({ shouldPrompt: false, reason: 'stale' });
  });

  it('skips the same screenshot that was already handled', () => {
    expect(
      decideScreenshotNudge(
        {
          status: 'ok',
          assetId: '42',
          dateAddedSeconds: NOW - 5,
          image,
        },
        '42',
        60,
        NOW,
      ),
    ).toEqual({ shouldPrompt: false, reason: 'duplicate' });
  });

  it.each(['permission', 'empty', 'unavailable'] as const)(
    'skips when the screenshot lookup returns %s',
    status => {
      expect(decideScreenshotNudge({ status }, null, 60, NOW)).toEqual({
        shouldPrompt: false,
        reason: status,
      });
    },
  );
});
