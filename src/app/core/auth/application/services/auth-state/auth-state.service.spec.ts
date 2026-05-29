import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  let service: AuthStateService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),AuthStateService, { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthStateService);
  });

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.accessToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('setAccessToken marks as authenticated', () => {
    service.setAccessToken('tok');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.accessToken()).toBe('tok');
  });

  it('clearSession resets state and redirects to /login', () => {
    service.setAccessToken('tok');
    service.clearSession();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.accessToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
