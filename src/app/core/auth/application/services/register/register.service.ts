import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AUTH_REPOSITORY, IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import { RegisterResponse } from '@/core/auth/domain/interfaces/auth-response.interface';
import { EventBusService } from '@/core/shared/infrastructure/event-bus.service';
import { UserRegisteredEvent } from '@/core/shared/domain/events/user-registered.event';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly eventBus = inject(EventBusService);

  register(email: string, password: string): Observable<RegisterResponse> {
    return this.repo.register(email, password).pipe(
      tap(({ spaceId }) => {
        const event: UserRegisteredEvent = {
          type: 'auth.user_registered',
          occurredAt: new Date(),
          spaceId,
        };
        this.eventBus.publish(event);
      }),
    );
  }
}
