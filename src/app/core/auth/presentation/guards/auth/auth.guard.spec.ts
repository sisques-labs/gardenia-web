import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStateService } from '@/core/auth/application/services/auth-state/auth-state.service';
import { authGuard } from './auth.guard';

const mockState = (url: string) => ({ url } as RouterStateSnapshot);
const mockRoute = {} as ActivatedRouteSnapshot;

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authState: jasmine.SpyObj<AuthStateService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    authState = jasmine.createSpyObj('AuthStateService', ['isAuthenticated']);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: AuthStateService, useValue: authState },
      ],
    });
  });

  it('returns true when authenticated', () => {
    authState.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState('/dashboard')));
    expect(result).toBeTrue();
  });

  it('redirects to /login with returnUrl when not authenticated', () => {
    authState.isAuthenticated.and.returnValue(false);
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState('/dashboard')));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/dashboard' } });
    expect(result).toBe(tree);
  });
});
