import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { EventBusService } from './event-bus.service';
import { DomainEvent } from '@/core/shared/domain/domain-event.interface';

interface FooEvent extends DomainEvent {
  readonly type: 'foo';
}

interface BarEvent extends DomainEvent {
  readonly type: 'bar';
}

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), EventBusService],
    });
    service = TestBed.inject(EventBusService);
  });

  it('publish delivers to on() subscriber of matching type', done => {
    const event: FooEvent = { type: 'foo', occurredAt: new Date() };
    service.on<FooEvent>('foo').subscribe(received => {
      expect(received).toEqual(event);
      done();
    });
    service.publish(event);
  });

  it('on() filters out events of non-matching type', done => {
    const bar: BarEvent = { type: 'bar', occurredAt: new Date() };
    const foo: FooEvent = { type: 'foo', occurredAt: new Date() };
    const received: DomainEvent[] = [];

    service.on<FooEvent>('foo').subscribe(e => received.push(e));
    service.publish(bar);
    service.publish(foo);

    Promise.resolve().then(() => {
      expect(received.length).toBe(1);
      expect(received[0]).toEqual(foo);
      done();
    });
  });

  it('multiple subscribers each receive independently', done => {
    const event: FooEvent = { type: 'foo', occurredAt: new Date() };
    let count = 0;

    service.on<FooEvent>('foo').subscribe(() => count++);
    service.on<FooEvent>('foo').subscribe(() => {
      count++;
      expect(count).toBe(2);
      done();
    });

    service.publish(event);
  });
});
