export interface  Instrument {
  id: string;
  description: string;
  currency: string;
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

export interface ChartPoint {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export interface ChartDataResponse {
  data: ChartPoint[];
}

export enum PeriodicityEnum {
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year'
}
