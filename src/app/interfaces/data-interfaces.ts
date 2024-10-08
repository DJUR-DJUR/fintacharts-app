export interface  Instrument {
  id: string;
  description: string;
}

interface Pagination {
  page: number;
  pages: number;
  items: number;
}

export interface InstrumentObject {
  id: string;
  symbol: string;
  kind: string;
  description: string;
  tickSize: number;
  currency: string;
  baseCurrency: string;
  mappings: unknown;
  profile: unknown;
}

export interface InstrumentsResponse {
  paging: Pagination;
  data: InstrumentObject[];
}
