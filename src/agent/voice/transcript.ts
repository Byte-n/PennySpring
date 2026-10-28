export function appendTranscript(draft: string, transcript: string): string {
  const text = transcript.trim();
  if (!text) {
    return draft;
  }
  if (!draft.trim()) {
    return text;
  }
  const needsSpace = /[A-Za-z0-9]$/.test(draft) && /^[A-Za-z0-9]/.test(text);
  return needsSpace ? `${draft} ${text}` : `${draft}${text}`;
}
