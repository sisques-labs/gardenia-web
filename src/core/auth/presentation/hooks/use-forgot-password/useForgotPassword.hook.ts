import { useMutation } from '@tanstack/react-query';
import { ForgotPasswordUseCase } from '@/core/auth/application/use-cases/forgot-password/forgot-password.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';

const forgotPasswordService = new ForgotPasswordUseCase(authHttpRepository);

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordService.execute(email),
  });
}
