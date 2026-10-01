import { Component, inject, signal, ViewChild, WritableSignal, OnInit } from '@angular/core';
import { ChatService } from '@core/services/chat.service';
import { ChatResponseDto } from '@shared/data-transfer-objects/chat-response.dto';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ChatRequestDto } from '@shared/data-transfer-objects/chat-request.dto';

@Component({
  selector: 'app-chat',
  imports: [RouterLink],
  providers: [ChatService],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
  private readonly chatService = inject(ChatService);
  displayChat: WritableSignal<boolean> = signal(false);
  highlightChat = signal(true);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly version = signal('1.2.2');
  
  response$?: Observable<ChatResponseDto | undefined>;
  public readonly responses = signal<ChatResponseDto[]>([]);
  @ViewChild('messageInput', { static: true }) messageInput: HTMLDivElement | undefined;

  constructor() {}

  
ngOnInit(): void {
  setTimeout(() => {
    this.highlightChat.set(false);
  }, 5000);
}

  keypress(event: KeyboardEvent, messageDiv: HTMLDivElement) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send(messageDiv);
      messageDiv.innerText = '';
    }
  }
  toggleChat() {
    this.displayChat.update((currentValue) => !currentValue);
  }

send(messageDiv: HTMLDivElement) {
  const message = messageDiv.innerText;
  const trimmedMessage = message.trim();

  messageDiv.innerText = '';

  if (!trimmedMessage) {
    return;
  }

  const previousResponse =
    this.responses().at(-1);

  const chatRequestDto: ChatRequestDto = {
    message: trimmedMessage,
    previousIntent:
      previousResponse?.intent ?? null,
    referencedServiceIds:
      previousResponse?.referencedServiceIds ?? [],
  };

  this.chatService
    .sendMessage(chatRequestDto)
    .subscribe({
      next: (response: ChatResponseDto) => {

        this.responses.update(
          (currentResponses) => [
            ...currentResponses,
            response,
          ]);
      },
      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          'A szerver nem adott választ.');
      },
    });
}
}
