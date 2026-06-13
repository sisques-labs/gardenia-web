export function resolveFieldError(
  message: string | undefined,
  dict: Record<string, unknown>,
): string | undefined {
  if (!message) return undefined;
  const resolved = dict[message];
  return typeof resolved === 'string' ? resolved : message;
}
