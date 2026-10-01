import {
  Component,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { OrdersService } from '@admincore/services/orders.service';
import { AdminOrderItemDto } from '../../shared/data-transfer-objects/admin-order-item.dto';
import { OrderStatusCode } from '../../shared/enums/order-status-code';

@Component({
  selector: 'app-orders',
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {

  private readonly ordersService =
    inject(OrdersService);

  orders = signal<AdminOrderItemDto[]>([]);

  isLoading = signal(true);

  error = signal<string | null>(null);

  readonly orderStatusCode =
    OrderStatusCode;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.ordersService
      .getOrders()
      .subscribe({
        next: orders => {
          this.orders.set(orders);
          this.isLoading.set(false);
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült betölteni a megrendeléseket.'
          );

          this.isLoading.set(false);
        }
      });
  }

  getStatusName(
    status: OrderStatusCode
  ): string {
    switch (status) {
      case OrderStatusCode.Created:
        return 'Új';

      case OrderStatusCode.Consultation:
        return 'Egyeztetés';

      case OrderStatusCode.InProgress:
        return 'Folyamatban';

      case OrderStatusCode.Completed:
        return 'Elkészült';

      case OrderStatusCode.Storno:
        return 'Sztornó';

      default:
        return 'Ismeretlen';
    }
  }
}