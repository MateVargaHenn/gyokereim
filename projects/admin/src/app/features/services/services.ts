import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { ServicesService } from '@admincore/services/services.service';
import { AdminServiceDto } from '../../shared/data-transfer-objects/admin-service.dto';
import { ServiceStatusCode } from '../../shared/enums/service-status-code';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {
  private readonly servicesService =
    inject(ServicesService);

  services = signal<AdminServiceDto[]>([]);

  readonly activeServices = computed(() =>
    this.services().filter(
      service =>
        service.serviceStatusCode ===
        ServiceStatusCode.Active
    )
  );

  readonly inactiveServices = computed(() =>
    this.services().filter(
      service =>
        service.serviceStatusCode ===
        ServiceStatusCode.Inactive
    )
  );

  isLoading = signal(true);

  error = signal<string | null>(null);

  readonly serviceStatusCode =
    ServiceStatusCode;

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.servicesService
      .getAdminServices()
      .subscribe({
        next: services => {
          this.services.set(services);
          this.isLoading.set(false);
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült betölteni a szolgáltatásokat.'
          );

          this.isLoading.set(false);
        }
      });
  }

  deactivateService(
    service: AdminServiceDto
  ): void {
    const confirmed = window.confirm(
      `Biztosan inaktiválod ezt a szolgáltatást?\n\n${service.name}`
    );

    if (!confirmed) {
      return;
    }

    this.servicesService
      .deactivateService(service.id)
      .subscribe({
        next: () => {
          this.loadServices();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült inaktiválni a szolgáltatást.'
          );
        }
      });
  }

  activateService(
    service: AdminServiceDto
  ): void {
    const confirmed = window.confirm(
      `Biztosan aktiválod ezt a szolgáltatást?\n\n${service.name}`
    );

    if (!confirmed) {
      return;
    }

    this.servicesService
      .activateService(service.id)
      .subscribe({
        next: () => {
          this.loadServices();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült aktiválni a szolgáltatást.'
          );
        }
      });
  }
}