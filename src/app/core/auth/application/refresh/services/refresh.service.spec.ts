import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AUTH_REPOSITORY } from '../../../domain/ports/auth.repository.port';
import { AuthStateService } from '../auth-state/services/auth-state.service';
import { RefreshService } from './refresh.service';

const mockRepo = { refresh: jasmine.createSpy('refresh') };
const mockState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['setAccessToken']);

describe('RefreshService', () => {
  let service: RefreshService;

  beforeEach(() => {
    mockRepo.refresh.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        RefreshService,
        { provide: AUTH_REPOSITORY, useValue: mockRepo },
        { provide: AuthStateService, useValue: mockState },
      ],
    });
    service = TestBed.inject(RefreshService);
  });

  it('updates state and emits new token', done => {
    mockRepo.refresh.and.returnValue(of({ accessToken: 'new-tok' }));

    service.refresh().subscribe(token => {
      expect(token).toBe('new-tok');
      expect(mockState.setAccessToken).toHaveBeenCalledWith('new-tok');
      done();
    });
  });
});
