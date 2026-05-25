import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

let selectIdCounter = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input<string>('Seleccionar...');
  readonly errorMessage = input<string>('');

  protected readonly selectId = `app-select-${++selectIdCounter}`;
  protected readonly errorId = `${this.selectId}-error`;

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);

  private onChange: (v: string) => void = () => void 0;
  private onTouched: () => void = () => void 0;

  writeValue(v: string | null): void {
    this.value.set(v ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
