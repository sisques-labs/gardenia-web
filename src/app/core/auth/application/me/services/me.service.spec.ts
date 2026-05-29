import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AccountUser } from '../../../domain/models/account-user.model';
import { AUTH_REPOSITORY } from '../../../domain/ports/auth.repository.port';
import { AuthStateService } from '../auth-state/services/auth-state.service';
import { MeService } from './me.service';

const mockUser: AccountUser = { id: '1', email: 'a@b.com' };
const mockRepo = { me: jasmine.createSpy('me') };
const mockState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['setCurrentUser']);

describe('MeService', () => {
  let service: MeService;

  beforeEach(() => {
    mockRepo.me.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        MeService,
        { provide: AUTH_REPOSITORY, useValue: mockRepo },
        { provide: AuthStateService, useValue: mockState },
      ],
    });
    service = TestBed.inject(MeService);
  });

  it('loads user and updates state', done => {
    mockRepo.me.and.returnValue(of(mockUser));

    service.loadCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(mockState.setCurrentUser).toHaveBeenCalledWith(mockUser);
      done();
    });
  });
});
