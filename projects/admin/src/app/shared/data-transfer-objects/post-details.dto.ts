import { PostMetaDto } from './post-meta.dto';
import { PostTagDto } from './post-tag.dto';

export interface PostDetailsDto {
  id: number;
  authorId: string;
  title: string;
  metaTitle: string;
  slug: string;
  summary: string;
  content: string;
  postStatus: number;
  publishedAt: string | null;
  postMetas: PostMetaDto[];
  postTags: PostTagDto[];
}