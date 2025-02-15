export type Period =
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "last-quarter"
  | "this-year"
  | "last-year";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MetricsResponse {
  totalDeals: number;
  totalValue: number;
  receivedAmount: number;
  paymentStatus: {
    PENDING: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  previousPeriod?: {
    totalDeals: number;
    totalValue: number;
    receivedAmount: number;
  };
}
