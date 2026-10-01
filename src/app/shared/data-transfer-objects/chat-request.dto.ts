export interface ChatRequestDto {
  message: string;
  previousIntent: string | null;
  referencedServiceIds: number[];
}