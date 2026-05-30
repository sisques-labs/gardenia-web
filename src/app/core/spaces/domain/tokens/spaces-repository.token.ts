import { InjectionToken } from '@angular/core';
import { SpacesRepositoryPort } from '@/core/spaces/domain/ports/spaces.repository.port';

export const SPACES_REPOSITORY = new InjectionToken<SpacesRepositoryPort>('SpacesRepositoryPort');
