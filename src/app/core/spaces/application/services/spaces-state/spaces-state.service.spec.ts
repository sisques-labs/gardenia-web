import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { SPACES_REPOSITORY } from '@/core/spaces/domain/tokens/spaces-repository.token';
import { ActiveSpaceStorage } from '@/core/spaces/infrastructure/storage/active-space.storage';
import { EventBusService } from '@/core/shared/infrastructure/event-bus.service';
import { UserRegisteredEvent } from '@/core/shared/domain/events/user-registered.event';
import { SpacesStateService } from './spaces-state.service';

const SPACE_A: Space = { id: 'space-a', name: 'Space A', ownerId: 'user-1' };
const SPACE_B: Space = { id: 'space-b', name: 'Space B', ownerId: 'user-1' };

describe('SpacesStateService', () => {
  let service: SpacesStateService;
  let mockRepo: jasmine.SpyObj<{ getSpacesByUser: () => Observable<Space[]>; createSpace: (n: string) => Observable<Space> }>;
  let mockStorage: jasmine.SpyObj<ActiveSpaceStorage>;
  let eventBus: EventBusService;

  beforeEach(() => {
    mockRepo = jasmine.createSpyObj('SpacesRepositoryPort', ['getSpacesByUser', 'createSpace']);
    mockStorage = jasmine.createSpyObj('ActiveSpaceStorage', ['get', 'set', 'clear']);
    mockStorage.get.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SpacesStateService,
        { provide: SPACES_REPOSITORY, useValue: mockRepo },
        { provide: ActiveSpaceStorage, useValue: mockStorage },
        EventBusService,
      ],
    });
    service = TestBed.inject(SpacesStateService);
    eventBus = TestBed.inject(EventBusService);
  });

  describe('initial state', () => {
    it('starts with empty availableSpaces', () => {
      expect(service.availableSpaces()).toEqual([]);
    });

    it('starts with null currentSpace', () => {
      expect(service.currentSpace()).toBeNull();
    });

    it('starts not loading and not resolved', () => {
      expect(service.isLoading()).toBeFalse();
      expect(service.isResolved()).toBeFalse();
    });
  });

  describe('loadSpaces()', () => {
    it('sets availableSpaces and marks isResolved after load', () => {
      mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
      service.loadSpaces().subscribe();
      expect(service.availableSpaces()).toEqual([SPACE_A, SPACE_B]);
      expect(service.isResolved()).toBeTrue();
      expect(service.isLoading()).toBeFalse();
    });

    it('picks first space when no storage entry', () => {
      mockStorage.get.and.returnValue(null);
      mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
      service.loadSpaces().subscribe();
      expect(service.currentSpace()).toEqual(SPACE_A);
      expect(mockStorage.set).toHaveBeenCalledWith(SPACE_A.id);
    });

    it('restores from storage when stored id is valid', () => {
      mockStorage.get.and.returnValue(SPACE_B.id);
      mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
      service.loadSpaces().subscribe();
      expect(service.currentSpace()).toEqual(SPACE_B);
    });

    it('falls back to first space when stored id is stale', () => {
      mockStorage.get.and.returnValue('stale-id');
      mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
      service.loadSpaces().subscribe();
      expect(service.currentSpace()).toEqual(SPACE_A);
      expect(mockStorage.set).toHaveBeenCalledWith(SPACE_A.id);
    });

    it('sets currentSpace to null when no spaces returned', () => {
      mockRepo.getSpacesByUser.and.returnValue(of([]));
      service.loadSpaces().subscribe();
      expect(service.currentSpace()).toBeNull();
    });
  });

  describe('setActiveSpace()', () => {
    it('updates currentSpace and persists to storage', () => {
      mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
      service.loadSpaces().subscribe();
      service.setActiveSpace(SPACE_B.id);
      expect(service.currentSpace()).toEqual(SPACE_B);
      expect(mockStorage.set).toHaveBeenCalledWith(SPACE_B.id);
    });
  });

  describe('resolveFromStorage()', () => {
    it('sets currentSpace from storage when id exists in spaces', () => {
      mockStorage.get.and.returnValue(SPACE_B.id);
      service.resolveFromStorage([SPACE_A, SPACE_B]);
      expect(service.currentSpace()).toEqual(SPACE_B);
    });

    it('falls back to first space and updates storage when stored id is stale', () => {
      mockStorage.get.and.returnValue('old-id');
      service.resolveFromStorage([SPACE_A, SPACE_B]);
      expect(service.currentSpace()).toEqual(SPACE_A);
      expect(mockStorage.set).toHaveBeenCalledWith(SPACE_A.id);
    });

    it('sets null when spaces list is empty', () => {
      service.resolveFromStorage([]);
      expect(service.currentSpace()).toBeNull();
    });
  });

  describe('UserRegisteredEvent subscription', () => {
    it('calls setActiveSpace when UserRegisteredEvent is published', () => {
      mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
      service.loadSpaces().subscribe();

      const evt: UserRegisteredEvent = { type: 'auth.user_registered', occurredAt: new Date(), spaceId: SPACE_B.id };
      eventBus.publish(evt);

      expect(service.currentSpace()).toEqual(SPACE_B);
      expect(mockStorage.set).toHaveBeenCalledWith(SPACE_B.id);
    });
  });
});

// ─── Integration: register event → SpacesStateService → localStorage ─────────

describe('SpacesStateService (integration)', () => {
  let service: SpacesStateService;
  let mockRepo: jasmine.SpyObj<{ getSpacesByUser: () => Observable<Space[]>; createSpace: (n: string) => Observable<Space> }>;
  let eventBus: EventBusService;

  beforeEach(() => {
    mockRepo = jasmine.createSpyObj('SpacesRepositoryPort', ['getSpacesByUser', 'createSpace']);
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SpacesStateService,
        { provide: SPACES_REPOSITORY, useValue: mockRepo },
        ActiveSpaceStorage,
        EventBusService,
      ],
    });
    service = TestBed.inject(SpacesStateService);
    eventBus = TestBed.inject(EventBusService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('register event published → SpacesStateService reacts → localStorage has gardenia.activeSpaceId', () => {
    mockRepo.getSpacesByUser.and.returnValue(of([SPACE_A, SPACE_B]));
    service.loadSpaces().subscribe();

    const evt: UserRegisteredEvent = { type: 'auth.user_registered', occurredAt: new Date(), spaceId: SPACE_B.id };
    eventBus.publish(evt);

    expect(localStorage.getItem('gardenia.activeSpaceId')).toBe(SPACE_B.id);
    expect(service.currentSpace()).toEqual(SPACE_B);
  });
});
