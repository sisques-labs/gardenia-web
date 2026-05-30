import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { SPACES_REPOSITORY } from '@/core/spaces/domain/tokens/spaces-repository.token';
import { ActiveSpaceStorage } from '@/core/spaces/infrastructure/storage/active-space.storage';
import { EventBusService } from '@/core/shared/infrastructure/event-bus.service';
import { UserRegisteredEvent } from '@/core/shared/domain/events/user-registered.event';

@Injectable({ providedIn: 'root' })
export class SpacesStateService {
  private readonly repo = inject(SPACES_REPOSITORY);
  private readonly storage = inject(ActiveSpaceStorage);
  private readonly eventBus = inject(EventBusService);

  private readonly _availableSpaces = signal<Space[]>([]);
  private readonly _currentSpaceId = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isResolved = signal<boolean>(false);

  readonly availableSpaces: Signal<Space[]> = this._availableSpaces.asReadonly();
  readonly currentSpace: Signal<Space | null> = computed(() => {
    const id = this._currentSpaceId();
    if (id === null) return null;
    return this._availableSpaces().find((s) => s.id === id) ?? null;
  });
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly isResolved: Signal<boolean> = this._isResolved.asReadonly();

  constructor() {
    this.eventBus
      .on<UserRegisteredEvent>('auth.user_registered')
      .pipe(takeUntilDestroyed())
      .subscribe((event) => this.setActiveSpace(event.spaceId));
  }

  loadSpaces(): Observable<void> {
    this._isLoading.set(true);
    return this.repo.getSpacesByUser().pipe(
      tap((spaces) => {
        this._availableSpaces.set(spaces);
        this.resolveFromStorage(spaces);
        this._isLoading.set(false);
        this._isResolved.set(true);
      }),
      map(() => undefined),
    );
  }

  setActiveSpace(spaceId: string): void {
    this._currentSpaceId.set(spaceId);
    this.storage.set(spaceId);
  }

  resolveFromStorage(spaces: Space[]): void {
    const storedId = this.storage.get();
    if (storedId && spaces.some((s) => s.id === storedId)) {
      this._currentSpaceId.set(storedId);
    } else if (spaces.length > 0) {
      const firstId = spaces[0].id;
      this._currentSpaceId.set(firstId);
      this.storage.set(firstId);
    } else {
      this._currentSpaceId.set(null);
    }
  }

  clear(): void {
    this._availableSpaces.set([]);
    this._currentSpaceId.set(null);
    this._isLoading.set(false);
    this._isResolved.set(false);
    this.storage.clear();
  }
}
