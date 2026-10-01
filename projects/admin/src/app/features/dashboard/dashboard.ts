import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminOrderDetailsDto } from '../../shared/data-transfer-objects/admin-order-details.dto';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  newOrdersCount = signal<number>(0);
  servicesCount = signal<number>(0);
  OrderDetails = signal<AdminOrderDetailsDto[]>([]);
}
