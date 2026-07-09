import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginUseCase } from '@/core/auth/application/use-cases/login/login.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const loginService = new LoginUseCase(authHttpRepository);

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginService.login(credentials),
    onSuccess: ({ accessToken, user }) => {
      setAccessToken(accessToken);
      setCurrentUser(user);
      void queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}
