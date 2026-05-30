import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpacesStateService } from './core/spaces/application/services/spaces-state/spaces-state.service';
import { App } from './app';

const spacesStateStub = {
  currentSpace: signal(null),
  availableSpaces: signal([]),
  isLoading: signal(false),
  isResolved: signal(false),
  loadSpaces: () => of(undefined),
  setActiveSpace: (_id: string) => { void _id; },
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpacesStateService, useValue: spacesStateStub },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
