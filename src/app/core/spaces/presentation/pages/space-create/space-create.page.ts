import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SPACES_REPOSITORY } from '@/core/spaces/domain/tokens/spaces-repository.token';
import { SpacesStateService } from '@/core/spaces/application/services/spaces-state/spaces-state.service';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Card } from '@/shared/presentation/components/ui/card/card';

@Component({
  selector: 'app-space-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, Button, Input, Card],
  template: `
    <main class="flex items-center justify-center min-h-screen p-6">
      <app-card class="w-full max-w-md">
        <h1 class="text-2xl font-semibold mb-6">Create a Space</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <app-input
            formControlName="name"
            placeholder="Space name"
            aria-label="Space name"
          />
          @if (error()) {
            <p class="text-red-500 text-sm">{{ error() }}</p>
          }
          <app-button type="submit" variant="primary" size="md" [disabled]="loading()">
            {{ loading() ? 'Creating…' : 'Create Space' }}
          </app-button>
        </form>
      </app-card>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(SPACES_REPOSITORY);
  private readonly spacesState = inject(SpacesStateService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    const { name } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.repo.createSpace(name).subscribe({
      next: (space) => {
        this.loading.set(false);
        this.spacesState.setActiveSpace(space.id);
        this.router.navigateByUrl('/');
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err?.message ?? 'Could not create space');
      },
    });
  }
}
