import { useMutation } from '@tanstack/react-query';
import { LoginUseCase } from '@/core/auth/application/use-cases/login/login.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';

const loginService = new LoginUseCase(authHttpRepository);

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginService.login(credentials),
  });
}
