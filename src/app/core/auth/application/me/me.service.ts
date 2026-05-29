import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AccountUser } from '../../domain/models/account-user.model';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/ports/auth.repository.port';
import { AuthStateService } from '../auth-state/auth-state.service';

@Injectable({ providedIn: 'root' })
export class MeService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly state = inject(AuthStateService);

  loadCurrentUser(): Observable<AccountUser> {
    return this.repo.me().pipe(tap(user => this.state.setCurrentUser(user)));
  }
}
