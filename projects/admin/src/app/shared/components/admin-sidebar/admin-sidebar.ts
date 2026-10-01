import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router, RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  selector: 'app-admin-sidebar',
  styleUrl: './admin-sidebar.css',
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/bejelentkezes']);
  }
}
