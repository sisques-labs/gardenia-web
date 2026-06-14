export function formatRelativeTime(isoDate: string, locale: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const diffSecs = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSecs);
  if (abs < 60) return rtf.format(diffSecs, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSecs / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSecs / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSecs / 86400), 'day');
  return rtf.format(Math.round(diffSecs / 604800), 'week');
}
