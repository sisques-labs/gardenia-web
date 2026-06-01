import { useMutation } from '@tanstack/react-query';
import { RegisterUseCase } from '@/core/auth/application/use-cases/register/register.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import type { RegisterData } from '@/core/auth/domain/interfaces/register-data.interface';

const registerService = new RegisterUseCase(authHttpRepository);

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => registerService.register(data),
  });
}
