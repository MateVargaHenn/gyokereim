import { OrderStatusCode } from "../enums/order-status-code";

export interface AdminOrderItemDto {
  id: number;
  customerName: string;
  email: string;
  phoneNumber: string;
  serviceName: string;
  trackingCode: string;
  orderStatusCode: OrderStatusCode;
  created: string;
}