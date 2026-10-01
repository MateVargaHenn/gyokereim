import { OrderStatusCode } from "../enums/order-status-code";

export interface AdminOrderDetailsDto {
  id: number;
  customerName: string;
  email: string;
  phoneNumber: string;
  message: string | null;
  serviceName: string;
  trackingCode: string;
  orderStatusCode: OrderStatusCode;
  created: string;
  lastModified: string;
}