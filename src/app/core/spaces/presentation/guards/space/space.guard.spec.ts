import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SpacesStateService } from '@/core/spaces/application/services/spaces-state/spaces-state.service';
import { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { spaceGuard } from './space.guard';

const mockSpace: Space = { id: 'space-1', name: 'Space 1', ownerId: 'user-1' };
const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = {} as RouterStateSnapshot;

function makeSpacesStateMock(opts: {
  isResolved: boolean;
  currentSpace: Space | null;
}): Partial<SpacesStateService> {
  return {
    isResolved: signal(opts.isResolved),
    currentSpace: signal(opts.currentSpace),
    loadSpaces: jasmine.createSpy('loadSpaces').and.returnValue(of(undefined)),
  };
}

describe('spaceGuard', () => {
  let router: jasmine.SpyObj<Router>;

  function setup(mock: Partial<SpacesStateService>) {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: SpacesStateService, useValue: mock },
      ],
    });
  }

  it('returns true when already resolved and space is active', () => {
    setup(makeSpacesStateMock({ isResolved: true, currentSpace: mockSpace }));
    const result = TestBed.runInInjectionContext(() => spaceGuard(mockRoute, mockState));
    expect(result).toBeTrue();
  });

  it('redirects to /spaces/new when resolved but no current space', () => {
    setup(makeSpacesStateMock({ isResolved: true, currentSpace: null }));
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() => spaceGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/spaces/new']);
    expect(result).toBe(tree);
  });

  it('calls loadSpaces() when isResolved is false and returns true when space exists', fakeAsync(() => {
    const mock = makeSpacesStateMock({ isResolved: false, currentSpace: mockSpace });
    setup(mock);

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      const guard$ = spaceGuard(mockRoute, mockState) as Observable<boolean | UrlTree>;
      guard$.subscribe((v: boolean | UrlTree) => (result = v));
    });
    tick();

    expect(mock.loadSpaces).toHaveBeenCalled();
    expect(result).toBeTrue();
  }));

  it('redirects to /spaces/new when loadSpaces resolves with no space', fakeAsync(() => {
    const mock = makeSpacesStateMock({ isResolved: false, currentSpace: null });
    setup(mock);
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);

    let result: boolean | UrlTree | undefined;
    TestBed.runInInjectionContext(() => {
      const guard$ = spaceGuard(mockRoute, mockState) as Observable<boolean | UrlTree>;
      guard$.subscribe((v: boolean | UrlTree) => (result = v));
    });
    tick();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/spaces/new']);
    expect(result).toBe(tree);
  }));
});
