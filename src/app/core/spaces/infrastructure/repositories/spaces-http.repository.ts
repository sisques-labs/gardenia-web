import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { SpacesRepositoryPort } from '@/core/spaces/domain/ports/spaces.repository.port';

@Injectable({ providedIn: 'root' })
export class SpacesHttpRepository extends SpacesRepositoryPort {
  getSpacesByUser(): Observable<Space[]> {
    return throwError(() => new Error('TODO: implement when API is ready'));
  }

  createSpace(name: string): Observable<Space> {
    void name;
    return throwError(() => new Error('TODO: implement when API is ready'));
  }
}
