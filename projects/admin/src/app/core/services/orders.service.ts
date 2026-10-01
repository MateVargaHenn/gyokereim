import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api/api';
import { AdminOrderItemDto } from '../../shared/data-transfer-objects/admin-order-item.dto';
import { AdminOrderDetailsDto } from '../../shared/data-transfer-objects/admin-order-details.dto';
import { OrderStatusCode } from '../../shared/enums/order-status-code';

@Injectable({
  providedIn: 'root'
})
export class OrdersService extends Api {

  getOrders(): Observable<AdminOrderItemDto[]> {
    return this.get<AdminOrderItemDto[]>(
      'services/admin/orders'
    );
  }

  getOrder(
  id: number
    ): Observable<AdminOrderDetailsDto> {
    return this.get<AdminOrderDetailsDto>(
        `services/admin/orders/${id}`
    );
    }

    updateOrderStatus(
  id: number,
  orderStatusCode: OrderStatusCode
): Observable<void> {
  return this.put<void>(
    `services/admin/orders/${id}/status`,
    {
      orderStatusCode
    }
  );
}
}