import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AUTH_REPOSITORY, IAuthRepository } from '@/core/auth/domain/ports/auth.repository.port';
import { AuthStateService } from '@/core/auth/application/auth-state/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class LogoutService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly state = inject(AuthStateService);

  logout(): Observable<void> {
    return this.repo.logout().pipe(finalize(() => this.state.clearSession()));
  }
}
