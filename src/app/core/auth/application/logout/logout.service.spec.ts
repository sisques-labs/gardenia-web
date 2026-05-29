import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AUTH_REPOSITORY } from '../../domain/ports/auth.repository.port';
import { AuthStateService } from '../auth-state/auth-state.service';
import { LogoutService } from './logout.service';

const mockRepo = { logout: jasmine.createSpy('logout') };
const mockState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['clearSession']);

describe('LogoutService', () => {
  let service: LogoutService;

  beforeEach(() => {
    mockRepo.logout.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        LogoutService,
        { provide: AUTH_REPOSITORY, useValue: mockRepo },
        { provide: AuthStateService, useValue: mockState },
      ],
    });
    service = TestBed.inject(LogoutService);
  });

  it('calls clearSession after logout completes', done => {
    mockRepo.logout.and.returnValue(of(undefined));

    service.logout().subscribe({
      complete: () => {
        expect(mockState.clearSession).toHaveBeenCalled();
        done();
      },
    });
  });
});
