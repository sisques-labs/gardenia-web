import { Suspense } from 'react';
import { ForgotPasswordScreen } from '@/core/auth/presentation/screens/forgot-password/forgot-password.screen';

// TODO (PR 2): resolve i18n dict and pass to ForgotPasswordScreen
export default async function Page() {
  return (
    <Suspense>
      <ForgotPasswordScreen />
    </Suspense>
  );
}
