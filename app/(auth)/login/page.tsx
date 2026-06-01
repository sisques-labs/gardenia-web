import { Suspense } from 'react';
import { LoginScreen } from '@/core/auth/presentation/screens/login/login.screen';

export default function Page() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
