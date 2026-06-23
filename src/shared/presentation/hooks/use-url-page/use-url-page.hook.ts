import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseUrlPageReturn {
  page: number;
  onPageChange: (page: number) => void;
}

export function useUrlPage(): UseUrlPageReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const onPageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { page, onPageChange };
}
