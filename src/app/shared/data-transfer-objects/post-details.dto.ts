import { PostMetaDto } from "./post-meta.dto";

export interface PostDetailsDto {
  id: number;
  authorId: string;
  title: string;
  metaTitle: string;
  slug: string;
  summary: string;
  content: string;
  publishedAt?: Date | null;
  postMetas: PostMetaDto[];
}