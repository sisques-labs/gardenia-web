import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AUTH_REPOSITORY } from '@/core/auth/application/ports/auth.repository.port';
import { EventBusService } from '@/core/shared/infrastructure/event-bus.service';
import { RegisterService } from './register.service';

const mockRepo = { register: jasmine.createSpy('register') };
const mockEventBus = { publish: jasmine.createSpy('publish') };

describe('RegisterService', () => {
  let service: RegisterService;

  beforeEach(() => {
    mockRepo.register.calls.reset();
    mockEventBus.publish.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        RegisterService,
        { provide: AUTH_REPOSITORY, useValue: mockRepo },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    });
    service = TestBed.inject(RegisterService);
  });

  it('delegates to repository', done => {
    mockRepo.register.and.returnValue(of({ spaceId: 'space-1' }));
    service.register('a@b.com', 'pass1234').subscribe({ next: () => done() });
    expect(mockRepo.register).toHaveBeenCalledWith('a@b.com', 'pass1234');
  });

  it('publishes UserRegisteredEvent with correct spaceId on success', done => {
    mockRepo.register.and.returnValue(of({ spaceId: 'space-42' }));
    service.register('a@b.com', 'pass1234').subscribe({
      next: () => {
        expect(mockEventBus.publish).toHaveBeenCalledOnceWith(
          jasmine.objectContaining({ type: 'auth.user_registered', spaceId: 'space-42' }),
        );
        done();
      },
    });
  });

  it('does not publish event on failure', done => {
    mockRepo.register.and.returnValue(throwError(() => new Error('409')));
    service.register('a@b.com', 'pass1234').subscribe({
      error: () => {
        expect(mockEventBus.publish).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('propagates repository error', done => {
    mockRepo.register.and.returnValue(throwError(() => new Error('409')));
    service.register('a@b.com', 'pass1234').subscribe({
      error: err => {
        expect(err.message).toBe('409');
        done();
      },
    });
  });
});
