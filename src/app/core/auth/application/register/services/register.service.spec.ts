import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AUTH_REPOSITORY } from '../../../domain/ports/auth.repository.port';
import { RegisterService } from './register.service';

const mockRepo = { register: jasmine.createSpy('register') };

describe('RegisterService', () => {
  let service: RegisterService;

  beforeEach(() => {
    mockRepo.register.calls.reset();
    TestBed.configureTestingModule({
      providers: [RegisterService, { provide: AUTH_REPOSITORY, useValue: mockRepo }],
    });
    service = TestBed.inject(RegisterService);
  });

  it('delegates to repository', done => {
    mockRepo.register.and.returnValue(of(undefined));
    service.register('a@b.com', 'pass1234').subscribe({ next: () => done() });
    expect(mockRepo.register).toHaveBeenCalledWith('a@b.com', 'pass1234');
  });

  it('propagates repository error', done => {
    mockRepo.register.and.returnValue(throwError(() => new Error('409')));
    service.register('a@b.com', 'pass1234').subscribe({
      error: err => {
        expect(err.message).toBe('409');
        done();
      },
    });
  });
});
