export const DEFAULT_MAX_STEPS = 3;
export const AGENT_TIMEOUT_MS = 120_000;
export const AGENT_CHUNK_TIMEOUT_MS = 60_000;

// 为模型回复预留的 token 数，避免提示词占满整个上下文窗口
export const AGENT_RESPONSE_TOKEN_RESERVE = 4_096;
export const AGENT_MAX_HISTORY_MESSAGES = 100;
export const AGENT_MESSAGE_TOKEN_OVERHEAD = 4;
