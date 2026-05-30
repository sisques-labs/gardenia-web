import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '@/core/auth/application/services/auth-state/auth-state.service';
import { RefreshService } from '@/core/auth/application/services/refresh/refresh.service';
import { SpacesStateService } from '@/core/spaces/application/services/spaces-state/spaces-state.service';
import { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { authInterceptor } from './auth.interceptor';

const mockSpace: Space = { id: 'space-1', name: 'Space 1', ownerId: 'user-1' };

describe('authInterceptor — X-Space-ID', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let mockAuthState: jasmine.SpyObj<AuthStateService>;
  let mockSpacesState: { currentSpace: jasmine.Spy; isResolved: jasmine.Spy };
  let mockRefreshSvc: jasmine.SpyObj<RefreshService>;

  function setup(spaceValue: Space | null, token: string | null = 'test-token') {
    mockAuthState = jasmine.createSpyObj('AuthStateService', ['accessToken', 'clearSession']);
    mockAuthState.accessToken.and.returnValue(token);
    mockSpacesState = {
      currentSpace: jasmine.createSpy('currentSpace').and.returnValue(spaceValue),
      isResolved: jasmine.createSpy('isResolved').and.returnValue(true),
    };
    mockRefreshSvc = jasmine.createSpyObj('RefreshService', ['refresh']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStateService, useValue: mockAuthState },
        { provide: SpacesStateService, useValue: mockSpacesState },
        { provide: RefreshService, useValue: mockRefreshSvc },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  afterEach(() => controller.verify());

  it('adds X-Space-ID header on non-auth requests when space is set', () => {
    setup(mockSpace);
    http.get('/api/data').subscribe();
    const req = controller.expectOne('/api/data');
    expect(req.request.headers.get('X-Space-ID')).toBe('space-1');
    req.flush({});
  });

  it('does not add X-Space-ID on /auth/ URLs', () => {
    setup(mockSpace);
    http.post('/api/auth/login', {}).subscribe();
    const req = controller.expectOne('/api/auth/login');
    expect(req.request.headers.has('X-Space-ID')).toBeFalse();
    req.flush({});
  });

  it('does not add X-Space-ID when currentSpace is null', () => {
    setup(null);
    http.get('/api/data').subscribe();
    const req = controller.expectOne('/api/data');
    expect(req.request.headers.has('X-Space-ID')).toBeFalse();
    req.flush({});
  });
});
