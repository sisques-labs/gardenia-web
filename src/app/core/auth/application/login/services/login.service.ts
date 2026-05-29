import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { AUTH_REPOSITORY, IAuthRepository } from '@/core/auth/domain/ports/auth.repository.port';
import { AuthStateService } from '@/core/auth/application/auth-state/services/auth-state.service';
import { MeService } from '@/core/auth/application/me/services/me.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly state = inject(AuthStateService);
  private readonly me = inject(MeService);

  login(email: string, password: string): Observable<void> {
    return this.repo.login(email, password).pipe(
      tap(res => this.state.setAccessToken(res.accessToken)),
      switchMap(() => this.me.loadCurrentUser()),
      map(() => void 0),
      catchError(err => throwError(() => err)),
    );
  }
}
