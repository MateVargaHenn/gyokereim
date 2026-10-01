import { Injectable } from '@angular/core';
import { Api } from './api/api';
import { SendContactMessageRequestDto } from '../../shared/data-transfer-objects/send-contact-message-request.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactService extends Api {

  sendContactForm(request: SendContactMessageRequestDto, attachment?: File): Observable<any> {
    const formData = new FormData();

    formData.append('name', request.name);
    formData.append('email', request.email);
    formData.append('phoneNumber', request.phoneNumber);
    formData.append('message', request.message);
    formData.append('captchaToken', request.captchaToken);
    

if (attachment) {
    formData.append(
        'attachment',
        attachment,
        attachment.name
    );
}
    return this.post<any>('contact/message/send', formData);
  }
}
