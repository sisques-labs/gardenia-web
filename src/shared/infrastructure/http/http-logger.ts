export interface HttpErrorLog {
  status?: number;
  url?: string;
  durationMs: number;
  correlationId?: string;
}

export function logHttpError(log: HttpErrorLog): void {
  console.error('[http-error]', JSON.stringify(log));
}
