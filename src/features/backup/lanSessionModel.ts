import type { LanSessionInfo } from './lan';
import type { LanBookSummary, LanPeer } from './lanProtocol';

export type LanPhase =
  | 'starting'
  | 'discovering'
  | 'waiting-peer'
  | 'connected'
  | 'waiting-offer'
  | 'receiving'
  | 'sending'
  | 'done'
  | 'error';

export interface LanIncomingPair {
  peer: LanPeer;
  requestId: string;
  verificationCode: string;
}

export interface LanOffer {
  offerId: string;
  peer: LanPeer;
  sessionToken: string;
  fileName: string;
  sizeBytes: number;
  totalRecords: number;
  books: LanBookSummary[];
  includeSettings?: boolean;
  includeNetworkBooks?: boolean;
}

export interface LanTransferState {
  direction: 'send' | 'receive';
  fileName: string;
  sizeBytes: number;
  bytesRead: number;
  percent: number;
}

export interface LanResult {
  status: 'success' | 'error';
  direction: 'send' | 'receive';
  title: string;
  subtitle: string;
}

export interface LanSessionView {
  supported: boolean;
  phase: LanPhase;
  session: LanSessionInfo | null;
  localCode: string;
  nearby: LanPeer[];
  pairTarget: LanPeer | null;
  pairCode: string;
  pairError: string;
  incomingPair: LanIncomingPair | null;
  connectedPeer: LanPeer | null;
  verificationCode: string;
  sessionToken: string;
  incomingOffer: LanOffer | null;
  outgoingOffer: LanOffer | null;
  transfer: LanTransferState | null;
  result: LanResult | null;
  errorText: string;
  busy: boolean;
}

export interface LanOfferInput {
  fileUri: string;
  fileName: string;
  sizeBytes: number;
  totalRecords: number;
  books: LanBookSummary[];
  includeSettings?: boolean;
  includeNetworkBooks?: boolean;
}
