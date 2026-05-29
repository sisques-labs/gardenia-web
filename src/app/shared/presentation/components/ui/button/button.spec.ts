import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Button } from './button';
import { createTestBed } from '../_testing/test-host';

describe('Button', () => {
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await createTestBed(Button);
    fixture = TestBed.createComponent(Button);
    fixture.detectChanges();
  });

  it('renders a native button with type="button" by default', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('button');
  });

  it('applies primary variant classes by default', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toContain('bg-forest');
    expect(btn.className).toContain('text-paper');
  });

  it('sets the disabled attribute when disabled=true', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('does not emit click when disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const clickSpy = jasmine.createSpy('click');
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.addEventListener('click', clickSpy);
    btn.click();

    // Native disabled button does not fire click events
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('disables the button and shows spinner when loading=true', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();

    const spinner = fixture.debugElement.query(By.css('svg.animate-spin'));
    expect(spinner).toBeTruthy();
  });

  it('forwards the type input to the native button', async () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });
});
