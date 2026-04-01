import type { ReactNode } from "react";

const inlineBoldPattern = /<strong>(.*?)<\/strong>/g;

export function renderCodexInlineText(text: string, strongClassName?: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(inlineBoldPattern)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }

    nodes.push(
      <strong key={`${match[1]}-${index}`} className={strongClassName}>
        {match[1]}
      </strong>
    );
    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes.length > 0 ? nodes : text;
}
