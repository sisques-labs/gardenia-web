import { useMutation } from '@tanstack/react-query';
import { LoginService } from '@/core/auth/application/use-cases/login/login.service';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';

const loginService = new LoginService(authHttpRepository);

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginService.login(credentials),
  });
}
