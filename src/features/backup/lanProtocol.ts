/* eslint-disable no-bitwise */
export const LAN_PROTOCOL_VERSION = 1;
const VERIFICATION_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_BOOKS = 20;
const MAX_FILE_NAME_LENGTH = 160;

export type LanPlatform = 'android' | 'ios';

export interface LanPeer {
  id: string;
  name: string;
  platform: LanPlatform;
  nonce: string;
  host: string;
  port: number;
}

export interface LanBookSummary {
  name: string;
  records: number;
  assets: number;
  images: number;
}

interface LanMessageBase {
  from: LanPeer;
}

export interface LanPairMessage extends LanMessageBase {
  kind: 'pair';
  requestId: string;
  code: string;
}

export type LanPairRejectReason = 'code' | 'denied' | 'busy' | 'expired';

export interface LanPairConfirmMessage extends LanMessageBase {
  kind: 'pair-confirm';
  requestId: string;
  accepted: boolean;
  reason?: LanPairRejectReason;
  verificationCode?: string;
  sessionToken?: string;
}

export interface LanOfferMessage extends LanMessageBase {
  kind: 'offer';
  offerId: string;
  sessionToken: string;
  fileName: string;
  sizeBytes: number;
  books: LanBookSummary[];
  totalRecords: number;
}

export type LanOfferRejectReason = 'denied' | 'busy' | 'expired';

export interface LanOfferResponseMessage extends LanMessageBase {
  kind: 'offer-response';
  offerId: string;
  accepted: boolean;
  reason?: LanOfferRejectReason;
}

export interface LanTransferCompleteMessage extends LanMessageBase {
  kind: 'transfer-complete';
  sessionToken: string;
  success: boolean;
}

export interface LanDisconnectMessage extends LanMessageBase {
  kind: 'disconnect';
}

export type LanMessage =
  | LanPairMessage
  | LanPairConfirmMessage
  | LanOfferMessage
  | LanOfferResponseMessage
  | LanTransferCompleteMessage
  | LanDisconnectMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isPlatform(value: unknown): value is LanPlatform {
  return value === 'android' || value === 'ios';
}

function isPort(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 65535
  );
}

function isNonEmptyString(value: unknown, maxLength = 200): value is string {
  return (
    typeof value === 'string' && value.length > 0 && value.length <= maxLength
  );
}

export function parseLanPeer(value: unknown): LanPeer | null {
  if (!isRecord(value)) return null;

  const id = value.id;
  const name = value.name;
  const platform = value.platform;
  const nonce = value.nonce;
  const host = value.host;
  const port = value.port;

  if (!isNonEmptyString(id, 80)) return null;
  if (!isNonEmptyString(name, 80)) return null;
  if (!isPlatform(platform)) return null;
  if (!isNonEmptyString(nonce, 128)) return null;
  if (!isNonEmptyString(host, 80)) return null;
  if (!isPort(port)) return null;

  return { id, name, platform, nonce, host, port };
}

function parseBookSummary(value: unknown): LanBookSummary | null {
  if (!isRecord(value)) return null;

  const name = value.name;
  const records = value.records;
  const assets = value.assets;
  const images = value.images;

  if (!isNonEmptyString(name, 100)) return null;
  if (!isNonNegativeInteger(records)) return null;
  if (!isNonNegativeInteger(assets)) return null;
  if (!isNonNegativeInteger(images)) return null;

  return { name, records, assets, images };
}

export function parseLanMessage(body: string): LanMessage | null {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return null;
  }

  if (!isRecord(value)) return null;
  const from = parseLanPeer(value.from);
  if (!from) return null;

  switch (value.kind) {
    case 'pair': {
      const requestId = value.requestId;
      const code = value.code;
      if (!isNonEmptyString(requestId, 120)) return null;
      if (!isValidLanCode(code)) return null;
      return { kind: 'pair', from, requestId, code };
    }
    case 'pair-confirm': {
      const requestId = value.requestId;
      const accepted = value.accepted;
      if (!isNonEmptyString(requestId, 120)) return null;
      if (typeof accepted !== 'boolean') return null;

      const reason = value.reason;
      const verificationCode = value.verificationCode;
      const sessionToken = value.sessionToken;

      if (accepted) {
        if (
          !isNonEmptyString(verificationCode, 8) ||
          !isNonEmptyString(sessionToken, 128)
        ) {
          return null;
        }
      } else if (
        reason !== 'code' &&
        reason !== 'denied' &&
        reason !== 'busy' &&
        reason !== 'expired'
      ) {
        return null;
      }

      return {
        kind: 'pair-confirm',
        from,
        requestId,
        accepted,
        ...(reason === 'code' ||
        reason === 'denied' ||
        reason === 'busy' ||
        reason === 'expired'
          ? { reason }
          : {}),
        ...(typeof verificationCode === 'string' ? { verificationCode } : {}),
        ...(typeof sessionToken === 'string' ? { sessionToken } : {}),
      };
    }
    case 'offer': {
      const offerId = value.offerId;
      const sessionToken = value.sessionToken;
      const fileName = value.fileName;
      const sizeBytes = value.sizeBytes;
      const totalRecords = value.totalRecords;
      const booksValue = value.books;

      if (!isNonEmptyString(offerId, 120)) return null;
      if (!isNonEmptyString(sessionToken, 128)) return null;
      if (!isNonEmptyString(fileName, MAX_FILE_NAME_LENGTH)) return null;
      if (!isNonNegativeInteger(sizeBytes)) return null;
      if (!isNonNegativeInteger(totalRecords)) return null;
      if (!Array.isArray(booksValue) || booksValue.length > MAX_BOOKS) {
        return null;
      }

      const books: LanBookSummary[] = [];
      for (const item of booksValue) {
        const book = parseBookSummary(item);
        if (!book) return null;
        books.push(book);
      }

      return {
        kind: 'offer',
        from,
        offerId,
        sessionToken,
        fileName,
        sizeBytes,
        books,
        totalRecords,
      };
    }
    case 'offer-response': {
      const offerId = value.offerId;
      const accepted = value.accepted;
      if (!isNonEmptyString(offerId, 120)) return null;
      if (typeof accepted !== 'boolean') return null;

      const reason = value.reason;
      if (
        !accepted &&
        reason !== 'denied' &&
        reason !== 'busy' &&
        reason !== 'expired'
      ) {
        return null;
      }

      return {
        kind: 'offer-response',
        from,
        offerId,
        accepted,
        ...(reason === 'denied' || reason === 'busy' || reason === 'expired'
          ? { reason }
          : {}),
      };
    }
    case 'transfer-complete': {
      const sessionToken = value.sessionToken;
      const success = value.success;
      if (!isNonEmptyString(sessionToken, 128)) return null;
      if (typeof success !== 'boolean') return null;
      return { kind: 'transfer-complete', from, sessionToken, success };
    }
    case 'disconnect':
      return { kind: 'disconnect', from };
    default:
      return null;
  }
}

export function createLanCode(random: () => number = Math.random): string {
  return String(100000 + Math.floor(random() * 900000));
}

export function isValidLanCode(value: unknown): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value);
}

export function formatLanCode(code: string): string {
  if (!isValidLanCode(code)) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

export function createLanRequestId(
  prefix: string,
  random: () => number = Math.random,
): string {
  const suffix = Math.floor(random() * 0xffffff)
    .toString(36)
    .padStart(5, '0');
  return `${prefix}-${Date.now().toString(36)}-${suffix}`;
}

function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createVerificationCode(
  firstNonce: string,
  secondNonce: string,
): string {
  const sorted = [firstNonce, secondNonce].sort().join('|');
  let hash = hashString(sorted);
  let result = '';
  for (let index = 0; index < 4; index += 1) {
    result += VERIFICATION_ALPHABET[hash % VERIFICATION_ALPHABET.length];
    hash = Math.floor(hash / VERIFICATION_ALPHABET.length);
  }
  return result;
}

export function createSessionToken(random: () => number = Math.random): string {
  let token = '';
  for (let index = 0; index < 32; index += 1) {
    token += Math.floor(random() * 16).toString(16);
  }
  return token;
}

export function isValidPeerHost(host: string): boolean {
  return /^[a-z0-9.-]+$/i.test(host) || /^\[[0-9a-f:]+\]$/i.test(host);
}

export function buildPeerMessageUrl(peer: LanPeer): string {
  return `http://${peer.host}:${peer.port}/message`;
}

export function buildPackageUrl(peer: LanPeer, token: string): string {
  return `http://${peer.host}:${peer.port}/package?token=${encodeURIComponent(
    token,
  )}`;
}

export function isSamePeer(left: LanPeer | null, right: LanPeer): boolean {
  return Boolean(left && left.id === right.id);
}
