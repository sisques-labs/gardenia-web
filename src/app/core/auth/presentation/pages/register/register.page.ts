import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card } from '@/shared/presentation/components/ui/card/card';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { LoginService } from '@/core/auth/application/services/login/login.service';
import { RegisterService } from '@/core/auth/application/services/register/register.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Button, Card, Input],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly registerSvc = inject(RegisterService);
  private readonly loginSvc = inject(LoginService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.registerSvc
      .register(email, password)
      .pipe(switchMap(() => this.loginSvc.login(email, password)))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl('/');
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'No se pudo crear la cuenta');
        },
      });
  }
}
