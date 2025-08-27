export const fetchTickers = jest.fn();

export type StocksQuery = {
  search?: string;
  market?: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices';
  active?: boolean;
  cusip?: string;
  cik?: string;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  next_url?: string;
};
