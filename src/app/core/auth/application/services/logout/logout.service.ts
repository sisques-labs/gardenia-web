import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AUTH_REPOSITORY, IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import { AuthStateService } from '@/core/auth/application/services/auth-state/auth-state.service';

@Injectable({ providedIn: 'root' })
export class LogoutService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly state = inject(AuthStateService);

  logout(): Observable<void> {
    return this.repo.logout().pipe(finalize(() => this.state.clearSession()));
  }
}
