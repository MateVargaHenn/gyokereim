import { ChatAnswerDto } from './chat-answer.dto';
export interface ChatResponseDto {
  myQuestion: string;
  chatAnswer: ChatAnswerDto;
  intent: string;
  referencedServiceIds: number[];
}