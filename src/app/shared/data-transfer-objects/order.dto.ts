export interface OrderDto {
    customerName: string;
    email: string;
    phoneNumber: string;
    message?: string;
    serviceKey: string;
    acceptTerms: boolean;
}