import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from './textarea';
import { createFormTestBed } from '../_testing/test-host';

// Host component for CVA testing
@Component({
  selector: 'app-test-textarea-host',
  standalone: true,
  imports: [Textarea, ReactiveFormsModule],
  template: `<app-textarea [formControl]="control" [label]="label" [errorMessage]="errorMessage" [hint]="hint" [rows]="rows" />`,
})
class TestHost {
  control = new FormControl('');
  label = 'Test label';
  errorMessage = '';
  hint = '';
  rows = 4;
}

describe('Textarea', () => {
  describe('standalone (no FormControl)', () => {
    let fixture: ComponentFixture<Textarea>;

    beforeEach(async () => {
      await createFormTestBed(Textarea);
      fixture = TestBed.createComponent(Textarea);
    });

    it('renders a native textarea element', () => {
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
    });

    it('links label to textarea via matching for/id', () => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(label).toBeTruthy();
      expect(label.htmlFor).toBe(textarea.id);
      expect(textarea.id).toBeTruthy();
    });

    it('forwards rows input to native textarea', () => {
      fixture.componentRef.setInput('rows', 6);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(6);
    });

    it('uses default rows=4', () => {
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });

    it('applies error class and renders error message with role=alert', () => {
      fixture.componentRef.setInput('errorMessage', 'Too long');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      const errorEl = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
      expect(textarea.classList).toContain('app-textarea__field--error');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent?.trim()).toBe('Too long');
      expect(textarea.getAttribute('aria-invalid')).toBe('true');
    });

    it('renders hint when set and no error', () => {
      fixture.componentRef.setInput('hint', 'Max 500 characters');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.app-textarea__hint') as HTMLElement;
      expect(hint).toBeTruthy();
      expect(hint.textContent?.trim()).toBe('Max 500 characters');
    });

    it('shows error instead of hint when both are set', () => {
      fixture.componentRef.setInput('hint', 'Max 500 characters');
      fixture.componentRef.setInput('errorMessage', 'Too long');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.app-textarea__hint');
      const error = fixture.nativeElement.querySelector('.app-textarea__error') as HTMLElement;
      expect(hint).toBeNull();
      expect(error.textContent?.trim()).toBe('Too long');
    });

    it('sets required attribute when required=true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.required).toBeTrue();
      expect(textarea.getAttribute('aria-required')).toBe('true');
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

    it('displays FormControl initial value in native textarea', () => {
      host.control = new FormControl('hello');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('hello');
    });

    it('updates FormControl when user types', () => {
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'new content';
      textarea.dispatchEvent(new Event('input'));
      expect(host.control.value).toBe('new content');
    });

    it('disables the native textarea when FormControl is disabled', () => {
      host.control = new FormControl({ value: '', disabled: true });
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.disabled).toBeTrue();
    });

    it('marks FormControl touched on blur', () => {
      fixture.detectChanges();
      expect(host.control.touched).toBeFalse();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBeTrue();
    });
  });
});
