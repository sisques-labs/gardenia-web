/** Trims a string and collapses empty/whitespace-only values to `undefined`. */
export function trimOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
