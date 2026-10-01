export interface SendContactMessageRequestDto {
    name: string;
    email: string;
    phoneNumber: string;
    message: string;
    attachment?: File;
    captchaToken: string;
}