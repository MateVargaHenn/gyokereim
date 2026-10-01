import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminServiceDto } from '../../shared/data-transfer-objects/admin-service.dto';
import { CreateServiceDto } from '../../shared/data-transfer-objects/create-service.dto';
import { Api } from './api/api';
import { AdminOrderDetailsDto } from '../../shared/data-transfer-objects/admin-order-details.dto';

@Injectable({
  providedIn: 'root'
})
export class ServicesService extends Api{

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/services`;

    createService(
  dto: CreateServiceDto
): Observable<void> {
  return this.post<void>(
    'services/admin',
    dto
  );
}

  getAdminServices(): Observable<AdminServiceDto[]> {
    return this.get<AdminServiceDto[]>(`services/admin/get`);
  }


  getService(
    id: number
  ): Observable<AdminServiceDto> {
    return this.get<AdminServiceDto>(
      `services/admin/${id}`
    );
  }


  updateService(
  id: number,
  dto: CreateServiceDto
): Observable<void> {
  return this.put<void>(
    `services/admin/${id}`,
    dto
  );
}

deactivateService(
  id: number
): Observable<void> {
  return this.put<void>(
    `services/admin/${id}/deactivate`,
    null
  );
}

activateService(
  id: number
): Observable<void> {
  return this.put<void>(
    `services/admin/${id}/activate`,
    null
  );
}

getOrder(
  id: number
): Observable<AdminOrderDetailsDto> {
  return this.get<AdminOrderDetailsDto>(
    `services/admin/orders/${id}`
  );
}
}