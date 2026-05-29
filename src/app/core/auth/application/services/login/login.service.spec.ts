import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AUTH_REPOSITORY } from '@/core/auth/application/ports/auth.repository.port';
import { AuthStateService } from '@/core/auth/application/services/auth-state/auth-state.service';
import { MeService } from '@/core/auth/application/services/me/me.service';
import { LoginService } from './login.service';

const mockRepo = {
  login: jasmine.createSpy('login'),
  register: jasmine.createSpy(),
  refresh: jasmine.createSpy(),
  logout: jasmine.createSpy(),
  me: jasmine.createSpy(),
};

const mockState = jasmine.createSpyObj<AuthStateService>('AuthStateService', ['setAccessToken']);
const mockMe = jasmine.createSpyObj<MeService>('MeService', ['loadCurrentUser']);

describe('LoginService', () => {
  let service: LoginService;

  beforeEach(() => {
    mockRepo.login.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoginService,
        { provide: AUTH_REPOSITORY, useValue: mockRepo },
        { provide: AuthStateService, useValue: mockState },
        { provide: MeService, useValue: mockMe },
      ],
    });
    service = TestBed.inject(LoginService);
  });

  it('sets access token and loads current user on success', done => {
    mockRepo.login.and.returnValue(of({ accessToken: 'tok' }));
    mockMe.loadCurrentUser.and.returnValue(of({ id: '1', email: 'a@b.com' }));

    service.login('a@b.com', 'pass1234').subscribe({
      next: () => {
        expect(mockState.setAccessToken).toHaveBeenCalledWith('tok');
        expect(mockMe.loadCurrentUser).toHaveBeenCalled();
        done();
      },
    });
  });

  it('propagates error on failed login', done => {
    mockRepo.login.and.returnValue(throwError(() => new Error('401')));

    service.login('a@b.com', 'wrong').subscribe({
      error: err => {
        expect(err.message).toBe('401');
        done();
      },
    });
  });
});
