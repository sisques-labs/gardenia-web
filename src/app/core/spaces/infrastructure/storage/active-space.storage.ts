import { Injectable } from '@angular/core';

const STORAGE_KEY = 'gardenia.activeSpaceId';

@Injectable({ providedIn: 'root' })
export class ActiveSpaceStorage {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  set(id: string): void {
    localStorage.setItem(STORAGE_KEY, id);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
