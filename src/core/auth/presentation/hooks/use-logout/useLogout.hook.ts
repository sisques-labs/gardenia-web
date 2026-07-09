import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogoutUseCase } from '@/core/auth/application/use-cases/logout/logout.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const logoutService = new LogoutUseCase(authHttpRepository);

export function useLogout() {
  const redirectToLogin = useAuthStore((s) => s.redirectToLogin);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutService.logout(),
    onSuccess: () => {
      queryClient.clear();
      redirectToLogin();
    },
  });
}
