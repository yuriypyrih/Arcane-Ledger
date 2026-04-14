export type Open5eListEnvelope<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Open5eKeyedReference = {
  name: string;
  key: string;
  url: string;
  [key: string]: unknown;
};

export type Open5eDocumentReference = {
  name: string;
  key: string;
  type?: string;
  display_name?: string;
  publisher?: Open5eKeyedReference | null;
  gamesystem?: Open5eKeyedReference | null;
  permalink?: string | null;
  [key: string]: unknown;
};
