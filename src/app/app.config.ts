import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@/core/auth/infrastructure/interceptors/auth.interceptor';
import { API_URL } from '@/core/auth/infrastructure/tokens/api-url.token';
import { AUTH_REPOSITORY } from '@/core/auth/domain/ports/auth.repository.port';
import { AuthHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_URL, useValue: 'http://localhost:3000' },
    { provide: AUTH_REPOSITORY, useExisting: AuthHttpRepository },
  ],
};
