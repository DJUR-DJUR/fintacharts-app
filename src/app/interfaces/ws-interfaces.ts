export interface WSResponse {
  type: string;
  instrumentId: string;
  provider: string;
  last: WSData;
  price: number;
  timestamp: string;
  volume: number;
}

export interface WSData {
  change: number;
  changePct: number;
  price: number;
  timestamp: string;
  volume: number;
}

export interface WSSubscriptionMessage {
  type: string;
  id: string;
  instrumentId: string;
  provider: string;
  subscribe: boolean | null;
  kinds: string[];
}

