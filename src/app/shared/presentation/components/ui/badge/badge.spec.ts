import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Badge } from './badge';
import { createTestBed } from '../_testing/test-host';

describe('Badge', () => {
  let fixture: ComponentFixture<Badge>;

  beforeEach(async () => {
    await createTestBed(Badge);
    fixture = TestBed.createComponent(Badge);
    fixture.detectChanges();
  });

  it('has .chip class on the host element by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('chip');
  });

  it('applies the forest color modifier class when color="forest"', async () => {
    fixture.componentRef.setInput('color', 'forest');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('chip');
    expect(host.classList).toContain('forest');
  });

  it('shows a colored dot element before content when variant="dot"', async () => {
    fixture.componentRef.setInput('variant', 'dot');
    fixture.componentRef.setInput('color', 'forest');
    fixture.detectChanges();
    await fixture.whenStable();

    const dot = fixture.debugElement.query(By.css('.dot'));
    expect(dot).toBeTruthy();
    expect(dot.nativeElement.style.backgroundColor).toBeTruthy();
  });

  it('applies .outline class and does NOT show a dot when variant="outline"', async () => {
    fixture.componentRef.setInput('variant', 'outline');
    fixture.componentRef.setInput('color', 'honey');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('chip');
    expect(host.classList).toContain('outline');

    const dot = fixture.debugElement.query(By.css('.dot'));
    expect(dot).toBeNull();
  });
});
