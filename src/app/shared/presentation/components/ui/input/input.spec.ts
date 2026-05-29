import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Input } from './input';
import { createFormTestBed } from '../_testing/test-host';

// Host component for CVA testing
@Component({
  selector: 'app-test-input-host',
  standalone: true,
  imports: [Input, ReactiveFormsModule],
  template: `<app-input [formControl]="control" [label]="label" [errorMessage]="errorMessage" [hint]="hint" [required]="required" />`,
})
class TestHost {
  control = new FormControl('');
  label = 'Test label';
  errorMessage = '';
  hint = '';
  required = false;
}

describe('Input', () => {
  describe('standalone (no FormControl)', () => {
    let fixture: ComponentFixture<Input>;

    beforeEach(async () => {
      await createFormTestBed(Input);
      fixture = TestBed.createComponent(Input);
    });

    it('renders a native input element', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input).toBeTruthy();
    });

    it('links label to input via matching for/id', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
      expect(label.htmlFor).toBe(input.id);
      expect(input.id).toBeTruthy();
    });

    it('shows no label element when label is empty', () => {
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label');
      expect(label).toBeNull();
    });

    it('applies error class and renders error message with role=alert', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('errorMessage', 'Invalid email');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const errorEl = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
      expect(input.classList).toContain('app-input__field--error');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent?.trim()).toBe('Invalid email');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('renders hint when set and no error', () => {
      fixture.componentRef.setInput('hint', 'Max 100 chars');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.app-input__hint') as HTMLElement;
      expect(hint).toBeTruthy();
      expect(hint.textContent?.trim()).toBe('Max 100 chars');
    });

    it('shows error instead of hint when both are set', () => {
      fixture.componentRef.setInput('hint', 'Max 100 chars');
      fixture.componentRef.setInput('errorMessage', 'Too long');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.app-input__hint');
      const error = fixture.nativeElement.querySelector('.app-input__error') as HTMLElement;
      expect(hint).toBeNull();
      expect(error.textContent?.trim()).toBe('Too long');
    });

    it('sets required attribute and aria-required when required=true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.required).toBeTrue();
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('forwards type to native input', () => {
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('email');
    });
  });

  describe('with FormControl (CVA)', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    beforeEach(async () => {
      await createFormTestBed(TestHost);
      fixture = TestBed.createComponent(TestHost);
      host = fixture.componentInstance;
    });

    it('displays FormControl initial value in native input', () => {
      host.control = new FormControl('test@example.com');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
    });

    it('updates FormControl when user types', () => {
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'hello@world.com';
      input.dispatchEvent(new Event('input'));
      expect(host.control.value).toBe('hello@world.com');
    });

    it('disables the native input when FormControl is disabled', () => {
      host.control = new FormControl({ value: '', disabled: true });
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBeTrue();
    });

    it('marks FormControl touched on blur', () => {
      fixture.detectChanges();
      expect(host.control.touched).toBeFalse();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBeTrue();
    });
  });
});
