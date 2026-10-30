const START_TIME = Date.now();

function isDev(): boolean {
  return (globalThis as { __DEV__?: boolean }).__DEV__ === true;
}

export function agentDebugLog(
  scope: string,
  event: string,
  data?: Record<string, unknown>,
): void {
  if (!isDev()) {
    return;
  }
  let payload = '';
  if (data) {
    try {
      payload = ` ${JSON.stringify(data)}`;
    } catch {
      payload = ' [unserializable]';
    }
  }
  console.log(
    `[agent-debug:${scope}] +${Date.now() - START_TIME}ms ${event}${payload}`,
  );
}
