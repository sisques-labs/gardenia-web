import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gardenia',
  description: 'Gardenia web application',
};

// Root `/` is redirected by proxy.ts before this renders.
export default function Home() {
  return null;
}
