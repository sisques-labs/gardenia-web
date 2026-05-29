import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select, SelectOption } from './select';
import { createFormTestBed } from '../_testing/test-host';

const TEST_OPTIONS: SelectOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

// Host component for CVA testing
@Component({
  selector: 'app-test-select-host',
  standalone: true,
  imports: [Select, ReactiveFormsModule],
  template: `<app-select [formControl]="control" [label]="label" [options]="options" [placeholder]="placeholder" [errorMessage]="errorMessage" />`,
})
class TestHost {
  control = new FormControl('');
  label = 'Test label';
  options: SelectOption[] = TEST_OPTIONS;
  placeholder = 'Select one';
  errorMessage = '';
}

describe('Select', () => {
  describe('standalone (no FormControl)', () => {
    let fixture: ComponentFixture<Select>;

    beforeEach(async () => {
      await createFormTestBed(Select);
      fixture = TestBed.createComponent(Select);
    });

    it('renders a native select element', () => {
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
    });

    it('links label to select via matching for/id', () => {
      fixture.componentRef.setInput('label', 'Category');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      expect(label).toBeTruthy();
      expect(label.htmlFor).toBe(select.id);
      expect(select.id).toBeTruthy();
    });

    it('renders all options', () => {
      fixture.componentRef.setInput('options', TEST_OPTIONS);
      fixture.componentRef.setInput('placeholder', '');
      fixture.detectChanges();
      const opts = fixture.nativeElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
      expect(opts.length).toBe(2);
      expect(opts[0].value).toBe('a');
      expect(opts[0].textContent?.trim()).toBe('Alpha');
      expect(opts[1].value).toBe('b');
      expect(opts[1].textContent?.trim()).toBe('Beta');
    });

    it('renders placeholder as first option with empty value', () => {
      fixture.componentRef.setInput('options', TEST_OPTIONS);
      fixture.componentRef.setInput('placeholder', 'Select one');
      fixture.detectChanges();
      const opts = fixture.nativeElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
      expect(opts[0].value).toBe('');
      expect(opts[0].textContent?.trim()).toBe('Select one');
    });

    it('renders error message with role=alert and aria-invalid', () => {
      fixture.componentRef.setInput('errorMessage', 'Required');
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      const error = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
      expect(select.classList).toContain('app-select__field--error');
      expect(error).toBeTruthy();
      expect(error.textContent?.trim()).toBe('Required');
      expect(select.getAttribute('aria-invalid')).toBe('true');
    });

    it('shows no error when errorMessage is empty', () => {
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('[role="alert"]');
      expect(error).toBeNull();
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

    it('selects the option matching FormControl initial value', () => {
      host.control = new FormControl('a');
      host.placeholder = '';
      fixture.detectChanges();
      const opts = fixture.nativeElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
      const alphaOpt = Array.from(opts).find(o => o.value === 'a');
      expect(alphaOpt?.selected).toBeTrue();
    });

    it('updates FormControl when user changes selection', () => {
      host.placeholder = '';
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      select.value = 'b';
      select.dispatchEvent(new Event('change'));
      expect(host.control.value).toBe('b');
    });

    it('disables the native select when FormControl is disabled', () => {
      host.control = new FormControl({ value: '', disabled: true });
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      expect(select.disabled).toBeTrue();
    });

    it('marks FormControl touched on blur', () => {
      fixture.detectChanges();
      expect(host.control.touched).toBeFalse();
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      select.dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBeTrue();
    });
  });
});
