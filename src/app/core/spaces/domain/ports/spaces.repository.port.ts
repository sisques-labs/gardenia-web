import { Observable } from 'rxjs';
import { Space } from '@/core/spaces/domain/interfaces/space.interface';

export abstract class SpacesRepositoryPort {
  abstract getSpacesByUser(): Observable<Space[]>;
  abstract createSpace(name: string): Observable<Space>;
}
