export interface SendContactMessageRequestDto {
    topic: 'general' | 'package_selection';
    name: string;
    email: string;
    phoneNumber: string;
    message: string;
    attachment?: File;
    captchaToken: string;
}