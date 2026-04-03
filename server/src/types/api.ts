export type PaginationEnvelope<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
