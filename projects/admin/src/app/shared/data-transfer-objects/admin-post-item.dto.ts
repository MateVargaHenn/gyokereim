import { PostStatus } from '../enums/post-status';

export interface AdminPostItemDto {
  id: number;
  title: string;
  slug: string;
  postStatus: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}