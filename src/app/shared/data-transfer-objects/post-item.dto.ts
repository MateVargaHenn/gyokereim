export interface PostItemDto {
  id: number;
  title: string;
  slug: string;
  summary: string;
  publishedAt?: Date | null;
}