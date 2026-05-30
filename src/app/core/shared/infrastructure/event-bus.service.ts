import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomainEvent } from '@/core/shared/domain/domain-event.interface';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly events$ = new Subject<DomainEvent>();

  publish(event: DomainEvent): void {
    this.events$.next(event);
  }

  on<T extends DomainEvent>(type: string): Observable<T> {
    return this.events$.pipe(filter((e) => e.type === type)) as Observable<T>;
  }
}
