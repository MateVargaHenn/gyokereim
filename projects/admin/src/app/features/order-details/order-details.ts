import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { DatePipe } from '@angular/common';

import { OrdersService } from '@admincore/services/orders.service';
import { AdminOrderDetailsDto } from '../../shared/data-transfer-objects/admin-order-details.dto';
import { OrderStatusCode } from '../../shared/enums/order-status-code';

@Component({
  selector: 'app-order-details',
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  private readonly route =
    inject(ActivatedRoute);

  private readonly ordersService =
    inject(OrdersService);

  order =
    signal<AdminOrderDetailsDto | null>(null);

  isLoading = signal(true);

  error = signal<string | null>(null);

  readonly orderStatusCode =
    OrderStatusCode;

    selectedStatus =
  signal<OrderStatusCode | null>(null);

isSavingStatus =
  signal(false);

  ngOnInit(): void {
    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (!id || Number.isNaN(id)) {
      this.error.set(
        'Érvénytelen megrendelés azonosító.'
      );

      this.isLoading.set(false);

      return;
    }

    this.loadOrder(id);
  }

  private loadOrder(
    id: number
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.ordersService
      .getOrder(id)
      .subscribe({
        next: order => {
          this.order.set(order);
          this.isLoading.set(false);
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült betölteni a megrendelést.'
          );

          this.isLoading.set(false);
        }
      });
  }

  changeStatus(): void {
  const order = this.order();
  const status = this.selectedStatus();

  if (
    !order ||
    status === null ||
    status === order.orderStatusCode
  ) {
    return;
  }

  this.isSavingStatus.set(true);
  this.error.set(null);

  this.ordersService
    .updateOrderStatus(
      order.id,
      status
    )
    .subscribe({
      next: () => {
        this.loadOrder(order.id);
        this.isSavingStatus.set(false);
      },

      error: error => {
        console.error(error);

        this.error.set(
          'Nem sikerült módosítani a megrendelés állapotát.'
        );

        this.isSavingStatus.set(false);
      }
    });
}
}