import { Component, Type } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Shorthand for provideZonelessChangeDetection — always include in specs.
 */
export function provideZoneless() {
  return provideZonelessChangeDetection();
}

/**
 * Creates a TestBed configuration that always includes zoneless change detection.
 * Use this in every beforeEach to satisfy the global constraint.
 */
export async function createTestBed<T>(
  component: Type<T>,
  config: Omit<TestModuleMetadata, 'declarations'> = {},
): Promise<void> {
  const imports = (config['imports'] as Type<unknown>[] | undefined) ?? [];
  const providers = config['providers'] ?? [];

  await TestBed.configureTestingModule({
    imports: [component, ...imports],
    providers: [provideZoneless(), ...providers],
  }).compileComponents();
}

/**
 * A minimal host component for testing form CVA components via FormControl.
 * Set inputs on the host BEFORE calling fixture.detectChanges() in zoneless mode.
 */
@Component({
  selector: 'app-test-form-host',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: '',
})
export class FormTestHost {
  control = new FormControl('');
}

/**
 * Creates a TestBed with ReactiveFormsModule included — required for CVA form tests.
 */
export async function createFormTestBed<T>(
  component: Type<T>,
  config: Omit<TestModuleMetadata, 'declarations'> = {},
): Promise<void> {
  const imports = (config['imports'] as Type<unknown>[] | undefined) ?? [];
  const providers = config['providers'] ?? [];

  await TestBed.configureTestingModule({
    imports: [component, ReactiveFormsModule, ...imports],
    providers: [provideZoneless(), ...providers],
  }).compileComponents();
}
