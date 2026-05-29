import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AUTH_REPOSITORY, IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);

  register(email: string, password: string): Observable<void> {
    return this.repo.register(email, password);
  }
}
