export function formatTokens(tokens: number | null | undefined): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) {
    const val = tokens / 1_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${Math.round(tokens / 1_000)}K`;
  }
  return String(tokens);
}

export function formatPrice(pricePer1M: number | null | undefined): string {
  if (pricePer1M === null || pricePer1M === undefined) return "—";
  if (pricePer1M === 0) return "Free";
  return `$${pricePer1M.toFixed(pricePer1M < 1 ? 2 : 2)} / 1M`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
