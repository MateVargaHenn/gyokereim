import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthenticationService } from '../../core/services/authentication.service';
import { LoginRequestDto } from '../../shared/data-transfer-objects/login-request.dto';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  protected loginForm = new FormGroup({
    userName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.isLoading.set(true);

    const request: LoginRequestDto = {
      userName: this.loginForm.controls.userName.value,
      password: this.loginForm.controls.password.value
    };

    this.authenticationService
      .login(request)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/admin']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.error.set(
              'Hibás felhasználónév vagy jelszó.'
            );

            return;
          }

          this.error.set(
            'A bejelentkezés során hiba történt.'
          );
        }
      });
  }
}