import { appendTranscript } from '../../src/agent/voice/transcript';

describe('appendTranscript', () => {
  it('uses the transcript when the draft is empty', () => {
    expect(appendTranscript('', '午饭 25 块')).toBe('午饭 25 块');
  });

  it('appends Chinese text without an extra separator', () => {
    expect(appendTranscript('昨天', '午饭 25 块')).toBe('昨天午饭 25 块');
  });

  it('inserts a space between ASCII words', () => {
    expect(appendTranscript('lunch', '25 yuan')).toBe('lunch 25 yuan');
  });

  it('keeps the draft when the transcript is blank', () => {
    expect(appendTranscript('已有内容', '   ')).toBe('已有内容');
  });

  it('replaces a whitespace-only draft with the transcript', () => {
    expect(appendTranscript('   ', '打车 18')).toBe('打车 18');
  });
});
