import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/ports/auth.repository.port';
import { AuthStateService } from '../auth-state/auth-state.service';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly state = inject(AuthStateService);

  refresh(): Observable<string> {
    return this.repo.refresh().pipe(
      tap(res => this.state.setAccessToken(res.accessToken)),
      map(res => res.accessToken),
    );
  }
}
