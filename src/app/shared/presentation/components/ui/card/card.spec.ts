import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from './card';
import { createTestBed } from '../_testing/test-host';

// ---------------------------------------------------------------------------
// Test hosts
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [Card],
  template: `
    <app-card [variant]="variant">
      <div card-header>Header</div>
      <div>Body</div>
      <div card-footer>Footer</div>
    </app-card>
  `,
})
class FullSlotsHost {
  variant: 'default' | 'bordered' = 'default';
}

@Component({
  standalone: true,
  imports: [Card],
  template: `
    <app-card>
      <div>Body only</div>
    </app-card>
  `,
})
class BodyOnlyHost {}

// ---------------------------------------------------------------------------
// Specs
// ---------------------------------------------------------------------------

describe('Card', () => {
  describe('content projection — all slots', () => {
    let fixture: ComponentFixture<FullSlotsHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await createTestBed(FullSlotsHost);
      fixture = TestBed.createComponent(FullSlotsHost);
      fixture.detectChanges();
      el = fixture.nativeElement as HTMLElement;
    });

    it('projects header, body and footer in correct DOM order', () => {
      const card = el.querySelector('app-card') as HTMLElement;
      const children = Array.from(card.children).map(c => (c as HTMLElement).textContent?.trim());
      expect(children).toEqual(['Header', 'Body', 'Footer']);
    });

    it('host element has the .card class', () => {
      const card = el.querySelector('app-card') as HTMLElement;
      expect(card.classList).toContain('card');
    });

    it('host element has role="article"', () => {
      const card = el.querySelector('app-card') as HTMLElement;
      expect(card.getAttribute('role')).toBe('article');
    });
  });

  describe('bordered variant', () => {
    let fixture: ComponentFixture<FullSlotsHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await createTestBed(FullSlotsHost);
      fixture = TestBed.createComponent(FullSlotsHost);
      fixture.componentInstance.variant = 'bordered';
      fixture.detectChanges();
      el = fixture.nativeElement as HTMLElement;
    });

    it('adds .bordered class when variant="bordered"', () => {
      const card = el.querySelector('app-card') as HTMLElement;
      expect(card.classList).toContain('bordered');
    });
  });

  describe('default variant', () => {
    let fixture: ComponentFixture<FullSlotsHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await createTestBed(FullSlotsHost);
      fixture = TestBed.createComponent(FullSlotsHost);
      fixture.detectChanges();
      el = fixture.nativeElement as HTMLElement;
    });

    it('does NOT have .bordered class when variant="default"', () => {
      const card = el.querySelector('app-card') as HTMLElement;
      expect(card.classList).not.toContain('bordered');
    });
  });

  describe('body-only — empty header and footer slots', () => {
    let fixture: ComponentFixture<BodyOnlyHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await createTestBed(BodyOnlyHost);
      fixture = TestBed.createComponent(BodyOnlyHost);
      fixture.detectChanges();
      el = fixture.nativeElement as HTMLElement;
    });

    it('renders body content', () => {
      const card = el.querySelector('app-card') as HTMLElement;
      expect(card.textContent?.trim()).toBe('Body only');
    });
  });
});
