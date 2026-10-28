import {
  buildChatCompletionsUrl,
  buildModelsUrl,
  buildResponsesUrl,
  isValidBaseUrl,
  normalizeBaseUrl,
} from '../../src/agent/core/url';

describe('agent endpoint url', () => {
  it('trims whitespace and trailing slashes', () => {
    expect(normalizeBaseUrl('  https://api.example.com/v1/  ')).toBe(
      'https://api.example.com/v1',
    );
  });

  it('removes a trailing chat completions or responses path', () => {
    expect(
      normalizeBaseUrl('https://api.example.com/v1/chat/completions'),
    ).toBe('https://api.example.com/v1');
    expect(
      normalizeBaseUrl('https://api.example.com/v1/chat/completions/'),
    ).toBe('https://api.example.com/v1');
    expect(normalizeBaseUrl('https://api.example.com/v1/responses')).toBe(
      'https://api.example.com/v1',
    );
    expect(normalizeBaseUrl('https://api.example.com/v1/responses/')).toBe(
      'https://api.example.com/v1',
    );
  });

  it('keeps a base url without version untouched', () => {
    expect(normalizeBaseUrl('https://api.example.com')).toBe(
      'https://api.example.com',
    );
  });

  it.each([
    'https://api.example.com/v1',
    'http://192.168.1.10:8080/v1',
    ' https://api.example.com/v1/chat/completions ',
  ])('accepts valid base url %s', url => {
    expect(isValidBaseUrl(url)).toBe(true);
  });

  it.each(['', 'api.example.com/v1', 'ftp://api.example.com/v1', 'https://'])(
    'rejects invalid base url %s',
    url => {
      expect(isValidBaseUrl(url)).toBe(false);
    },
  );

  it('builds chat completions and models urls', () => {
    expect(buildChatCompletionsUrl('https://api.example.com/v1/')).toBe(
      'https://api.example.com/v1/chat/completions',
    );
    expect(buildModelsUrl('https://api.example.com/v1')).toBe(
      'https://api.example.com/v1/models',
    );
    expect(buildResponsesUrl('https://api.example.com/v1/responses')).toBe(
      'https://api.example.com/v1/responses',
    );
  });
});
