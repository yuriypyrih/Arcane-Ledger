export type CodexEntry = {
  id: string;
  name: string;
  category: string;
  tag: string;
  summary: string;
};

export type CodexStatus = "loading" | "ready" | "error";
