import { Injectable } from '@angular/core';
import { Api } from './api/api';
import { ChatResponseDto } from '@shared/data-transfer-objects/chat-response.dto';
import { Observable } from 'rxjs';
import { ChatRequestDto } from '@shared/data-transfer-objects/chat-request.dto';

@Injectable({
  providedIn: 'root',
})
export class ChatService extends Api {
    constructor() {
        super();
    }
    
    sendMessage(chatRequestDto: ChatRequestDto): Observable<ChatResponseDto> {
        return this.post<ChatResponseDto>('chat/ask', chatRequestDto );
    }
}
