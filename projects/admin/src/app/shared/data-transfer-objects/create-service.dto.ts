export interface CreateServiceDto {
  name: string;
  shortDescription: string;
  description: string;
  slug: string;
  price: number;
  orderNumber: number;
  serviceStatusCode: number;
}