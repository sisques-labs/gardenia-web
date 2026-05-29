import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStateService } from '@/core/auth/application/services/auth-state/auth-state.service';
import { guestGuard } from './guest.guard';

const mockState = {} as RouterStateSnapshot;
const mockRoute = {} as ActivatedRouteSnapshot;

describe('guestGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authState: jasmine.SpyObj<AuthStateService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    authState = jasmine.createSpyObj('AuthStateService', ['isAuthenticated']);
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthStateService, useValue: authState },
      ],
    });
  });

  it('returns true when not authenticated', () => {
    authState.isAuthenticated.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));
    expect(result).toBeTrue();
  });

  it('redirects to / when already authenticated', () => {
    authState.isAuthenticated.and.returnValue(true);
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(tree);
  });
});
